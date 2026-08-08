/*
 * Generates the three asset sets for the "what is an LLM gateway" diagram:
 *   1. app/       — "your app" retro window card (no logo)
 *   2. straitly/  — the central router machine (Straitly mark fed as reference)
 *   3. providers/ — one tile per provider (real logo fed as reference)
 *
 * All on transparent backgrounds so we can compose the diagram in HTML/CSS
 * with live animated connector lines. Run: node gateway.mjs
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..", "..");
const OUT = join(DIR, "out", "gateway");
const REF = join(DIR, "tmp", "gateway-refs");
mkdirSync(OUT, { recursive: true });
mkdirSync(REF, { recursive: true });

const env = readFileSync(join(DIR, ".env"), "utf8");
const API_KEY = env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
if (!API_KEY) {
  console.error("No OPENAI_API_KEY found in .env");
  process.exit(1);
}

const PIXEL = `Create a premium 16-bit pixel-art illustration, crisp retro video-game asset quality.`;

// Shared rules for composable sprites: chroma-key bg, straight-on, site palette.
const RULES = `
NON-NEGOTIABLE RULES (follow exactly):
- The background of the ENTIRE canvas is one perfectly flat, solid, pure magenta hex #FF00FF (chroma-key). No vignette, no gradient, no shadow, no floor, no glow — nothing but flat #FF00FF outside the object's silhouette. Magenta must NOT appear anywhere on the object itself.
- One single object, dead-center, facing the viewer PERFECTLY STRAIGHT-ON, zero perspective tilt.
- Palette: warm cream #F0EBE2, amber terracotta #B77F5A with highlights #CF9268, medium charcoal #3A3E46 with edge highlights #4A4E57, small phosphor-green #33ff66 for LEDs only.
- No human characters. No text anywhere unless explicitly stated.
- Generous empty flat-magenta margin (at least 8%) around the object.`;

const LOGO_RULE = `
- The FIRST attached image is the exact official logo. Reproduce it FAITHFULLY — same shapes, same proportions. Do not redraw, distort, restyle or recolor it beyond what is stated.`;

// svg -> big clean png reference for the edits endpoint
async function svgToPng(svgPath, outPath, bg) {
  const img = sharp(svgPath, { density: 300 }).resize(768, 768, {
    fit: "inside",
  });
  const composed = bg
    ? sharp({
        create: { width: 900, height: 900, channels: 4, background: bg },
      }).composite([{ input: await img.png().toBuffer(), gravity: "center" }])
    : img;
  writeFileSync(outPath, await composed.png().toBuffer());
}

const PROVIDERS = [
  "openai",
  "claude",
  "gemini",
  "grok",
  "deepseek",
  "mistral",
  "qwen",
  "meta",
];

const JOBS = [
  // ---- set 1: the app (pure generation, no reference) ----
  {
    name: "app-window",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A retro 1980s operating-system application window, warm cream #F0EBE2 rounded-rectangle card with a chunky charcoal #3A3E46 title bar holding three tiny square buttons. Inside the window: a few abstract charcoal text-line bars of varying width, and one wide input field strip with a small phosphor-green arrow button at its right end. Reads instantly as "a software app". Flat, crisp, minimal.`,
  },
  {
    name: "app-terminal",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A tiny, cute wedge-shaped cream #F0EBE2 home computer with a small built-in screen, amber #B77F5A function keys, one glowing phosphor-green power LED. The screen is ALIVE: on its dark near-black display sits a small cream #F0EBE2 app window with a charcoal title bar and three tiny square buttons, containing a few short abstract phosphor-green #33ff66 text-line bars of varying width and one solid blinking-cursor block — purely abstract UI shapes, NO readable letters or numbers. The lit screen casts a very subtle green glow on the bezel. Compact and friendly — represents "the developer's app". Soft pixel shading only.`,
  },
  // ---- set 2: straitly router (straitly mark as reference) ----
  {
    name: "straitly-router",
    refs: [join(REF, "straitly.png")],
    prompt: `${PIXEL}
${RULES}${LOGO_RULE}

SUBJECT: A squat, wide industrial router machine — the heart of a network. Heavy charcoal #3A3E46 metal case with #4A4E57 edge highlights, a warm cream #F0EBE2 front faceplate. The attached logo is embossed LARGE and dead-center on the cream faceplate in charcoal. One chunky input port on the machine's LEFT edge, a vertical column of six output ports on its RIGHT edge, a thin row of tiny amber and phosphor-green status LEDs along the bottom of the faceplate. Serious, premium, 1983 data-center energy.`,
  },
  {
    name: "straitly-tower",
    refs: [join(REF, "straitly.png")],
    prompt: `${PIXEL}
${RULES}${LOGO_RULE}

SUBJECT: A vertical industrial signal-tower machine in charcoal #3A3E46 with #4A4E57 highlights: stacked equipment modules with ventilation slots, small amber dials, and phosphor-green LEDs. Near the top, a cream #F0EBE2 panel carries the attached logo embossed in charcoal, large and clearly readable. Cables enter on the left, a column of output sockets on the right. Premium retro network-hub energy.`,
  },
];

// ---- provider rack unit: one blank sprite reused for every provider;
//      logo + status text are overlaid live in HTML ----
JOBS.push({
  name: "provider-unit",
  prompt: `${PIXEL}
${RULES}

SUBJECT: A small, wide industrial rack-mount network unit, landscape orientation roughly 3:1, the little sibling of a serious 1983 data-center router. Heavy charcoal #3A3E46 metal case with #4A4E57 edge highlights and two tiny screws in the corners. The front is a warm cream #F0EBE2 faceplate with: on its LEFT third, one large completely BLANK square cream label area with a subtle recessed border (empty — a logo will be printed there later); on its RIGHT third, one wide dark near-black inset LED display window, completely BLANK and unlit (status text appears there later); between them, a small vertical column of three tiny round status LEDs (one phosphor-green #33ff66, two unlit charcoal). One chunky input port centered on the LEFT edge of the case. Flat, crisp, premium, minimal.`,
});

// ---- provider TVs for the routing showcase: the coin-op TV from the model
//      catalog, re-themed per provider. The existing Anthropic TV is fed as
//      the exact style reference; only cabinet accent colors change. Screens
//      stay lit + blank (logo/status overlaid live in HTML). ----
const TV_REF = join(ROOT, "public", "retro", "tv-anthropic-on.png");
const TV_THEMES = [
  { key: "bedrock", color: "deep amber-orange #C9803F" },
  { key: "vertexai", color: "cobalt blue #3B6BB0" },
  { key: "azure", color: "sky blue #4F8FD0" },
  { key: "groq", color: "burnt orange #C05B2E" },
  { key: "together", color: "royal blue #2F5FC4" },
  { key: "fireworks", color: "deep violet #5B21B6" },
];
for (const t of TV_THEMES) {
  JOBS.push({
    name: `tv-${t.key}`,
    refs: [TV_REF],
    prompt: `${PIXEL}
${RULES}

The attached image is the EXACT television to reproduce. Draw the very same retro coin-operated television — identical cabinet shape, identical proportions, identical rounded CRT screen position and size, identical side dial knobs, coin slot and vents, identical pixel-art style and shading — with ONE change: re-theme the cabinet's accent color (the colored panels, knobs and trim that are terracotta in the reference) to ${t.color}, keeping the warm cream body. The CRT screen stays exactly like the reference: lit, warm paper white, completely BLANK, no content, subtle glow. Same straight-on angle, same scale in frame.`,
  });
}

// ---- set 3: provider tiles (each real logo as reference) ----
for (const p of PROVIDERS) {
  JOBS.push({
    name: `tile-${p}`,
    refs: [join(REF, `${p}.png`)],
    prompt: `${PIXEL}
${RULES}${LOGO_RULE}

SUBJECT: A chunky retro game-cartridge-style tile: a rounded-square warm cream #F0EBE2 plastic cartridge with subtle #B77F5A shading, ridged grip lines at the top, and a large square label area on the front. The attached logo is printed centered on the label, faithfully and crisply, in dark charcoal #3A3E46 monochrome. Looks like a collectible computer chip cartridge. Flat, crisp, minimal.`,
  });
}

const CONCURRENCY = 4;
const MAX_ATTEMPTS = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Remove the flat #FF00FF chroma background: fully magenta pixels become
   transparent; near-magenta edge pixels get their alpha scaled + magenta
   fringe neutralized so pixel-art edges stay crisp. Then trim to content. */
