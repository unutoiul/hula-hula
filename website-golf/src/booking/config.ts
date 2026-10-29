import { toMinutes } from './dates.ts';

// The shape of everything staff can change in /admin — activities and their
// prices, rental clubs, and the club's own settings (opening hours, contact
// details, the shuttle, booking rules) — with the values the website started
// from. The live values are in Supabase (golf_activities, golf_settings) and
// reach every page through /api/site; these defaults fill in anything missing
// and keep the site working if the database can't be reached. Prices come
// from the club's brochure. Shared by the website, /admin and api/.

export interface ActivityOption {
  id: string;
  /** "9 holes", "2 hours", "Half day". */
  label: string;
  /** Per person. A one-person price can be set apart with `soloPrice` on the activity. */
  price: number;
  /** How long it takes: for the summary, the calendar entry and bay overlaps. */
  minutes: number;
  /** Last start time for this option, "HH:MM" (Krabi time). */
  lastStart: string;
}

export const ICONS = ['golf', 'football', 'flag', 'range', 'lesson', 'trophy', 'group', 'star'] as const;
export type ActivityIconKey = (typeof ICONS)[number];

export interface Activity {
  /** Short name used in links and on bookings ("footgolf"). Never changes once created. */
  id: string;
  name: string;
  icon: ActivityIconKey;
  tagline: string;
  includes: string[];
  options: ActivityOption[];
  /** Optional: what one person on their own pays (a lesson for one costs more each). */
  soloPrice?: number;
  firstStart: string;
  /** Minutes between start times. */
  interval: number;
  /** People one start can take: a flight of four, a bay of five, a lesson group of three. */
  capacity: number;
  /** Parallel units per start: the range has several bays, everything else one. */
  units: number;
  /** Each start goes to one group only, however small (lessons). */
  privateGroup: boolean;
  minPlayers: number;
  maxPlayers: number;
  rentals: boolean;
  caddie: boolean;
  noSkillNeeded: boolean;
  /** Ask how much golf they've played (lessons) / their handicap (golf). */
  askExperience: boolean;
  askHandicap: boolean;
  wear: string;
  /** Words for the booking pages: what one start is called, what the options are, who's in the group. */
  slotNoun: string;
  optionsLabel: string;
  peopleNoun: 'player' | 'person';
  /** Shown on the price card, e.g. "1–3 hr". */
  durationBadge: string;
  /** The homepage "Play" card. Images are site photos (/images/golf/…) or uploads. */
  card: { kicker: string; title: string; detail: string; images: string[] };
}

export interface Rental { id: string; label: string; price: number }

export interface OpeningDay { open: string; close: string; closed: boolean }

export interface ClubSettings {
  /** The message in the blue strip at the very top of the website. */
  announcement: string;
  contact: { phone: string; email: string; lineId: string; facebook: string; instagram: string; area: string; mapsUrl: string };
  /** Monday first. A closed day takes no bookings. */
  hours: OpeningDay[];
  hoursNote: string;
  transfer: { pickups: string[]; leadMinutes: number };
  booking: { holdMinutes: number; windowDays: number; minLeadMinutes: number; cancellationHours: number; caddieTip: number };
}

export interface SiteData { activities: Activity[]; rentals: Rental[]; club: ClubSettings }

const p = (name: string) => `/images/golf/${name}-1600.webp`;

