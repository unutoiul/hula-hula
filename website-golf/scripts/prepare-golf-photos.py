"""Create website-sized AVIF and WebP copies of the golf club photos; preserve source files.

Same recipe as the resort's scripts/prepare-resort-photos.py: AVIF (quality 55)
is what modern browsers download, WebP (quality 78) is the fallback. The
originals live in the resort's photo collection (website/photos/06 Hula Hula
Golf Club). Two pictures only exist inside the packages brochure (the range
bays and a golfer on the tee), so they're cropped out of it. The painted
pineapple postcards and mascot come from the marketing folder.
"""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PHOTO_ROOT = ROOT.parent / 'website' / 'photos' / '06 Hula Hula Golf Club'
OUTPUT = ROOT / 'public' / 'images' / 'golf'
OUTPUT.mkdir(parents=True, exist_ok=True)
for stale in OUTPUT.glob('*'):  # regenerate from scratch so dropped photos don't linger
    stale.unlink()

SELECTION = {
    'fairwayBalcony': 'hula-hula-golf-club-striped-fairways-from-clubhouse-balcony',
    'fairwaySign': 'hula-hula-golf-club-striped-fairway-and-club-sign',
    'puttingGreen': 'hula-hula-golf-club-putting-green-red-flag-and-water-hazard',
    'pondFairway': 'hula-hula-golf-club-pond-and-fairway-under-blue-sky',
    'sunnyFairway': 'hula-hula-golf-club-sunny-fairway-and-tropical-trees',
    'clubhouse': 'hula-hula-golf-club-clubhouse-exterior-and-golf-club-sign',
    'golfSwing': 'hula-hula-golf-club-golfer-swinging-beside-golf-cart',
    'footgolfGroup': 'hula-hula-golf-club-footgolf-group-photo',
    'footgolfKick': 'hula-hula-golf-club-footgolf-player-kicking-ball-close-up',
    'footgolfLineUp': 'hula-hula-golf-club-footgolf-player-lining-up-kick',
    'footgolfFlag': 'hula-hula-golf-club-footgolf-players-beside-hole-flag',
    'footgolfFairway': 'hula-hula-golf-club-footgolf-players-on-fairway',
    'cafeInterior': 'hula-hula-golf-club-cafe-interior-green-feature-wall',
    'cafeLounge': 'hula-hula-golf-club-cafe-lounge-sofa-and-coffee-counter',
    'cafeCoffee': 'hula-hula-golf-club-coffee-and-pastries-flat-lay',
    'cafeView': 'hula-hula-golf-club-food-and-drinks-overlooking-fairway',
}

# key: (brochure stem, crop box in the 2000×1414 original)
CROPS = {
    'rangeBays': ('hula-hula-golf-club-golf-footgolf-and-events-packages', (1436, 347, 1938, 640)),
    'teeShot': ('hula-hula-golf-club-golf-footgolf-and-events-packages', (1436, 686, 1970, 1012)),
}

# The painted pineapple postcards (marketing/). Their 26px ivory frame is cut
# off; the site draws its own white border around them.
MARKETING = ROOT.parent / 'marketing'
ILLUSTRATIONS = {
    'artGolfClub': '01-hula-hula-golf-club-card',
    'artDrivingRange': '02-hula-hula-driving-range-card',
    'artPuttingGreen': '03-hula-hula-putting-green-card',
    'artSunsetGolf': '04-hula-hula-sunset-golf-card',
    'art19thHole': '05-hula-hula-the-19th-hole-card',
}
FRAME = 26

# The resort's Two-Storey Pool Villa, for the pool villa page.
VILLA_ROOT = ROOT.parent / 'website' / 'photos' / '02 Rooms and Villas' / 'Two-Storey Pool Villa'
VILLA = {
    'villaTerrace': 'hula-hula-two-storey-pool-villa-private-pool-terrace-with-loungers-and-parasol',
    'villaBedroom': 'hula-hula-two-storey-pool-villa-four-poster-bed-with-towel-swans-front-view',
    'villaLiving': 'hula-hula-two-storey-pool-villa-living-room-sofa-and-dining-table',
    'villaPoolBed': 'hula-hula-two-storey-pool-villa-downstairs-bed-and-private-pool-terrace',
    'villaBath': 'hula-hula-two-storey-pool-villa-rose-petal-bath-and-four-poster-bedroom',
}

by_stem = {p.stem: p for p in [*PHOTO_ROOT.rglob('*'), *VILLA_ROOT.glob('*')] if p.is_file()}


