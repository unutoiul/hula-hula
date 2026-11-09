import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSheet, fits, isBookableDay, rulesFrom } from '../src/booking/availability.ts';
import { contactLinks, EXPERIENCE_LEVELS, findActivity, pickupFor, rentalsFor } from '../src/booking/config.ts';
import type { ErrorResponse, Guest, ReservationStarted } from '../src/booking/contract.ts';
import { isISODate } from '../src/booking/dates.ts';
import { priceLines, totalOf } from '../src/booking/pricing.ts';
import { DbError, rest } from './_lib/db.ts';
import { allowMethods, queryString, readJsonBody, siteUrl } from './_lib/http.ts';
import { ACCESS_KEY_PATTERN, BOOKING_REF_PATTERN, invoiceNoFor, newAccessKey, sameHash, sha256Hex } from './_lib/ids.ts';
import { createPayment, customerEmailFor, isConfigured as paymentConfigured, isTestMode } from './_lib/payso.ts';
import { loadDay } from './_lib/sheet.ts';
import { loadSite } from './_lib/site.ts';
import { confirmBookingPayment, getBooking, sendBookingEmails, updateBookings, viewOf } from './_lib/teeTimes.ts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\d\s.-]{6,30}$/;
const HOLD_MINUTES = 20;
const INQUIRY_EVERY_MS = 5_000;

// /api/reservations
//   POST — books a tee time. Everything the browser sends is checked again
//          here against the club's current settings and priced here (never
//          trusted from the page), then saved through golf_book(), which takes
//          the last place atomically and holds it for HOLD_MINUTES while the
//          guest pays on Payso's page. Something with nothing to pay is booked
//          straight away.
//   GET ?ref&key — the booking for /book/confirmation. While it's pending this
//          asks Payso directly (at most every few seconds), so a confirmation
//          never depends on Payso's notification arriving.
// The guest and the club are emailed once it's confirmed, from the Resend
// templates in emails/ (RESEND_API_KEY; `npm run email:publish`).
// GOLF_EMAIL_FROM (an address on a domain verified in Resend), GOLF_BOOKINGS_TO
// (default the club's email from its settings), GOLF_BOOKINGS_BCC and SITE_URL
// are optional overrides.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  res.setHeader('Cache-Control', 'no-store');
  return req.method === 'POST' ? book(req, res) : status(req, res);
}

