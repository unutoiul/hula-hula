import type { SiteEvent } from '../../shared/siteContent';
import { eventHighlight, eventWhen, offerHighlight } from '../components/sections/cmsCards';
import type { ContentConfig, Row } from './ContentManager';

// What staff can edit for each kind of content, and how it previews. Column
// names match supabase/migrations/0001_booking_and_cms.sql.

const text = (row: Row, key: string) => (typeof row[key] === 'string' ? row[key] as string : '');
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const dayOf = (iso: string) => day.format(new Date(`${iso}T00:00:00`));
const todayInBangkok = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const activitiesConfig: ContentConfig = {
  table: 'activities',
  noun: 'day',
  intro: 'The 7-day Krabi programme: one trip for each day of the week. The website opens it on today’s day, and each trip’s button asks the front desk to book it.',
  liveKey: 'published',
  fields: [
    { key: 'weekday', label: 'Day of the week', kind: 'select', options: [
      { value: '1', label: 'Monday' }, { value: '2', label: 'Tuesday' }, { value: '3', label: 'Wednesday' }, { value: '4', label: 'Thursday' },
      { value: '5', label: 'Friday' }, { value: '6', label: 'Saturday' }, { value: '7', label: 'Sunday' },
    ] },
    { key: 'kicker', label: 'Small label above the title', kind: 'text', max: 40, helper: 'e.g. Sport day, Beach fun' },
    { key: 'title', label: 'Title', kind: 'text', max: 120, required: true },
    { key: 'place', label: 'Where', kind: 'text', max: 80, helper: 'e.g. Koh Klang' },
    { key: 'detail', label: 'Description', kind: 'multiline', max: 600 },
    { key: 'time_label', label: 'Time', kind: 'text', max: 40, helper: 'e.g. 09:30 – 12:30' },
    { key: 'transport', label: 'Getting there', kind: 'text', max: 80, helper: 'e.g. Hotel bus, with our chef' },
    { key: 'price_note', label: 'Price', kind: 'text', max: 80, helper: 'e.g. 150 THB per person, min. 2 — or Free bus' },
    { key: 'free_bus', label: 'Free hotel bus (shows the “Free bus” sticker)', kind: 'switch' },
    { key: 'images', label: 'Pictures (the first is shown first)', kind: 'images' },
    { key: 'cta_label', label: 'Button text', kind: 'text', max: 40, helper: 'Leave empty for “Book this trip”' },
  ],
  blank: () => ({ weekday: '1', kicker: '', title: '', place: '', detail: '', time_label: '', transport: '', price_note: '', free_bus: false, images: [], cta_label: '', published: false }),
  subtitle: (row) => [WEEKDAY_NAMES[Number(row.weekday) - 1], text(row, 'time_label'), text(row, 'price_note')].filter(Boolean).join(' · '),
  preview: (row) => ({
    id: 'preview', kicker: text(row, 'kicker'), title: text(row, 'title') || 'Title', detail: text(row, 'detail'), images: (row.images as string[]) ?? [], ctaLabel: text(row, 'cta_label') || 'Book this trip',
    weekday: Number(row.weekday) || null, place: text(row, 'place') || null, timeLabel: text(row, 'time_label') || null, transport: text(row, 'transport') || null, priceNote: text(row, 'price_note') || null, freeBus: !!row.free_bus,
  }),
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
  'Room upgrade (subject to availability)', 'Free airport transfer', 'Free shuttle to Ao Nang Beach', 'Floating breakfast', 'Free Tuesday FootGolf trip', '10% off spa treatments',
  'Free round of footgolf', 'Bottle of wine on arrival', 'Birthday cake',
];

const percentOf = (row: Row) => Number(row.discount_percent) || 0;
const perksOf = (row: Row) => (row.perks as string[] | undefined) ?? [];

