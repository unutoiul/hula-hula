import { BOOKING_WINDOW_DAYS, MIN_LEAD_MINUTES, type Activity, type ActivityOption } from './config.ts';
import { addDays, daysBetween, fromMinutes, krabiNow, toMinutes } from './dates.ts';

// The tee sheet for one activity on one day, built from the bookings and
// blocked times already in the database. The same code runs in the browser
// (staff's "add booking"), on the server (the public sheet, and the check
// before a booking is saved) and in the tests.

/** One start on the sheet. `spotsLeft` is people for the course, bays × capacity on the range. */
export interface Slot {
  time: string;
  capacity: number;
  spotsLeft: number;
  /** Range only: bays free for the whole booked duration. */
  baysLeft?: number;
  /** Staff closed this time (maintenance, a tournament…). */
  blocked?: boolean;
}

/** A booking already on the sheet (not cancelled): its start, how long it runs and how many people. */
export interface SheetBooking { time: string; minutes: number; players: number }
/** Staff-blocked starts, from `start` up to (not including) `end`. */
export interface SheetBlock { start: string; end: string }

/** The days a booking can be made for: today (Krabi time) up to the booking window. */
export function bookableDays(now = krabiNow()): string[] {
  return Array.from({ length: BOOKING_WINDOW_DAYS + 1 }, (_, i) => addDays(now.date, i));
}

export function isBookableDay(date: string, now = krabiNow()): boolean {
  const ahead = daysBetween(now.date, date);
  return ahead >= 0 && ahead <= BOOKING_WINDOW_DAYS;
}

/**
 * Every start for an activity, option and day. Online, starts that are past
 * or too soon are left out; staff (`includePast`) see the whole day.
 */
export function buildSheet(activity: Activity, option: ActivityOption, date: string, bookings: SheetBooking[], blocks: SheetBlock[] = [], { now = krabiNow(), includePast = false } = {}): Slot[] {
  const earliest = includePast ? 0 : date === now.date ? now.minutes + MIN_LEAD_MINUTES : 0;
  if (!includePast && !isBookableDay(date, now)) return [];
  const slots: Slot[] = [];
  for (let start = toMinutes(activity.firstStart); start <= toMinutes(option.lastStart); start += activity.interval) {
    if (start < earliest) continue;
    const time = fromMinutes(start);
    const blocked = blocks.some((b) => toMinutes(b.start) <= start && start < toMinutes(b.end));

    if (activity.units > 1) {
      // A bay is free for the booking only if one is free in every hour it covers.
      const hours = Array.from({ length: Math.ceil(option.minutes / 60) }, (_, i) => start + i * 60);
      const busiest = Math.max(...hours.map((hour) => bookings.filter((b) => toMinutes(b.time) <= hour && hour < toMinutes(b.time) + b.minutes).length));
      const baysLeft = blocked ? 0 : Math.max(0, activity.units - busiest);
      slots.push({ time, capacity: activity.capacity, spotsLeft: baysLeft * activity.capacity, baysLeft, ...(blocked && { blocked }) });
      continue;
    }

    const here = bookings.filter((b) => b.time === time);
    const booked = here.reduce((sum, b) => sum + b.players, 0);
    const full = blocked || (activity.privateGroup ? here.length > 0 : booked >= activity.capacity);
    slots.push({ time, capacity: activity.capacity, spotsLeft: full ? 0 : activity.capacity - booked, ...(blocked && { blocked }) });
  }
  return slots;
}

/** Whether a group of `players` fits in a slot (a whole bay on the range). */
export const fits = (slot: Slot, players: number) => (slot.baysLeft !== undefined ? slot.baysLeft > 0 : slot.spotsLeft >= players);

export type DayPart = 'morning' | 'midday' | 'afternoon';
export const DAY_PARTS: { id: DayPart; label: string; hint: string }[] = [
  { id: 'morning', label: 'Morning', hint: 'before 11' },
  { id: 'midday', label: 'Midday', hint: '11 – 2' },
  { id: 'afternoon', label: 'Afternoon', hint: 'from 2' },
];
export function dayPartOf(time: string): DayPart {
  const minutes = toMinutes(time);
  return minutes < 11 * 60 ? 'morning' : minutes < 14 * 60 ? 'midday' : 'afternoon';
}