def load(key):
    if key in CROPS:
        stem, box = CROPS[key]
        with Image.open(by_stem[stem]) as raw:
            return ImageOps.exif_transpose(raw).convert('RGB').crop(box), by_stem[stem]
    if key in ILLUSTRATIONS:
        source = MARKETING / f'{ILLUSTRATIONS[key]}.png'
        with Image.open(source) as raw:
            return raw.convert('RGB').crop((FRAME, FRAME, raw.width - FRAME, raw.height - FRAME)), source
    stem = SELECTION.get(key) or VILLA[key]
    with Image.open(by_stem[stem]) as raw:
        return ImageOps.exif_transpose(raw).convert('RGB'), by_stem[stem]


assets = {}
for key in [*SELECTION, *CROPS, *ILLUSTRATIONS, *VILLA]:
    image, source = load(key)
    variants = {}
    for width in (480, 960, 1600):
        copy = image.copy()
        copy.thumbnail((width, 2400), Image.Resampling.LANCZOS)
        copy.save(OUTPUT / f'{key}-{width}.webp', 'WEBP', quality=78, method=6)
        copy.save(OUTPUT / f'{key}-{width}.avif', 'AVIF', quality=55, speed=4)
        variants[width] = (f'/images/golf/{key}-{width}', copy.width, copy.height)
    # Small sources yield duplicate widths; keep one entry per actual width.
    unique = {v[1]: v for v in variants.values()}.values()
    assets[key] = {
        'src': variants[1600][0] + '.webp',
        'srcSet': ', '.join(f'{url}.webp {w}w' for url, w, h in unique),
        'avifSrcSet': ', '.join(f'{url}.avif {w}w' for url, w, h in unique),
        'width': variants[1600][1], 'height': variants[1600][2],
        'source': source.relative_to(ROOT.parent).as_posix(),
    }

# The pineapple golfer on his own (transparent PNG): trimmed to the painting
# and its shadow, the nearly-opaque body made solid, kept apart from the
# photo library so he isn't offered as a card photo in /admin.
MASCOT_OUTPUT = ROOT / 'public' / 'images' / 'mascot'
MASCOT_OUTPUT.mkdir(parents=True, exist_ok=True)
mascot_source = MARKETING / '06-hula-hula-pineapple-golfer-transparent.png'
with Image.open(mascot_source) as raw:
    mascot = raw.convert('RGBA')
alpha = mascot.getchannel('A')
mascot = mascot.crop(alpha.point(lambda v: 255 if v > 8 else 0).getbbox())
mascot.putalpha(mascot.getchannel('A').point(lambda v: 255 if v >= 245 else v))
mascot_variants = []
for width in (240, 480):
    copy = mascot.copy()
    copy.thumbnail((width, 2400), Image.Resampling.LANCZOS)
    copy.save(MASCOT_OUTPUT / f'pineapple-golfer-{width}.webp', 'WEBP', quality=82, method=6)
    copy.save(MASCOT_OUTPUT / f'pineapple-golfer-{width}.avif', 'AVIF', quality=60, speed=4)
    mascot_variants.append((f'/images/mascot/pineapple-golfer-{width}', copy.width, copy.height))
mascot_asset = {
    'src': mascot_variants[-1][0] + '.webp',
    'srcSet': ', '.join(f'{url}.webp {w}w' for url, w, h in mascot_variants),
    'avifSrcSet': ', '.join(f'{url}.avif {w}w' for url, w, h in mascot_variants),
    'width': mascot_variants[-1][1], 'height': mascot_variants[-1][2],
    'source': mascot_source.relative_to(ROOT.parent).as_posix(),
}

# The link preview (WhatsApp, Facebook, LINE): the club postcard cut to 1200 by 630,
# keeping the title and the pineapple's face.
club_card, _ = load('artGolfClub')
share_height = round(club_card.width * 630 / 1200)
club_card.crop((0, 20, club_card.width, 20 + share_height)).resize((1200, 630), Image.Resampling.LANCZOS) \
    .save(ROOT / 'public' / 'images' / 'share.jpg', 'JPEG', quality=85, optimize=True, progressive=True)

asset_types = 'export interface PhotoAsset { src: string; srcSet: string; avifSrcSet: string; width: number; height: number; source: string }\n\n'
(ROOT / 'src' / 'data' / 'photos.ts').write_text(
    '// Generated by scripts/prepare-golf-photos.py from the supplied photo collection.\n' + asset_types
    + 'export const photoAssets = ' + json.dumps(assets, indent=2) + ' satisfies Record<string, PhotoAsset>;\n\n'
    + 'export const photoByUrl = new Map<string, PhotoAsset>(Object.values(photoAssets).map(photo => [photo.src, photo]));\n\n'
    + 'export const pineappleGolfer: PhotoAsset = ' + json.dumps(mascot_asset, indent=2) + ';\n',
    encoding='utf-8')
print(json.dumps({'photos': len(assets), **{f'{ext}_mb': round(sum(p.stat().st_size for p in OUTPUT.glob(f'*.{ext}')) / 1024 / 1024, 2) for ext in ('avif', 'webp')}}))
