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
