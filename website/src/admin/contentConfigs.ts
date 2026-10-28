import type { SiteEvent } from '../../shared/siteContent';
import { eventWhen } from '../components/sections/cmsCards';
import type { ContentConfig, Row } from './ContentManager';

// What staff can edit for each kind of content, and how it previews. Column
// names match supabase/migrations/0001_booking_and_cms.sql.

const text = (row: Row, key: string) => (typeof row[key] === 'string' ? row[key] as string : '');
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const dayOf = (iso: string) => day.format(new Date(`${iso}T00:00:00`));

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

const EVENT_CTA_DEFAULT: Record<string, string> = { contact: 'Ask about this', book: 'Book your stay', link: 'Find out more' };

export const eventsConfig: ContentConfig = {
  table: 'events',
  noun: 'event',
  intro: 'The “What’s on” carousel under Celebrate. Events disappear from the website by themselves once their last day has passed.',
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
  preview: (row) => {
    const event = asEvent(row);
    return { id: 'preview', kicker: eventWhen(event), title: event.title || 'Title', detail: event.summary, images: event.imageUrl ? [event.imageUrl] : [], ctaLabel: event.cta.type === 'none' ? undefined : event.cta.label || EVENT_CTA_DEFAULT[event.cta.type] };
  },
  firstImage: (row) => text(row, 'image_url') || null,
};

export const offersConfig: ContentConfig = {
  table: 'offers',
  noun: 'offer',
  intro: 'Deals shown at the top of the “Hula happenings” section. For a discount on rooms, create the promo code in SiteMinder first and enter the same code here — the button then opens booking with the code applied. Offers hide themselves outside their dates.',
  liveKey: 'active',
  fields: [
    { key: 'kicker', label: 'Small label above the title', kind: 'text', max: 40, helper: 'e.g. 15% off · Leave empty to show the end date' },
    { key: 'title', label: 'Title', kind: 'text', max: 120, required: true },
    { key: 'description', label: 'Description', kind: 'multiline', max: 600 },
    { key: 'image_url', label: 'Picture', kind: 'image' },
    { key: 'promo_code', label: 'SiteMinder promo code (optional)', kind: 'code', helper: 'Must match a promo code set up in SiteMinder exactly' },
    { key: 'valid_from', label: 'Show from', kind: 'date' },
    { key: 'valid_to', label: 'Show until', kind: 'date' },
    { key: 'cta_label', label: 'Button text', kind: 'text', max: 40, helper: 'Leave empty for “Book with code …” or “Ask about this”' },
  ],
  blank: () => ({ kicker: '', title: '', description: '', image_url: null, promo_code: '', valid_from: null, valid_to: null, cta_label: '', active: false }),
  subtitle: (row) => [text(row, 'promo_code') && `Code ${text(row, 'promo_code')}`, text(row, 'valid_to') && `until ${dayOf(text(row, 'valid_to'))}`].filter(Boolean).join(' · ') || 'No end date',
  preview: (row) => ({
    id: 'preview', title: text(row, 'title') || 'Title', detail: text(row, 'description'), images: text(row, 'image_url') ? [text(row, 'image_url')] : [],
    kicker: text(row, 'kicker') || (text(row, 'valid_to') ? `Until ${dayOf(text(row, 'valid_to'))}` : 'Special offer'),
    ctaLabel: text(row, 'cta_label') || (text(row, 'promo_code') ? `Book with code ${text(row, 'promo_code')}` : 'Ask about this'),
  }),
  firstImage: (row) => text(row, 'image_url') || null,
};