async function book(req: VercelRequest, res: VercelResponse) {
  const fail = (code: number, error: string, kind?: ErrorResponse['code']) => res.status(code).json({ error, ...(kind && { code: kind }) } satisfies ErrorResponse);

  const body = readJsonBody(req);
  if (body.hp) return fail(400, 'Please try again.');
  // Timed in the browser, so a guest's clock being off doesn't matter.
  if (typeof body.elapsedMs === 'number' && body.elapsedMs < 3000) return fail(429, 'Please wait a few seconds and try again.');

  const site = await loadSite();
  const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
  // Only what's switched on for online booking; the others are booked by message.
  const found = findActivity(site, text(body.activity, 40));
  const activity = found?.bookOnline ? found : undefined;
  const option = activity?.options.find((o) => o.id === text(body.option, 10));
  const date = text(body.date, 10);
  const time = text(body.time, 5);
  const players = Number(body.players);
  if (!activity || !option || !isISODate(date) || !isBookableDay(date, site.club.booking.windowDays) || !/^\d\d:\d\d$/.test(time)
    || !Number.isInteger(players) || players < activity.minPlayers || players > activity.maxPlayers) {
    return fail(400, 'Something about this booking doesn’t add up. Please pick your time again.', 'invalid');
  }

  const g = (body.guest ?? {}) as Record<string, unknown>;
  const guest: Guest = {
    firstName: text(g.firstName, 60), lastName: text(g.lastName, 60), email: text(g.email, 120).toLowerCase(), phone: text(g.phone, 30),
    country: text(g.country, 2).toUpperCase(), handicap: activity.askHandicap ? text(g.handicap, 5) : '', notes: text(g.notes, 1000),
  };
  if (!guest.firstName || !guest.lastName || !EMAIL.test(guest.email) || !PHONE.test(guest.phone) || !/^[A-Z]{2}$/.test(guest.country)) {
    return fail(400, 'Please check your name, email, phone and country.', 'invalid');
  }

  // Only rentals this activity offers, never more than one each.
  const sentRentals = (body.rentals ?? {}) as Record<string, unknown>;
  const rentals: Record<string, number> = {};
  for (const r of rentalsFor(activity, site.rentals)) {
    const count = Number(sentRentals[r.id]);
    if (Number.isInteger(count) && count > 0) rentals[r.id] = count;
  }
  if (Object.values(rentals).reduce((sum, n) => sum + n, 0) > players) return fail(400, 'That’s more rental sets than players.', 'invalid');

  const transfer = text(body.transfer, 5) || null;
  const pickupFrom = text(body.pickupFrom, 160);
  if (transfer && (transfer !== pickupFor(time, site.club) || !pickupFrom)) return fail(400, 'Please check the shuttle pick-up.', 'invalid');
  const experience = activity.askExperience && EXPERIENCE_LEVELS.includes(text(body.experience, 60)) ? text(body.experience, 60) : '';

  try {
    // A real start on the day's sheet, still with room (golf_book() checks again, atomically).
    const { bookings, blocks } = await loadDay(activity.id, date);
    const slot = buildSheet(activity, option, date, bookings, blocks, { rules: rulesFrom(site.club) }).find((s) => s.time === time);
    if (!slot || !fits(slot, players)) return fail(409, 'Sorry — that time was just taken. Please pick another.', 'taken');

    const lines = priceLines(activity, option, players, rentals, site.rentals);
    const total = totalOf(lines);
    const needsPayment = total > 0;
    if (needsPayment && !paymentConfigured()) return fail(503, 'Online payment isn’t switched on yet — please WhatsApp us and we’ll book you in.', 'unavailable');

    const ref = await rest<string>('/rpc/golf_book', {
      method: 'POST',
      body: {
        p_booking: {
          activity: activity.id, option: option.id, play_date: date, start_time: time, minutes: option.minutes, players, rentals,
          transfer, pickup_from: transfer ? pickupFrom : '', experience, first_name: guest.firstName, last_name: guest.lastName,
          email: guest.email, phone: guest.phone, country: guest.country, handicap: guest.handicap, notes: guest.notes, lines, total, source: 'online',
          ...(needsPayment && { status: 'pending', expires_at: new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString() }),
        },
        p_capacity: activity.capacity, p_units: activity.units, p_private: activity.privateGroup, p_force: false,
      },
    });

    const origin = siteUrl(req);
    const key = newAccessKey();
    const invoiceNo = invoiceNoFor(ref);
    const [booking] = await updateBookings(`ref=eq.${ref}`, { access_key_hash: sha256Hex(key), ...(needsPayment && { invoice_no: invoiceNo, test_payment: isTestMode() }) });
    console.info('Golf booking saved', ref, activity.id, date, time, players, needsPayment ? 'awaiting payment' : 'nothing to pay');

    if (!needsPayment) {
      // Never fails the booking — it's saved, and staff see it in /admin either way.
      await sendBookingEmails(booking, origin).catch((error) => console.error('Booking emails failed', ref, error));
      return res.status(200).json({ ref, key, webPaymentUrl: null } satisfies ReservationStarted);
    }

    try {
      const { redirectUrl, transactionId } = await createPayment({
        referenceNo: invoiceNo,
        description: `Hula Hula Golf ${ref} - ${activity.name} ${option.label} x${players} - ${date} ${time}`,
        amount: total,
        email: customerEmailFor(guest.email, contactLinks(site.club.contact).email),
        returnUrl: `${origin}/api/payment/payso-return?booking=${ref}&key=${key}`,
        postbackUrl: `${origin}/api/payment/payso-postback?refno=${invoiceNo}`,
      });
      await updateBookings(`id=eq.${booking.id}`, { payment_token: transactionId });
      return res.status(200).json({ ref, key, webPaymentUrl: redirectUrl } satisfies ReservationStarted);
    } catch (error) {
      console.error('Tee time: Payso create payment failed', ref, error);
      await updateBookings(`id=eq.${booking.id}`, { status: 'expired' }).catch(() => {});
      return fail(502, 'Our payment provider isn’t responding — please try again in a few minutes.', 'unavailable');
    }
  } catch (error) {
    if (error instanceof DbError && error.message.includes('taken')) return fail(409, 'Sorry — that time was just taken. Please pick another.', 'taken');
    console.error('Golf booking failed', error);
    return fail(500, 'We couldn’t save your booking just now. Please try again, or WhatsApp us.');
  }
}

async function status(req: VercelRequest, res: VercelResponse) {
  const notFound = () => res.status(404).json({ error: 'We couldn’t find that booking.' });
  const ref = queryString(req, 'ref');
  const key = queryString(req, 'key');
  if (!BOOKING_REF_PATTERN.test(ref) || !ACCESS_KEY_PATTERN.test(key)) return notFound();
  try {
    let booking = await getBooking(`ref=eq.${ref}`);
    if (!booking?.access_key_hash || !sameHash(sha256Hex(key), booking.access_key_hash)) return notFound();
    if (booking.status === 'pending' && booking.invoice_no) {
      const [won] = await updateBookings(`id=eq.${booking.id}&status=eq.pending&or=(last_inquiry_at.is.null,last_inquiry_at.lt.${new Date(Date.now() - INQUIRY_EVERY_MS).toISOString()})`, { last_inquiry_at: new Date().toISOString() });
      if (won) booking = (await confirmBookingPayment(booking.invoice_no, 'status').catch((error) => { console.error('Booking status: inquiry failed', ref, error); return null; })) ?? booking;
    }
    return res.status(200).json(viewOf(booking, await loadSite()));
  } catch (error) {
    console.error('Booking status failed', ref, error);
    return res.status(502).json({ error: 'Could not check your booking right now.' });
  }
}
