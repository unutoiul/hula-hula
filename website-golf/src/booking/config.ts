import { toMinutes } from './dates.ts';

// Everything the tee sheet, the prices and the booking rules are built from —
// shared by the website, the staff app and the server (api/). Prices and what
// each package includes come from the club's packages brochure. Lines marked
// ASSUMPTION are sensible defaults that still need confirming with the club
// (opening hours, tee intervals, number of bays…).

export type ActivityId = 'golf' | 'footgolf' | 'puttgolf' | 'range' | 'lesson';

export interface ActivityOption {
  id: string;
  /** "9 holes", "2 hours", "Half day". */
  label: string;
  /** Per person. The lesson's solo price is `soloPrice` on the activity. */
  price: number;
  /** How long it takes: for the summary, the calendar entry and bay overlaps. */
  minutes: number;
  /** Last start time for this option, "HH:MM" (Krabi time). */
  lastStart: string;
}

export interface Activity {
  id: ActivityId;
  name: string;
  /** What one start on the sheet is called. */
  slotNoun: 'tee time' | 'bay' | 'session';
  tagline: string;
  includes: string[];
  options: ActivityOption[];
  /** Lessons: one person pays more than each of a group of two or three. */
  soloPrice?: number;
  firstStart: string;
  /** Minutes between start times. */
  interval: number;
  /** People one start can take: a flight of four, a bay of five, a lesson group of three. */
  capacity: number;
  /** Parallel units per start: the range has several bays, everything else one. */
  units: number;
  /** A lesson session goes to one group, however small. */
  privateGroup?: boolean;
  minPlayers: number;
  maxPlayers: number;
  rentals: boolean;
  caddie: boolean;
  noSkillNeeded: boolean;
  wear: string;
}

export const ACTIVITIES: Activity[] = [
  {
    id: 'golf', name: 'Golf', slotNoun: 'tee time',
    tagline: '9-hole, par 36 course',
    includes: ['Green fee', 'Caddie', 'Golf cart'],
    options: [
      { id: '9', label: '9 holes', price: 1400, minutes: 135, lastStart: '15:30' }, // ASSUMPTION: last tee times
      { id: '18', label: '18 holes', price: 2080, minutes: 270, lastStart: '13:30' },
    ],
    firstStart: '07:00', interval: 10, // ASSUMPTION: first tee 07:00, 10-minute intervals
    capacity: 4, units: 1, minPlayers: 1, maxPlayers: 4,
    rentals: true, caddie: true, noSkillNeeded: false,
    wear: 'A collared shirt, and golf shoes or clean trainers.', // ASSUMPTION: dress code
  },
  {
    id: 'footgolf', name: 'FootGolf', slotNoun: 'tee time',
    tagline: 'Full 18-hole FootGolf course',
    includes: ['Course fee', 'Caddie', 'Golf cart', 'Football'],
    options: [
      { id: '9', label: '9 holes', price: 850, minutes: 75, lastStart: '16:30' },
      { id: '18', label: '18 holes', price: 1180, minutes: 150, lastStart: '15:00' },
    ],
    firstStart: '08:00', interval: 15, // ASSUMPTION
    capacity: 6, units: 1, minPlayers: 1, maxPlayers: 6, // ASSUMPTION: groups of up to six
    rentals: false, caddie: true, noSkillNeeded: true,
    wear: 'Trainers or turf shoes — no metal studs, please.',
  },
  {
    id: 'puttgolf', name: 'Putt-Golf', slotNoun: 'tee time',
    tagline: 'Mini-golf on real greens',
    includes: ['Course fee', 'Caddie', 'Golf cart', 'Putters & balls'],
    options: [{ id: '1h', label: '1 hour', price: 1050, minutes: 60, lastStart: '16:30' }],
    firstStart: '08:00', interval: 30, // ASSUMPTION
    capacity: 6, units: 1, minPlayers: 1, maxPlayers: 6, // ASSUMPTION
    rentals: false, caddie: true, noSkillNeeded: true,
    wear: 'Comfortable clothes and flat-soled shoes.',
  },
  {
    id: 'range', name: 'Driving range', slotNoun: 'bay',
    tagline: 'Private bays for up to five',
    includes: ['Private bay with sofa', 'Launch monitor', 'Chipping & putting course'],
    options: [
      { id: '1h', label: '1 hour', price: 250, minutes: 60, lastStart: '17:00' }, // ASSUMPTION: range closes 18:00
      { id: '2h', label: '2 hours', price: 500, minutes: 120, lastStart: '16:00' },
      { id: '3h', label: '3 hours', price: 750, minutes: 180, lastStart: '15:00' },
    ],
    firstStart: '08:00', interval: 60, // ASSUMPTION
    capacity: 5, units: 6, minPlayers: 1, maxPlayers: 5, // ASSUMPTION: six bays
    rentals: true, caddie: false, noSkillNeeded: true,
    wear: 'Comfortable clothes and flat-soled shoes.',
  },
  {
    id: 'lesson', name: 'Golf lesson', slotNoun: 'session',
    tagline: 'Half-day lesson for beginners',
    includes: ['Coaching', 'Driving range', 'All equipment'],
    options: [{ id: 'half', label: 'Half day', price: 2100, minutes: 210, lastStart: '14:00' }],
    soloPrice: 2990,
    firstStart: '09:00', interval: 300, // ASSUMPTION: sessions at 09:00 and 14:00
    capacity: 3, units: 1, privateGroup: true, minPlayers: 1, maxPlayers: 3,
    rentals: false, caddie: false, noSkillNeeded: true,
    wear: 'Comfortable sporty clothes and trainers.',
  },
];

