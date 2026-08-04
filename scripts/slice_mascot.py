"""Slice the Straitly-guy sprite sheet into transparent frames.

Chroma-keys the magenta background, cuts the sheet into 6 equal cells,
then crops every cell with a shared height window so the character
keeps one baseline across frames.
"""

import sys

from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/mascot-a.png"
OUT = "public/retro/guy"
FRAMES = 6


def key_magenta(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            # magenta-ish: strong red+blue, weak green
            if r > 150 and b > 150 and g < 110:
                px[x, y] = (0, 0, 0, 0)
    return im


def main() -> None:
    sheet = key_magenta(Image.open(SRC))
    w, h = sheet.size
    cell_w = w // FRAMES

    cells = [sheet.crop((i * cell_w, 0, (i + 1) * cell_w, h)) for i in range(FRAMES)]

    # shared vertical window across frames -> stable baseline
    tops, bottoms = [], []
    boxes = []
    for c in cells:
        box = c.getbbox()
        boxes.append(box)
        if box:
            tops.append(box[1])
            bottoms.append(box[3])
    top, bottom = min(tops), max(bottoms)

    import os

    os.makedirs(OUT, exist_ok=True)
    for i, c in enumerate(cells, start=1):
        box = boxes[i - 1]
        if not box:
            print(f"frame {i}: EMPTY, skipped")
            continue
        # per-frame horizontal crop, shared vertical crop
        frame = c.crop((box[0], top, box[2], bottom))
        frame.save(f"{OUT}/frame-{i}.png")
        print(f"frame {i}: {frame.size}")


if __name__ == "__main__":
    main()
