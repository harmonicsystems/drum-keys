"""Home-screen icons, one per machine in app/machines.js: the machine's name on
a muted colour, with a row of four pads along the bottom like the app icon.
iOS takes the apple-touch-icon of the page when you add a shortcut, so each
favorite's shortcut wears its machine.

Needs Pillow (dev only): python3 scripts/make-machine-icons.py"""
import json, os, subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'app', 'icons')
FONT = '/System/Library/Fonts/Avenir Next.ttc'   # index 2 = Bold on macOS
SIZE = 180

machines = json.loads(subprocess.check_output(
    ['node', '-e', "import('./app/machines.js').then(m => console.log(JSON.stringify(m.MACHINES.map(x => [x.id, x.name, x.maker]))))"],
    cwd=ROOT))

# What fits on an icon: drop the maker's model prefix where the number is the name people use
SHORT = {'tr808': '808', 'tr909': '909', 'tr606': '606', 'tr707': '707', 'sp1200': 'SP-1200', 'sp12': 'SP-12',
         'drumulator': 'Drumu-\nlator', 'drumtraks': 'Drum-\ntraks', 'rhythmace': 'Rhythm\nAce', 'linndrum': 'Linn\nDrum'}
PALETTE = ['#c07a5a', '#7389a3', '#b8a47c', '#8fa37a', '#93a6c4', '#c9a14f', '#9d7f9e', '#7c9a8e']
CREAM = '#fbf8f2'
PADS = ['#c07a5a', '#c9a14f', '#7389a3', '#8fa37a']


def font(px):
    return ImageFont.truetype(FONT, px, index=2)


def icon(i, mid, name, maker):
    img = Image.new('RGB', (SIZE, SIZE), PALETTE[i % len(PALETTE)])
    d = ImageDraw.Draw(img)
    text = SHORT.get(mid, name)
    # Largest size that fits 78% of the width and the space above the pads
    for px in range(78, 18, -2):
        box = d.multiline_textbbox((0, 0), text, font=font(px), align='center', spacing=2)
        if box[2] - box[0] <= SIZE * 0.78 and box[3] - box[1] <= SIZE * 0.5:
            break
    w, h = box[2] - box[0], box[3] - box[1]
    d.multiline_text(((SIZE - w) / 2 - box[0], (SIZE * 0.42 - h / 2) - box[1]), text, font=font(px),
                     fill=CREAM, align='center', spacing=2)
    m = font(15)
    mw = d.textlength(maker.upper(), font=m)
    d.text(((SIZE - mw) / 2, SIZE * 0.68), maker.upper(), font=m, fill=CREAM)
    # four little pads
    pw, gap, y = 26, 8, SIZE * 0.80
    x0 = (SIZE - (4 * pw + 3 * gap)) / 2
    for n, c in enumerate(PADS):
        x = x0 + n * (pw + gap)
        d.rounded_rectangle([x, y, x + pw, y + 18], radius=5, fill=CREAM)
        d.rounded_rectangle([x, y + 13, x + pw, y + 18], radius=3, fill=c)
    img.save(os.path.join(OUT, f'{mid}.png'), optimize=True)


os.makedirs(OUT, exist_ok=True)
for i, (mid, name, maker) in enumerate(machines):
    icon(i, mid, name, maker)
print(f'{len(machines)} icons in app/icons/')
