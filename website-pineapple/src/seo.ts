import { artworkAssets } from './components/landing/artworkAssets';
import { badgeFrames } from './components/landing/badgeFrames';
import { CONTACT, rooms } from './data/content';
import { photoAssets } from './data/photos';

// Every public page's title, description, canonical address and structured
// data, in one place. seoPlugin.ts writes them into each page's HTML at build
// time (and into the sitemap); PageMetadata keeps them right as visitors
// move between pages in the app.

// The address search engines and link previews should use: royalpineapplehotel.com
// redirects here, and thepineapplehotel.com and the Vercel address serve the same site.
export const SITE_URL = 'https://www.royalpineapplehotel.com';
export const SITE_NAME = 'Royal Pineapple Hotel';
export const SOCIAL_IMAGE = `${SITE_URL}/images/share.jpg`;
export const SOCIAL_IMAGE_ALT = 'Royal Pineapple Hotel, a pink-and-yellow boutique hotel with a pool in Krabi Town';

export interface PageHead { title: string; description: string; canonical: string | null; robots: string; structuredData?: object[]; preloadImages?: { srcSet: string; sizes: string; type: string }[] }

// The homepage's largest picture is the hero postcard: its frame and first
// photo. Both only appear once the app's JavaScript has run, so the HTML asks
// for them straight away (AVIF; browsers without AVIF skip these and load the
// WebP copies as before). The sizes must match the hero's <picture> elements
// (SCENE_SIZES and OFFER_SIZES in PostcardCollage.tsx).
const HOME_PRELOAD = [
  { srcSet: artworkAssets[badgeFrames['greeting-postcard'].image].avifSrcSet, sizes: '(max-width: 900px) 94vw, 50vw', type: 'image/avif' },
  { srcSet: photoAssets.poolFlamingo.avifSrcSet, sizes: '(max-width: 900px) 84vw, 44vw', type: 'image/avif' },
  { srcSet: artworkAssets[badgeFrames['grand-arrival'].image].avifSrcSet, sizes: '(max-width: 600px) 42vw, (max-width: 900px) 30vw, 260px', type: 'image/avif' },
];

const INDEX = 'index, follow, max-image-preview:large';
const HOTEL_ID = `${SITE_URL}/#hotel`;

const HOME_DESCRIPTION = 'Find your hideaway in Krabi Town at Royal Pineapple Hotel, with balcony rooms, an outdoor pool, a 24-hour café and a free 7-day Krabi programme.';

// Describe the property, without publishing an undated price or an unverified rating.
export const hotelStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  '@id': HOTEL_ID,
  name: SITE_NAME,
  alternateName: ['Royal Pineapple', 'The Pineapple Hotel'],
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo/royal-pineapple.svg`,
  description: HOME_DESCRIPTION,
  image: [SOCIAL_IMAGE],
  telephone: '+66 75 622 622',
  email: CONTACT.email,
  numberOfRooms: 72,
  amenityFeature: ['Outdoor pool', '24-hour gym', '24-hour co-working space', '24-hour café', 'Restaurant','Meeting rooms', 'Free parking', 'Free Wi-Fi', 'Shuttle bus'].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
  address: {
    '@type': 'PostalAddress',
    streetAddress: '339/9 Maharaj Road, Paknam',
    addressLocality: 'Muang',
    addressRegion: 'Krabi',
    postalCode: '81000',
    addressCountry: 'TH',
  },
  hasMap: CONTACT.maps,
  sameAs: [CONTACT.facebook, CONTACT.instagram, CONTACT.tiktok],
  parentOrganization: { '@type': 'Organization', name: 'Hula Hula Holiday', url: 'https://www.hulahularesort.com/' },
  potentialAction: {
    '@type': 'ReserveAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/book`,
      inLanguage: 'en',
      actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
    },
    result: { '@type': 'LodgingReservation', name: 'Book a stay at Royal Pineapple Hotel' },
  },
};

/** The site's name in search results ("Royal Pineapple Hotel" rather than the domain). */
const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  alternateName: ['Royal Pineapple', 'The Pineapple Hotel'],
  inLanguage: 'en',
  publisher: { '@id': HOTEL_ID },
};

/** Home › … › this page, for the breadcrumb trail under the result. */
const breadcrumbs = (trail: [string, string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', '/'] as [string, string], ...trail].map(([name, path], index) => ({ '@type': 'ListItem', position: index + 1, name, item: `${SITE_URL}${path}` })),
});

