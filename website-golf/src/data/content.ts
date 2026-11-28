import type { NavItem } from '../types';
import { photoAssets as p } from './photos';

export const navItems: NavItem[] = [
  ['The course', '/course'],
  ['Activities', '/activities'],
  ['Prices', '/prices'],
  ['Clubhouse', '/clubhouse'],
  ['Visit', '/visit'],
  ['Say hello', '/contact'],
];

export const COURSE_FACTS = [
  { value: '9 / 18', label: 'hole packages' },
  { value: '36', label: 'par' },
  { value: '3,011', label: 'yards' },
  { value: '9', label: 'ft green speed' },
];

export interface CafeMoment {
  name: string;
  detail: string;
  image: string;
  objectPosition?: string;
}
export const cafeMoments: CafeMoment[] = [
  { name: 'Before your round', detail: 'Lattes, matcha and fresh pastries, served on little putting greens.', image: p.cafeCoffee.src },
  {
    name: 'After your round',
    detail: 'Plates to share and cold shakes on the balcony, looking down the fairways.',
    image: p.cafeView.src,
    objectPosition: 'center 70%',
  },
  {
    name: 'Any time at all',
    detail: 'Sink into the lounge, cool off, and swap stories about the one that nearly went in.',
    image: p.cafeLounge.src,
  },
];

// The painted pineapple postcards, each one a way into the real thing: an
// activity's tee sheet (when that activity is live) or a section of the page.
export interface Postcard {
  image: string;
  alt: string;
  cta: string;
  activity?: string;
  href?: string;
}
export const postcards: Postcard[] = [
  {
    image: p.artGolfClub.src,
    alt: 'Painted postcard, “Hula Hula Golf Club”: the pineapple in sunglasses and a visor leans on his golf bag beside a green with a red flag',
    cta: 'Book a round',
    activity: 'golf',
  },
  {
    image: p.artDrivingRange.src,
    alt: 'Painted postcard, “Hula Hula Driving Range”: the pineapple follows through on a big swing from a range mat',
    cta: 'Book a range bay',
    activity: 'range',
  },
  {
    image: p.artPuttingGreen.src,
    alt: 'Painted postcard, “Hula Hula Putting Green”: the pineapple lines up a short putt to the hole',
    cta: 'Putt free at the range',
    activity: 'range',
  },
  {
    image: p.artSunsetGolf.src,
    alt: 'Painted postcard, “Hula Hula Sunset Golf”: coconut drink in hand, the pineapple leans on his putter as the sun goes down',
    cta: 'Book a late round',
    activity: 'golf',
  },
  {
    image: p.art19thHole.src,
    alt: 'Painted postcard, “Hula Hula The 19th Hole”: the pineapple puts his feet up on the clubhouse terrace with a cold drink',
    cta: 'Drinks after',
    href: '/activities/cafe',
  },
];

// The things to do that aren't on the tee sheet: the clubhouse café, the
// two pool villas here at the club and a villa at the resort. They sit in the activities list after whatever staff
// have switched on in /admin, each with its own page at /activities/<id>.
// An action's href of 'whatsapp' becomes a WhatsApp chat with `message`.
export interface PlaceAction {
  label: string;
  href: string;
  message?: string;
}
export interface Place {
  id: string;
  name: string;
  kind: 'cafe' | 'villa';
  kicker: string;
  tagline: string;
  title: string;
  detail: string;
  about: string;
  images: string[];
  facts: string[];
  actions: PlaceAction[];
  showHours: boolean;
  /** The little note on its card in the activities list; else "Open to all" (café) or "At the resort" (villa). */
  note?: string;
}

