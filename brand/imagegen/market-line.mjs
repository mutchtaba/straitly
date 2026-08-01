import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "out", "market-line");
mkdirSync(OUT, { recursive: true });

const env = readFileSync(join(DIR, ".env"), "utf8");
const API_KEY = env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
if (!API_KEY) {
  console.error("No OPENAI_API_KEY found in .env");
  process.exit(1);
}

/* Wide left-to-right "stage" scenes for the markup-comparison section.
   Real company logos and all numbers/text are overlaid later as crisp
   HTML/SVG, so every scene must provide BLANK signage surfaces. */
const RULES = `
NON-NEGOTIABLE RULES (follow exactly):
- WIDE horizontal composition, a single left-to-right scene, viewed perfectly straight-on from the side, zero perspective tilt (flat orthographic side view like a 2D game level).
- The background of the ENTIRE canvas is one perfectly flat solid charcoal, hex #313338 — no vignette, no gradient, no sky, no black.
- Accent colors come only from this palette: warm cream #F0EBE2, amber terracotta #B77F5A with highlights #CF9268, medium charcoal #3A3E46 with edge highlights #4A4E57, and small phosphor-green #33ff66 glows used very sparingly.
- Every station carries one BLANK rectangular cream #F0EBE2 sign panel with rounded corners, completely empty — NO text, NO characters, NO icons, NO symbols drawn on any sign. The signs must be flat, front-facing, and generously sized.
- No text anywhere in the image. No real-world brand logos. No human characters. No coins or money floating mid-air (moving objects are animated later).
- Keep the scene in the vertical middle of the canvas with generous flat charcoal margin above and below.`;

const PIXEL = `Create a premium 16-bit pixel-art illustration, crisp retro video-game asset quality.`;
const PAINTED = `Create a premium painted retro illustration, soft cinematic studio lighting, slightly photorealistic, product-shot quality.`;

const JOBS = [
  {
    name: "a-conveyor-pixel",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A single retro factory conveyor belt running the full width of the image, left to right, drawn in charcoal #3A3E46 with #4A4E57 edge highlights and small cream rollers. Along the belt stand FIVE evenly-spaced checkpoint stations: chunky little charcoal machines that arch over the belt like scanners. The four stations on the left are identical, each with a small amber #B77F5A warning lamp and a blank cream sign panel mounted above it on a short pole. The FIFTH station on the far right is slightly larger and friendlier, glows softly phosphor-green #33ff66 from within, its gate is fully open, and its blank cream sign above is slightly bigger. The belt surface is EMPTY — nothing riding on it. Clean, minimal, lots of breathing room.`,
  },
  {
    name: "b-pipe-pixel",
    prompt: `${PIXEL}
${RULES}

SUBJECT: One horizontal industrial pipe in charcoal #3A3E46 with #4A4E57 rivets and edge highlights, running the full width of the image at mid-height. Along the pipe, FOUR valve stations on the left: each is a chunky valve wheel on top of the pipe with a small amber #B77F5A drip tap underneath feeding a tiny glass jar sitting below the pipe, and a blank cream sign panel mounted above the valve on a short pole. After the last valve, the rightmost quarter of the pipe is brand new, perfectly straight and clean, softly glowing phosphor-green #33ff66 along its seam, with no valve and no jar — just one larger blank cream sign above it. Minimal, diagram-like, generous spacing.`,
  },
  {
    name: "c-tollgates-pixel",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A flat retro highway lane running the full width of the image, a simple horizontal road strip in charcoal #3A3E46 with a cream dashed center line. On the road stand FIVE toll booths in a row, evenly spaced, seen perfectly from the side: compact charcoal booths with cream trim roofs. The four booths on the left have their striped amber-and-cream barrier arms DOWN, blocking the lane, each with a blank cream sign panel on its roof. The fifth booth on the far right has its barrier arm raised fully UP, a small phosphor-green #33ff66 lamp lit on its roof, and a slightly larger blank cream sign. The road is empty — no vehicles. Playful but clean and minimal.`,
  },
  {
    name: "d-conveyor-painted",
    prompt: `${PAINTED}
${RULES}

SUBJECT: A single retro factory conveyor belt running the full width of the image, left to right, matte charcoal #3A3E46 machinery with warm #4A4E57 edge light and cream rollers, softly lit like a museum diorama. Along the belt stand FIVE evenly-spaced checkpoint stations: small charcoal scanner arches over the belt. The four on the left are identical with a small amber #B77F5A lamp and a blank cream sign panel on a short pole above each. The fifth on the far right is slightly larger, glows gently phosphor-green #33ff66 from inside, gate open, with a slightly larger blank cream sign. Empty belt, soft studio shadows under the machines, slight film grain, premium and calm.`,
  },
];