async function chromaKey(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // "magenta-ness": high red + high blue + low green
    const d = Math.sqrt((255 - r) ** 2 + g ** 2 + (255 - b) ** 2);
    if (d < 90) {
      data[i + 3] = 0;
    } else if (d < 170) {
      // edge pixel: fade alpha, pull color away from magenta fringe
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

async function callApi(job) {
  if (job.refs?.length) {
    const form = new FormData();
    form.append("model", "gpt-image-2");
    form.append("prompt", job.prompt);
    form.append("size", "1024x1024");
    form.append("quality", "high");
    form.append("output_format", "png");
    for (const r of job.refs) {
      form.append(
        "image[]",
        new Blob([readFileSync(r)], { type: "image/png" }),
        r.split("/").pop()
      );
    }
    return fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: form,
    });
  }
  return fetch("https://api.openai.com/v1/images/generations", {
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
}

async function generate(job) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const t0 = Date.now();
    let res;
    try {
      res = await callApi(job);
    } catch (err) {
      console.log(`[${job.name}] network error (attempt ${attempt}): ${err.message}`);
      await sleep(15000 * attempt);
      continue;
    }

    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after")) || 20 * attempt;
      console.log(`[${job.name}] HTTP ${res.status}, retrying in ${retryAfter}s (attempt ${attempt}/${MAX_ATTEMPTS})`);
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
    // key out the magenta bg, then trim to content with a hair of padding
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

// prepare logo references
console.log("Preparing logo references...");
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
await svgToPng(join(ROOT, "brand", "straitly-mark.svg"), join(REF, "straitly.png"), WHITE);
for (const p of PROVIDERS) {
  const src = join(ROOT, "public", "logos", `${p}.svg`);
  if (!existsSync(src)) {
    console.error(`Missing logo: ${src}`);
    process.exit(1);
  }
  await svgToPng(src, join(REF, `${p}.png`), WHITE);
}

// optional CLI filter: node gateway.mjs app-terminal
const filter = process.argv[2];
const RUN = filter ? JOBS.filter((j) => j.name.includes(filter)) : JOBS;
console.log(`Generating ${RUN.length} gateway assets with concurrency ${CONCURRENCY}...`);
const queue = [...RUN];
let ok = 0;
let fail = 0;
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const job = queue.shift();
    (await generate(job)) ? ok++ : fail++;
  }
});
await Promise.all(workers);
console.log(`ALL DONE: ${ok} succeeded, ${fail} failed`);
