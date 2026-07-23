#!/usr/bin/env python3
"""Generate production Straitly logo SVGs.

Wordmark: Departure Mono glyphs converted to literal <path> outlines
(no font dependency in the final files). Compass mark: hand-computed
geometry — 45-degree needle, solid north half, outlined south half.
"""

import math
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

# ---- brand constants ----------------------------------------------------
CHARCOAL = "#313338"
TERRACOTTA = "#B77F5A"
CREAM = "#F0EBE2"

FONT_PATH = "tmp/DepartureMono-1.500/DepartureMono-Regular.otf"
WORD = "straitly"

# ---- wordmark: text -> outline paths ------------------------------------

def wordmark_paths(font_size: float):
    """Return (list of svg path 'd' strings offset per glyph, total width)."""
    font = TTFont(FONT_PATH)
    upem = font["head"].unitsPerEm
    scale = font_size / upem
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]

    paths = []
    x_cursor = 0.0
    for ch in WORD:
        gname = cmap[ord(ch)]
        pen = SVGPathPen(glyph_set)
        glyph_set[gname].draw(pen)
        d = pen.getCommands()
        if d:
            paths.append((x_cursor, d))
        x_cursor += hmtx[gname][0] * scale
    return paths, x_cursor


def wordmark_group(x: float, baseline_y: float, font_size: float, fill: str):
    font = TTFont(FONT_PATH)
    upem = font["head"].unitsPerEm
    scale = font_size / upem
    paths, width = wordmark_paths(font_size)
    parts = [f'<g fill="{fill}">']
    for gx, d in paths:
        # y-flip: font coords are y-up, SVG is y-down
        parts.append(
            f'  <path transform="translate({x + gx:.2f},{baseline_y:.2f}) '
            f'scale({scale:.6f},-{scale:.6f})" d="{d}"/>'
        )
    parts.append("</g>")
    return "\n".join(parts), width


# ---- compass mark --------------------------------------------------------

def _inset_triangle(a, b, c, d):
    """Return triangle shrunk so every edge moves inward by exactly d.

    Uniform edge inset == homothety about the incenter with ratio
    (r_in - d) / r_in, where r_in is the inradius.
    """
    def dist(p, q):
        return math.hypot(p[0] - q[0], p[1] - q[1])

    la, lb, lc = dist(b, c), dist(a, c), dist(a, b)   # side lengths opposite each vertex
    per = la + lb + lc
    incenter = (
        (la * a[0] + lb * b[0] + lc * c[0]) / per,
        (la * a[1] + lb * b[1] + lc * c[1]) / per,
    )
    s = per / 2
    area = abs(
        (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])
    ) / 2
    r_in = area / s
    k = max((r_in - d) / r_in, 0.0)

    def toward(p):
        return (
            incenter[0] + (p[0] - incenter[0]) * k,
            incenter[1] + (p[1] - incenter[1]) * k,
        )

    return toward(a), toward(b), toward(c)


def compass_group(cx: float, cy: float, r: float, stroke_w: float, color: str):
    """Thin circle + 45-degree needle. North (up-right) half solid,
    south (down-left) half a pure-geometry outline (no SVG stroke,
    so joints are exact and symmetric)."""
    u = 1 / math.sqrt(2)          # unit vector along needle axis
    L = r * 0.92                  # needle half-length (tip nearly touches circle)
    w = r * 0.24                  # needle half-width at the waist

    tip = (cx + L * u, cy - L * u)
    tail = (cx - L * u, cy + L * u)
    s1 = (cx + w * u, cy + w * u)   # waist vertex, lower-right side
    s2 = (cx - w * u, cy - w * u)   # waist vertex, upper-left side

    def pt(p):
        return f"{p[0]:.2f},{p[1]:.2f}"

    def tri(p, q, t):
        return f"M {pt(p)} L {pt(q)} L {pt(t)} Z"

    north = f'<path d="{tri(tip, s1, s2)}" fill="{color}"/>'

    # south half: outer triangle minus inner inset triangle (even-odd ring)
    inner = _inset_triangle(tail, s1, s2, stroke_w * 0.8)
    south = (
        f'<path d="{tri(tail, s1, s2)} {tri(*inner)}" '
        f'fill="{color}" fill-rule="evenodd"/>'
    )
    circle = (
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" '
        f'stroke="{color}" stroke-width="{stroke_w}"/>'
    )
    return "\n".join([circle, north, south])


# ---- compositions ---------------------------------------------------------

def lockup(bg: str | None, ink: str) -> str:
    W, H = 512, 620
    font_size = 60
    _, word_w = wordmark_paths(font_size)

    bg_rect = f'<rect width="{W}" height="{H}" fill="{bg}"/>' if bg else ""
    mark = compass_group(cx=W / 2, cy=248, r=130, stroke_w=8, color=ink)
    text, _ = wordmark_group((W - word_w) / 2, 560, font_size, ink)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">
{bg_rect}
{mark}
{text}
</svg>
"""


def mark_only(ink: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
{compass_group(cx=150, cy=150, r=130, stroke_w=8, color=ink)}
</svg>
"""


def favicon() -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<rect width="256" height="256" rx="56" fill="{CHARCOAL}"/>
{compass_group(cx=128, cy=128, r=92, stroke_w=7, color=TERRACOTTA)}
</svg>
"""


if __name__ == "__main__":
    out = {
        "straitly-lockup-dark.svg": lockup(CHARCOAL, TERRACOTTA),
        "straitly-lockup-cream.svg": lockup(CREAM, CHARCOAL),
        "straitly-lockup-transparent.svg": lockup(None, TERRACOTTA),
        "straitly-mark.svg": mark_only(TERRACOTTA),
        "favicon.svg": favicon(),
    }
    for name, svg in out.items():
        with open(name, "w") as f:
            f.write(svg)
        print("wrote", name)
