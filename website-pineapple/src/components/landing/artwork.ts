export const artwork = {
  flowers: '/images/royal-pineapple/botanical-flourish.webp',
  mascot: '/images/royal-pineapple/royal-pineapple-mascot.webp',
  swan: '/images/royal-pineapple/pink-pool-escape.webp',
  swanMascot: '/images/royal-pineapple/pink-swan-mascot.webp',
  hammock: '/images/royal-pineapple/pink-hammock.webp',
  riviera: '/images/royal-pineapple/postcards-v2/05-riviera.webp',
  balcony: '/images/royal-pineapple/postcards-v2/06-balcony.webp',
  night: '/images/royal-pineapple/postcards-v2/07-after-hours.webp',
  luggage: '/images/royal-pineapple/badges-v3/14-grand-arrival-badge.webp',
  photoArrival: '/images/royal-pineapple/postcards-v2/10-photo-arrival.webp',
  writingSet: '/images/royal-pineapple/keepsake-invitation/15-pink-postcard-writing-set.webp',
  postcardCorner: '/images/royal-pineapple/keepsake-invitation/16-bougainvillea-postcard-corner.webp',
};

export interface PostcardArtwork {
  id: string;
  title: string;
  image: string;
  fullImage: string;
  alt: string;
  width: number;
  height: number;
  kind: 'postcard' | 'badge';
}

// A curated set: one Riviera scene, one balcony, one real arrival, three badges.
// Similar pool photographs and alternate copies stay in assets, out of the UI.
const collection = [
  { id: 'riviera', file: '05-riviera', folder: 'postcards-v2', title: 'A little Riviera, a lot of Krabi', alt: 'A watercolor Royal Pineapple postcard with golden arches, a turquoise pool and pink striped parasols', width: 1536, height: 1024, kind: 'postcard' as const },
  { id: 'balcony', file: '06-balcony', folder: 'postcards-v2', title: 'The balcony daydream', alt: 'A watercolor balcony arch overlooking the golden hotel and turquoise pool, with pink flowers and a pineapple drink', width: 1536, height: 1024, kind: 'postcard' as const },
  { id: 'arrival', file: '10-photo-arrival', folder: 'postcards-v2', title: 'A very royal arrival', alt: 'The real hotel entrance photograph blended with pink flowers and gold postcard flourishes', width: 1536, height: 1024, kind: 'postcard' as const },
  { id: 'grand-tour', file: '14-grand-arrival-badge', folder: 'badges-v3', title: 'The grand tour', alt: 'A vintage rose-pink luggage badge of the golden hotel with the official pink pineapple emblem', width: 1385, height: 1136, kind: 'badge' as const },
  { id: 'pool-club', file: '12-pool-club-badge', folder: 'badges-v3', title: 'The pink pool club', alt: 'A rose-pink and gold die-cut badge with a sunny hotel pool, striped parasols and the official pineapple emblem', width: 1536, height: 1024, kind: 'badge' as const },
  { id: 'after-hours', file: '13-evening-garden-badge', folder: 'badges-v3', title: 'Meet you after hours', alt: 'An evening garden travel badge with a plum sky, warm hotel arches and the official pink pineapple emblem', width: 1536, height: 1024, kind: 'badge' as const },
];

export const postcards: PostcardArtwork[] = collection.map(card => ({
  id: card.id, title: card.title, alt: card.alt,
  image: `/images/royal-pineapple/${card.folder}/${card.file}.webp`,
  fullImage: `/images/royal-pineapple/${card.folder}/${card.file}.full.webp`,
  width: card.width, height: card.height, kind: card.kind,
}));

export const heroPostcards = [
  { ...postcards[1], position: 'back', tilt: 8 },
  { ...postcards[0], position: 'main', tilt: -6 },
  { ...postcards[3], position: 'badge', tilt: 11 },
];