export const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 'golf', name: 'Golf', icon: 'golf', tagline: '9-hole, par 36 course',
    includes: ['Green fee', 'Caddie', 'Golf cart'],
    options: [
      { id: '9', label: '9 holes', price: 1400, minutes: 135, lastStart: '15:30' },
      { id: '18', label: '18 holes', price: 2080, minutes: 270, lastStart: '13:30' },
    ],
    firstStart: '07:00', interval: 10, capacity: 4, units: 1, privateGroup: false, minPlayers: 1, maxPlayers: 4,
    rentals: true, caddie: true, noSkillNeeded: false, askExperience: false, askHandicap: true,
    wear: 'A collared shirt, and golf shoes or clean trainers.',
    slotNoun: 'tee time', optionsLabel: 'Holes', peopleNoun: 'player', durationBadge: '',
    card: { kicker: 'Golf · 9 or 18 holes', title: 'Tee off in the tropics', detail: 'Narrow fairways, water to carry and quick greens, with Phanom Bencha mountain on the horizon. Green fee, caddie and cart included.', images: [p('fairwaySign'), p('golfSwing'), p('sunnyFairway')] },
  },
  {
    id: 'footgolf', name: 'FootGolf', icon: 'football', tagline: 'Full 18-hole FootGolf course',
    includes: ['Course fee', 'Caddie', 'Golf cart', 'Football'],
    options: [
      { id: '9', label: '9 holes', price: 850, minutes: 75, lastStart: '16:30' },
      { id: '18', label: '18 holes', price: 1180, minutes: 150, lastStart: '15:00' },
    ],
    firstStart: '08:00', interval: 15, capacity: 6, units: 1, privateGroup: false, minPlayers: 1, maxPlayers: 6,
    rentals: false, caddie: true, noSkillNeeded: true, askExperience: false, askHandicap: false,
    wear: 'Trainers or turf shoes — no metal studs, please.',
    slotNoun: 'tee time', optionsLabel: 'Holes', peopleNoun: 'player', durationBadge: '1–3 hr',
    card: { kicker: 'FootGolf · 9 or 18 holes', title: 'Golf rules. Football feet.', detail: 'A full 18-hole FootGolf course right on the fairways. Kick, chase, laugh, repeat — fun for all ages.', images: [p('footgolfGroup'), p('footgolfKick'), p('footgolfFairway')] },
  },
  {
    id: 'puttgolf', name: 'Putt-Golf', icon: 'flag', tagline: 'Mini-golf on real greens',
    includes: ['Course fee', 'Caddie', 'Golf cart', 'Putters & balls'],
    options: [{ id: '1h', label: '1 hour', price: 1050, minutes: 60, lastStart: '16:30' }],
    firstStart: '08:00', interval: 30, capacity: 6, units: 1, privateGroup: false, minPlayers: 1, maxPlayers: 6,
    rentals: false, caddie: true, noSkillNeeded: true, askExperience: false, askHandicap: false,
    wear: 'Comfortable clothes and flat-soled shoes.',
    slotNoun: 'tee time', optionsLabel: 'How long', peopleNoun: 'player', durationBadge: '1 hr',
    card: { kicker: 'Putt-Golf · 1 hour', title: 'Mini-golf on real greens', detail: 'Ride a cart from green to green while your caddie sets fun starting points. Perfect for families and first-timers.', images: [p('puttingGreen'), p('pondFairway')] },
  },
  {
    id: 'range', name: 'Driving range', icon: 'range', tagline: 'Private bays for up to five',
    includes: ['Private bay with sofa', 'Launch monitor', 'Chipping & putting course'],
    options: [
      { id: '1h', label: '1 hour', price: 250, minutes: 60, lastStart: '17:00' },
      { id: '2h', label: '2 hours', price: 500, minutes: 120, lastStart: '16:00' },
      { id: '3h', label: '3 hours', price: 750, minutes: 180, lastStart: '15:00' },
    ],
    firstStart: '08:00', interval: 60, capacity: 5, units: 6, privateGroup: false, minPlayers: 1, maxPlayers: 5,
    rentals: true, caddie: false, noSkillNeeded: true, askExperience: false, askHandicap: false,
    wear: 'Comfortable clothes and flat-soled shoes.',
    slotNoun: 'bay', optionsLabel: 'How long', peopleNoun: 'person', durationBadge: 'per hr',
    card: { kicker: 'Driving range · by the hour', title: 'Your own private bay', detail: 'Cosy bays for up to five, each with a sofa, a launch monitor and food and drinks brought to you. Chipping and putting course included.', images: [p('rangeBays')] },
  },
  {
    id: 'lesson', name: 'Golf lesson', icon: 'lesson', tagline: 'Half-day lesson for beginners',
    includes: ['Coaching', 'Driving range', 'All equipment'],
    options: [{ id: 'half', label: 'Half day', price: 2100, minutes: 210, lastStart: '14:00' }],
    soloPrice: 2990,
    firstStart: '09:00', interval: 300, capacity: 3, units: 1, privateGroup: true, minPlayers: 1, maxPlayers: 3,
    rentals: false, caddie: false, noSkillNeeded: true, askExperience: true, askHandicap: false,
    wear: 'Comfortable sporty clothes and trainers.',
    slotNoun: 'session', optionsLabel: 'Length', peopleNoun: 'person', durationBadge: '3.5 hr',
    card: { kicker: 'Golf lesson · half day', title: 'Your very first swing', detail: 'A relaxed 3.5-hour session for complete beginners, with coaching, range time and all the equipment. Not too serious — just fun.', images: [p('teeShot'), p('golfSwing')] },
  },
];

