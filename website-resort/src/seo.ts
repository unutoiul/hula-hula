export const SITE_URL = 'https://www.hulahularesort.com';
export const SOCIAL_IMAGE = `${SITE_URL}/video/hero-poster.webp`;

const home = {
  title: 'Hula Hula Resort | Official Website | Ao Nang, Krabi',
  description: 'Stay at Hula Hula Resort in Ao Nang, Krabi. Explore tropical pools, rooms and villas, and book directly with live availability and prices.',
  canonical: `${SITE_URL}/`,
  robots: 'index, follow, max-image-preview:large',
};
const booking = {
  title: 'Book Direct | Hula Hula Resort, Ao Nang, Krabi',
  description: 'Check live room availability and prices at Hula Hula Resort. Choose your dates and guests, compare rooms and rate plans, and book directly on our official website.',
  canonical: `${SITE_URL}/book`,
  robots: home.robots,
};

export function pageMetadata(pathname: string) {
  if (['/book', '/book/', '/book.html'].includes(pathname)) return booking;
  if (['/', '/index.html'].includes(pathname)) return home;
  return {
    title: pathname.startsWith('/admin') ? 'Website admin — Hula Hula Resort' : 'Book your stay — Hula Hula Resort',
    description: booking.description,
    canonical: null,
    robots: 'noindex, nofollow',
  };
}

// Describe the property, without publishing an undated price or an unverified rating.
export const hotelStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  '@id': `${SITE_URL}/#hotel`,
  name: 'Hula Hula Resort',
  url: `${SITE_URL}/`,
  description: home.description,
  image: [SOCIAL_IMAGE],
  telephone: '+66 96 123 0789',
  email: 'reservation@hulahulaholiday.com',
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
