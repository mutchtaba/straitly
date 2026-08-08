/*
 * Generates candidate sprites for the ZDR / security section: one retro
 * lock-ish object, four takes. Same pipeline as gateway.mjs (magenta
 * chroma-key -> transparent png). Run: node security.mjs [filter]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "out", "security");
mkdirSync(OUT, { recursive: true });

const env = readFileSync(join(DIR, ".env"), "utf8");
const API_KEY = env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
if (!API_KEY) {
  console.error("No OPENAI_API_KEY found in .env");
  process.exit(1);
}

const PIXEL = `Create a premium 16-bit pixel-art illustration, crisp retro video-game asset quality.`;

const RULES = `
NON-NEGOTIABLE RULES (follow exactly):
- The background of the ENTIRE canvas is one perfectly flat, solid, pure magenta hex #FF00FF (chroma-key). No vignette, no gradient, no shadow, no floor, no glow — nothing but flat #FF00FF outside the object's silhouette. Magenta must NOT appear anywhere on the object itself.
- One single object, dead-center, facing the viewer PERFECTLY STRAIGHT-ON, zero perspective tilt.
- Palette: warm cream #F0EBE2, amber terracotta #B77F5A with highlights #CF9268, medium charcoal #3A3E46 with edge highlights #4A4E57, small phosphor-green #33ff66 for LEDs only.
- No human characters. No text anywhere unless explicitly stated.
- Generous empty flat-magenta margin (at least 8%) around the object.`;

const JOBS = [
  {
    name: "vault-door",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A round bank-vault door, seen dead straight-on: a heavy charcoal #3A3E46 circular door with #4A4E57 edge highlights set in a cream #F0EBE2 square frame with four corner bolts. In the door's center, a chunky three-spoke spinner handle in terracotta #B77F5A with #CF9268 highlights. Around the spinner, a ring of small rivets. One tiny phosphor-green #33ff66 status LED lit near the top of the frame, signalling "sealed". Massive, safe, premium 1983 bank energy.`,
  },
  {
    name: "padlock",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A chunky industrial padlock, the classic silhouette, filling most of the frame: a medium charcoal-gray #3A3E46 rounded-square metal body with #4A4E57 edge highlights and subtle darker shading — industrial gunmetal, NOT cream, NOT white — with a thick slightly-darker charcoal steel shackle, CLOSED. Small warm cream #F0EBE2 and terracotta #B77F5A accent details only (a keyhole plate, tiny screws). Dominating the body's face: one LARGE wide dark near-black inset LED display window with a subtle recessed border, spanning roughly two thirds of the body's width and one third of its height, completely BLANK and unlit (text will be printed there later). Below the display, one tiny lit phosphor-green #33ff66 LED. Reads instantly as "locked". Serious 1983 data-center hardware energy, crisp and minimal.`,
  },
  {
    name: "lock-terminal",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A small industrial security terminal: a squat charcoal #3A3E46 machine with #4A4E57 edge highlights and a cream #F0EBE2 faceplate, and mounted on the faceplate a big padlock icon rendered as a physical cream badge with a closed terracotta #B77F5A shackle. A thin row of tiny status LEDs along the bottom of the faceplate — all unlit except one phosphor-green #33ff66. Serious, premium, 1983 data-center security module energy.`,
  },
  {
    name: "shield-lock",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A heraldic security shield in pixel-art: a warm cream #F0EBE2 shield shape with a thick charcoal #3A3E46 border and #4A4E57 rim highlights. Centered on the shield, a chunky closed padlock in terracotta #B77F5A with #CF9268 highlights and a charcoal shackle. One tiny phosphor-green #33ff66 LED dot at the shield's top point. Emblem-like, flat, crisp, minimal — a badge of trust.`,
  },
];

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

async function generate(job) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const t0 = Date.now();
    let res;
    try {
      res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt: job.prompt,
          size: "1024x1024",
          quality: "high",
          output_format: "png",
          n: 1,
        }),
      });
    } catch (err) {
      console.log(`[${job.name}] network error (attempt ${attempt}): ${err.message}`);
      await sleep(15000 * attempt);
      continue;
    }

    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after")) || 20 * attempt;
      console.log(`[${job.name}] HTTP ${res.status}, retrying in ${retryAfter}s`);
      await res.text().catch(() => {});
      await sleep(retryAfter * 1000);
      continue;
    }

    if (!res.ok) {
      console.log(`[${job.name}] FAILED ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return false;
    }

    const json = await res.json();
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) {
      console.log(`[${job.name}] FAILED: no image in response`);
      return false;
    }
    const raw = Buffer.from(b64, "base64");
    let out = raw;
    try {
      out = await chromaKey(raw);
    } catch (err) {
      console.log(`[${job.name}] post-process failed (${err.message}), saved raw`);
    }
    writeFileSync(join(OUT, `${job.name}.png`), out);
    console.log(`[${job.name}] done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    return true;
  }
  console.log(`[${job.name}] FAILED after ${MAX_ATTEMPTS} attempts`);
  return false;
}

const filter = process.argv[2];
const RUN = filter ? JOBS.filter((j) => j.name.includes(filter)) : JOBS;
console.log(`Generating ${RUN.length} security sprites...`);
const queue = [...RUN];
const workers = Array.from({ length: 4 }, async () => {
  while (queue.length) await generate(queue.shift());
});
await Promise.all(workers);
console.log("ALL DONE");