export const offersConfig: ContentConfig = {
  table: 'offers',
  noun: 'offer',
  intro: 'Special offers for rooms booked on the website: a % off, perks like a welcome drink, or both (a package). A switched-on offer shows on the website between its dates (or straight away and until you switch it off, if you leave them empty), and its discount counts only for nights inside its stay dates. The booking page applies the best matching offer to each room automatically — or only with a promo code if you set one — and the reservations email shows the discount and the perks to arrange.',
  liveKey: 'active',
  fields: [
    { key: 's-show', label: 'What guests see', kind: 'section' },
    { key: 'title', label: 'Offer name', kind: 'text', max: 120, required: true, helper: 'e.g. Early bird, Celebrate in Krabi, Stay 3 pay less' },
    { key: 'badge', label: 'Badge', kind: 'text', max: 30, helper: 'Shown on the room prices, e.g. Special offer, Book direct, Package' },
    { key: 'description', label: 'Description', kind: 'multiline', max: 600 },
    { key: 'image_url', label: 'Picture (for the homepage card)', kind: 'image' },
    { key: 'show_on_homepage', label: 'Show as a card on the homepage', kind: 'switch', helper: 'Switch off for a secret promo-code offer' },

    { key: 's-deal', label: 'Discount & perks', kind: 'section', helper: 'Use a discount, perks, or both. A perks-only offer is a package.' },
    { key: 'discount_percent', label: 'Discount', kind: 'number', min: 0, max: 99, unit: '%', helper: 'Off the room price, on the nights inside the stay dates' },
    { key: 'perks', label: 'Perks included', kind: 'tags', suggestions: PERK_SUGGESTIONS, helper: 'Pick from the list or type your own and press Enter (up to 8)' },

    { key: 's-when', label: 'When it applies', kind: 'section', helper: 'Leave any of these empty for no limit.' },
    { key: 'valid_from', label: 'Shows on the website from', kind: 'date', helper: 'First day guests see it and can book it' },
    { key: 'valid_to', label: 'Shows on the website until', kind: 'date', helper: 'Last day to book — it disappears after this day' },
    { key: 'stay_from', label: 'Discount for stays from', kind: 'date', helper: 'The discount counts for nights from this date…' },
    { key: 'stay_to', label: 'Discount for stays until', kind: 'date', helper: '…up to and including this night' },
    { key: 'min_nights', label: 'Minimum stay', kind: 'number', min: 1, max: 31, unit: 'nights' },

    { key: 's-rooms', label: 'Rooms & promo code', kind: 'section' },
    { key: 'room_type_uuids', label: 'Rooms', kind: 'roomTypes' },
    { key: 'promo_code', label: 'Promo code (optional)', kind: 'code', helper: 'Empty = applies automatically to everyone. With a code, only guests who enter it get the offer.' },
    { key: 'cta_label', label: 'Homepage button text', kind: 'text', max: 40, helper: 'Leave empty for “Book this offer”' },
  ],
  blank: () => ({
    title: '', badge: 'Special offer', description: '', image_url: null, show_on_homepage: true, discount_percent: 0, perks: [],
    valid_from: null, valid_to: null, stay_from: null, stay_to: null, min_nights: null,
    room_type_uuids: [], promo_code: '', cta_label: '', active: false,
  }),
  subtitle: (row) => [
    percentOf(row) > 0 ? `−${percentOf(row)}%` : perksOf(row).length ? 'Package' : 'No discount or perks yet',
    perksOf(row).length ? `${perksOf(row).length} perk${perksOf(row).length === 1 ? '' : 's'}` : '',
    row.min_nights ? `${String(row.min_nights)}+ nights` : '',
    text(row, 'promo_code') && `code ${text(row, 'promo_code')}`,
    showing(row),
    text(row, 'stay_from') || text(row, 'stay_to') ? `stays ${text(row, 'stay_from') ? dayOf(text(row, 'stay_from')) : '…'} – ${text(row, 'stay_to') ? dayOf(text(row, 'stay_to')) : '…'}` : '',
    row.show_on_homepage === false ? 'not on homepage' : '',
  ].filter(Boolean).join(' · '),
  preview: (row) => offerHighlight({
    id: 'preview', kicker: null, title: text(row, 'title') || 'Offer name', description: text(row, 'description'), imageUrl: text(row, 'image_url') || null,
    promoCode: text(row, 'promo_code') || null, validFrom: text(row, 'valid_from') || null, validTo: text(row, 'valid_to') || null,
    stayFrom: text(row, 'stay_from') || null, stayTo: text(row, 'stay_to') || null, discountPercent: percentOf(row), badge: text(row, 'badge') || null, perks: perksOf(row),
    minNights: Number(row.min_nights) || null, ctaLabel: text(row, 'cta_label') || null,
  }),
  firstImage: (row) => text(row, 'image_url') || null,
  check: (row) => (text(row, 'valid_from') && text(row, 'valid_to') && text(row, 'valid_to') < text(row, 'valid_from') ? '“Shows on the website until” is before “from”.'
    : text(row, 'stay_from') && text(row, 'stay_to') && text(row, 'stay_to') < text(row, 'stay_from') ? '“Discount for stays until” is before “from”.' : null),
};

// Whether a switched-on offer is on the website today, going by its dates.
function showing(row: Row): string {
  const from = text(row, 'valid_from'), to = text(row, 'valid_to'), today = todayInBangkok();
  if (to && to < today) return `ended ${dayOf(to)}`;
  if (from && from > today) return `shows from ${dayOf(from)}`;
  return to ? `until ${dayOf(to)}` : '';
}
