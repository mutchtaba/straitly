import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "out", "retro");
mkdirSync(OUT, { recursive: true });

const env = readFileSync(join(DIR, ".env"), "utf8");
const API_KEY = env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
if (!API_KEY) {
  console.error("No OPENAI_API_KEY found in .env");
  process.exit(1);
}

// Shared hard rules: every image must have a straight-on, blank, rectangular
// screen so live HTML code can be overlaid on it later, and must sit on the
// site's flat charcoal background so it blends into the page.
const RULES = `
NON-NEGOTIABLE RULES (follow exactly):
- The computer faces the viewer PERFECTLY STRAIGHT-ON, dead-center, zero perspective tilt — the screen is a flat, perfectly rectangular (or gently rounded-corner) surface parallel to the picture plane.
- The screen is COMPLETELY BLANK: a dark, near-black surface (#0b0f0c) with only the faintest phosphor-green tint at the edges. NO text, NO characters, NO cursor, NO reflections, NO scanline content, NOTHING drawn on the screen.
- The screen is LARGE in the frame — it occupies as much of the composition as the design of the machine allows.
- The background of the ENTIRE canvas is one perfectly flat solid charcoal, hex #313338 — no vignette, no gradient, no floor line unless stated, no black.
- Accent colors come only from this palette: warm cream #F0EBE2, amber terracotta #B77F5A with highlights #CF9268, medium charcoal #3A3E46 with edge highlights #4A4E57, and small phosphor-green #33ff66 glows for power LEDs only.
- No human characters. No brand logos of real companies. No text anywhere in the image.
- Generous empty margin (at least 10%) around the machine on all sides.`;

const PIXEL = `Create a premium 16-bit pixel-art illustration, crisp retro video-game asset quality.`;
const PAINTED = `Create a premium painted retro illustration, soft cinematic studio lighting, slightly photorealistic, product-shot quality.`;

const JOBS = [
  {
    name: "01-macintosh-pixel",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A classic 1984 Macintosh-style all-in-one personal computer, warm cream #F0EBE2 beige case with subtle #B77F5A shading. Compact vertical body, built-in CRT screen in the upper half with a chunky rounded bezel, a horizontal floppy-disk slot below the screen, and a tiny glowing phosphor-green power LED. It sits directly on the flat charcoal background with a soft subtle shadow beneath it. Friendly, iconic, minimal.`,
  },
  {
    name: "02-crt-battlestation-pixel",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A chunky mid-90s beige CRT monitor, deep curved case, wide bezel with small dials and a phosphor-green power LED, sitting on top of a matching beige desktop computer tower case lying horizontally. In front of it, a big clunky beige mechanical keyboard with cream keycaps. All plastics warm cream #F0EBE2 with amber #B77F5A shading. Soft shadow beneath. Nostalgic office battlestation, minimal and clean.`,
  },
  {
    name: "03-phosphor-terminal-pixel",
    prompt: `${PIXEL}
${RULES}

SUBJECT: An early-80s industrial computer terminal in dark charcoal #3A3E46 housing with #4A4E57 edge highlights — the serious machine-room kind. Massive rounded CRT tube in a heavy square bezel, ventilation slots along the sides, a row of tiny amber and phosphor-green status LEDs under the screen, and a heavy-duty dark keyboard attached at the base. Looks like it belongs in a 1983 data center. Moody but readable.`,
  },
  {
    name: "04-wedge-commodore-pixel",
    prompt: `${PIXEL}
${RULES}

SUBJECT: An early-80s home computer setup: a wedge-shaped cream #F0EBE2 keyboard-computer (the whole computer inside the keyboard, like a Commodore 64) in the foreground, with a separate compact cream CRT monitor sitting on a small matching riser directly behind and above it. Amber #B77F5A function keys on the keyboard, one glowing phosphor-green power LED on the monitor. Soft shadow beneath both. Charming, boxy, toy-like.`,
  },
  {
    name: "05-retrofuture-console-pixel",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A retro-futuristic 1980s sci-fi computer console — a large CRT screen embedded in a wide charcoal #3A3E46 control panel with #4A4E57 highlights, flanked by columns of chunky toggle switches, round dials, and small blinking amber #CF9268 and phosphor-green indicator lights. Looks like mission control in a 1985 space movie. The CRT screen is still the dominant element, dead-center. Cinematic, mysterious, minimal.`,
  },
  {
    name: "06-macintosh-painted",
    prompt: `${PAINTED}
${RULES}

SUBJECT: A lovingly-lit vintage 1984 Macintosh-style all-in-one computer, warm cream #F0EBE2 beige plastic with gentle aging and amber #B77F5A bounce light, built-in CRT with rounded bezel, floppy slot below, tiny glowing green power LED. Soft studio product lighting, gentle shadow beneath, slight film grain. Nostalgic and premium, like a museum piece photographed for a design magazine.`,
  },
  {
    name: "07-desk-scene-pixel",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A cozy late-night hacker desk scene, still perfectly front-on: a chunky beige #F0EBE2 CRT monitor dead-center on a simple charcoal #3A3E46 desk surface (a single horizontal line of desk, nothing more), the monitor large and dominant. Beside it on the desk: a small stack of floppy disks with cream labels and a steaming amber #B77F5A coffee mug. A beige keyboard in front. One phosphor-green power LED. Warm amber desk-lamp glow from one side spilling softly. Minimal props, lots of empty charcoal space.`,
  },
];

const CONCURRENCY = 4;
const MAX_ATTEMPTS = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
          size: "1280x1024",
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
    writeFileSync(join(OUT, `${job.name}.png`), Buffer.from(b64, "base64"));
    console.log(`[${job.name}] done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    return true;
  }
  console.log(`[${job.name}] FAILED after ${MAX_ATTEMPTS} attempts`);
  return false;
}

console.log(`Generating ${JOBS.length} retro computer options with concurrency ${CONCURRENCY}...`);
const queue = [...JOBS];
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