interface Page { title: string; description: string; trail: [string, string][]; extra?: object[] }

const pages: Record<string, Page> = {
  '/book': {
    title: 'Book Direct | Royal Pineapple Hotel, Krabi Town',
    description: 'Check live room availability and prices at Royal Pineapple Hotel in Krabi Town. Choose your dates and guests, compare rooms and book directly on our official website.',
    trail: [['Book your stay', '/book']],
  },
  '/meetings': {
    title: 'Meetings, Events & Weddings in Krabi Town | Royal Pineapple Hotel',
    description: 'Four meeting rooms and a pool terrace for 10 to 200 guests in Krabi Town, with catering, equipment and wedding packages — and up to 2,000 guests at the family’s Takanta Event Hall.',
    trail: [['Meetings & events', '/meetings']],
  },
  '/meetings/takanta': {
    title: 'Takanta Event Hall (TK Hall) | Event Venue near Krabi Airport',
    description: 'Halls, terraces and lawns for 30 to 2,000 guests at Hula Hula Golf Club, near Krabi International Airport: meetings, seminars, weddings, banquets and parties, with two 15-metre LED walls and catering.',
    trail: [['Meetings & events', '/meetings'], ['Takanta Event Hall', '/meetings/takanta']],
  },
  '/experiences': {
    title: 'Things to Do in Krabi: the 7-Day Programme | Royal Pineapple Hotel',
    description: 'A different Krabi trip every day of the week from Royal Pineapple Hotel: Koh Klang, FootGolf, a Thai cooking class, Tiger Cave Temple, Central Krabi, Railay and Panurat Temple.',
    trail: [['7-day Krabi programme', '/experiences']],
  },
  ...Object.fromEntries(rooms.map((room): [string, Page] => [`/rooms/${room.id}`, {
    title: `${/suite$/i.test(room.title) ? room.title : `${room.title} Room`} | Royal Pineapple Hotel, Krabi`,
    description: `${room.detail} ${room.beds}, sleeps ${room.sleeps}, ${room.view.toLowerCase()}. Book direct on our official website.`,
    trail: [[room.title, `/rooms/${room.id}`]],
    extra: [{
      '@context': 'https://schema.org',
      '@type': 'HotelRoom',
      name: room.title,
      description: room.about,
      image: room.images.map((image) => `${SITE_URL}${image}`),
      bed: room.beds,
      floorSize: { '@type': 'QuantitativeValue', value: room.sqm, unitCode: 'MTK' },
      occupancy: { '@type': 'QuantitativeValue', maxValue: room.sleeps },
      containedInPlace: { '@id': HOTEL_ID },
    }],
  }])),
};

/** Every public page, for the per-page HTML files and the sitemap. */
export const PUBLIC_ROUTES = ['/', ...Object.keys(pages)];

export function pageHead(pathname: string): PageHead {
  const path = pathname === '/index.html' ? '/' : pathname === '/book.html' || pathname === '/book/' ? '/book' : pathname.replace(/(.)\/$/, '$1');
  if (path === '/') {
    return { title: 'Royal Pineapple Hotel | Official Website | Krabi Town, Thailand', description: HOME_DESCRIPTION, canonical: `${SITE_URL}/`, robots: INDEX, structuredData: [websiteStructuredData, hotelStructuredData], preloadImages: HOME_PRELOAD };
  }
  const page = pages[path];
  if (page) return { title: page.title, description: page.description, canonical: `${SITE_URL}${path}`, robots: INDEX, structuredData: [breadcrumbs(page.trail), ...(page.extra ?? [])] };
  // An event's own page (/events/<name>): EventPage.tsx fills in its title and
  // description once the event has loaded from /admin's content.
  if (/^\/events\/[a-z0-9-]+$/i.test(path)) {
    return { title: `What’s on — ${SITE_NAME}`, description: `Events and good times at ${SITE_NAME} in Krabi Town: dates, details, photos and videos.`, canonical: `${SITE_URL}${path}`, robots: INDEX };
  }
  // Staff pages, checkout steps and unknown addresses stay out of search results.
  return {
    title: path.startsWith('/admin') ? 'Website admin — Royal Pineapple Hotel' : 'Book your stay — Royal Pineapple Hotel',
    description: pages['/book'].description,
    canonical: null,
    robots: 'noindex, nofollow',
  };
}
