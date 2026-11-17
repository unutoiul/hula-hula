"""Create website-sized AVIF and WebP copies of the Royal Pineapple photos; preserve source files.

Same recipe as the resort's and golf club's photo scripts: AVIF (quality 55) is
what modern browsers download, WebP (quality 78) is the fallback. The
originals are the hotel's photo shoot in assets/ROYAL PINEAPPLE HOTEL (kept
out of git) and the Krabi landscapes in assets/00. The photographer's file
names repeat across folders (4P3A1879 is in both "common area" and "Chaba
Restaurant"), so every photo is picked by folder and name. The 7-day
programme photos are the wide pictures at the foot of the hotel's own
day posters, cut out of them.
"""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT.parent / 'assets'
HOTEL = ASSETS / 'ROYAL PINEAPPLE HOTEL'
OUTPUT = ROOT / 'public' / 'images' / 'pineapple'
OUTPUT.mkdir(parents=True, exist_ok=True)
for stale in OUTPUT.glob('*'):  # regenerate from scratch so dropped photos don't linger
    stale.unlink()

ROOMS = HOTEL / 'Roomtype'
COMMON = HOTEL / 'common area'
SELECTION = {
    # The hotel, its pool and the public rooms
    'poolFlamingo': COMMON / '4P3A1801.jpg',
    'poolFacade': COMMON / '4P3A1795.jpg',
    'poolLoungers': COMMON / '4P3A1776.jpg',
    'poolArches': COMMON / '4P3A1783.jpg',
    'poolGarden': COMMON / '4P3A1855.jpg',
    'flamingoFloat': COMMON / '4P3A1799.jpg',
    'facadeShuttle': COMMON / '4P3A1750.jpg',
    'facade': COMMON / '4P3A1538.jpg',
    'shuttle': COMMON / '4P3A1751.jpg',
    'lobby': COMMON / '4P3A1667.jpg',
    'reception': COMMON / '4P3A1675.jpg',
    'lobbyArches': COMMON / '4P3A1690.jpg',
    'windowView': COMMON / '4P3A1659.jpg',
    'floatingBreakfast': COMMON / '4P3A1805.jpg',
    'floatingBreakfastTray': COMMON / '4P3A1846.jpg',
    'chaba': HOTEL / 'Chaba Restaurant' / '4P3A1878.jpg',
    'chabaBuffet': HOTEL / 'Chaba Restaurant' / '4P3A1891.jpg',
    'chabaMurals': HOTEL / 'Chaba Restaurant' / '4P3A1902.jpg',
    'chabaFruit': HOTEL / 'Chaba Restaurant' / '4P3A1894.jpg',
    'meetingBanquet': HOTEL / 'Meeting' / '4P3A2252.jpg',
    'meetingClassroom': HOTEL / 'Meeting' / '4P3A2283.jpg',
    'meetingSmall': HOTEL / 'Meeting' / '4P3A2315.jpg',
    'meetingBoard': HOTEL / 'Meeting' / '4P3A2321.jpg',
    'gym': HOTEL / 'gym' / 'Gym1.png',
    # Rooms, by their new names (photo folders keep the OTA names)
    'twinCoco': ROOMS / 'Deluxe Twin' / '500A7721.jpg',
    'twinCocoBeds': ROOMS / 'Deluxe Twin' / '500A7727.jpg',
    'twinCocoDesk': ROOMS / 'Deluxe Twin' / '500A7731.jpg',
    'twinCocoBath': ROOMS / 'Deluxe Twin' / '500A7737.jpg',
    'hibiscus': ROOMS / 'Deluxe Town View' / '500A7742.jpg',
    'hibiscusBed': ROOMS / 'Deluxe Town View' / '500A7752.jpg',
    'hibiscusDesk': ROOMS / 'Deluxe Town View' / '500A7758.jpg',
    'hibiscusBath': ROOMS / 'Deluxe Town View' / '4P3A1623.jpg',
    'signature': ROOMS / 'Signature Pineapple' / '4P3A2189.jpg',
    'signatureWindow': ROOMS / 'Signature Pineapple' / '500A7678.jpg',
    'signatureBed': ROOMS / 'Signature Pineapple' / '500A7653.jpg',
    'signatureDesk': ROOMS / 'Signature Pineapple' / '500A7672.jpg',
    'blueSky': ROOMS / 'Premier Pool Town View' / '500A7604.jpg',
    'blueSkyDesk': ROOMS / 'Premier Pool Town View' / '4P3A2154.jpg',
    'blueSkyBed': ROOMS / 'Premier Pool Town View' / '500A7624.jpg',
    'blueSkyView': ROOMS / 'Premier Pool Town View' / '500A7631.jpg',
    'emerald': ROOMS / 'Premier Pool Access' / '500A7587.jpg',
    'emeraldBed': ROOMS / 'Premier Pool Access' / '500A7590.jpg',
    'emeraldBath': ROOMS / 'Premier Pool Access' / '500A7601.jpg',
    'emeraldPool': ROOMS / 'Premier Pool Access' / '4P3A1788.jpg',
    'suite': ROOMS / 'Family Suite - Town View' / '500A7695.jpg',
    'suiteBedroom': ROOMS / 'Family Suite - Town View' / '500A7686.jpg',
    'suiteArch': ROOMS / 'Family Suite - Town View' / '500A7691.jpg',
    'suiteView': ROOMS / 'Family Suite - Town View' / '4P3A1953.jpg',
    'tripleCoco': ROOMS / 'Triple Street View' / '4P3A2089.jpg',
    'tripleCocoBeds': ROOMS / 'Triple Street View' / '500A7705.jpg',
    'tripleCocoRoom': ROOMS / 'Triple Street View' / '500A7710.jpg',
    'tripleCocoBath': ROOMS / 'Triple Street View' / '500A7716.jpg',
    'tripleBlue': ROOMS / 'Triple Pool View' / '4P3A2133.jpg',
    'tripleBlueBeds': ROOMS / 'Triple Pool View' / '4P3A2136.jpg',
    'tripleBlueRoom': ROOMS / 'Triple Pool View' / '500A7633.jpg',
    'tripleBluePool': ROOMS / 'Triple Pool View' / '500A7683.jpg',
    # Krabi (assets/00, 1920x1080)
    'khanapNamSunset': ASSETS / '00' / '3.png',
    'khanapNam': ASSETS / '00' / '12.png',
    'longtail': ASSETS / '00' / '9.png',
    'tigerCave': ASSETS / '00' / '1.png',
    'railay': ASSETS / '00' / '7.png',
    'watKaew': ASSETS / '00' / '11.png',
    'blackCrab': ASSETS / '00' / '2.png',
    'riverSunset': ASSETS / '00' / '6.png',
    'lagoon': ASSETS / '00' / '10.png',
    'aoNangSunset': ASSETS / '00' / '8.png',
    'daySunday': ROOT / 'assets' / 'sunday-panurat-temple-v2.webp',
}