// The two pool villas here at the club share a pool. They're sold by our
// sister hotel Royal Pineapple (its SiteMinder), so "book" goes to its
// booking page; questions come to the club on WhatsApp. Photos are the ones
// on royalpineapplehotel.com/rooms/…-pool-villa.
const ROYAL_PINEAPPLE_BOOK = 'https://www.royalpineapplehotel.com/book';
const clubVillaActions = (villa: string): PlaceAction[] => [
  { label: 'Check dates & book', href: ROYAL_PINEAPPLE_BOOK },
  { label: 'Ask us on WhatsApp', href: 'whatsapp', message: `Hi Hula Hula Golf Club! I’d like to ask about the ${villa}: ` },
];
export const places: Place[] = [
  {
    id: 'cafe',
    name: 'H Café & Restaurant',
    kind: 'cafe',
    kicker: 'In the clubhouse',
    tagline: 'Coffee, lunch and cold drinks with a fairway view',
    title: 'The tenth hole',
    detail: 'Lattes and pastries before you tee off, plates to share and cold shakes after, looking straight down the fairways.',
    about:
      'The H Café & Restaurant sits in the clubhouse, looking straight down the fairways to Phanom Bencha mountain. Come early for lattes, matcha and fresh pastries, or stay after your round for plates to share and cold shakes on the balcony.\n\nIt’s open to everyone, no tee time needed. And if you’re in a driving range bay, food and drinks come right to your sofa.',
    images: [p.cafeView.src, p.cafeCoffee.src, p.cafeInterior.src, p.cafeLounge.src],
    facts: ['Open to everyone, no tee time needed', 'Balcony seats over the fairways', 'Food & drinks brought to the range bays'],
    actions: [
      { label: 'Reserve a table', href: 'whatsapp', message: 'Hi Hula Hula Golf Club! I’d like to reserve a table at H Café for ' },
      { label: 'See the clubhouse', href: '/clubhouse' },
    ],
    showHours: true,
  },
  {
    id: 'one-bedroom-villa',
    name: '1-Bedroom Pool Villa',
    kind: 'villa',
    kicker: 'Stay at the club',
    tagline: 'A villa for two by the pool, a short walk from the first tee',
    title: 'Sleep by the fairways',
    detail: 'A bedroom, a living room looking onto the shared pool, and a freestanding bathtub, right here at the club.',
    about:
      'Stay where you play. The 1-bedroom villa is here at Hula Hula Golf Club: a bedroom, a living room whose big window looks onto the villas’ shared pool, a fridge and microwave, and a bathroom with a freestanding tub.\n\nWake up, have breakfast, and be on the first tee before the heat. The villa is booked through our sister hotel, Royal Pineapple.',
    images: [
      p.clubVilla1Living.src,
      p.clubVillaPool.src,
      p.clubVilla1Bedroom.src,
      p.clubVilla1Bath.src,
      p.clubVilla1Lounge.src,
      p.clubVilla1Basin.src,
    ],
    facts: ['42 m², sleeps 2', 'Bedroom and separate living room', 'Shared pool with loungers', 'Freestanding bathtub', 'Booked with Royal Pineapple Hotel'],
    actions: clubVillaActions('1-bedroom pool villa'),
    showHours: false,
    note: 'Stay at the club',
  },
  {
    id: 'two-bedroom-villa',
    name: '2-Bedroom Pool Villa',
    kind: 'villa',
    kicker: 'Stay at the club',
    tagline: 'Room for four by the pool, here at the club',
    title: 'Bring the whole four-ball',
    detail: 'A living and dining room, a big main bedroom, a twin room and a shared pool, right here at the club.',
    about:
      'Bring the family or your playing partners. The 2-bedroom villa is here at Hula Hula Golf Club, by the villas’ shared pool: a living room with a big TV, a dining table under a carved wooden arch, a main bedroom with its own wardrobes and desk, and a twin room.\n\nThe villa is booked through our sister hotel, Royal Pineapple.',
    images: [
      p.clubVillaPool.src,
      p.clubVilla2Master.src,
      p.clubVilla2Living.src,
      p.clubVilla2Dining.src,
      p.clubVilla2Bedroom.src,
      p.clubVilla2MasterBed.src,
      p.clubVilla2Twin.src,
      p.clubVilla2Lounge.src,
    ],
    facts: ['Sleeps 4', 'Living room and dining table', 'Main bedroom and a twin room', 'Shared pool with loungers', 'Booked with Royal Pineapple Hotel'],
    actions: clubVillaActions('2-bedroom pool villa'),
    showHours: false,
    note: 'Stay at the club',
  },
  {
    id: 'pool-villa',
    name: 'Pool Villa',
    kind: 'villa',
    kicker: 'Stay at Hula Hula Resort',
    tagline: 'Your own pool, with the free shuttle to the first tee',
    title: 'Stay & play',
    detail: 'A two-storey villa with its own pool terrace at our sister resort in Ao Nang.',
    about:
      'Make a holiday of it at Hula Hula Resort, our sister resort in Ao Nang. The Two-Storey Pool Villa gives you your own pool terrace with loungers, a four-poster bedroom, and a living and dining room with space to spread out.\n\nThe club’s free shuttle runs twice a day, so you can swim in the morning and tee off after lunch.',
    images: [p.villaTerrace.src, p.villaBedroom.src, p.villaLiving.src, p.villaPoolBed.src, p.villaBath.src],
    facts: ['Private pool terrace with loungers', 'Four-poster bedroom', 'Living & dining room', 'Booked with Hula Hula Resort'],
    actions: [
      { label: 'Check dates at the resort', href: 'https://www.hulahularesort.com/book' },
      { label: 'See all the rooms', href: 'https://www.hulahularesort.com/#hotel' },
    ],
    showHours: false,
  },
];

