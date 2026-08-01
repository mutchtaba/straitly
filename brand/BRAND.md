# Straitly brand

## Colors

| Role | Hex | Usage |
|---|---|---|
| Charcoal | `#313338` | Default background / dark surfaces, text on cream |
| Terracotta | `#B77F5A` | Logo, key numbers ("0%"), primary buttons. Never body text. |
| Cream | `#F0EBE2` | Light surfaces / light mode background |
| Warm gray | `#9A948B` | Secondary text on charcoal |

## Typography

- **Display / hero / numbers:** Departure Mono (pixel monospace, SIL OFL license, `brand/tmp/DepartureMono-1.500/`)
- **Body / UI:** JetBrains Mono or Geist Mono
- Pixel font is a display voice only — never paragraphs.

## Files

- `straitly-lockup-dark.svg` — full logo on charcoal (primary)
- `straitly-lockup-cream.svg` — full logo on cream (light mode)
- `straitly-lockup-transparent.svg` — terracotta logo, no background
- `straitly-mark.svg` — compass glyph only, transparent
- `favicon.svg` — compass in rounded-square charcoal badge
- `generate_logo.py` — source of truth; regenerate with `./tmp/venv/bin/python generate_logo.py`

Wordmark letterforms are Departure Mono glyphs converted to outlines —
the SVGs have no font dependency.

## The vibe: "1983 machine room"

The site aesthetic is **retro computing / 80s terminal culture** — old
Macintosh energy, CRT phosphor glow, Matrix-green code — but always
filtered through the Straitly palette so it feels premium, not kitsch.

Reference points: 16-bit pixel art, 1983 data centers, IBM terminals,
WarGames / early hacker movies, boot screens, BIOS text.

### Illustration style (gpt-image-2)

All scene/hardware art is generated with `brand/imagegen/*.mjs` scripts
(model `gpt-image-2`, quality high, 1280x1024). Hard rules baked into
every prompt — keep these when writing new ones:

- **16-bit pixel art**, premium retro video-game asset quality.
- Background is always **flat solid charcoal `#313338`** — no vignette,
  no gradient — so images melt seamlessly into the page background.
- Only palette colors: cream `#F0EBE2` plastics, terracotta
  `#B77F5A`/`#CF9268` accents and warm glows, charcoal `#3A3E46` +
  `#4A4E57` dark hardware, phosphor green `#33ff66` for LEDs/screens.
- Machines face the viewer **dead straight-on** with **blank dark
  screens** — live HTML gets overlaid on the glass later.
- Generous margins (>=10%), no humans, no real-company logos, no text
  unless the prompt explicitly asks.

The hero machine is `public/retro/03-phosphor-terminal-pixel.png`
(industrial phosphor terminal). Six alternates live in `public/retro/`
and can be compared at `/retro`.

### The live terminal overlay

`src/components/RetroTerminal.tsx` layers real, animated code onto the
image's screen:

- Screen rectangles are **measured, not eyeballed** — run
  `node brand/imagegen/detect-screens.mjs` to get exact percent coords
  of the dark glass in any newly generated image.
- Terminal text is **phosphor green**: bright `#66ff99`, main
  `#33e06a`, dim `#1c8f44`, with a soft green text-shadow glow,
  scanline overlay, and blinking block cursor.
- Font sizes are in container-query units so the type always fits the
  glass at any layout width.
- Green is reserved for *inside screens only* — everywhere else on the
  site stays charcoal / cream / terracotta.

### Voice

Terminal-flavored, confident, a little playful: `$` prompts, `[OK]`
status lines, BIOS-style all-caps taglines ("ONE ENDPOINT · EVERY
MODEL"). Serious-dev tone, never corporate.