export const DEFAULT_RENTALS: Rental[] = [
  { id: 'standard', label: 'Standard club set', price: 500 },
  { id: 'premium', label: 'Premium club set', price: 1000 },
];

const everyDay = (open: string, close: string): OpeningDay[] => Array.from({ length: 7 }, () => ({ open, close, closed: false }));

export const DEFAULT_CLUB: ClubSettings = {
  announcement: 'Free transfers twice daily · 8:00 am & 1:30 pm',
  contact: {
    phone: '+66 91 998 8891', email: 'reservation@hulahulagolfclub.com', lineId: '@hulahulagolfclub',
    facebook: 'https://www.facebook.com/hulahulagolfclub', instagram: 'https://www.instagram.com/hulahulagolfclub',
    area: 'near Krabi International Airport, Krabi, Thailand',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hula+Hula+Golf+Club+Krabi',
  },
  hours: everyDay('07:00', '18:00'),
  hoursNote: '',
  transfer: { pickups: ['08:00', '13:30'], leadMinutes: 60 },
  booking: { holdMinutes: 10, windowDays: 60, minLeadMinutes: 60, cancellationHours: 24, caddieTip: 300 },
};

export const DEFAULT_SITE: SiteData = { activities: DEFAULT_ACTIVITIES, rentals: DEFAULT_RENTALS, club: DEFAULT_CLUB };

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ── Reading what's stored ───────────────────────────────────────────────────
// Whatever comes out of the database is checked field by field: anything
// missing or the wrong type falls back to a sensible default, so a half-filled
// form in /admin can never break the booking pages.

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const str = (v: unknown, fallback: string, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : fallback);
const num = (v: unknown, fallback: number, min: number, max: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
const time = (v: unknown, fallback: string) => (typeof v === 'string' && TIME.test(v) ? v : fallback);
const list = (v: unknown, max = 20) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map((x) => x.trim().slice(0, 200)).slice(0, max) : []);
export const slugify = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

