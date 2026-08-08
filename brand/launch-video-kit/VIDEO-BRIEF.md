# Straitly — Launch Video Brief

## What we're making

A launch video for **Straitly** (straitly.ai) — an OpenAI-compatible API
gateway that gives qualified startups **up to 50% off frontier AI models**
(Anthropic, OpenAI, Google, Meta) through one endpoint.

- **Format:** 16:9 primary (site + X/Twitter). 30–45 seconds.
- **Audience:** indie hackers and startup engineers who pay real money for
  LLM inference every month. They live in terminals. They hate ads that
  look like ads.
- **Desired reaction:** "wait, that's my API bill cut in half — and this
  brand is cool as hell." Then they click "See if you qualify."

## The one-line story

Every dev is overpaying for tokens at list price. Straitly is the arcade
where your coin buys twice as much — qualify, swap one base URL, and
you're on program rates tonight.

## The world: "1983 machine room"

The entire brand is retro computing / 80s arcade — 16-bit pixel art,
CRT phosphor glow, coin-op machines — but premium and restrained, never
kitsch. The website already tells the story as a physical arcade:

1. **Hero:** an industrial pixel-art terminal with real green code typing
   on its CRT (see `screenshots/01-hero.png`, art: `pixel-art/hero-terminal.png`)
2. **The Deal:** a token vending machine dispenses provider coins —
   OpenAI, Anthropic, Google, Meta — into its tray
   (`screenshots/02-the-deal.png`, art: `pixel-art/machine/`, `pixel-art/coins/`)
3. **Model catalog:** four retro TVs, one per provider. A coin drops into
   each TV's coin slot, the TV powers ON and its screen lights up showing
   discounted prices (`screenshots/03-model-catalog.png`, art: `pixel-art/tvs/`
   — each TV has an `-off` and `-on` state, they overlay pixel-perfectly)
4. **Stats:** LED dot-matrix boards count up: 99.99% reliability, 1.4s
   p99 TTFT, 2.4B tokens served (`screenshots/04-statboard.png`)
5. **How it works:** APPLY → REVIEW → GET YOUR KEY → PICK YOUR PRICING,
   with a segmented loading bar that fills to "ACCESS GRANTED"
   (`screenshots/05-how-it-works.png`)
6. **Final stage:** the pixel mascot walks in, KICKS the words
   "list price." off the screen, "Start saving." slams down, and he hops
   onto the PRESS START button and sits there kicking his feet
   (`screenshots/06-final-cta.png`, sprites: `pixel-art/mascot/`)

The video should feel like this site came to life — an insert-coin
arcade sequence, not a SaaS explainer.

## Palette (strict — no other colors)

| Role | Hex |
|---|---|
| Charcoal background | `#313338` (dark hardware `#3A3E46`, `#4A4E57`) |
| Cream (light surfaces, plastics, headline text) | `#F0EBE2` |
| Terracotta (THE accent: logo, key numbers, buttons) | `#B77F5A` / bright `#CF9268` |
| Warm gray (secondary text) | `#9A948B` |
| Phosphor green (ONLY inside screens/CRTs) | bright `#66ff99`, main `#33e06a`, dim `#1c8f44` |
| Amber (marquee/LED displays only) | `#e8a33d` |

Hard rules:
- Background is always flat charcoal `#313338`. No gradients, no vignette.
- Phosphor green lives ONLY inside screen glass. Never as UI/text outside.
- Terracotta is the single accent. Use it sparingly so it lands.

## Typography

- **Display / numbers / all-caps taglines:** Departure Mono
  (`fonts/DepartureMono-Regular.otf`, SIL OFL licensed — included).
  This is the pixel voice: "UP TO 50% OFF", "ACCESS GRANTED", "PRESS START".
- **Body / code:** JetBrains Mono (Google Fonts).
- Pixel font is display-only. Never paragraphs.

## Voice

Terminal-flavored, confident, a little playful. `$` prompts, `[ OK ]`
status lines, BIOS-style all-caps: "ONE ENDPOINT · EVERY MODEL".
Serious-dev tone, never corporate. No exclamation marks.

## Beat sheet (suggested, ~40s)

- **0:00–0:04 — Boot.** Black. A CRT powers on with a soft phosphor
  bloom. Green terminal types: `$ straitly --init` … `WAKING THE
  MACHINES...`. Sound: CRT degauss thunk, key clicks. Mood: anticipation.
