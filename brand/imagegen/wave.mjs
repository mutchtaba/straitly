/*
 * Generates two waving frames of the mascot for the announcement strip.
 * SEQUENTIAL by design: frame A is generated from the standing reference,
 * then frame B is generated FROM frame A's raw output, told to change only
 * the waving arm — so the body stays pixel-identical between frames and the
 * animation doesn't "blink". Magenta chroma-key pipeline as usual.
 * Run: node wave.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "out", "wave");
mkdirSync(OUT, { recursive: true });

const env = readFileSync(join(DIR, ".env"), "utf8");
const API_KEY = env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
if (!API_KEY) {
  console.error("No OPENAI_API_KEY found in .env");
  process.exit(1);
}

const REF = join(DIR, "..", "..", "public", "retro", "guy", "stride-1.png");

const RULES = `
NON-NEGOTIABLE RULES (follow exactly):
- The background of the ENTIRE canvas is one perfectly flat, solid, pure magenta hex #FF00FF (chroma-key). No vignette, no gradient, no shadow, no floor — nothing but flat #FF00FF outside the character's silhouette. Magenta must NOT appear on the character.
- The character stands upright, full body visible, FACING THE VIEWER straight-on.
- One character only, dead-center, generous flat-magenta margin around him.
- No text anywhere.`;

const PROMPT_A = `The attached image is the EXACT character reference: a 16-bit pixel-art miner mascot — cream-white hard hat with a small headlamp, terracotta/rust shirt, dark charcoal overalls, dark boots. Reproduce THIS character faithfully: same palette, same pixel style, same face, and EXACTLY the same body proportions as the reference — same head-to-body ratio, same limb thickness. Do not redesign him, do not make him fatter or thinner.
${RULES}

POSE: Friendly wave, frame A: his RIGHT arm (viewer's left) is raised with the elbow bent, and the forearm leans INWARD across his body so his open hand is up beside the top of his hard hat, palm out. A clear diagonal forearm angle, like the start of a big hello wave. Other arm relaxed at his side. Friendly open-mouth smile. Feet together, standing still.`;

const PROMPT_B = `The attached image is frame A of a two-frame pixel-art waving animation. Create frame B.

COPY the attached image EXACTLY, pixel for pixel: same canvas, same character position, same body, same legs, same feet, same torso, same head, same hard hat, same face, same expression, same relaxed left arm, same colors. Frame B must be IDENTICAL to the attached image in every way except one thing:

THE ONLY CHANGE: his raised waving arm. Swing the forearm and open hand from leaning INWARD (as attached) to leaning far OUTWARD, away from his head — pivot at the elbow by roughly 70 degrees, a big dramatic wave swing, hand at head height well clear of the hat, palm out. Keep the same arm thickness and hand size.
${RULES}`;

const MAX_ATTEMPTS = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function chromaKey(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const d = Math.sqrt((255 - r) ** 2 + g ** 2 + (255 - b) ** 2);
    if (d < 90) {
      data[i + 3] = 0;
    } else if (d < 170) {
      data[i + 3] = Math.round(((d - 90) / 80) * data[i + 3]);
      data[i] = Math.min(r, Math.round((r + g) / 2) + 40);
      data[i + 2] = Math.min(b, Math.round((b + g) / 2) + 40);
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 8 })
    .extend({
      top: 8,
      bottom: 8,
      left: 8,
      right: 8,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

/* returns the RAW (magenta background) buffer, or null on failure */
async function callApi(name, prompt, refPath) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const fd = new FormData();
    fd.append("model", "gpt-image-2");
    fd.append("prompt", prompt);
    fd.append("size", "1024x1024");
    fd.append("quality", "high");
    fd.append("output_format", "png");
    fd.append("n", "1");
    fd.append(
      "image[]",
      new Blob([readFileSync(refPath)], { type: "image/png" }),
      basename(refPath),
    );

    const t0 = Date.now();
    let res;
    try {
      res = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${API_KEY}` },
        body: fd,
      });
    } catch (err) {
      console.log(`[${name}] network error (attempt ${attempt}): ${err.message}`);
      await sleep(15000 * attempt);
      continue;
    }

    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after")) || 20 * attempt;
      console.log(`[${name}] HTTP ${res.status}, retrying in ${retryAfter}s`);
      await res.text().catch(() => {});
      await sleep(retryAfter * 1000);
      continue;
    }

    if (!res.ok) {
      console.log(`[${name}] FAILED ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return null;
    }

    const json = await res.json();
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) {
      console.log(`[${name}] FAILED: no image in response`);
      return null;
    }
    console.log(`[${name}] done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    return Buffer.from(b64, "base64");
  }
  console.log(`[${name}] FAILED after ${MAX_ATTEMPTS} attempts`);
  return null;
}

/* pad both frames onto one shared canvas, feet pinned to the bottom and
   horizontally centered, so swapping frames never makes him wobble */
async function normalize(paths) {
  const metas = await Promise.all(paths.map((p) => sharp(p).metadata()));
  const W = Math.max(...metas.map((m) => m.width));
  const H = Math.max(...metas.map((m) => m.height));
  for (let i = 0; i < paths.length; i++) {
    const { width, height } = metas[i];
    const buf = await sharp(paths[i])
      .extend({
        top: H - height,
        bottom: 0,
        left: Math.floor((W - width) / 2),
        right: Math.ceil((W - width) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    writeFileSync(paths[i], buf);
  }
  console.log(`normalized both frames to ${W}x${H}`);
}

console.log("Frame A (from standing reference)...");
const rawA = await callApi("wave-a", PROMPT_A, REF);
if (!rawA) process.exit(1);
const rawAPath = join(OUT, "wave-a-raw.png");
writeFileSync(rawAPath, rawA);

console.log("Frame B (from frame A, arm only)...");
const rawB = await callApi("wave-b", PROMPT_B, rawAPath);
if (!rawB) process.exit(1);

const outA = join(OUT, "wave-a.png");
const outB = join(OUT, "wave-b.png");
writeFileSync(outA, await chromaKey(rawA));
writeFileSync(outB, await chromaKey(rawB));
await normalize([outA, outB]);
console.log("ALL DONE");