const STALL_JOBS = [
  {
    name: "e-market-stalls-pixel",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A row of FIVE cozy video-game market stalls standing side by side on a thin charcoal ground line, like vendor stalls in a classic RPG town market. Each stall: a chunky wooden frame in charcoal #3A3E46 with #4A4E57 edge highlights, a striped cloth awning in warm cream #F0EBE2 and terracotta #B77F5A, a simple counter, and a few small neutral crates or sacks on the counter. Above each stall hangs one BLANK rectangular cream sign board. From the front edge of each awning hangs one SMALL blank cream price-tag shaped placard on a short string. The four stalls on the left are identical in size with amber #B77F5A lanterns. The FIFTH stall on the far right is slightly larger and friendlier, lit by a softly glowing phosphor-green #33ff66 lantern, with a slightly bigger blank sign and blank price tag. No shopkeepers, no customers, counters tidy. Charming, cozy, minimal.`,
  },
  {
    name: "f-shop-street-pixel",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A row of FIVE compact video-game town shop storefronts side by side on a thin charcoal ground line, like the shopping street of a classic 16-bit RPG. Each storefront: a boxy charcoal #3A3E46 facade with #4A4E57 trim, a cream #F0EBE2 framed door, one square window with warm amber #B77F5A light inside, and a flat awning. Above each door hangs one BLANK rectangular cream sign board, generously sized. Beside each door is one SMALL blank cream price-tag shaped placard mounted on the wall. The four shops on the left are identical. The FIFTH shop on the far right is slightly wider, its window glows phosphor-green #33ff66 instead of amber, its door stands open, and its blank sign is slightly bigger. No characters anywhere. Cozy, tidy, inviting.`,
  },
  {
    name: "g-night-bazaar-pixel",
    prompt: `${PIXEL}
${RULES}

SUBJECT: A moody night-market row of FIVE vendor stalls side by side on a thin charcoal ground line, video-game night-bazaar atmosphere. Each stall: charcoal #3A3E46 wooden frame with #4A4E57 highlights, a cream #F0EBE2 canvas awning catching warm light, a counter with a few neutral sacks, and one hanging amber #B77F5A paper lantern casting a soft warm glow. Above each stall one BLANK rectangular cream sign board. From each awning edge hangs one SMALL blank cream price-tag placard. The four stalls on the left are identical. The FIFTH stall on the far right is slightly larger, its lantern glows phosphor-green #33ff66, and its blank sign and tag are slightly bigger. Background stays flat solid #313338 — the mood comes only from the lantern glows on the stalls themselves. No characters. Atmospheric but clean.`,
  },
];

/* Top-down RPG overworld map versions — GBA Pokémon-town camera angle,
   logos and shop names baked in per user request. */
const MAP_RULES = `
NON-NEGOTIABLE RULES (follow exactly):
- TOP-DOWN 3/4 RPG overworld camera, exactly like a Game Boy Advance Pokémon town map: the viewer looks down at the town from above, every building shows its ROOF and its FRONT FACADE at the classic 3/4 angle, paths and ground are seen from directly above. NO side-view, NO horizon, NO sky.
- 16-bit pixel-art tile style, crisp clean tiles, premium retro-game quality.
- The ground/terrain fills the whole canvas like a real game map: charcoal #313338 and #3A3E46 ground tiles with subtle tile texture, warm cream #F0EBE2 walking paths connecting the buildings.
- Palette discipline: buildings in charcoal #3A3E46 with #4A4E57 trim and warm cream #F0EBE2 walls, awnings and roofs striped cream and terracotta #B77F5A / #CF9268, tiny phosphor-green #33ff66 accents. Logos may additionally use their real brand colors.
- No human characters, no creatures.`;

