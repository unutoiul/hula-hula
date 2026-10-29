import type { SiteEvent } from '../../shared/siteContent';
import { eventHighlight, eventWhen, offerHighlight } from '../components/sections/cmsCards';
import type { ContentConfig, Row } from './ContentManager';

// What staff can edit for each kind of content, and how it previews. Column
// names match supabase/migrations/0001_booking_and_cms.sql.

const text = (row: Row, key: string) => (typeof row[key] === 'string' ? row[key] as string : '');

export const activitiesConfig: ContentConfig = {
  table: 'activities',
  noun: 'activity',
  intro: 'The “Do a little. Enjoy a lot.” cards. Their button opens the contact form with the activity filled in.',
  liveKey: 'published',
  fields: [
    { key: 'kicker', label: 'Small label above the title', kind: 'text', max: 40, helper: 'e.g. Splash, Explore, Unwind' },
    { key: 'title', label: 'Title', kind: 'text', max: 120, required: true },
    { key: 'detail', label: 'Description', kind: 'multiline', max: 600 },
    { key: 'images', label: 'Pictures (the first is shown first)', kind: 'images' },
    { key: 'cta_label', label: 'Button text', kind: 'text', max: 40, helper: 'Leave empty for “Help me plan this”' },
  ],
  blank: () => ({ kicker: '', title: '', detail: '', images: [], cta_label: '', published: false }),
  subtitle: (row) => [text(row, 'kicker'), `${(row.images as string[] | undefined)?.length ?? 0} picture(s)`].filter(Boolean).join(' · '),
  preview: (row) => ({ id: 'preview', kicker: text(row, 'kicker'), title: text(row, 'title') || 'Title', detail: text(row, 'detail'), images: (row.images as string[]) ?? [], ctaLabel: text(row, 'cta_label') || 'Help me plan this' }),
  firstImage: (row) => (row.images as string[] | undefined)?.[0] ?? null,
};

const asEvent = (row: Row): SiteEvent => ({
  id: 'preview', title: text(row, 'title'), summary: text(row, 'summary'), imageUrl: text(row, 'image_url') || null,
  startsOn: text(row, 'starts_on') || null, endsOn: text(row, 'ends_on') || null, timeLabel: text(row, 'time_label') || null,
  cta: { type: (text(row, 'cta_type') || 'contact') as SiteEvent['cta']['type'], label: text(row, 'cta_label') || null, url: text(row, 'cta_url') || null },
});

export const eventsConfig: ContentConfig = {
  table: 'events',
  noun: 'event',
  intro: 'Shown with the offers in “Offers & what’s on”, and in the photo card at the top of the homepage. Events disappear from the website by themselves once their last day has passed.',
  liveKey: 'published',
  fields: [
    { key: 'title', label: 'Title', kind: 'text', max: 120, required: true },
    { key: 'summary', label: 'Description', kind: 'multiline', max: 600 },
    { key: 'image_url', label: 'Picture', kind: 'image' },
    { key: 'starts_on', label: 'First day', kind: 'date', helper: 'Leave both dates empty for something ongoing' },
    { key: 'ends_on', label: 'Last day', kind: 'date', helper: 'Only for events over several days' },
    { key: 'time_label', label: 'When (in words)', kind: 'text', max: 60, helper: 'e.g. 7 pm – late, or Every Friday' },
    { key: 'cta_type', label: 'Button', kind: 'select', options: [
      { value: 'contact', label: 'Ask us (opens the contact form)' },
      { value: 'book', label: 'Book a stay' },
      { value: 'link', label: 'Open a link' },
      { value: 'none', label: 'No button' },
    ] },
    { key: 'cta_label', label: 'Button text', kind: 'text', max: 40, showIf: (row) => row.cta_type !== 'none' },
    { key: 'cta_url', label: 'Link address', kind: 'text', max: 300, helper: 'https://…', showIf: (row) => row.cta_type === 'link' },
  ],
  blank: () => ({ title: '', summary: '', image_url: null, starts_on: null, ends_on: null, time_label: '', cta_type: 'contact', cta_label: '', cta_url: '', published: false }),
  subtitle: (row) => eventWhen(asEvent(row)),
  preview: (row) => eventHighlight({ ...asEvent(row), title: text(row, 'title') || 'Title' }),
  firstImage: (row) => text(row, 'image_url') || null,
};

