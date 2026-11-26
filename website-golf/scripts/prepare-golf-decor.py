"""Small, display-sized copies of the club logo and the tropical leaf corner.

The originals (logo 600×600 PNG, leaves 800×800 WebP) stay as they are; the
site shows them at 60–138px and 75–240px, so it downloads these instead.
Both have transparency, which AVIF and WebP keep.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'public'

JOBS = [
    # source, output stem, widths, (avif quality, webp quality)
    (ROOT / 'logo' / 'hula-hula-golf.png', ROOT / 'logo' / 'hula-hula-golf', (160, 320, 480), (70, 88)),
    (ROOT / 'images' / 'illustrations' / 'tropical-foliage.webp', ROOT / 'images' / 'illustrations' / 'tropical-foliage', (240, 480), (50, 70)),
]

for source, stem, widths, (avif_q, webp_q) in JOBS:
    with Image.open(source) as raw:
        art = raw.convert('RGBA')
    for width in widths:
        copy = art.resize((width, round(art.height * width / art.width)), Image.Resampling.LANCZOS)
        copy.save(f'{stem}-{width}.avif', 'AVIF', quality=avif_q, speed=4)
        copy.save(f'{stem}-{width}.webp', 'WEBP', quality=webp_q, method=6)
        print(f'{stem.name}-{width}', *(f'{ext} {Path(f"{stem}-{width}.{ext}").stat().st_size // 1024} KB' for ext in ('avif', 'webp')))
