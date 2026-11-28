import { explorePages } from './data/exploreCopy';
import { photoAssets } from './data/photos';

// Every public page's title, description, canonical address and structured
// data, in one place. seoPlugin.ts writes them into each page's HTML at build
// time (and into the sitemap).

// The club's own domain (the bare domain redirects here).
export const SITE_URL = 'https://www.hulahulagolfclub.com';
export const SITE_NAME = 'Hula Hula Golf Club';
export const SOCIAL_IMAGE = `${SITE_URL}/images/share.jpg`;
export const SOCIAL_IMAGE_ALT = 'Painted postcard: the Hula Hula pineapple in sunglasses beside a tropical golf green';

export interface PageHead {
  title: string;
  description: string;
  canonical: string | null;
  robots: string;
  structuredData?: object[];
  preloadImages?: { srcSet: string; sizes: string; type: string }[];
}

// The homepage's largest picture is the hero fairway photo. It only appears
// once the app's JavaScript has run, so the HTML asks for it straight away
// (AVIF; browsers without AVIF skip this and load the WebP as before). The
// sizes must match the hero's ClubPhoto in components/hero/Hero.tsx.
const HOME_PRELOAD = [{ srcSet: photoAssets.fairwaySign.avifSrcSet, sizes: '(max-width: 900px) 95vw, 55vw', type: 'image/avif' }];

const INDEX = 'index, follow, max-image-preview:large';
const CLUB_ID = `${SITE_URL}/#club`;
const HOME_DESCRIPTION =
  'A tropical 9-hole course near Krabi Airport, with FootGolf, Fling Golf, pickleball, private driving range bays, beginner lessons and H Café & Restaurant. Book your tee time online at Hula Hula Golf Club.';

const clubStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'GolfCourse',
  '@id': CLUB_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  description: HOME_DESCRIPTION,
  image: [SOCIAL_IMAGE],
  telephone: '+66 91 998 8891',
  email: 'reservation@hulahulagolfclub.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Krabi', addressRegion: 'Krabi', addressCountry: 'TH' },
  hasMap: 'https://www.google.com/maps/search/?api=1&query=Hula+Hula+Golf+Club+Krabi',
  sameAs: ['https://www.facebook.com/hulahulagolfclub', 'https://www.instagram.com/hulahulagolfclub'],
  parentOrganization: { '@type': 'Organization', name: 'Hula Hula Holiday', url: 'https://www.hulahularesort.com/' },
};

/** The site's name in search results ("Hula Hula Golf Club" rather than the domain). */
const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  alternateName: ['Hula Hula Golf', 'Hula Hula Golf Club Krabi'],
  inLanguage: 'en',
  publisher: { '@id': CLUB_ID },
};

const breadcrumbs = (trail: [string, string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', '/'] as [string, string], ...trail].map(([name, path], index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: `${SITE_URL}${path}`,
  })),
});

interface Page {
  title: string;
  description: string;
  trail: [string, string][];
}

// The explore pages' search titles; their descriptions are the pages' own intros.
const exploreTitles: Record<string, string> = {
  '/activities': 'Things to Do: Golf, FootGolf & More | Hula Hula Golf Club, Krabi',
  '/events': 'Events & Offers | Hula Hula Golf Club, Krabi',
  '/offers': 'Golf Offers & Packages | Hula Hula Golf Club, Krabi',
  '/prices': 'Green Fees & Prices | Hula Hula Golf Club, Krabi',
  '/clubhouse': 'H Café & Clubhouse | Hula Hula Golf Club, Krabi',
  '/gallery': 'Photo Gallery | Hula Hula Golf Club, Krabi',
  '/visit': 'Plan Your Visit: Location & Free Shuttle | Hula Hula Golf Club',
  '/contact': 'Contact Us | Hula Hula Golf Club, Krabi',
};

