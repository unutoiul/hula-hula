"""Add (or replace) photos in src/data/photos.ts from the raw assets folder.

Each photo becomes AVIF + WebP copies at 480, 960 and 1600 px wide (capped at
the source's width) in public/images/pineapple/, and an entry in photos.ts
under its key. Keys in REMOVE lose their entry and files. Raw photos live in
the repo's root assets/ folder, which isn't in git, so `source` records where
each one came from.

    python scripts/add-photos.py
    python scripts/add-photos.py chabaLunch chabaDinner
"""
import argparse
import json
import re
from pathlib import Path
from PIL import Image, ImageOps

SITE = Path(__file__).resolve().parent.parent
REPO = SITE.parent
OUTPUT = SITE / 'public' / 'images' / 'pineapple'
PHOTOS_TS = SITE / 'src' / 'data' / 'photos.ts'
WIDTHS = [480, 960, 1600]

UPDATE = 'assets/RP WEBSITE PHOTOS UPDATE'
VILLA1 = f'{UPDATE}/1-bedroom pool villa with shared pool  สนามกอล์ฟ r3'
VILLA2 = f'{UPDATE}/2-bedroom pool villa with shared pool  สนามกอล์ฟ'

# key -> (source under the repo root, crop box (left, top, right, bottom) or None)
SELECTION = {
    # The villas' shared pool at dusk. The hotel's copy has a caption burnt
    # into the bottom-left corner; the crop stops just above it.
    'villaPool': (f'{VILLA1}/OTAs-Activity.png', (0, 0, 1280, 836)),
    'villa1Bedroom': (f'{VILLA1}/LINE_ALBUM_r.3 villa_260205_10.jpg', None),
    'villa1Living': (f'{VILLA1}/LINE_ALBUM_r.3 villa_260205_5.jpg', None),
    'villa1Lounge': (f'{VILLA1}/LINE_ALBUM_r.3 villa_260205_9.jpg', None),
    'villa1Bath': (f'{VILLA1}/LINE_ALBUM_r.3 villa_260205_1.jpg', None),
    'villa1Basin': (f'{VILLA1}/LINE_ALBUM_r.3 villa_260205_4.jpg', None),
    'villa2Living': (f'{VILLA2}/1051409.jpg', None),
    'villa2Dining': (f'{VILLA2}/1051410_0.jpg', None),
    'villa2Lounge': (f'{VILLA2}/1051411_0.jpg', None),
    'villa2Bedroom': (f'{VILLA2}/1051412_0.jpg', None),
    'villa2Master': (f'{VILLA2}/1051414_0.jpg', None),
    'villa2MasterBed': (f'{VILLA2}/1051415_0.jpg', None),
    'villa2Twin': (f'{VILLA2}/1051418.jpg', None),
    'golfClubhouse': (f'{VILLA2}/11.png', None),
    'golfCafe': (f'{VILLA2}/12.png', None),
    'golfFairway': (f'{VILLA2}/6.png', None),
    'breakfastYoghurt': (f'{UPDATE}/Breakfast/b1.png', None),
    'breakfastRoom': (f'{UPDATE}/Breakfast/b2.png', None),
    'breakfastBuffet': (f'{UPDATE}/Breakfast/b3.png', None),
    'breakfastCollage': (f'{UPDATE}/Breakfast/b4.png', None),
    'chabaLunch': (f'{UPDATE}/Lunch/L2.png', None),
    'chabaDinner': (f'{UPDATE}/Dinner/D2.png', None),
    'meetingChaba': (f'{UPDATE}/Meeting Room/Chaba/F1.png', None),
    'meetingChabaClassroom': (f'{UPDATE}/Meeting Room/Chaba/F1.1.png', None),
    'meetingSandSea': (f'{UPDATE}/Meeting Room/Sandsea/F2.png', None),
    'meetingSummer': (f'{UPDATE}/Meeting Room/Summer/F3.png', None),
    'meetingSunshine': (f'{UPDATE}/Meeting Room/Sunshine/F4.png', None),
    'meetingSunshineClassroom': (f'{UPDATE}/Meeting Room/Sunshine/F4.1.png', None),
    'poolParty': (f'{UPDATE}/Meeting Room/Poolside/P1.png', None),
    'poolBanquet': (f'{UPDATE}/Meeting Room/Poolside/p2.png', None),
    'poolFruitBasket': (f'{UPDATE}/Spa/s1.png', None),
}

# The first meeting-room shoot (green tablecloths), replaced by the new one.
REMOVE = ['meetingBanquet', 'meetingClassroom', 'meetingSmall', 'meetingBoard']

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('keys', nargs='*', help='Only import the named photos')
keys = parser.parse_args().keys
for key in keys:
    if key not in SELECTION:
        parser.error(f'unknown photo: {key}')

text = PHOTOS_TS.read_text(encoding='utf-8')
match = re.search(r'export const photoAssets = (\{.*?\n\}) satisfies', text, re.S)
photos = json.loads(match.group(1))

if not keys:
    for key in REMOVE:
        photos.pop(key, None)
        for old in OUTPUT.glob(f'{key}-*'):
            old.unlink()

for key in keys or SELECTION:
    source, crop = SELECTION[key]
    image = ImageOps.exif_transpose(Image.open(REPO / source)).convert('RGB')
    if crop:
        image = image.crop(crop)
    for old in OUTPUT.glob(f'{key}-*'):
        old.unlink()
    made = []
    for nominal in WIDTHS:
        width = min(nominal, image.width)
        if made and made[-1][1] == width:
            continue
        height = round(image.height * width / image.width)
        copy = image.resize((width, height), Image.LANCZOS) if width != image.width else image
        copy.save(OUTPUT / f'{key}-{nominal}.webp', 'WEBP', quality=78, method=6)
        copy.save(OUTPUT / f'{key}-{nominal}.avif', 'AVIF', quality=55, speed=4)
        made.append((nominal, width))
    base = f'/images/pineapple/{key}'
    photos[key] = {
        'src': f'{base}-{made[-1][0]}.webp',
        'srcSet': ', '.join(f'{base}-{n}.webp {w}w' for n, w in made),
        'avifSrcSet': ', '.join(f'{base}-{n}.avif {w}w' for n, w in made),
        'width': made[-1][1],
        'height': round(image.height * made[-1][1] / image.width),
        'source': source,
    }
    kb = sum((OUTPUT / f'{key}-{n}.{ext}').stat().st_size for n, _ in made for ext in ('avif', 'webp')) // 1024
    print(f'{key}: {image.width}x{image.height} -> {[w for _, w in made]} ({kb} KB in all)')

PHOTOS_TS.write_text(
    text[: match.start(1)] + json.dumps(photos, indent=2, ensure_ascii=False) + text[match.end(1) :],
    encoding='utf-8',
)
