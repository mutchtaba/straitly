import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "out", "variants");
mkdirSync(OUT, { recursive: true });

const env = readFileSync(join(DIR, ".env"), "utf8");
const API_KEY = env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
if (!API_KEY) {
  console.error("No OPENAI_API_KEY found in .env");
  process.exit(1);
}

const STYLE = `Create a 16-bit isometric pixel-art illustration, premium retro video-game asset quality, LANDSCAPE composition that reads LEFT TO RIGHT.

COLOR RULES (follow exactly):
- The background is one perfectly flat solid charcoal, hex #313338, across the ENTIRE canvas — no vignette, no gradient, no darkening toward the edges, no black. NO floor grid, no grid lines anywhere — the floor is the same pure flat #313338.
- Data-center tower bodies are medium charcoal #3A3E46 with clearly visible lighter edge highlights #4A4E57 — the towers must read clearly against the background, never near-black.
- Generous warm lighting: small glowing amber windows on towers, warm amber glow from every token cube spilling softly onto the floor.
- Token cubes: rich saturated amber terracotta #B77F5A with bright #CF9268 highlights.
- Price tags: bright cream #F0EBE2 paper with dark charcoal #2A2C30 blocky 8-bit pixel type.
- Overall the scene is warm and readable, not moody-dark.`;

const WITHOUT_BASE = `${STYLE}

SCENE — "buying retail, alone":
On the LEFT side of the canvas stand THREE separate data-center towers, arranged in a shallow front-to-back isometric row, one tower per AI lab. Each tower has one glowing sign plate on its front face showing a logo in cream #F0EBE2 pixel art, crisp and clearly recognizable: the first tower shows the OpenAI logo from image 1, the second tower the Anthropic logo from image 2, the third tower the xAI logo from image 3.

From EACH of the three towers, a separate THIN fragile winding pipe runs across the floor to the RIGHT. All three thin pipes converge at ONE small lonely developer desk with a computer monitor on the RIGHT side of the canvas. ON TOP of the desk surface, right beside the monitor, sits one small glowing amber token cube — the cube is ON the desk, never on the floor. A string runs from the cube down to a comically ENORMOUS cream price tag lying flat on the floor next to the desk, printed with "$$$" (exactly three dollar signs) in huge dark blocky 8-bit pixel type. The tag is far bigger than the desk — the joke is a tiny purchase with a giant price.

COMPOSITION RULES: the scene must BREATHE — generous empty flat-charcoal floor between the tower group and the desk, at least 12% empty margin around the entire scene, nothing crowded or overlapping.

No text anywhere except the "$$$" on the tag. No human characters. Cinematic, minimal, generous negative space.`;

const WITH_BASE = `${STYLE}

SCENE — "buying wholesale, together":
On the LEFT side of the canvas stand THREE separate data-center towers, arranged in a shallow front-to-back isometric row, one tower per AI lab. Each tower has one glowing sign plate on its front face showing a logo in cream #F0EBE2 pixel art, crisp and clearly recognizable: the first tower shows the OpenAI logo from image 1, the second tower the Anthropic logo from image 2, the third tower the xAI logo from image 3.

From the three towers, three THICK industrial pipes run toward the right and visibly JOIN at a single clear Y-shaped manifold junction, merging into EXACTLY ONE extra-heavy main pipe. That ONE merged pipe runs low along the floor and connects directly into the LEFT side of the pallet described below. PIPE RULES: there are NO other pipes between the towers and the pallet — no overhead pipes, no elevated horizontal pipe, no floating or disconnected pipe segments, nothing running above or behind the pallet. Every pipe in the scene is connected at both ends.

Floating in the empty air ABOVE the merged main pipe, small bright cream #F0EBE2 blocky 8-bit pixel text, all caps, perfectly crisp, evenly spaced, horizontal: "WE BUY IN BULK AT A DISCOUNT".

The merged main pipe feeds a large wooden shipping pallet in the CENTER of the canvas, stacked high with many glowing amber token cubes strapped together as one bulk load, radiating warm light. A large cream price tag printed with "$$" (exactly two dollar signs) in dark blocky pixel type stands leaning against the LEFT SIDE of the pallet, at its left edge — NOT covering the middle of the cube stack. Next to the pallet stands a small glowing sign post displaying the Straitly compass logo from image 4 (terracotta #B77F5A circle with compass needle), undistorted.

From the RIGHT side of the pallet, three delivery lines fan out to the RIGHT to three small developer desks with computer monitors on the RIGHT side of the canvas. CRITICAL: these three outgoing delivery lines are MUCH THINNER than the thick intake pipes — slim, small-diameter tubes, roughly one quarter of the intake pipe thickness. Thick pipes IN on the left, thin tubes OUT on the right — the contrast is the point. On each desk, ON the desk surface beside the monitor, sits one small glowing amber cube with a SMALL cream tag printed with a single "$" in dark pixel type — cubes always on desks, never on the floor.

COMPOSITION RULES: the scene must BREATHE. Keep every element compact and leave generous empty flat-charcoal floor between the three groups (towers | pallet | desks) — clear open gaps, nothing crowded, nothing overlapping. Leave at least 12% empty margin around the entire scene on all sides. The pixel caption text floats alone in open air with plenty of empty space around it, never touching or overlapping any object.

No text anywhere except "WE BUY IN BULK AT A DISCOUNT", the "$$" on the pallet tag, and the "$" on the three desk tags. No human characters. Cinematic, minimal, generous negative space.`;

