import { contactLinks, findActivity, type SiteData } from '../../src/booking/config.ts';
import type { Guest, Reservation, ReservationView } from '../../src/booking/contract.ts';
import type { PriceLine } from '../../src/booking/pricing.ts';
import { rest } from './db.ts';
import { bookingConfirmation, bookingNotification } from './emails.ts';
import { PAID, paidFields, paymentInquiry } from './payso.ts';
import { emailConfigured, sendTemplate, splitAddresses } from './resend.ts';
import { loadSite } from './site.ts';

// Tee time bookings in Supabase (supabase/tee-payments.sql). Like the event
// orders in events.ts, confirmBookingPayment() is the one path from "this might
// be paid" to "booked, and both emails sent": Payso's notification, the
// confirmation page's polling and the daily cron can all call it at once, so
// every step is a conditional update only one of them can win.

export interface BookingRow {
  id: string; ref: string; invoice_no: string | null; access_key_hash: string | null;
  activity: string; option: string; play_date: string; start_time: string; minutes: number; players: number;
  rentals: Record<string, number>; transfer: string | null; pickup_from: string; experience: string;
  first_name: string; last_name: string; email: string; phone: string; country: string; handicap: string; notes: string;
  lines: PriceLine[]; total: number; status: string; test_payment: boolean; flags: string[]; expires_at: string | null; paid_at: string | null;
  resp_code: string | null; emailed_at: string | null; emails_claimed_at: string | null;
}

export const getBooking = async (filter: string) => (await rest<BookingRow[]>(`/golf_bookings?select=*&${filter}&limit=1`))[0] ?? null;
export const updateBookings = (filter: string, patch: Record<string, unknown>) =>
  rest<BookingRow[]>(`/golf_bookings?${filter}`, { method: 'PATCH', body: patch, prefer: 'return=representation' });

function reservationOf(b: BookingRow, site: SiteData): Reservation {
  const activity = findActivity(site, b.activity);
  return {
    ref: b.ref, activity: b.activity, activityName: activity?.name ?? b.activity, optionLabel: activity?.options.find((o) => o.id === b.option)?.label ?? b.option,
    date: b.play_date, time: b.start_time.slice(0, 5), minutes: b.minutes, players: b.players, rentals: b.rentals,
    transfer: b.transfer ? b.transfer.slice(0, 5) : null, pickupFrom: b.pickup_from, lines: b.lines, total: b.total, email: b.email, emailed: !!b.emailed_at, testPayment: b.test_payment,
  };
}

/** The booking for its confirmation page. A hold gets a minute's grace in case Payso is still answering. */
export function viewOf(b: BookingRow, site: SiteData): ReservationView {
  const lapsed = b.status === 'pending' && !!b.expires_at && Date.now() > Date.parse(b.expires_at) + 60_000;
  const status = b.status === 'pending' ? (lapsed ? 'expired' : 'pending') : b.status === 'expired' || b.status === 'cancelled' ? b.status : 'confirmed';
  return { ...reservationOf(b, site), status };
}

export async function confirmBookingPayment(invoiceNo: string, source: 'webhook' | 'status' | 'cron'): Promise<BookingRow | null> {
  const booking = await getBooking(`invoice_no=eq.${invoiceNo}`);
  if (!booking) { console.error('Payso reference with no tee time', invoiceNo, source); return null; }
  if (booking.paid_at) return sendBookingEmails(booking);
  if (booking.status !== 'pending' && booking.status !== 'expired') return booking;

  const inquiry = await paymentInquiry(invoiceNo);
  if (inquiry.status !== PAID) {
    if (booking.status === 'pending' && inquiry.status && inquiry.status !== booking.resp_code) {
      await updateBookings(`id=eq.${booking.id}&status=eq.pending`, { resp_code: inquiry.status, resp_desc: inquiry.statusName ?? null });
      return { ...booking, resp_code: inquiry.status };
    }
    return booking;
  }

  const [paid] = await updateBookings(`id=eq.${booking.id}&status=in.(pending,expired)`, { status: 'booked', ...paidFields(booking, inquiry) });
  if (paid) console.info('Tee time paid', paid.ref, source);
  const current = paid ?? await getBooking(`id=eq.${booking.id}`);
  return current?.paid_at ? sendBookingEmails(current) : current;
}

const CLAIM_STALE_MS = 5 * 60_000;

/** The guest's confirmation and the club's alert — once, whoever gets here first. */
export async function sendBookingEmails(booking: BookingRow, siteUrl = process.env.SITE_URL || 'https://hulahula-golf.vercel.app'): Promise<BookingRow> {
  if (booking.emailed_at) return booking;
  if (!emailConfigured()) { console.warn('Booking emails skipped: RESEND_API_KEY not set'); return booking; }
  const stale = new Date(Date.now() - CLAIM_STALE_MS).toISOString();
  const [claimed] = await updateBookings(`id=eq.${booking.id}&emailed_at=is.null&or=(emails_claimed_at.is.null,emails_claimed_at.lt.${stale})`, { emails_claimed_at: new Date().toISOString() });
  if (!claimed) return booking;

  const site = await loadSite();
  const contact = contactLinks(site.club.contact);
  const reservation = reservationOf(claimed, site);
  const guest: Guest = { firstName: claimed.first_name, lastName: claimed.last_name, email: claimed.email, phone: claimed.phone, country: claimed.country, handicap: claimed.handicap, notes: claimed.notes };
  const url = siteUrl.replace(/\/$/, '');
  const from = process.env.GOLF_EMAIL_FROM || 'Hula Hula Golf Club <golf@hulahularesort.com>';
  const results = await Promise.allSettled([
    // A retry after one of the two failed resends both; the keys stop the one that went through going twice.
    sendTemplate({ from, to: [claimed.email], replyTo: contact.email, ...bookingConfirmation(reservation, guest, url, site), idempotencyKey: `golf-booking-${claimed.ref}-guest` }),
    sendTemplate({ from, to: splitAddresses(process.env.GOLF_BOOKINGS_TO || contact.email), bcc: splitAddresses(process.env.GOLF_BOOKINGS_BCC ?? ''), replyTo: claimed.email, ...bookingNotification(reservation, guest, claimed.experience, url, site, claimed.flags), idempotencyKey: `golf-booking-${claimed.ref}-club` }),
  ]);
  if (!results.every((r) => r.status === 'fulfilled' && r.value.ok)) {
    console.error('Tee time emails failed', claimed.ref, results.map((r) => (r.status === 'rejected' ? String(r.reason) : r.value.body)));
    await updateBookings(`id=eq.${claimed.id}`, { emails_claimed_at: null });
    return claimed;
  }
  const [done] = await updateBookings(`id=eq.${claimed.id}`, { emailed_at: new Date().toISOString() });
  return done ?? claimed;
}