// Each activity's own page, with the default wording from booking/config.ts
// and data/content.ts (staff can rename activities in /admin; the page itself
// then shows the new name, while search keeps these until the next build).
const activityPages: [string, string, string, string][] = [
  [
    '/course',
    'Golf',
    'Golf Course: 9 Holes, Par 36 | Hula Hula Golf Club, Krabi',
    'Narrow fairways, water to carry and quick greens, with Phanom Bencha mountain on the horizon. Green fee, caddie and cart included. Book your tee time online.',
  ],
  [
    '/activities/footgolf',
    'FootGolf',
    'FootGolf in Krabi: 18 Holes | Hula Hula Golf Club',
    '18 holes of FootGolf on real fairways, oversized cups and a caddie to show the way. All ages, all abilities, plenty of laughs. Book online.',
  ],
  [
    '/activities/fling-golf',
    'Fling Golf',
    'Fling Golf in Krabi | Hula Hula Golf Club',
    'Scoop, swing and fling a golf ball down our fairways with a lacrosse-style Flingstick. Easy to learn, huge fun in a group.',
  ],
  [
    '/activities/puttgolf',
    'Putt-Golf',
    'Putt-Golf: Mini-Golf on Real Greens | Hula Hula Golf Club, Krabi',
    'Ride a cart from green to green while your caddie sets fun starting points. Mini-golf on real greens, perfect for families and first-timers.',
  ],
  [
    '/activities/range',
    'Driving range',
    'Driving Range with Private Bays | Hula Hula Golf Club, Krabi',
    'Cosy private bays for up to five, each with a sofa, a launch monitor and food and drinks brought to you. Chipping and putting course included.',
  ],
  [
    '/activities/pickleball',
    'Pickleball',
    'Pickleball in Krabi | Hula Hula Golf Club',
    'A little court, a light ball and long, laughing rallies. Pickleball at Hula Hula Golf Club near Krabi Airport: easy to pick up, hard to put down.',
  ],
  [
    '/activities/lesson',
    'Golf lesson',
    'Beginner Golf Lessons in Krabi | Hula Hula Golf Club',
    'A relaxed 3.5-hour golf lesson for complete beginners, with coaching, range time and all the equipment. Not too serious — just fun.',
  ],
  [
    '/activities/cafe',
    'H Café & Restaurant',
    'H Café & Restaurant | Hula Hula Golf Club, Krabi',
    'Lattes and pastries before you tee off, plates to share and cold shakes after, looking straight down the fairways. Open to everyone, no tee time needed.',
  ],
  [
    '/activities/one-bedroom-villa',
    '1-Bedroom Pool Villa',
    '1-Bedroom Pool Villa at the Club | Hula Hula Golf Club, Krabi',
    'Stay where you play: a 1-bedroom villa by a shared pool at Hula Hula Golf Club near Krabi Airport, with a living room and a freestanding bathtub.',
  ],
  [
    '/activities/two-bedroom-villa',
    '2-Bedroom Pool Villa',
    '2-Bedroom Pool Villa at the Club | Hula Hula Golf Club, Krabi',
    'Room for four by a shared pool at Hula Hula Golf Club near Krabi Airport: a living and dining room, a main bedroom and a twin room.',
  ],
];

const pages: Record<string, Page> = {
  '/book': {
    title: 'Book a Tee Time Online | Hula Hula Golf Club, Krabi',
    description:
      'Book golf, FootGolf, Putt-Golf, driving range bays and beginner lessons at Hula Hula Golf Club near Krabi Airport. Pick your day and time, and pay a deposit online.',
    trail: [['Book', '/book']],
  },
  ...Object.fromEntries(
    Object.entries(exploreTitles).map(([path, title]): [string, Page] => {
      const [, intro, , eyebrow] = explorePages[path];
      return [path, { title, description: intro, trail: [[eyebrow, path]] }];
    }),
  ),
  ...Object.fromEntries(
    activityPages.map(([path, name, title, description]): [string, Page] => [
      path,
      {
        title,
        description,
        trail:
          path === '/course'
            ? [[name, path]]
            : [
                ['Activities', '/activities'],
                [name, path],
              ],
      },
    ]),
  ),
};

/** Every public page, for the per-page HTML files and the sitemap. */
export const PUBLIC_ROUTES = ['/', ...Object.keys(pages)];

export function pageHead(pathname: string): PageHead {
  const path = pathname === '/index.html' ? '/' : pathname.replace(/(.)\/$/, '$1');
  if (path === '/') {
    return {
      title: 'Hula Hula Golf Club | Tropical Golf & FootGolf near Krabi Airport',
      description: HOME_DESCRIPTION,
      canonical: `${SITE_URL}/`,
      robots: INDEX,
      structuredData: [websiteStructuredData, clubStructuredData],
      preloadImages: HOME_PRELOAD,
    };
  }
  const page = pages[path];
  if (page)
    return {
      title: page.title,
      description: page.description,
      canonical: `${SITE_URL}${path}`,
      robots: INDEX,
      structuredData: [breadcrumbs(page.trail)],
    };
  // Event pages and anything else the app answers: the homepage's head, which
  // points search engines at the homepage.
  return { ...pageHead('/'), structuredData: [] };
}
