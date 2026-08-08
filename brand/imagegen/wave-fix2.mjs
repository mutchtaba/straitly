/*
 * v2 of the blink fix: frame B's body wasn't just shifted, it was a slightly
 * different SIZE than frame A's — so the plain diff-composite let scaled body
 * pixels leak through and the mascot still "breathed" between frames.
 *
 * This version searches for the (scale, dx, dy) that best aligns B's body to
 * A's — scored ONLY on the lower body silhouette, which the waving arm never
 * touches — then applies that transform and rebuilds frame B as:
 *   frame A everywhere, except the (dilated) genuine-diff region in the arm
 *   zone, which takes the transformed B pixels.
 * Body = literally frame A's pixels in both frames. Same size, same spot.
 *
 * Run: node wave-fix2.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DIR = dirname(fileURLToPath(import.meta.url));
const A = join(DIR, "out", "wave", "wave-a.png");
const B = join(DIR, "out", "wave", "wave-b.png");
const PUB = join(DIR, "..", "..", "public", "retro", "guy");

const load = async (p) => {
  const { data, info } = await sharp(p)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};

const a = await load(A);
const b = await load(B);
const { w, h } = a;
const idx = (x, y) => (y * w + x) * 4;
const cx = w / 2;
const cy = h / 2;

/* solid-silhouette bitmaps */
const solidOf = (img) => {
  const s = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) s[i] = img.data[i * 4 + 3] > 128 ? 1 : 0;
  return s;
};
const solidA = solidOf(a);
const solidB = solidOf(b);

/* nearest-neighbor sample of B's silhouette under (scale, dx, dy), anchored
   at the canvas center */
function sampleB(x, y, s, dx, dy) {
  const sx = Math.round((x - dx - cx) / s + cx);
  const sy = Math.round((y - dy - cy) / s + cy);
  if (sx < 0 || sx >= w || sy < 0 || sy >= h) return 0;
  return solidB[sy * w + sx];
}

/* score = silhouette mismatches over the LOWER BODY only (bottom 45% of the
   canvas: legs, boots, lower torso — the arm never reaches down there) */
const Y0 = Math.floor(h * 0.55);
function score(s, dx, dy, step) {
  let bad = 0;
  for (let y = Y0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (solidA[y * w + x] !== sampleB(x, y, s, dx, dy)) bad++;
    }
  }
  return bad;
}

/* coarse-to-fine search */
let best = { s: 1, dx: 0, dy: 0, bad: Infinity };
for (let s = 0.92; s <= 1.081; s += 0.01) {
  for (let dy = -30; dy <= 30; dy += 3) {
    for (let dx = -70; dx <= 70; dx += 3) {
      const bad = score(s, dx, dy, 3);
      if (bad < best.bad) best = { s, dx, dy, bad };
    }
  }
}
for (let s = best.s - 0.008; s <= best.s + 0.0081; s += 0.002) {
  for (let dy = best.dy - 3; dy <= best.dy + 3; dy++) {
    for (let dx = best.dx - 4; dx <= best.dx + 4; dx++) {
      const bad = score(s, dx, dy, 1);
      if (bad < best.bad) best = { s, dx, dy, bad };
    }
  }
}
console.log(
  `best fit: scale ${best.s.toFixed(3)}, dx ${best.dx}, dy ${best.dy} (${best.bad} lower-body mismatch px)`,
);

/* apply the transform to B's full RGBA */
const bT = Buffer.alloc(b.data.length);
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const sx = Math.round((x - best.dx - cx) / best.s + cx);
    const sy = Math.round((y - best.dy - cy) / best.s + cy);
    if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
      b.data.copy(bT, idx(x, y), idx(sx, sy), idx(sx, sy) + 4);
    }
  }
}

/* genuine-diff mask, arm zone only, dilated for a clean seam */
const ARM_ZONE = Math.floor(h * 0.55);
const THRESH = 40;
let mask = new Uint8Array(w * h);
for (let y = 0; y < ARM_ZONE; y++) {
  for (let x = 0; x < w; x++) {
    const i = idx(x, y);
    const d = Math.max(
      Math.abs(a.data[i] - bT[i]),
      Math.abs(a.data[i + 1] - bT[i + 1]),
      Math.abs(a.data[i + 2] - bT[i + 2]),
      Math.abs(a.data[i + 3] - bT[i + 3]),
    );
    if (d > THRESH) mask[y * w + x] = 1;
  }
}
for (let it = 0; it < 3; it++) {
  const next = new Uint8Array(mask);
  for (let y = 1; y < ARM_ZONE - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (
        mask[y * w + x] ||
        mask[y * w + x - 1] ||
        mask[y * w + x + 1] ||
        mask[(y - 1) * w + x] ||
        mask[(y + 1) * w + x]
      )
        next[y * w + x] = 1;
    }
  }
  mask = next;
}

const bOut = Buffer.from(a.data);
let armPixels = 0;
for (let y = 0; y < ARM_ZONE; y++) {
  for (let x = 0; x < w; x++) {
    if (mask[y * w + x]) {
      const i = idx(x, y);
      bT.copy(bOut, i, i, i + 4);
      armPixels++;
    }
  }
}
console.log(
  `arm region: ${armPixels} px (${((armPixels / (w * h)) * 100).toFixed(1)}% of canvas)`,
);

const SCALE = 1.08;
const out = async (buf, name) => {
  const png = await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .resize(Math.round(w * SCALE), Math.round(h * SCALE), { kernel: "nearest" })
    .png()
    .toBuffer();
  writeFileSync(join(PUB, name), png);
};
await out(a.data, "wavey-a.png");
await out(bOut, "wavey-b.png");
console.log("wrote public/retro/guy/wavey-a.png + wavey-b.png");