const MAP_LOGOS = `
THE SIX SHOPS (each is a small vendor shop/stall with a clearly readable sign):
1. A shop with a sign showing the OpenRouter logo and the name "OpenRouter".
2. A shop with a sign showing the Vercel black triangle logo and the name "Vercel".
3. A shop with a sign showing the orange Cloudflare cloud logo and the name "Cloudflare".
4. A shop with a sign showing the OpenAI hexagonal knot logo and the name "OpenAI".
5. A shop with a sign showing the Anthropic logo and the name "Anthropic".
6. THE HERO SHOP: slightly larger, warm and inviting, glowing phosphor-green #33ff66 lantern and green-lit windows, with a sign showing a simple cream compass-rose mark and the name "straitly" in lowercase. This shop must be the visual destination of the map.`;

const MAP_JOBS = [
  {
    name: "h-town-map-pixel",
    size: "1536x1024",
    prompt: `Create a premium 16-bit pixel-art RPG town map.
${MAP_RULES}
${MAP_LOGOS}

LAYOUT: A cozy town square seen from the classic top-down 3/4 angle. Cream paths form a plaza. The five competitor shops (OpenRouter, Vercel, Cloudflare, OpenAI, Anthropic) are arranged around the left and top of the plaza as small market buildings. The straitly hero shop sits at the bottom-right end of the main path, slightly apart, glowing green, with the widest path leading to its door. A few pixel props between buildings: crates, barrels, a tiny fountain, small trees rendered in the charcoal/cream palette. Balanced composition, readable signs, generous path space.`,
  },
  {
    name: "i-market-square-pixel",
    size: "1536x1024",
    prompt: `Create a premium 16-bit pixel-art RPG market map.
${MAP_RULES}
${MAP_LOGOS}

LAYOUT: A dense open-air bazaar seen from the top-down 3/4 angle: the five competitor shops are market STALLS with striped cream-and-terracotta awnings viewed from above, arranged in two facing rows with a wide cream market path running between them. Small props on the path: crates, sacks, a barrel or two. At the far right end of the market path stands the straitly hero shop as a proper little building with a green glowing lantern, facing down the path so every stall row leads the eye to it. Readable signs above every stall.`,
  },
  {
    name: "j-route-map-pixel",
    size: "1536x1024",
    prompt: `Create a premium 16-bit pixel-art RPG route map.
${MAP_RULES}
${MAP_LOGOS}

LAYOUT: A winding journey map seen from the top-down 3/4 angle, like a Pokémon route: a single wide cream path enters at the bottom-left and winds diagonally across the whole map to the top-right. Along the path, the five competitor shops stand one after another as little roadside vendor buildings, each slightly off the path with a short spur path to its door. At the top-right destination of the path sits the straitly hero shop, slightly larger, glowing green, with a small plaza in front of it. Sparse charcoal-palette trees and rocks fill empty map space. The path must read as one continuous journey ending at straitly.`,
  },
];

/* Minimal priced-journey maps: one path, most expensive -> cheapest,
   markup numbers baked onto the shops. */
const MIN_RULES = `
NON-NEGOTIABLE RULES (follow exactly):
- TOP-DOWN 3/4 RPG overworld camera, exactly like a Game Boy Advance Pokémon town: buildings show their ROOF and FRONT FACADE at the classic 3/4 angle, ground seen from above. NO side view, NO horizon, NO sky.
- 16-bit pixel-art tile style, crisp clean tiles, premium retro-game quality.
- EXTREMELY MINIMAL: the ground is one flat, nearly-uniform charcoal #313338 tile field with only the subtlest tile texture. NO trees, NO rocks, NO crates, NO barrels, NO fountains, NO fences, NO water, NO decorative props of any kind. Only the path, the buildings, their signs, and empty ground.
- One single walking path in warm cream #F0EBE2, wide and clearly readable, connecting the buildings in a fixed order. The path is the visual spine of the image.
- Buildings: small, simple, boxy shops in charcoal #3A3E46 with #4A4E57 trim, cream #F0EBE2 walls, flat terracotta #B77F5A roofs. All competitor shops identical in size and shape. Generous empty space between them.
- Each shop has ONE clean rectangular cream sign board above its door with the brand logo, brand name, and its price text — pixel-crisp, high contrast, readable. Logos may use their real brand colors. No other text anywhere.
- No human characters, no creatures.`;