export function normaliseActivity(raw: Record<string, unknown>, id: string): Activity {
  const base = DEFAULT_ACTIVITIES.find((a) => a.id === id) ?? DEFAULT_ACTIVITIES[0];
  const options = (Array.isArray(raw.options) ? raw.options : []).map((o: Record<string, unknown>, i) => ({
    id: str(o?.id, `o${i + 1}`, 10) || `o${i + 1}`,
    label: str(o?.label, `Option ${i + 1}`, 40) || `Option ${i + 1}`,
    price: num(o?.price, 0, 0, 1_000_000),
    minutes: num(o?.minutes, 60, 10, 600),
    lastStart: time(o?.lastStart, '16:00'),
  }));
  const card = (raw.card ?? {}) as Record<string, unknown>;
  const minPlayers = num(raw.minPlayers, 1, 1, 50);
  return {
    id,
    name: str(raw.name, base.name, 60) || 'Activity',
    icon: ICONS.includes(raw.icon as ActivityIconKey) ? raw.icon as ActivityIconKey : 'golf',
    tagline: str(raw.tagline, '', 120),
    includes: list(raw.includes),
    options: options.length ? options : [{ id: 'o1', label: '1 hour', price: 0, minutes: 60, lastStart: '16:00' }],
    soloPrice: typeof raw.soloPrice === 'number' && raw.soloPrice > 0 ? num(raw.soloPrice, 0, 0, 1_000_000) : undefined,
    firstStart: time(raw.firstStart, '08:00'),
    interval: num(raw.interval, 30, 5, 720),
    capacity: num(raw.capacity, 4, 1, 50),
    units: num(raw.units, 1, 1, 50),
    privateGroup: bool(raw.privateGroup, false),
    minPlayers,
    maxPlayers: Math.max(minPlayers, num(raw.maxPlayers, 4, 1, 50)),
    rentals: bool(raw.rentals, false),
    caddie: bool(raw.caddie, false),
    noSkillNeeded: bool(raw.noSkillNeeded, true),
    askExperience: bool(raw.askExperience, false),
    askHandicap: bool(raw.askHandicap, false),
    wear: str(raw.wear, 'Comfortable clothes and flat-soled shoes.', 200),
    slotNoun: str(raw.slotNoun, 'tee time', 20) || 'tee time',
    optionsLabel: str(raw.optionsLabel, 'Options', 20) || 'Options',
    peopleNoun: raw.peopleNoun === 'person' ? 'person' : 'player',
    durationBadge: str(raw.durationBadge, '', 10),
    card: {
      kicker: str(card.kicker, '', 60), title: str(card.title, '', 80), detail: str(card.detail, '', 300),
      images: list(card.images, 6),
    },
  };
}

export function normaliseRentals(raw: unknown): Rental[] {
  if (!Array.isArray(raw)) return DEFAULT_RENTALS;
  return raw.map((r: Record<string, unknown>, i) => ({ id: str(r?.id, `r${i + 1}`, 20) || `r${i + 1}`, label: str(r?.label, 'Club set', 60) || 'Club set', price: num(r?.price, 0, 0, 100_000) }));
}

export function normaliseClub(raw: unknown): ClubSettings {
  const r = (raw ?? {}) as Record<string, unknown>;
  const d = DEFAULT_CLUB;
  const contact = (r.contact ?? {}) as Record<string, unknown>;
  const transfer = (r.transfer ?? {}) as Record<string, unknown>;
  const booking = (r.booking ?? {}) as Record<string, unknown>;
  const hours = Array.isArray(r.hours) && r.hours.length === 7 ? (r.hours as Record<string, unknown>[]) : null;
  return {
    announcement: str(r.announcement, d.announcement, 140),
    contact: {
      phone: str(contact.phone, d.contact.phone, 30) || d.contact.phone,
      email: str(contact.email, d.contact.email, 120) || d.contact.email,
      lineId: str(contact.lineId, d.contact.lineId, 40),
      facebook: str(contact.facebook, d.contact.facebook, 200),
      instagram: str(contact.instagram, d.contact.instagram, 200),
      area: str(contact.area, d.contact.area, 120),
      mapsUrl: str(contact.mapsUrl, d.contact.mapsUrl, 300),
    },
    hours: hours ? hours.map((h, i) => ({ open: time(h?.open, d.hours[i].open), close: time(h?.close, d.hours[i].close), closed: bool(h?.closed, false) })) : d.hours,
    hoursNote: str(r.hoursNote, '', 140),
    transfer: {
      pickups: (Array.isArray(transfer.pickups) ? transfer.pickups.filter((t): t is string => typeof t === 'string' && TIME.test(t)) : d.transfer.pickups).sort().slice(0, 6),
      leadMinutes: num(transfer.leadMinutes, d.transfer.leadMinutes, 0, 240),
    },
    booking: {
      holdMinutes: num(booking.holdMinutes, d.booking.holdMinutes, 3, 60),
      windowDays: num(booking.windowDays, d.booking.windowDays, 1, 365),
      minLeadMinutes: num(booking.minLeadMinutes, d.booking.minLeadMinutes, 0, 1440),
      cancellationHours: num(booking.cancellationHours, d.booking.cancellationHours, 0, 720),
      caddieTip: num(booking.caddieTip, d.booking.caddieTip, 0, 10_000),
    },
  };
}

