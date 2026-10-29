import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSheet, fits, isBookableDay } from '../src/booking/availability.ts';
import { activityById, EXPERIENCE_LEVELS, pickupFor, RENTALS, type RentalId } from '../src/booking/config.ts';
import type { ErrorResponse, Guest, Reservation } from '../src/booking/contract.ts';
import { isISODate } from '../src/booking/dates.ts';
import { priceLines, totalOf } from '../src/booking/pricing.ts';
import { CONTACT } from '../src/data/contact.ts';
import { DbError, rest } from './_lib/db.ts';
import { clubEmail, guestEmail } from './_lib/emails.ts';
import { allowMethods, readJsonBody, siteUrl } from './_lib/http.ts';
import { emailConfigured, sendEmail, splitAddresses } from './_lib/resend.ts';
import { loadDay } from './_lib/sheet.ts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\d\s.-]{6,30}$/;

// POST /api/reservations — books a tee time. Everything the browser sends is
// checked again here and priced here (never trusted from the page), then
// saved through golf_book(), which takes the last place atomically. Then the
// guest gets a confirmation and the club a "new booking" email through Resend
// (RESEND_API_KEY). GOLF_EMAIL_FROM (an address on a domain verified in
// Resend), GOLF_BOOKINGS_TO (default the club's reservations address),
// GOLF_BOOKINGS_BCC and SITE_URL are optional overrides.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['POST'])) return;
  res.setHeader('Cache-Control', 'no-store');
  const fail = (status: number, error: string, code?: ErrorResponse['code']) => res.status(status).json({ error, ...(code && { code }) } satisfies ErrorResponse);

  const body = readJsonBody(req);
  if (body.hp) return fail(400, 'Please try again.');
  // Timed in the browser, so a guest's clock being off doesn't matter.
  if (typeof body.elapsedMs === 'number' && body.elapsedMs < 3000) return fail(429, 'Please wait a few seconds and try again.');

  const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
  const activity = activityById(text(body.activity, 20));
  const option = activity?.options.find((o) => o.id === text(body.option, 10));
  const date = text(body.date, 10);
  const time = text(body.time, 5);
  const players = Number(body.players);
  if (!activity || !option || !isISODate(date) || !isBookableDay(date) || !/^\d\d:\d\d$/.test(time)
    || !Number.isInteger(players) || players < activity.minPlayers || players > activity.maxPlayers) {
    return fail(400, 'Something about this booking doesn’t add up. Please pick your time again.', 'invalid');
  }

  const g = (body.guest ?? {}) as Record<string, unknown>;
  const guest: Guest = {
    firstName: text(g.firstName, 60), lastName: text(g.lastName, 60), email: text(g.email, 120).toLowerCase(), phone: text(g.phone, 30),
    country: text(g.country, 2).toUpperCase(), handicap: text(g.handicap, 5), notes: text(g.notes, 1000),
  };
  if (!guest.firstName || !guest.lastName || !EMAIL.test(guest.email) || !PHONE.test(guest.phone) || !/^[A-Z]{2}$/.test(guest.country)) {
    return fail(400, 'Please check your name, email, phone and country.', 'invalid');
  }

  // Rental sets only where the activity has them, never more than one each.
  const sentRentals = (body.rentals ?? {}) as Record<string, unknown>;
  const rentals: Partial<Record<RentalId, number>> = {};
  if (activity.rentals) for (const r of RENTALS) {
    const count = Number(sentRentals[r.id]);
    if (Number.isInteger(count) && count > 0) rentals[r.id] = count;
  }
  if (Object.values(rentals).reduce((sum, n) => sum + n, 0) > players) return fail(400, 'That’s more rental sets than players.', 'invalid');

  const transfer = text(body.transfer, 5) || null;
  const pickupFrom = text(body.pickupFrom, 160);
  if (transfer && (transfer !== pickupFor(time) || !pickupFrom)) return fail(400, 'Please check the shuttle pick-up.', 'invalid');
  const experience = activity.id === 'lesson' && EXPERIENCE_LEVELS.includes(text(body.experience, 60)) ? text(body.experience, 60) : '';

  try {
    // A real start on today's sheet, still with room (golf_book() checks again, atomically).
    const { bookings, blocks } = await loadDay(activity.id, date);
    const slot = buildSheet(activity, option, date, bookings, blocks).find((s) => s.time === time);
    if (!slot || !fits(slot, players)) return fail(409, 'Sorry — that time was just taken. Please pick another.', 'taken');

    const lines = priceLines(activity, option, players, rentals);
    const total = totalOf(lines);
    const ref = await rest<string>('/rpc/golf_book', {
      method: 'POST',
      body: {
        p_booking: {
          activity: activity.id, option: option.id, play_date: date, start_time: time, minutes: option.minutes, players, rentals,
          transfer, pickup_from: transfer ? pickupFrom : '', experience, first_name: guest.firstName, last_name: guest.lastName,
          email: guest.email, phone: guest.phone, country: guest.country, handicap: guest.handicap, notes: guest.notes, lines, total, source: 'online',
        },
        p_capacity: activity.capacity, p_units: activity.units, p_private: !!activity.privateGroup, p_force: false,
      },
    });

    const reservation: Reservation = {
      ref, activity: activity.id, option: option.id, date, time, minutes: option.minutes, players, rentals,
      transfer, pickupFrom: transfer ? pickupFrom : '', lines, total, email: guest.email, emailed: false,
    };
    reservation.emailed = await sendEmails(reservation, guest, experience, siteUrl(req));
    console.info('Golf booking saved', ref, activity.id, date, time, players);
    return res.status(200).json(reservation);
  } catch (error) {
    if (error instanceof DbError && error.message.includes('taken')) return fail(409, 'Sorry — that time was just taken. Please pick another.', 'taken');
    console.error('Golf booking failed', error);
    return fail(500, 'We couldn’t save your booking just now. Please try again, or WhatsApp us.');
  }
}

// Never fails the booking — it's saved, and staff see it in /admin either way.
async function sendEmails(reservation: Reservation, guest: Guest, experience: string, site: string): Promise<boolean> {
  if (!emailConfigured()) { console.warn('Booking emails skipped: RESEND_API_KEY not set'); return false; }
  const from = process.env.GOLF_EMAIL_FROM || 'Hula Hula Golf Club <golf@hulahularesort.com>';
  const club = splitAddresses(process.env.GOLF_BOOKINGS_TO || CONTACT.email);
  const bcc = splitAddresses(process.env.GOLF_BOOKINGS_BCC ?? '');
  const toGuest = guestEmail(reservation, guest, site);
  const toClub = clubEmail(reservation, guest, experience, site);
  const [guestResult, clubResult] = await Promise.allSettled([
    sendEmail({ from, to: [guest.email], replyTo: CONTACT.email, ...toGuest }),
    sendEmail({ from, to: club, bcc, replyTo: guest.email, ...toClub }),
  ]);
  if (clubResult.status === 'rejected' || !clubResult.value.ok) console.error('Club booking email failed', reservation.ref, clubResult.status === 'rejected' ? clubResult.reason : clubResult.value.body);
  const guestOk = guestResult.status === 'fulfilled' && guestResult.value.ok;
  if (!guestOk) console.error('Guest booking email failed', reservation.ref, guestResult.status === 'rejected' ? guestResult.reason : guestResult.value.body);
  return guestOk;
}
