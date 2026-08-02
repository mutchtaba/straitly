"""Strip near-solid backgrounds from pixel-art PNGs via edge flood fill, then crop."""
import sys
from collections import deque
from PIL import Image

ASSETS = "/Users/hashimsyed/.cursor/projects/Users-hashimsyed-Desktop-workspace-2/assets"
OUT = "/Users/hashimsyed/Desktop/workspace-2/straitly/public/retro"

JOBS = [
    # (src, out, tolerance)
    (f"{ASSETS}/image-f41f2484-affd-4301-a337-2572c0d6bebe.png", f"{OUT}/token-machine-cut.png", 26),
    (f"{ASSETS}/image-7522a7ba-9569-4550-84c1-6c4dbc430807.png", f"{OUT}/icon-hacker-cut.png", 34),
    (f"{ASSETS}/image-cfe4ac51-1345-47e4-b0c9-841a4985c9bb.png", f"{OUT}/icon-terminals-cut.png", 34),
    (f"{ASSETS}/image-9d12a166-9d59-4f76-be96-095afb2480bd.png", f"{OUT}/icon-rocket-cut.png", 34),
]


def strip(src, out, tol):
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    # sample background color from the four corners (average)
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))

    def is_bg(p):
        return abs(p[0] - bg[0]) <= tol and abs(p[1] - bg[1]) <= tol and abs(p[2] - bg[2]) <= tol

    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg(px[x, y]) and not seen[y * w + x]:
                seen[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg(px[x, y]) and not seen[y * w + x]:
                seen[y * w + x] = 1
                q.append((x, y))

    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and is_bg(px[nx, ny]):
                seen[ny * w + nx] = 1
                q.append((nx, ny))

    bbox = im.getbbox()
    im = im.crop(bbox)
    im.save(out)
    print(f"{out}  bg={bg}  cropped={im.size}")


for src, out, tol in JOBS:
    strip(src, out, tol)
