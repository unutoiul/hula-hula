import type { Highlight } from './cmsCards';

/** Visual concepts requested for review. They never create promo codes or alter rates. */
export const previewOffers: Highlight[] = [
  {
    id: 'preview-direct',
    kind: 'offer',
    preview: true,
    label: 'Your book-direct treat',
    tag: '−45%',
    title: 'Your holiday. A little sweeter.',
    description: 'Golden arches, pink pool days and a direct-booking treat worth daydreaming about.',
    perks: ['A special rate for booking direct', 'Your choice of a lovely little room', 'A warm welcome from our own team'],
    note: 'Sample offer. Dates, eligible rooms and terms to be confirmed.',
    image: '/images/pineapple/poolFlamingo-1600.webp',
    ctaLabel: 'Ask about booking direct',
  },
  {
    id: 'preview-breakfast',
    kind: 'offer',
    preview: true,
    label: 'The slow-morning escape',
    tag: 'Breakfast for two',
    title: 'Stay a little. Linger a lot.',
    description: 'Three nights, long breakfasts and absolutely no reason to rush your first coffee.',
    perks: ['A three-night little getaway', 'Breakfast for two, each morning', 'A balcony and a little time together'],
    note: 'Sample package. Availability and inclusions to be confirmed.',
    image: '/images/pineapple/floatingBreakfast-1600.webp',
    ctaLabel: 'Ask about a slow escape',
  },
];
