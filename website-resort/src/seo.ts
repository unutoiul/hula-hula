// Every public page's title, description, canonical address and structured
// data, in one place. seoPlugin.ts writes them into each page's HTML at build
// time (and into the sitemap); PageMetadata keeps them right as visitors
// move between pages in the app.

export const SITE_URL = 'https://www.hulahularesort.com';
export const SITE_NAME = 'Hula Hula Resort';
export const SOCIAL_IMAGE = `${SITE_URL}/video/hero-poster.webp`;
export const SOCIAL_IMAGE_ALT = 'Hula Hula Resort in Ao Nang, Krabi';

export interface PageHead { title: string; description: string; canonical: string | null; robots: string; structuredData?: object[]; preloadImages?: { srcSet: string; sizes: string; type: string }[] }

// The homepage hero is a video whose poster is the first picture painted, and
// the video element only exists once the app's JavaScript has run, so the
// HTML asks for the poster straight away (see HeroVideo.tsx).
const HOME_PRELOAD = [{ srcSet: '/video/hero-poster.webp 854w', sizes: '(max-width: 900px) 95vw, 50vw', type: 'image/webp' }];

const INDEX = 'index, follow, max-image-preview:large';
const HOTEL_ID = `${SITE_URL}/#hotel`;

// The direct-booking deal that search results lead with: the website's
// "Direct Promotion" offer in /admin → Offers. Keep these in step with that
// offer. The headline copy switches itself off after `validThrough` (checked
// at build time and in the browser), so an ended deal is never promised.
const DIRECT_DEAL = { percent: 45, perk: 'a welcome drink on arrival', validFrom: '2026-11-09', validThrough: '2027-04-01', untilLabel: '1 Apr 2027' };
// Other automatic website offers, published as structured data while they run.
const SEASONAL_DEALS = [
  { name: 'Christmas', description: '50% off stays of 3 nights or more, with a fruit platter in your room and a welcome drink on arrival, when you book direct', validFrom: '2026-11-01', validThrough: '2027-01-04' },
];
const todayInKrabi = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
const dealRuns = (deal: { validFrom: string; validThrough: string }) => deal.validFrom <= todayInKrabi() && todayInKrabi() <= deal.validThrough;

function copy() {
  const deal = dealRuns(DIRECT_DEAL) ? DIRECT_DEAL : null;
  return {
    homeTitle: deal ? `Hula Hula Resort Ao Nang, Krabi | Book Direct & Save ${deal.percent}%` : 'Hula Hula Resort Ao Nang, Krabi | Official Site, Book Direct',
    homeDescription: deal
      ? `Official Hula Hula Resort website in Ao Nang, Krabi. Book direct and save ${deal.percent}% on every room, with ${deal.perk}. Pools, villas, live prices.`
      : 'Official Hula Hula Resort website in Ao Nang, Krabi. Tropical pools, rooms and villas, with the best prices when you book direct. Live availability.',
    bookTitle: deal ? `Book Direct & Save ${deal.percent}% | Hula Hula Resort, Ao Nang` : 'Book Direct | Hula Hula Resort, Ao Nang, Krabi',
    bookDescription: deal
      ? `Book Hula Hula Resort direct: ${deal.percent}% off every room until ${deal.untilLabel}, plus ${deal.perk}. Live availability and secure online payment.`
      : 'Check live availability and prices at Hula Hula Resort, Ao Nang. Compare rooms and rate plans and book direct with secure online payment.',
  };
}

// Running website offers, as schema.org Offers with their end dates, so search
// engines know each one is time-limited and only for direct bookings.
function offersStructuredData() {
  const deals = [
    { name: 'Direct Promotion', description: `${DIRECT_DEAL.percent}% off every room, with ${DIRECT_DEAL.perk}, when you book direct on the official website`, validFrom: DIRECT_DEAL.validFrom, validThrough: DIRECT_DEAL.validThrough },
    ...SEASONAL_DEALS,
  ].filter(dealRuns);
  return deals.map((deal) => ({
    '@type': 'Offer',
    name: `${deal.name} — book direct`,
    description: deal.description,
    url: `${SITE_URL}/book`,
    validFrom: deal.validFrom,
    validThrough: deal.validThrough,
    seller: { '@id': HOTEL_ID },
  }));
}