# The 7-day programme: the wide photo at the foot of each day poster.
POSTERS = HOTEL / 'Activity 7Day'
DAY_POSTERS = {
    'dayMonday': 'ACTIVE-03', 'dayTuesday': 'ACTIVE-04', 'dayWednesday': 'ACTIVE-05', 'dayThursday': 'ACTIVE-06',
    'dayFriday': 'ACTIVE-07', 'daySaturday': 'ACTIVE-08',
}


# Every day poster shares one A4 template (2481 x 3509): the wide photo panel
# starts below the white gap at y 2088 and runs to the leaves at the foot;
# the box is kept inside its rounded corners and the painted leaves.
POSTER_PANEL = (95, 2105, 2390, 3395)


def poster_photo(path):
    """The lower photo panel of a day poster."""
    with Image.open(path) as raw:
        return raw.convert('RGB').crop(POSTER_PANEL)


def load(key):
    if key in DAY_POSTERS:
        source = POSTERS / f'{DAY_POSTERS[key]}.png'
        return poster_photo(source), source
    source = SELECTION[key]
    with Image.open(source) as raw:
        return ImageOps.exif_transpose(raw).convert('RGB'), source


assets = {}
for key in [*SELECTION, *DAY_POSTERS]:
    image, source = load(key)
    variants = {}
    for width in (480, 960, 1600):
        copy = image.copy()
        copy.thumbnail((width, 2400), Image.Resampling.LANCZOS)
        copy.save(OUTPUT / f'{key}-{width}.webp', 'WEBP', quality=78, method=6)
        copy.save(OUTPUT / f'{key}-{width}.avif', 'AVIF', quality=55, speed=4)
        variants[width] = (f'/images/pineapple/{key}-{width}', copy.width, copy.height)
    # Small sources yield duplicate widths; keep one entry per actual width.
    unique = {v[1]: v for v in variants.values()}.values()
    assets[key] = {
        'src': variants[1600][0] + '.webp',
        'srcSet': ', '.join(f'{url}.webp {w}w' for url, w, h in unique),
        'avifSrcSet': ', '.join(f'{url}.avif {w}w' for url, w, h in unique),
        'width': variants[1600][1], 'height': variants[1600][2],
        'source': source.relative_to(ROOT.parent).as_posix(),
    }

# The link preview (WhatsApp, Facebook, LINE): the pool, the flamingo and the yellow hotel, 1200 by 630.
share, _ = load('poolFlamingo')
share = ImageOps.fit(share, (1200, 630), Image.Resampling.LANCZOS, centering=(0.5, 0.55))
share.save(ROOT / 'public' / 'images' / 'share.jpg', 'JPEG', quality=85, optimize=True, progressive=True)

# The thumbnail in every Hula Hula site's switcher (resort, golf club and this one).
thumb, _ = load('poolFlamingo')
thumb = ImageOps.fit(thumb, (224, 224), Image.Resampling.LANCZOS, centering=(0.62, 0.62))
for site in ('website-pineapple', 'website-resort', 'website-golf'):
    target = ROOT.parent / site / 'public' / 'images' / 'switcher'
    target.mkdir(parents=True, exist_ok=True)
    thumb.save(target / 'pineapple.webp', 'WEBP', quality=82, method=6)

asset_types = 'export interface PhotoAsset { src: string; srcSet: string; avifSrcSet: string; width: number; height: number; source: string }\n\n'
(ROOT / 'src' / 'data' / 'photos.ts').write_text(
    '// Generated by scripts/prepare-pineapple-photos.py from the hotel\'s photo shoot.\n' + asset_types
    + 'export const photoAssets = ' + json.dumps(assets, indent=2) + ' satisfies Record<string, PhotoAsset>;\n\n'
    + 'export const photoByUrl = new Map<string, PhotoAsset>(Object.values(photoAssets).map(photo => [photo.src, photo]));\n',
    encoding='utf-8')
print(json.dumps({'photos': len(assets), **{f'{ext}_mb': round(sum(p.stat().st_size for p in OUTPUT.glob(f'*.{ext}')) / 1024 / 1024, 2) for ext in ('avif', 'webp')}}))
