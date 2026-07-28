import { readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));

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

const PANELS = {
  without: {
    refs: ["refs/logo-openai.png", "refs/logo-anthropic.png", "refs/logo-xai.png"],
    out: "out/panel-without.png",
    prompt: `${STYLE}

SCENE — "buying retail, alone":
On the LEFT side of the canvas stand THREE separate data-center towers, arranged in a shallow front-to-back isometric row, one tower per AI lab. Each tower has one glowing sign plate on its front face showing a logo in cream #F0EBE2 pixel art, crisp and clearly recognizable: the first tower shows the OpenAI logo from image 1, the second tower the Anthropic logo from image 2, the third tower the xAI logo from image 3.

From EACH of the three towers, a separate THIN fragile winding pipe runs across the floor to the RIGHT. All three thin pipes converge at ONE small lonely developer desk with a computer monitor on the RIGHT side of the canvas. ON TOP of the desk surface, right beside the monitor, sits one small glowing amber token cube — the cube is ON the desk, never on the floor. A string runs from the cube down to a comically ENORMOUS cream price tag lying flat on the floor next to the desk, printed with "$$$" (exactly three dollar signs) in huge dark blocky 8-bit pixel type. The tag is far bigger than the desk — the joke is a tiny purchase with a giant price.

No text anywhere except the "$$$" on the tag. No human characters. Cinematic, minimal, generous negative space.`,
  },
  with: {
    refs: [
      "refs/logo-openai.png",
      "refs/logo-anthropic.png",
      "refs/logo-xai.png",
      "refs/logo-straitly.png",
    ],
    out: "out/panel-with.png",
    prompt: `${STYLE}

SCENE — "buying wholesale, together":
On the LEFT side of the canvas stand THREE separate data-center towers, arranged in a shallow front-to-back isometric row, one tower per AI lab. Each tower has one glowing sign plate on its front face showing a logo in cream #F0EBE2 pixel art, crisp and clearly recognizable: the first tower shows the OpenAI logo from image 1, the second tower the Anthropic logo from image 2, the third tower the xAI logo from image 3.

From the three towers, three THICK industrial pipes run toward the right and visibly JOIN at a single clear Y-shaped manifold junction, merging into EXACTLY ONE extra-heavy main pipe. That ONE merged pipe runs low along the floor and connects directly into the LEFT side of the pallet described below. PIPE RULES: there are NO other pipes between the towers and the pallet — no overhead pipes, no elevated horizontal pipe, no floating or disconnected pipe segments, nothing running above or behind the pallet. Every pipe in the scene is connected at both ends.

Floating in the empty air ABOVE the merged main pipe, small bright cream #F0EBE2 blocky 8-bit pixel text, all caps, perfectly crisp, evenly spaced, horizontal: "WE BUY IN BULK AT A DISCOUNT".

The merged main pipe feeds a large wooden shipping pallet in the CENTER of the canvas, stacked high with many glowing amber token cubes strapped together as one bulk load, radiating warm light. A large cream price tag printed with "$$" (exactly two dollar signs) in dark blocky pixel type stands leaning against the LEFT SIDE of the pallet, at its left edge — NOT covering the middle of the cube stack. Next to the pallet stands a small glowing sign post displaying the Straitly compass logo from image 4 (terracotta #B77F5A circle with compass needle), undistorted.

From the RIGHT side of the pallet, three delivery lines fan out to the RIGHT to three small developer desks with computer monitors on the RIGHT side of the canvas. CRITICAL: these three outgoing delivery lines are MUCH THINNER than the thick intake pipes — slim, small-diameter tubes, roughly one quarter of the intake pipe thickness. Thick pipes IN on the left, thin tubes OUT on the right — the contrast is the point. On each desk, ON the desk surface beside the monitor, sits one small glowing amber cube with a SMALL cream tag printed with a single "$" in dark pixel type — cubes always on desks, never on the floor. The small tags contrast with the giant retail tag of the companion image.

COMPOSITION RULES: the scene must BREATHE. Keep every element compact and leave generous empty flat-charcoal floor between the three groups (towers | pallet | desks) — clear open gaps, nothing crowded, nothing overlapping. Leave at least 12% empty margin around the entire scene on all sides. The pixel caption text floats alone in open air with plenty of empty space around it, never touching or overlapping any object. Prefer fewer, cleaner details over clutter.

No text anywhere except "WE BUY IN BULK AT A DISCOUNT", the "$$" on the pallet tag, and the "$" on the three desk tags. No human characters. Cinematic, minimal, generous negative space.`,
  },
};

const which = process.argv[2];
const panel = PANELS[which];
if (!panel) {
  console.error(`Usage: node gen.mjs <without|with>`);
  process.exit(1);
}

const SIZE = process.env.IMG_SIZE || "1280x1024";

const fd = new FormData();
fd.append("model", "gpt-image-2");
fd.append("prompt", panel.prompt);
fd.append("size", SIZE);
fd.append("quality", "high");
fd.append("output_format", "png");
fd.append("n", "1");
for (const ref of panel.refs) {
  const p = join(DIR, ref);
  fd.append("image[]", new Blob([readFileSync(p)], { type: "image/png" }), basename(p));
}

console.log(`Generating "${which}" panel at ${SIZE} with ${panel.refs.length} logo references...`);
const t0 = Date.now();

const res = await fetch("https://api.openai.com/v1/images/edits", {
  method: "POST",
  headers: { Authorization: `Bearer ${API_KEY}` },
  body: fd,
});

if (!res.ok) {
  console.error(`API error ${res.status}:`);
  console.error(await res.text());
  process.exit(1);
}

const json = await res.json();
const b64 = json.data?.[0]?.b64_json;
if (!b64) {
  console.error("No image in response:", JSON.stringify(json).slice(0, 2000));
  process.exit(1);
}

const outPath = join(DIR, panel.out);
writeFileSync(outPath, Buffer.from(b64, "base64"));
console.log(`Saved ${outPath} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (json.usage) console.log("Usage:", JSON.stringify(json.usage));
