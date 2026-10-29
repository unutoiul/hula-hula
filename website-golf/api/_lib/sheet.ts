import type { SheetBlock, SheetBooking } from '../../src/booking/availability.ts';
import { rest } from './db.ts';

// What's already on one activity's sheet for one day: the bookings that
// aren't cancelled, and the times staff have blocked (for this activity or
// for everything).

const hhmm = (time: string) => time.slice(0, 5);

export async function loadDay(activity: string, date: string): Promise<{ bookings: SheetBooking[]; blocks: SheetBlock[] }> {
  const [bookings, blocks] = await Promise.all([
    rest<{ start_time: string; minutes: number; players: number }[]>(`/golf_bookings?select=start_time,minutes,players&activity=eq.${activity}&play_date=eq.${date}&status=neq.cancelled`),
    rest<{ start_time: string; end_time: string }[]>(`/golf_blocks?select=start_time,end_time&play_date=eq.${date}&or=(activity.is.null,activity.eq.${activity})`),
  ]);
  return {
    bookings: bookings.map((b) => ({ time: hhmm(b.start_time), minutes: b.minutes, players: b.players })),
    blocks: blocks.map((b) => ({ start: hhmm(b.start_time), end: hhmm(b.end_time) })),
  };
}