export const activityById = (id: string) => ACTIVITIES.find((a) => a.id === id);

export const RENTALS = [
  { id: 'standard', label: 'Standard club set', price: 500 }, // ASSUMPTION: the brochure says "500 – 1,000 Baht"
  { id: 'premium', label: 'Premium club set', price: 1000 },
] as const;
export type RentalId = (typeof RENTALS)[number]['id'];

/** The free shuttle runs twice a day (brochure: 8.00 am and 1.30 pm). */
export const TRANSFER_PICKUPS = ['08:00', '13:30'];
/** ASSUMPTION: a pick-up reaches the club in time for starts from an hour later. */
export const TRANSFER_LEAD_MINUTES = 60;

/**
 * The shuttle pick-up that suits a start time: the latest one that still gets
 * there in time, as long as it doesn't mean waiting around for hours.
 */
export function pickupFor(time: string): string | null {
  const start = toMinutes(time);
  const usable = TRANSFER_PICKUPS.filter((p) => toMinutes(p) + TRANSFER_LEAD_MINUTES <= start && start - toMinutes(p) - TRANSFER_LEAD_MINUTES <= 180);
  return usable.at(-1) ?? null;
}

/** Recommended caddie tip, per caddie, paid in cash on the day. */
export const CADDIE_TIP = 300;

/** How long a picked time is kept for while the guest finishes booking. */
export const HOLD_MINUTES = 10;
/** How far ahead times can be booked, and how soon before a start online booking closes. */
export const BOOKING_WINDOW_DAYS = 60;
export const MIN_LEAD_MINUTES = 60;
/** ASSUMPTION: free cancellation up to this many hours before the start. */
export const FREE_CANCELLATION_HOURS = 24;

/** Lessons: asked on the extras step so the coach can plan the session. */
export const EXPERIENCE_LEVELS = ['Never held a club', 'Played a few times', 'I play now and then'];

/** The rules every booking is made under — on the details step, in its conditions dialog and on the confirmation. */
export function clubRules(wear: string) {
  return [
    { title: 'Arrive early', text: 'Please check in at the clubhouse 20–30 minutes before your start.' },
    { title: 'What to wear', text: wear },
    { title: 'Payment', text: 'Pay at the club on the day. Nothing is charged online.' },
    { title: 'Changes & cancellation', text: `Free up to ${FREE_CANCELLATION_HOURS} hours before your start — just WhatsApp or email us. Later cancellations and no-shows may be charged.` }, // ASSUMPTION
    { title: 'Weather', text: 'If a storm stops play, we’ll help you find a new time.' },
  ];
}