// Perks guests often get with a direct-booking offer — staff can also type their own.
const PERK_SUGGESTIONS = [
  'Welcome drink on arrival', 'Romantic room decoration', 'Free photo at your floating breakfast', 'Floating breakfast for two',
  'Fruit platter in your room', 'Late check-out until 2 pm (subject to availability)', 'Early check-in (subject to availability)',
  'Room upgrade (subject to availability)', 'Free airport transfer', 'Free shuttle to Ao Nang Beach', '10% off spa treatments',
  'Free round of footgolf', 'Bottle of wine on arrival', 'Birthday cake',
];

const percentOf = (row: Row) => Number(row.discount_percent) || 0;
const perksOf = (row: Row) => (row.perks as string[] | undefined) ?? [];

export const offersConfig: ContentConfig = {
  table: 'offers',
  noun: 'offer',
  intro: 'Special offers for rooms booked on the website: a % off, perks like a welcome drink, or both (a package). An offer is live the moment you switch it on, and stays until you switch it off. The booking page applies the best matching offer to each room automatically — or only with a promo code if you set one — and the reservations email shows the discount and the perks to arrange.',
  liveKey: 'active',
  fields: [
    { key: 's-show', label: 'What guests see', kind: 'section' },
    { key: 'title', label: 'Offer name', kind: 'text', max: 120, required: true, helper: 'e.g. Early bird, Celebrate in Krabi, Stay 3 pay less' },
    { key: 'badge', label: 'Badge', kind: 'text', max: 30, helper: 'Shown on the room prices, e.g. Special offer, Book direct, Package' },
    { key: 'description', label: 'Description', kind: 'multiline', max: 600 },
    { key: 'image_url', label: 'Picture (for the homepage card)', kind: 'image' },
    { key: 'show_on_homepage', label: 'Show as a card on the homepage', kind: 'switch', helper: 'Switch off for a secret promo-code offer' },

    { key: 's-deal', label: 'Discount & perks', kind: 'section', helper: 'Use a discount, perks, or both. A perks-only offer is a package.' },
    { key: 'discount_percent', label: 'Discount', kind: 'number', min: 0, max: 90, unit: '%', helper: 'Off the room price, for every night of the stay' },
    { key: 'perks', label: 'Perks included', kind: 'tags', suggestions: PERK_SUGGESTIONS, helper: 'Pick from the list or type your own and press Enter (up to 8)' },

    { key: 's-when', label: 'When it applies', kind: 'section', helper: 'The offer is live while it’s switched on. Leave empty for no minimum.' },
    { key: 'min_nights', label: 'Minimum stay', kind: 'number', min: 1, max: 31, unit: 'nights' },

    { key: 's-rooms', label: 'Rooms & promo code', kind: 'section' },
    { key: 'room_type_uuids', label: 'Rooms', kind: 'roomTypes' },
    { key: 'promo_code', label: 'Promo code (optional)', kind: 'code', helper: 'Empty = applies automatically to everyone. With a code, only guests who enter it get the offer.' },
    { key: 'cta_label', label: 'Homepage button text', kind: 'text', max: 40, helper: 'Leave empty for “Book this offer”' },
  ],
  blank: () => ({
    title: '', badge: 'Special offer', description: '', image_url: null, show_on_homepage: true, discount_percent: 0, perks: [],
    min_nights: null,
    room_type_uuids: [], promo_code: '', cta_label: '', active: false,
  }),
  subtitle: (row) => [
    percentOf(row) > 0 ? `−${percentOf(row)}%` : perksOf(row).length ? 'Package' : 'No discount or perks yet',
    perksOf(row).length ? `${perksOf(row).length} perk${perksOf(row).length === 1 ? '' : 's'}` : '',
    row.min_nights ? `${String(row.min_nights)}+ nights` : '',
    text(row, 'promo_code') && `code ${text(row, 'promo_code')}`,
    row.show_on_homepage === false ? 'not on homepage' : '',
  ].filter(Boolean).join(' · '),
  preview: (row) => offerHighlight({
    id: 'preview', kicker: null, title: text(row, 'title') || 'Offer name', description: text(row, 'description'), imageUrl: text(row, 'image_url') || null,
    promoCode: text(row, 'promo_code') || null, discountPercent: percentOf(row), badge: text(row, 'badge') || null, perks: perksOf(row),
    minNights: Number(row.min_nights) || null, ctaLabel: text(row, 'cta_label') || null,
  }),
  firstImage: (row) => text(row, 'image_url') || null,
};
