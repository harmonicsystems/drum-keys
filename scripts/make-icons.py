"""Draws the Drum Pads app icon (a 4x4 pad grid in the app's muted palette)
as PNGs, with no image libraries. Run: python3 scripts/make-icons.py"""
import os, struct, zlib

BG = (0xF4, 0xEF, 0xE6)
KEY = (0xFB, 0xF8, 0xF2)
# Matches app/machines.js LAYOUT colours: cymbals/perc, toms, hats/clap/rim, kick/snare
ROWS = [
    ['y', 'y', 'p', 'p'],
    ['t', 't', 't', 'p'],
    ['h', 'o', 'c', 'r'],
    ['k', 's', 'k', 's'],
]
CAT = {'k': 0xC07A5A, 's': 0xC9A14F, 'c': 0x8FA37A, 'r': 0x7C9A8E, 'h': 0x7389A3, 'o': 0x93A6C4,
       't': 0x9D7F9E, 'y': 0xB8A47C, 'p': 0x9B958B}
rgb = lambda h: (h >> 16, (h >> 8) & 255, h & 255)


def draw(size):
    px = [[BG] * size for _ in range(size)]
    inset = size * 0.18            # maskable safe zone
    grid = size - 2 * inset
    gap = grid * 0.05
    cell = (grid - 3 * gap) / 4
    rad = cell * 0.18
    for r, row in enumerate(ROWS):
        for c, cat in enumerate(row):
            x0, y0 = inset + c * (cell + gap), inset + r * (cell + gap)
            stripe = y0 + cell * 0.80
            for y in range(int(y0), int(y0 + cell) + 1):
                for x in range(int(x0), int(x0 + cell) + 1):
                    # rounded corners
                    dx = max(x0 + rad - x, 0, x - (x0 + cell - rad))
                    dy = max(y0 + rad - y, 0, y - (y0 + cell - rad))
                    if dx * dx + dy * dy > rad * rad:
                        continue
                    px[y][x] = rgb(CAT[cat]) if y >= stripe or (r == 3 and c < 2) else KEY
    return px


def png(px, path):
    h, w = len(px), len(px[0])
    raw = b''.join(b'\x00' + bytes(v for p in row for v in p) for row in px)
    chunk = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xFFFFFFFF)
    data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) \
        + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(data)


out = os.path.join(os.path.dirname(__file__), '..', 'app')
for size, name in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png')]:
    png(draw(size), os.path.join(out, name))
    print(name)