const WITHOUT_VARIATIONS = [
  "Arrange the three towers in a gentle arc instead of a straight row; the pipes sweep in smooth graceful curves to the desk.",
  "Pull the camera slightly further out so the whole scene sits smaller in the frame with extra empty margin on all sides.",
  "Place the desk in the lower-right corner and lay the giant tag diagonally, pointing toward the bottom-right corner.",
  "Give the three pipes more dramatic winding S-curves across the floor, clearly tangled and inefficient-looking.",
  "The enormous price tag leans upright against the side of the desk instead of lying flat on the floor.",
  "Cluster the three towers tightly together and make the pipe run to the desk noticeably longer across empty floor.",
  "Make the lighting warmer and cozier: stronger amber glow from the tower windows and the cube, soft pools of light on the floor.",
  "Lower the camera angle slightly so the towers feel taller and more imposing over the tiny desk.",
  "Make the giant tag even bigger relative to the desk — almost twice the desk footprint — for maximum comic effect.",
  "Ultra-minimal rendition: simplify the tower faces and desk details to the fewest readable pixel shapes, maximum negative space.",
];

const WITH_VARIATIONS = [
  "Arrange the three towers in a gentle arc; the Y-junction sits close to the towers so the single merged pipe run is long and prominent.",
  "Place the pixel caption text in the upper-center of the canvas and make the pallet slightly smaller so the text has even more air.",
  "Put the Straitly compass sign near the pallet's front-left corner beside the $$ tag, and stagger the three desks on a diagonal.",
  "Pull the camera further out so the whole scene sits smaller in the frame with extra empty margin on all sides.",
  "Make the pallet glow stronger — the brightest object in the scene — with dark straps for contrast.",
  "Make the junction a clean industrial T-manifold block instead of a Y, with short straight pipe runs from the towers.",
  "Arrange the three desks in an even vertical column on the right edge with equal spacing between them.",
  "Hang the $$ tag from the pallet's left strap so it dangles over the left face of the cube stack.",
  "Make the three outgoing delivery lines even thinner — like slim cables with small couplings — emphasizing the thick-in thin-out contrast.",
  "Ultra-minimal rendition: simplify all details to the fewest readable pixel shapes, maximum negative space, calm and airy.",
];

const LOGO_REFS_3 = ["refs/logo-openai.png", "refs/logo-anthropic.png", "refs/logo-xai.png"];
const LOGO_REFS_4 = [...LOGO_REFS_3, "refs/logo-straitly.png"];

const JOBS = [];
WITHOUT_VARIATIONS.forEach((note, i) => {
  JOBS.push({
    name: `without-${String(i + 1).padStart(2, "0")}`,
    refs: LOGO_REFS_3,
    prompt: `${WITHOUT_BASE}\n\nVARIATION NOTE (apply while keeping every rule above): ${note}`,
  });
});
WITH_VARIATIONS.forEach((note, i) => {
  JOBS.push({
    name: `with-${String(i + 1).padStart(2, "0")}`,
    refs: LOGO_REFS_4,
    prompt: `${WITH_BASE}\n\nVARIATION NOTE (apply while keeping every rule above): ${note}`,
  });
});

const CONCURRENCY = 4;
const MAX_ATTEMPTS = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(job) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const fd = new FormData();
    fd.append("model", "gpt-image-2");
    fd.append("prompt", job.prompt);
    fd.append("size", "1280x1024");
    fd.append("quality", "high");
    fd.append("output_format", "png");
    fd.append("n", "1");
    for (const ref of job.refs) {
      const p = join(DIR, ref);
      fd.append("image[]", new Blob([readFileSync(p)], { type: "image/png" }), basename(p));
    }

    const t0 = Date.now();
    let res;
    try {
      res = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${API_KEY}` },
        body: fd,
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

console.log(`Generating ${JOBS.length} variants with concurrency ${CONCURRENCY}...`);
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
