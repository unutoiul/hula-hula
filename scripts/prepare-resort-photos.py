"""Create website-sized WebP copies of selected photos; preserve source files."""
from pathlib import Path
import json
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PHOTO_ROOT = ROOT / 'photos'
OUTPUT = ROOT / 'public' / 'images' / 'hula-hula'
OUTPUT.mkdir(parents=True, exist_ok=True)

SELECTION = {
    'fruitCart': 'hula-hula-resort-fruit-cart-promotion',
    'shuttlePromotion': 'hula-hula-shuttle-truck-and-service-destinations-promotion',
    'heroPool': 'hula-hula-main-pool-and-guest-room-balconies',
    'heroBreakfast': 'hula-hula-guest-with-breakfast-tray-in-infinity-pool',
    'heroGolf': 'hula-hula-golf-club-footgolf-group-photo',
    'breakfast': 'hula-hula-round-breakfast-tray-on-pool-water',
    'breakfastPortrait': 'hula-hula-guest-and-breakfast-tray-in-private-pool',
    'poolOverview': 'hula-hula-elevated-swim-up-bar-and-curved-pool',
    'poolBar': 'hula-hula-swim-up-bar-and-pool-access-walkway',
    'poolNight': 'hula-hula-poolside-sun-loungers-and-lobby-at-night',
    'poolLifestyle': 'hula-hula-guest-standing-beside-tropical-pool',
    'garden': 'hula-hula-palm-lined-walkway-between-villas',
    'lobby': 'hula-hula-high-ceiling-lobby-and-glass-gable',
    'reception': 'hula-hula-reception-counter-and-lounge-seating',
    'deluxeBedroom': 'hula-hula-deluxe-garden-street-view-bedroom-and-garden-balcony',
    'deluxeRoom': 'hula-hula-deluxe-garden-street-view-bedroom-television-and-dressing-table',
    'deluxeBathroom': 'hula-hula-deluxe-garden-street-view-bathroom-walk-in-shower-and-vanity',
    'premierBedroom': 'hula-hula-premier-pool-mountain-view-bedroom-wide-view-and-balcony',
    'premierRoom': 'hula-hula-premier-pool-mountain-view-bedroom-wooden-headboard-and-dressing-table',
    'signatureBedroom': 'hula-hula-signature-spa-villa-bedroom-front-view-and-green-bed-runner',
    'signatureRoom': 'hula-hula-signature-spa-villa-bedroom-wide-view-and-wooden-headboard',
    'spaBathroom': 'hula-hula-spa-villa-bathroom-tub-and-vanity',
    'poolVillaTerrace': 'hula-hula-two-storey-pool-villa-private-pool-terrace-with-loungers-and-parasol',
    'poolVillaBedroom': 'hula-hula-two-storey-pool-villa-four-poster-bed-with-towel-swans-front-view',
    'poolVillaLiving': 'hula-hula-two-storey-pool-villa-living-room-sofa-and-dining-table',
    'spaPremierBedroom': 'hula-hula-villa-spa-premier-bedroom-with-pineapple-cushions-and-wooden-headboard',
    'spaPremierBalcony': 'hula-hula-villa-spa-premier-balcony-chairs-and-tropical-garden-view',
    'juniorBedroom': 'hula-hula-junior-suite-pool-access-mountain-view-bedroom-facing-pool-access-terrace',
    'juniorTerrace': 'hula-hula-junior-suite-pool-access-mountain-view-pool-access-terrace-chairs-and-tropical-plants',
    'juniorBathroom': 'hula-hula-junior-suite-pool-access-mountain-view-bathroom-tub-vanity-and-walk-in-shower',
    'familyLiving': 'hula-hula-family-two-bedrooms-living-room-sofas-and-dining-table',
    'familyBedroom': 'hula-hula-family-two-bedrooms-bathroom-and-bedroom-through-opening',
    'familyBathroom': 'hula-hula-family-two-bedrooms-bathroom-tub-and-double-basins',
    'pineappleRice': 'hula-hula-chang-pineapple-fried-rice-with-prawns',
    'thaiFood': 'hula-hula-chang-thai-dishes-and-pineapple-rice-table-spread',
    'restaurant': 'hula-hula-chang-dining-tables-and-lounge-sofas',
    'cocktail': 'hula-hula-pom-pom-blue-green-tropical-cocktail-with-pineapple',
    'watermelon': 'hula-hula-pom-pom-watermelon-shake-with-paper-parasol',
    'coconut': 'hula-hula-pom-pom-fresh-coconut-drink-with-branded-shell',
    'burger': 'hula-hula-pom-pom-cheeseburger-with-fries-and-salad',
    'golfCourse': 'hula-hula-golf-club-striped-fairways-from-clubhouse-balcony',
    'golfSwing': 'hula-hula-golf-club-golfer-swinging-beside-golf-cart',
    'railay': 'railay-beach-aerial-beach-and-limestone-cliffs',
    'longtail': 'krabi-longtail-boats-on-turquoise-sea-with-cliffs',
    'wellness': 'hula-hula-thai-herbal-compresses-and-spa-ingredients',
    'gym': 'hula-hula-fitness-centre-treadmills-and-greenery',
    'banquet': 'hula-hula-round-table-banquet-with-white-chair-covers',
    'poolBanquet': 'hula-hula-poolside-banquet-tables-under-palm-trees',
    'meeting': 'hula-hula-conference-room-facing-stage-and-chandelier',
}

