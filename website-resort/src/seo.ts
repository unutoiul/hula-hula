// Every public page's title, description, canonical address and structured
// data, in one place. seoPlugin.ts writes them into each page's HTML at build
// time (and into the sitemap); PageMetadata keeps them right as visitors
// move between pages in the app.

export const SITE_URL = 'https://www.hulahularesort.com';
export const SITE_NAME = 'Hula Hula Resort';
export const SOCIAL_IMAGE = `${SITE_URL}/video/hero-poster.webp`;
export const SOCIAL_IMAGE_ALT = 'Hula Hula Resort in Ao Nang, Krabi';

export interface PageHead { title: string; description: string; canonical: string | null; robots: string; structuredData?: object[] }

const INDEX = 'index, follow, max-image-preview:large';
const HOTEL_ID = `${SITE_URL}/#hotel`;
const HOME_DESCRIPTION = 'Stay at Hula Hula Resort in Ao Nang, Krabi. Explore tropical pools, rooms and villas, and book directly with live availability and prices.';
const BOOK_DESCRIPTION = 'Check live room availability and prices at Hula Hula Resort. Choose your dates and guests, compare rooms and rate plans, and book directly on our official website.';

// Describe the property, without publishing an undated price or an unverified rating.
export const hotelStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Resort',
  '@id': HOTEL_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo/hula-hula-holiday-logo-colour-on-white.png`,
  description: HOME_DESCRIPTION,
  image: [SOCIAL_IMAGE],
  telephone: '+66 96 123 0789',
  email: 'reservation@hulahularesort.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '222 Moo 3, Klongheng Road, Ban Ao Nang',
    addressLocality: 'Muang',
    addressRegion: 'Krabi',
    postalCode: '81180',
    addressCountry: 'TH',
  },
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
  if (['/book', '/book/', '/book.html'].includes(pathname)) {
    return { title: 'Book Direct | Hula Hula Resort, Ao Nang, Krabi', description: BOOK_DESCRIPTION, canonical: `${SITE_URL}/book`, robots: INDEX, structuredData: [bookingBreadcrumbs] };
  }
  if (['/', '/index.html'].includes(pathname)) {
    return { title: 'Hula Hula Resort | Official Website | Ao Nang, Krabi', description: HOME_DESCRIPTION, canonical: `${SITE_URL}/`, robots: INDEX, structuredData: [websiteStructuredData, hotelStructuredData] };
  }
  // Staff pages, checkout steps and unknown addresses stay out of search results.
  return {
    title: pathname.startsWith('/admin') ? 'Website admin — Hula Hula Resort' : 'Book your stay — Hula Hula Resort',
    description: BOOK_DESCRIPTION,
    canonical: null,
    robots: 'noindex, nofollow',
  };
}