const MIN_SHOPS = `
THE FOUR SHOPS, in exact path order from the path's START to its END (most expensive first):
1. START of path: shop signed with the OpenRouter logo, the name "OpenRouter", and the price text "+5.5%".
2. Next: shop signed with the black Vercel triangle logo, the name "Vercel", and the price text "+3.5%".
3. Next: shop signed with the OpenAI hexagonal knot logo, the name "OpenAI", and the price text "LIST".
4. END of path, the destination: the straitly shop — slightly larger, cream walls, a phosphor-green #33ff66 glowing lantern and green-lit doorway, signed with a simple cream compass-rose mark, the name "straitly" in lowercase, and the price text "0%". The path visibly widens as it arrives here.`;

const MIN_JOBS = [
  {
    name: "k-min-diagonal",
    size: "1536x1024",
    prompt: `Create a premium minimal 16-bit pixel-art RPG map.
${MIN_RULES}
${MIN_SHOPS}

LAYOUT: The cream path enters at the TOP-LEFT corner and runs in a clean diagonal staircase pattern down to the BOTTOM-RIGHT corner. The four shops sit along it in order — OpenRouter top-left, then Vercel, then OpenAI, then straitly at the bottom-right end. Each shop sits just beside the path with a tiny stub connecting its door. Vast calm empty charcoal ground everywhere else.`,
  },
  {
    name: "l-min-straight",
    size: "1536x640",
    prompt: `Create a premium minimal 16-bit pixel-art RPG map, wide banner format.
${MIN_RULES}
${MIN_SHOPS}

LAYOUT: One perfectly straight horizontal cream path runs the full width of the map from LEFT to RIGHT. The four shops stand in a row above the path, evenly spaced, doors facing down toward it: OpenRouter far left, then Vercel, then OpenAI, then straitly at the far right end where the path terminates in a small cream plaza at its door. Nothing else on the map.`,
  },
  {
    name: "m-min-descent",
    size: "1536x1024",
    prompt: `Create a premium minimal 16-bit pixel-art RPG map.
${MIN_RULES}
${MIN_SHOPS}

LAYOUT: A gentle S-curve: the cream path enters at the TOP of the map and snakes downward in two soft bends to the BOTTOM-CENTER. Shops in path order from top to bottom: OpenRouter at the top, Vercel at the first bend, OpenAI at the second bend, and straitly at the bottom-center destination where the path opens into a small plaza. The vertical descent should read like prices dropping. Empty charcoal ground everywhere else.`,
  },
];

const SIZES = ["1536x640", "1536x1024"];
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(job) {
  let sizeIdx = 0;
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
          size: job.size ?? SIZES[sizeIdx],
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
      const body = await res.text();
      // unsupported size -> fall back to the next size and retry
      if (res.status === 400 && /size/i.test(body) && sizeIdx < SIZES.length - 1) {
        console.log(`[${job.name}] size ${SIZES[sizeIdx]} rejected, falling back to ${SIZES[sizeIdx + 1]}`);
        sizeIdx++;
        continue;
      }
      console.log(`[${job.name}] FAILED ${res.status}: ${body.slice(0, 300)}`);
      return false;
    }

    const json = await res.json();
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) {
      console.log(`[${job.name}] FAILED: no image in response`);
      return false;
    }
    writeFileSync(join(OUT, `${job.name}.png`), Buffer.from(b64, "base64"));
    console.log(`[${job.name}] done in ${((Date.now() - t0) / 1000).toFixed(0)}s at ${SIZES[sizeIdx]}`);
    return true;
  }
  console.log(`[${job.name}] FAILED after ${MAX_ATTEMPTS} attempts`);
  return false;
}

const RUN =
  process.argv[2] === "stalls"
    ? STALL_JOBS
    : process.argv[2] === "map"
      ? MAP_JOBS
      : process.argv[2] === "min"
        ? MIN_JOBS
        : JOBS;
console.log(`Generating ${RUN.length} market-line stage options...`);
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