// ── Rules built on the settings ─────────────────────────────────────────────

export const findActivity = (site: Pick<SiteData, 'activities'>, id: string) => site.activities.find((a) => a.id === id);

/** "Golf lesson" for an activity that's since been deleted, by its id. */
export const activityName = (site: Pick<SiteData, 'activities'>, id: string) => findActivity(site, id)?.name ?? id.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** Monday = 0 … Sunday = 6, for a "YYYY-MM-DD" day. */
export const weekdayIndex = (iso: string) => (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7;

/**
 * The shuttle pick-up that suits a start time: the latest one that still gets
 * there in time, as long as it doesn't mean waiting around for hours.
 */
export function pickupFor(time: string, club: ClubSettings): string | null {
  const start = toMinutes(time);
  const lead = club.transfer.leadMinutes;
  const usable = club.transfer.pickups.filter((pick) => toMinutes(pick) + lead <= start && start - toMinutes(pick) - lead <= 180);
  return usable.at(-1) ?? null;
}

/** Lessons: asked on the extras step so the coach can plan the session. */
export const EXPERIENCE_LEVELS = ['Never held a club', 'Played a few times', 'I play now and then'];

/** The rules every booking is made under — on the details step, in its conditions dialog and on the confirmation. */
export function clubRules(wear: string, club: ClubSettings) {
  return [
    { title: 'Arrive early', text: 'Please check in at the clubhouse 20–30 minutes before your start.' },
    { title: 'What to wear', text: wear },
    { title: 'Payment', text: 'Pay at the club on the day. Nothing is charged online.' },
    { title: 'Changes & cancellation', text: `Free up to ${club.booking.cancellationHours} hours before your start — just WhatsApp or email us. Later cancellations and no-shows may be charged.` },
    { title: 'Weather', text: 'If a storm stops play, we’ll help you find a new time.' },
  ];
}

const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const clock = (hhmm: string) => { const m = toMinutes(hhmm); const h = Math.floor(m / 60); return `${h % 12 || 12}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };

/** Opening hours in as few lines as possible: "Mon – Fri · 7:00 am – 6:00 pm", "Sun · Closed". */
export function openingHoursLines(club: ClubSettings): string[] {
  const label = (d: OpeningDay) => (d.closed ? 'Closed' : `${clock(d.open)} – ${clock(d.close)}`);
  const lines: string[] = [];
  let from = 0;
  for (let i = 1; i <= 7; i++) {
    if (i < 7 && label(club.hours[i]) === label(club.hours[from])) continue;
    const days = from === 0 && i === 7 ? 'Every day' : from === i - 1 ? SHORT_DAYS[from] : `${SHORT_DAYS[from]} – ${SHORT_DAYS[i - 1]}`;
    lines.push(`${days} · ${label(club.hours[from])}`);
    from = i;
  }
  return lines;
}

/** Links built from the contact details. */
export function contactLinks(contact: ClubSettings['contact']) {
  const digits = contact.phone.replace(/\D/g, '');
  return {
    ...contact,
    tel: `tel:+${digits}`,
    whatsapp: `https://wa.me/${digits}`,
    line: contact.lineId ? `https://line.me/R/ti/p/${encodeURIComponent(contact.lineId)}` : '',
    maps: contact.mapsUrl,
    resort: 'https://hulahularesort.com',
  };
}
export type ContactLinks = ReturnType<typeof contactLinks>;