// Describe the property, without publishing an undated price or a rating we don't control.
export function hotelStructuredData() {
  const offers = offersStructuredData();
  return {
  '@context': 'https://schema.org',
  '@type': 'Resort',
  '@id': HOTEL_ID,
  name: SITE_NAME,
  alternateName: ['Hula Hula Resort Ao Nang', 'Hula Hula Holiday'],
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo/hula-hula-holiday-logo-colour-on-white.png`,
  description: copy().homeDescription,
  image: [SOCIAL_IMAGE],
  telephone: '+66 96 123 0789',
  email: 'reservation@hulahularesort.com',
  starRating: { '@type': 'Rating', ratingValue: 4 },
  checkinTime: '15:00',
  checkoutTime: '12:00',
  currenciesAccepted: 'THB',
  paymentAccepted: 'Credit card, PromptPay',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '222 Moo 3, Klongheng Road, Ban Ao Nang',
    addressLocality: 'Muang',
    addressRegion: 'Krabi',
    postalCode: '81180',
    addressCountry: 'TH',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 8.0409396, longitude: 98.8194034 },
  hasMap: 'https://www.google.com/maps/search/?api=1&query=Hula%20Hula%20Resort%20Ao%20Nang%20Krabi',
  // From the property's facilities in SiteMinder, plus what the site shows.
  amenityFeature: ['Outdoor pool', 'Swim-up pool bar', 'Restaurant', 'Room service', 'Air conditioning', 'Free parking', 'Spa treatments', 'Fitness centre', 'Meeting and event rooms']
    .map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
  ...(offers.length && { makesOffer: offers }),
  potentialAction: {
    '@type': 'ReserveAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/book`,
      inLanguage: 'en',
      actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
    },
    result: { '@type': 'LodgingReservation', name: 'Book a stay at Hula Hula Resort' },
  },
  };
}

/** The site's name in search results ("Hula Hula Resort" rather than the domain). */
const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  alternateName: ['Hula Hula Resort Ao Nang', 'Hula Hula Holiday'],
  inLanguage: 'en',
  publisher: { '@id': HOTEL_ID },
};

const bookingBreadcrumbs = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Book your stay', item: `${SITE_URL}/book` },
  ],
};

/** Every public page, for the per-page HTML files and the sitemap. */
export const PUBLIC_ROUTES = ['/', '/book'];

export function pageHead(pathname: string): PageHead {
  const text = copy();
  if (['/book', '/book/', '/book.html'].includes(pathname)) {
    return { title: text.bookTitle, description: text.bookDescription, canonical: `${SITE_URL}/book`, robots: INDEX, structuredData: [bookingBreadcrumbs] };
  }
  if (['/', '/index.html'].includes(pathname)) {
    return { title: text.homeTitle, description: text.homeDescription, canonical: `${SITE_URL}/`, robots: INDEX, structuredData: [websiteStructuredData, hotelStructuredData()], preloadImages: HOME_PRELOAD };
  }
  // An event's own page (/events/<name>): EventPage.tsx fills in its title and
  // description once the event has loaded from /admin's content.
  if (/^\/events\/[a-z0-9-]+\/?$/i.test(pathname)) {
    return { title: `What’s on — ${SITE_NAME}`, description: `Events and good times at ${SITE_NAME} in Ao Nang, Krabi: dates, details, photos and videos.`, canonical: `${SITE_URL}${pathname.replace(/\/$/, '')}`, robots: INDEX };
  }
  // Staff pages, checkout steps and unknown addresses stay out of search results.
  return {
    title: pathname.startsWith('/admin') ? 'Website admin — Hula Hula Resort' : 'Book your stay — Hula Hula Resort',
    description: text.bookDescription,
    canonical: null,
    robots: 'noindex, nofollow',
  };
}
