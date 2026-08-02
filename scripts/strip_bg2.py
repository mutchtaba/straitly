"""Strip backgrounds from the v2 machine + individual token coins."""
import sys
from collections import deque
from PIL import Image

ASSETS = "/Users/hashimsyed/.cursor/projects/Users-hashimsyed-Desktop-workspace-2/assets"
OUT = "/Users/hashimsyed/Desktop/workspace-2/straitly/public/retro"

JOBS = [
    (f"{ASSETS}/image-10a675af-6cb3-4fba-86e2-4b770e0d7361.png", f"{OUT}/token-machine-v2-cut.png", 26),
    (f"{ASSETS}/image-a0677416-71ae-4a32-b4cf-775a7639c868.png", f"{OUT}/coin-meta-cut.png", 30),
    (f"{ASSETS}/image-f4b40b10-e42f-4812-880c-2953802a8a72.png", f"{OUT}/coin-ai-cut.png", 30),
    (f"{ASSETS}/image-62e74d5a-5223-4960-865d-05070f817b30.png", f"{OUT}/coin-openai-cut.png", 30),
    (f"{ASSETS}/image-39162fd8-92a8-48f2-a49d-fe7249cad768.png", f"{OUT}/coin-gemini-cut.png", 30),
]


def strip(src, out, tol):
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()
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

    im = im.crop(im.getbbox())
    im.save(out)
    print(f"{out.split('/')[-1]}  bg={bg}  cropped={im.size}")


for src, out, tol in JOBS:
    strip(src, out, tol)
