"""Strip checkered backgrounds from the coin-op TV cabinet set, then crop all
images with one shared union bounding box so every OFF/ON pair still overlays
pixel-perfectly while losing the transparent canvas padding."""
from collections import deque
from PIL import Image

OUT = "/Users/hashimsyed/Desktop/workspace-2/straitly/public/retro"

JOBS = [
    ("/tmp/tvf-ant-on-1.png", f"{OUT}/tv-anthropic-on.png"),
    ("/tmp/tvf-ant-off.png", f"{OUT}/tv-anthropic-off.png"),
    ("/tmp/tvc-oai-on.png", f"{OUT}/tv-openai-on.png"),
    ("/tmp/tvf-oai-off.png", f"{OUT}/tv-openai-off.png"),
    ("/tmp/tvc-gem-on.png", f"{OUT}/tv-gemini-on.png"),
    ("/tmp/tvf-gem-off.png", f"{OUT}/tv-gemini-off.png"),
    ("/tmp/tvc-meta-on.png", f"{OUT}/tv-meta-on.png"),
    ("/tmp/tvf-meta-off.png", f"{OUT}/tv-meta-off.png"),
]


def strip(src):
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    def is_bg(p):
        r, g, b = p[0], p[1], p[2]
        mx, mn = max(r, g, b), min(r, g, b)
        return (mx - mn) <= 22 and 150 <= (r + g + b) // 3 <= 245

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
    return im


stripped = [(strip(src), out) for src, out in JOBS]

# union bbox across the whole family + a few px of breathing room
boxes = [im.getbbox() for im, _ in stripped]
x0 = max(min(b[0] for b in boxes) - 4, 0)
y0 = max(min(b[1] for b in boxes) - 4, 0)
x1 = min(max(b[2] for b in boxes) + 4, stripped[0][0].size[0])
y1 = min(max(b[3] for b in boxes) + 4, stripped[0][0].size[1])
print(f"union crop: ({x0}, {y0}, {x1}, {y1})  size={x1 - x0}x{y1 - y0}")

for im, out in stripped:
    im.crop((x0, y0, x1, y1)).save(out)
    print(f"{out.split('/')[-1]}  size={x1 - x0}x{y1 - y0}")