- **0:04–0:10 — The problem.** On the glass, a bill scrolls too fast:
  `anthropic list price ... $10.00/MTOK`, `openai ... $5.00/MTOK`,
  numbers stacking. Type on screen: "You're paying list price." Mood:
  uncomfortable, wry.
- **0:10–0:16 — Insert coin.** Cut to the token machine (pixel art
  provided). It hums, marquee glows STRAITLY in amber, and it dispenses
  the four provider coins into the tray — each with a chunky mechanical
  clunk. Type: "UP TO 50% OFF FRONTIER MODELS". Mood: the deal.
- **0:16–0:24 — Power the wall.** The four TVs in a row, all dark. Coins
  drop into slots one by one — each TV snaps ON (use the exact -off/-on
  art states) showing its models and program prices. Rhythm builds with
  each power-on. Type: "ANTHROPIC · OPENAI · GOOGLE · META" then
  "ONE OPENAI-COMPATIBLE API". Mood: momentum.
- **0:24–0:30 — Proof.** LED dot-matrix boards scramble then settle:
  `99.99%` reliability · `1.4s` p99 TTFT · `2.4B` tokens served. Under:
  "Measured, not promised." Mood: earned trust.
- **0:30–0:36 — The kick.** The mascot (sprites provided: walk cycle,
  windup, kick, flinch, sit) walks in and boots the words "list price."
  clean off the screen. "Start saving." slams down. Mood: payoff, fun.
- **0:36–0:44 — Lockup.** Segmented loading bar fills → "ACCESS GRANTED"
  in amber. Straitly logo lockup (terracotta compass + wordmark) on
  charcoal. Line: "QUALIFY AND GET $100 IN TRIAL CREDITS". Button:
  PRESS START. URL: straitly.ai. Hold 4s+, gentle CRT scanline shimmer.

## Sound

8-bit-adjacent but modern: warm synthwave pulse, not chiptune kitsch.
Mechanical foley carries the cuts — coin clunks, CRT power-on thunks,
relay clicks, keyboard clatter. A satisfying "insert coin" chime on each
TV power-on. No voiceover needed; the type carries it. Must work muted.

## Copy constraints (respect exactly)

- Exact phrases to use: "Up to 50% off frontier models." ·
  "One OpenAI-compatible API · every frontier model" · "Measured, not
  promised." · "Stop paying list price. Start saving." · "PRESS START" ·
  "ACCESS GRANTED" · "$100 in trial credits"
- Numbers allowed: 50% off, 45% off Claude, 99.99% reliability, 1.4s p99
  TTFT, 2.4B tokens served, $100 trial credits. NO other stats.
- It's a **qualification program**: say "qualify", never "sign up free".
- Provider names (Anthropic/OpenAI/Google/Meta) may appear as text or via
  the provided coin/TV art. Do NOT recreate their official logos yourself.
- Never say: markup, wholesale, reseller, proxy, "we buy in bulk".
- No fake testimonials, no user counts, no "as seen on".

## Do NOT

- No purple/blue neon, no Matrix rain clichés, no glitch-for-glitch's-sake
- No gradients, no glassmorphism, no 3D renders, no lens flares
- No stock footage, no humans (the pixel mascot is the only character)
- No AI-generated new food… I mean new *pixel art* that clashes — use the
  provided art; anything new must match its 16-bit style and palette
- Don't stretch or recolor the logo; don't put green text outside screens

## Asset map (this kit)

```
logo/                     straitly-lockup-dark.svg (primary), -cream, -transparent,
                          straitly-mark.svg (compass glyph), favicon.svg
fonts/                    DepartureMono-Regular.otf/.woff2 + license
pixel-art/hero-terminal.png    the hero CRT terminal (screen is blank — put live green code on it)
pixel-art/machine/        token vending machine (marquee area is blank — STRAITLY goes there in amber)
pixel-art/coins/          4 provider coins + neutral straitly token coin
pixel-art/tvs/            8 TVs: {anthropic,openai,gemini,meta} x {off,on} — perfectly aligned pairs
pixel-art/mascot/         sprite frames: walk cycle (walkc-1..4, stride, frame-1..6),
                          windup, kick, flinch, hop, sit (sit-1/2, sitk-1..4)
pixel-art/icons/          hacker, rocket, terminals (the "who qualifies" icons)
screenshots/              the live site, section by section — match this look exactly
BRAND.md                  full brand doc
```

## Reference site

The live site IS the art direction: **straitly.ai** (or run the repo
locally). Scroll it once before designing — every animation in the video
already exists on the page in some form. The video is the site's story,
compressed and scored.