paths = list(PHOTO_ROOT.rglob('*'))
by_stem = {p.stem:p for p in paths if p.is_file()}
assets = {}
contact = Image.new('RGB', (1500, ((len(SELECTION)+4)//5)*240), '#fff8ea')
draw = ImageDraw.Draw(contact)
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 17)
for n,(key,stem) in enumerate(SELECTION.items()):
    source = by_stem[stem]
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw).convert('RGB')
        variants = {}
        for width in (480,960,1600):
            copy = image.copy()
            copy.thumbnail((width,2400),Image.Resampling.LANCZOS)
            filename = f'{key}-{width}.webp'
            copy.save(OUTPUT/filename,'WEBP',quality=84,method=5)
            variants[width] = (f'/images/hula-hula/{filename}',copy.width,copy.height)
        assets[key] = {'src':variants[1600][0],'srcSet':', '.join(f'{url} {w}w' for url,w,h in {v[1]:v for v in variants.values()}.values()),'width':variants[1600][1],'height':variants[1600][2],'source':source.relative_to(ROOT).as_posix()}
        image.thumbnail((290,207),Image.Resampling.LANCZOS)
        x,y=n%5*300,n//5*240
        contact.paste(image,(x+(300-image.width)//2,y+(210-image.height)//2))
        draw.text((x+8,y+215),key,fill='#173c40',font=font)

asset_types = 'export interface PhotoAsset { src: string; srcSet: string; width: number; height: number; source: string }\n\n'
(ROOT/'src'/'data'/'photos.ts').write_text('// Generated by scripts/prepare-resort-photos.py from the supplied photo collection.\n'+asset_types+'export const photoAssets = '+json.dumps(assets,indent=2)+' satisfies Record<string, PhotoAsset>;\n\nexport const photoByUrl = new Map<string, PhotoAsset>(Object.values(photoAssets).map(photo => [photo.src, photo]));\n',encoding='utf-8')
(ROOT/'design-preview').mkdir(exist_ok=True)
contact.save(ROOT/'design-preview'/'selected-photos.jpg',quality=88)
print(json.dumps({'selected_photos':len(assets),'webp_files':len(list(OUTPUT.glob('*.webp'))),'total_mb':round(sum(p.stat().st_size for p in OUTPUT.glob('*.webp'))/1024/1024,2)}))
