import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = join(DIR, "out", "retro");

// Screen pixels are near-black (~#0b0f0c, luma ~12). Site bg is #313338
// (luma ~51) and dark casings are #3A3E46+ (luma ~62), so luma < 32 isolates glass.
const LUMA_MAX = 32;

function largestComponentBBox(mask, w, h) {
  const labels = new Int32Array(w * h).fill(-1);
  let best = null;
  const stack = [];
  let label = 0;
  for (let i = 0; i < w * h; i++) {
    if (!mask[i] || labels[i] !== -1) continue;
    let minX = w, maxX = 0, minY = h, maxY = 0, count = 0;
    stack.push(i);
    labels[i] = label;
    while (stack.length) {
      const p = stack.pop();
      const px = p % w, py = (p / w) | 0;
      count++;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
      // 4-neighbourhood
      if (px > 0 && mask[p - 1] && labels[p - 1] === -1) { labels[p - 1] = label; stack.push(p - 1); }
      if (px < w - 1 && mask[p + 1] && labels[p + 1] === -1) { labels[p + 1] = label; stack.push(p + 1); }
      if (py > 0 && mask[p - w] && labels[p - w] === -1) { labels[p - w] = label; stack.push(p - w); }
      if (py < h - 1 && mask[p + w] && labels[p + w] === -1) { labels[p + w] = label; stack.push(p + w); }
    }
    if (!best || count > best.count) best = { count, minX, maxX, minY, maxY, label };
    label++;
  }
  return { best, labels };
}

// Shrink bbox to rows/cols that are >=95% dark, so the rect sits fully on glass
// (handles rounded CRT corners and bezel bleed).
function innerRect(mask, w, bbox) {
  const { minX, maxX, minY, maxY } = bbox;
  const rowCov = [], colCov = [];
  for (let y = minY; y <= maxY; y++) {
    let c = 0;
    for (let x = minX; x <= maxX; x++) c += mask[y * w + x];
    rowCov.push(c / (maxX - minX + 1));
  }
  for (let x = minX; x <= maxX; x++) {
    let c = 0;
    for (let y = minY; y <= maxY; y++) c += mask[y * w + x];
    colCov.push(c / (maxY - minY + 1));
  }
  const first = (arr) => arr.findIndex((v) => v >= 0.95);
  const last = (arr) => arr.length - 1 - [...arr].reverse().findIndex((v) => v >= 0.95);
  return {
    x0: minX + first(colCov),
    x1: minX + last(colCov),
    y0: minY + first(rowCov),
    y1: minY + last(rowCov),
  };
}

const results = {};
for (const file of readdirSync(SRC).filter((f) => f.endsWith(".png")).sort()) {
  const img = sharp(join(SRC, file));
  const { width: w, height: h } = await img.metadata();
  const raw = await img.raw().toBuffer(); // RGB or RGBA
  const ch = raw.length / (w * h);
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = raw[i * ch], g = raw[i * ch + 1], b = raw[i * ch + 2];
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    mask[i] = luma < LUMA_MAX ? 1 : 0;
  }
  const { best } = largestComponentBBox(mask, w, h);
  if (!best) {
    console.log(`${file}: NO dark region found`);
    continue;
  }
  const r = innerRect(mask, w, best);
  const pct = (v, total) => +((v / total) * 100).toFixed(2);
  results[file] = {
    imgW: w,
    imgH: h,
    leftPct: pct(r.x0, w),
    topPct: pct(r.y0, h),
    widthPct: pct(r.x1 - r.x0 + 1, w),
    heightPct: pct(r.y1 - r.y0 + 1, h),
    darkPixels: best.count,
  };
}
console.log(JSON.stringify(results, null, 2));
