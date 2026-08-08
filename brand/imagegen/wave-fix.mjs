/*
 * Kills the "blink" between the two wave frames without regenerating:
 * 1. aligns frame B to frame A by the legs' centroid (canvas centering had
 *    shifted the body because B's outstretched arm widens its bounding box)
 * 2. rebuilds frame B as: frame A everywhere, except inside the (dilated)
 *    region where the two frames genuinely differ — the moving arm.
 *    Outside the arm, the pixels are literally identical -> no blink.
 * 3. scales both frames 1.08x (the size the strip uses now).
 * Run: node wave-fix.mjs
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
if (a.w !== b.w || a.h !== b.h) {
  console.error("frames are not on the same canvas — run wave.mjs normalize first");
  process.exit(1);
}
const { w, h } = a;
const idx = (x, y) => (y * w + x) * 4;

/* alpha-weighted x centroid of the bottom 15% of rows = where his legs are */
function legsCentroid(img) {
  let sum = 0;
  let weight = 0;
  for (let y = Math.floor(h * 0.85); y < h; y++) {
    for (let x = 0; x < w; x++) {
      const al = img.data[idx(x, y) + 3];
      sum += x * al;
      weight += al;
    }
  }
  return weight ? sum / weight : w / 2;
}

const shift = Math.round(legsCentroid(a) - legsCentroid(b));
console.log(`aligning frame B by ${shift}px (legs centroid match)`);

/* shift B horizontally into a new buffer */
const bAligned = Buffer.alloc(b.data.length);
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const sx = x - shift;
    if (sx >= 0 && sx < w) {
      b.data.copy(bAligned, idx(x, y), idx(sx, y), idx(sx, y) + 4);
    }
  }
}

/* mask where the frames genuinely differ (the arm), then dilate it so the
   seam lands in clean air instead of slicing through pixels */
const THRESH = 40;
let mask = new Uint8Array(w * h);
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = idx(x, y);
    const d = Math.max(
      Math.abs(a.data[i] - bAligned[i]),
      Math.abs(a.data[i + 1] - bAligned[i + 1]),
      Math.abs(a.data[i + 2] - bAligned[i + 2]),
      Math.abs(a.data[i + 3] - bAligned[i + 3]),
    );
    if (d > THRESH) mask[y * w + x] = 1;
  }
}
const DILATE = 4;
for (let it = 0; it < DILATE; it++) {
  const next = new Uint8Array(mask);
  for (let y = 1; y < h - 1; y++) {
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

/* the arm only moves in the upper ~60% of the sprite; below that, force
   frame A so legs/boots can never flicker even if the diff was noisy */
const ARM_ZONE = Math.floor(h * 0.6);

const bOut = Buffer.from(a.data);
let armPixels = 0;
for (let y = 0; y < ARM_ZONE; y++) {
  for (let x = 0; x < w; x++) {
    if (mask[y * w + x]) {
      const i = idx(x, y);
      bAligned.copy(bOut, i, i, i + 4);
      armPixels++;
    }
  }
}
console.log(`arm region: ${armPixels} px (${((armPixels / (w * h)) * 100).toFixed(1)}% of canvas)`);

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
