"""Tile PNG frames into a labelled contact sheet. usage: python3 tools/sheet.py out.png cols f1.png f2.png ..."""
import sys, os, re
from PIL import Image, ImageDraw, ImageFont
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ims = [Image.open(f).convert('RGB') for f in files]
w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w + (cols - 1) * 6, rows * h + (rows - 1) * 6), (60, 60, 60))
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', max(14, w // 18))
except Exception:
    font = ImageFont.load_default()
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * (w + 6), (i // cols) * (h + 6)
    sheet.paste(im, (x, y))
    lab = re.findall(r'_(\d+)\.png$', f)
    d = ImageDraw.Draw(sheet)
    t = lab[0].lstrip('0') or '0' if lab else os.path.basename(f)
    d.rectangle([x, y, x + font.getlength(t) + 16, y + font.size + 12], fill=(0, 0, 0))
    d.text((x + 8, y + 4), t, fill=(255, 255, 255), font=font)
sheet.save(out)
print(out)
