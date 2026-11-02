import { timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { BookingStatusResponse, PublicBookingStatus } from '../../shared/bookingContract.js';
import { type BookingRow, getByRef, updateWhere } from '../_lib/bookings.js';
import { confirmPayment, deliver } from '../_lib/finalize.js';
import { allowMethods, queryString } from '../_lib/http.js';
import { ACCESS_KEY_PATTERN, REF_PATTERN, sha256Hex } from '../_lib/ids.js';
import { nightsBetween } from '../_lib/search.js';
import { isTestMode } from '../_lib/twoc2p.js';

const INQUIRY_EVERY_MS = 5_000;

// GET /api/booking/status?ref&key — what /book/confirmation polls after the
// guest pays. Only the browser that started the booking has its key, and the
// answer never includes personal details. While a booking is still pending it
// asks 2C2P directly (at most every few seconds), so a confirmation never
// depends on 2C2P's notification arriving — or reaching us at all.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  res.setHeader('Cache-Control', 'no-store');
  const notFound = () => res.status(404).json({ error: 'We couldn’t find that booking.' });

  const ref = queryString(req, 'ref');
  const key = queryString(req, 'key');
  if (!REF_PATTERN.test(ref) || !ACCESS_KEY_PATTERN.test(key)) return notFound();

  try {
    let row = await getByRef(ref);
    if (!row || !sameHash(sha256Hex(key), row.access_key_hash)) return notFound();

    if (row.status === 'pending') {
      const [won] = await updateWhere(`id=eq.${row.id}&status=eq.pending&or=(last_inquiry_at.is.null,last_inquiry_at.lt.${new Date(Date.now() - INQUIRY_EVERY_MS).toISOString()})`, { last_inquiry_at: new Date().toISOString() });
      if (won) row = (await confirmPayment(row.invoice_no, 'status').catch((error) => { console.error('Status check: inquiry failed', ref, error); return null; })) ?? row;
    } else if (row.status === 'paid') {
      row = await deliver(row);
    }
    return res.status(200).json(toPublic(row));
  } catch (error) {
    console.error('Booking status failed', ref, error);
    return res.status(502).json({ error: 'Could not check your booking right now.' });
  }
}

function sameHash(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// 2C2P answers that mean "nothing final yet" — still being paid, or no
// attempt so far. Any other non-success answer is a decline or cancellation
// of the last attempt. The booking itself stays pending (the guest may try
// again until the hold runs out); only what the guest is shown changes.
const NOT_FINAL = new Set(['0001', '0999', '2001', '2002', '2003']);

function declineReason(code: string, description: string | null): string {
  if (code === '0003') return 'The payment was cancelled.';
  if (code === '4081') return 'Your bank couldn’t confirm the payment was you (the 3-D Secure check didn’t pass).';
  return description ? `The payment was declined: ${description}.` : 'The payment was declined.';
}

function toPublic(row: BookingRow): BookingStatusResponse {
  const declined = row.status === 'pending' && !!row.resp_code && row.resp_code !== '0000' && !NOT_FINAL.has(row.resp_code);
  const test = row.flags.includes('test_payment') || (row.status === 'pending' && isTestMode());
  const status: PublicBookingStatus = row.status === 'paid' || row.status === 'delivered' ? 'confirmed'
    : row.status === 'failed' || declined ? 'failed'
    : row.status === 'expired' || Date.now() > Date.parse(row.expires_at) + 60_000 ? 'expired'
    : 'pending';
  return {
    ref: row.ref,
    status,
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: nightsBetween(row.check_in, row.check_out),
    currency: row.currency,
    total: row.total_amount,
    deposit: row.deposit_amount,
    balance: Math.round((row.total_amount - (test ? 0 : row.paid_amount ?? row.deposit_amount)) * 100) / 100,
    paidAmount: test ? 0 : row.paid_amount,
    testPayment: test,
    lines: row.items.map((item) => ({
      roomTypeName: item.roomTypeName, rateName: item.rateName, quantity: item.quantity, adults: item.adults, children: item.children,
      ...(item.offer && { offerTitle: item.offer.percent > 0 ? `${item.offer.title} (−${item.offer.percent}%)` : item.offer.title, perks: item.offer.perks }),
    })),
    expiresAt: row.expires_at,
    ...(declined && { failureReason: declineReason(row.resp_code!, row.resp_desc) }),
  };
}
