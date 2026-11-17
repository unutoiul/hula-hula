// Royal Pineapple lives on its Vercel address until thepineapplehotel.com points here.
export const SITE_URL = 'https://hulahula-pineapple.vercel.app';
export const SOCIAL_IMAGE = `${SITE_URL}/images/share.jpg`;

const home = {
  title: 'Royal Pineapple Hotel | Official Website | Krabi Town, Thailand',
  description: 'A contemporary colonial-inspired urban resort in the heart of Krabi Town, part of the Hula Hula family. 72 rooms with balconies, a pool, a free 7-day Krabi programme, 24-hour café, co-working and gym. Stay local, explore more.',
  canonical: `${SITE_URL}/`,
  robots: 'index, follow, max-image-preview:large',
};
const booking = {
  title: 'Book Direct | Royal Pineapple Hotel, Krabi Town',
  description: 'Check live room availability and prices at Royal Pineapple Hotel in Krabi Town. Choose your dates and guests, compare rooms and book directly on our official website.',
  canonical: `${SITE_URL}/book`,
  robots: home.robots,
};
const pages: Record<string, { title: string; description: string }> = {
  '/meetings': { title: 'Meetings, events & weddings | Royal Pineapple Hotel, Krabi', description: 'Four meeting rooms and a pool terrace for 10 to 200 guests in Krabi Town, with catering, equipment and wedding packages — and up to 2,000 guests at the family’s Takanta Event Hall.' },
  '/meetings/takanta': { title: 'Takanta Event Hall (TK Hall) | Event venue near Krabi Airport', description: 'Halls, terraces and lawns for 30 to 2,000 guests at Hula Hula Golf Club, near Krabi International Airport: meetings, seminars, weddings, banquets and parties, with two 15-metre LED walls, catering and a one-stop event team.' },
  '/experiences': { title: 'The 7-day Krabi programme | Royal Pineapple Hotel', description: 'A different Krabi trip every day of the week from Royal Pineapple Hotel: Koh Klang, FootGolf, a Thai cooking class, Tiger Cave Temple, Central Krabi, Railay and Panurat Temple.' },
};

export function pageMetadata(pathname: string) {
  if (['/book', '/book/', '/book.html'].includes(pathname)) return booking;
  if (['/', '/index.html'].includes(pathname)) return home;
  if (pages[pathname]) return { ...pages[pathname], canonical: `${SITE_URL}${pathname}`, robots: home.robots };
  if (pathname.startsWith('/rooms/')) {
    return { title: 'Rooms | Royal Pineapple Hotel, Krabi Town', description: home.description, canonical: `${SITE_URL}${pathname}`, robots: home.robots };
  }
  return {
    title: pathname.startsWith('/admin') ? 'Website admin — Royal Pineapple Hotel' : 'Book your stay — Royal Pineapple Hotel',
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
  name: 'Royal Pineapple Hotel',
  alternateName: 'The Pineapple Hotel',
  url: `${SITE_URL}/`,
  description: home.description,
  image: [SOCIAL_IMAGE],
  telephone: '+66 75 622 622',
  email: 'reservation@thepineapplehotel.com',
  numberOfRooms: 72,
  amenityFeature: ['Outdoor pool', '24-hour gym', '24-hour co-working space', '24-hour café', 'Restaurant', 'Spa and salon', 'Meeting rooms', 'Free parking', 'Free Wi-Fi', 'Shuttle bus'].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
  address: {
    '@type': 'PostalAddress',
    streetAddress: '339/9 Maharaj Road, Paknam',
    addressLocality: 'Muang',
    addressRegion: 'Krabi',
    postalCode: '81000',
    addressCountry: 'TH',
  },
  parentOrganization: { '@type': 'Organization', name: 'Hula Hula Holiday', url: 'https://hulahularesort.com' },
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