export interface GalleryPhoto {
  image: string;
  title: string;
  category: string;
}
export const galleryPhotos: GalleryPhoto[] = [
  { image: p.fairwayBalcony.src, title: 'The view from the clubhouse', category: 'The course' },
  { image: p.footgolfGroup.src, title: 'Squad goals on hole 8', category: 'FootGolf' },
  { image: p.cafeCoffee.src, title: 'Coffee, Hula Hula style', category: 'Clubhouse' },
  { image: p.puttingGreen.src, title: 'Over the water, onto the green', category: 'The course' },
  { image: p.cafeView.src, title: 'Lunch with a fairway view', category: 'Clubhouse' },
  { image: p.golfSwing.src, title: 'Swing, and enjoy the ride', category: 'The course' },
  { image: p.footgolfKick.src, title: 'Lining up the big kick', category: 'FootGolf' },
  { image: p.clubhouse.src, title: 'Welcome to the clubhouse', category: 'Clubhouse' },
  { image: p.pondFairway.src, title: 'Blue skies, green fairways', category: 'The course' },
  { image: p.cafeLounge.src, title: 'Sink into the lounge', category: 'Clubhouse' },
  { image: p.footgolfFlag.src, title: 'Who’s got the honours?', category: 'FootGolf' },
  { image: p.fairwaySign.src, title: 'Hello from Hula Hula', category: 'The course' },
  { image: p.cafeInterior.src, title: 'Cool and green inside', category: 'Clubhouse' },
  { image: p.footgolfLineUp.src, title: 'Eyes on the flag', category: 'FootGolf' },
  { image: p.sunnyFairway.src, title: 'Freshly striped fairways', category: 'The course' },
  { image: p.footgolfFairway.src, title: 'Chasing it down the fairway', category: 'FootGolf' },
];

// The club's Google rating, shown in the hero. Copied from Google Maps by hand
// (26 Nov 2026), so update it now and then; the link opens the club's listing.
export const GOOGLE_REVIEWS = {
  rating: 4.7,
  count: 780,
  label: 'Golf course',
  url: 'https://www.google.com/maps/search/?api=1&query=Hula%20Hula%20Golf%20Club%20Krabi',
};
