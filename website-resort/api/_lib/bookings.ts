import type { DepositType } from '../../shared/bookingContract.js';
import { rest } from './db.js';

// The bookings table (supabase/migrations/0001_booking_and_cms.sql and
// 0006_booking_desk.sql). A row is written at "Continue to payment" and,
// once paid, kept with the guest's details for staff at /admin → Bookings;
// attempts that were never paid are deleted after 30 days. Status changes are conditional updates,
// so when the webhook, the confirmation page's polling and the nightly cron
// race on the same booking, exactly one of them wins each step.

// Booking workflow, not the current financial state. A historical paid or
// delivered booking can subsequently have resp_code 4047 (void) or 4120
// (refund). Keep the reservation and original payment for staff to reconcile.
export type BookingStatus = 'pending' | 'paid' | 'delivered' | 'failed' | 'expired';

/** One line of the booking: `quantity` identical rooms at the same rate and occupancy. */
export interface BookingItem {
  roomTypeUuid: string;
  roomTypeName: string;
  roomRateUuid: string;
  rateName: string;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  cancellation: string;
  depositType: DepositType;
  adults: number;
  children: number;
  quantity: number;
  /** Per room, whole stay — after the special offer; unitOriginalTotal is before it. */
  unitTotal: number;
  unitOriginalTotal?: number;
  /** The special offer from /admin this room got (savings per room), if any. */
  offer?: { title: string; percent: number; perks: string[]; savings: number } | null;
  unitDeposit: number;
  nightly: { date: string; amount: number }[];
  promoDiscount: number;
}

export interface BookingRow {
  id: string;
  ref: string;
  invoice_no: string;
  access_key_hash: string;
  status: BookingStatus;
  check_in: string;
  check_out: string;
  promo_code: string | null;
  items: BookingItem[];
  currency: string;
  total_amount: number;
  deposit_amount: number;
  balance_amount: number;
  guest_first_name: string | null;
  guest_last_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guest_country: string | null;
  arrival_time: string | null;
  special_requests: string | null;
  pii_wiped_at: string | null;
  payment_token: string | null;
  paid_amount: number | null;
  tran_ref: string | null;
  reference_no: string | null;
  approval_code: string | null;
  channel_code: string | null;
  resp_code: string | null;
  resp_desc: string | null;
  paid_at: string | null;
  last_inquiry_at: string | null;
  delivery_method: string | null;
  delivery_claimed_at: string | null;
  delivery_attempts: number;
  delivery_error: string | null;
  delivered_at: string | null;
  guest_emailed_at: string | null;
  keyed_at: string | null;
  flags: string[];
  expires_at: string;
  created_at: string;
}

export type NewBooking = Pick<BookingRow,
  'ref' | 'invoice_no' | 'access_key_hash' | 'check_in' | 'check_out' | 'promo_code' | 'items' | 'currency' | 'total_amount' | 'deposit_amount'
  | 'guest_first_name' | 'guest_last_name' | 'guest_email' | 'guest_phone' | 'guest_country' | 'arrival_time' | 'special_requests' | 'expires_at'>;

const RETURN_ROWS = 'return=representation';

export async function insertPending(row: NewBooking): Promise<BookingRow> {
  const [created] = await rest<BookingRow[]>('/bookings', { method: 'POST', body: { ...row, status: 'pending' }, prefer: RETURN_ROWS });
  return created;
}

async function findOne(filter: string): Promise<BookingRow | null> {
  const rows = await rest<BookingRow[]>(`/bookings?${filter}&limit=1`);
  return rows[0] ?? null;
}

export const getByRef = (ref: string) => findOne(`ref=eq.${encodeURIComponent(ref)}`);
export const getByInvoice = (invoiceNo: string) => findOne(`invoice_no=eq.${encodeURIComponent(invoiceNo)}`);

/** PATCH every row matching `filter` (PostgREST syntax) and return the ones that changed — none means someone else got there first. */
export function updateWhere(filter: string, patch: Partial<Record<keyof BookingRow, unknown>>): Promise<BookingRow[]> {
  return rest<BookingRow[]>(`/bookings?${filter}`, { method: 'PATCH', body: patch, prefer: RETURN_ROWS });
}

export function listWhere(filter: string): Promise<BookingRow[]> {
  return rest<BookingRow[]>(`/bookings?${filter}`);
}

export async function deleteWhere(filter: string): Promise<number> {
  const rows = await rest<{ id: string }[]>(`/bookings?${filter}&select=id`, { method: 'DELETE', prefer: RETURN_ROWS });
  return rows.length;
}

// Rooms this site has sold that SiteMinder doesn't know about yet: unpaid
// carts still inside their payment window, and paid bookings the team hasn't
// marked "Entered in SiteMinder" (for up to three days). Taken off
// SiteMinder's availability so the last room can't be sold twice here.
export async function softHolds(checkIn: string, checkOut: string): Promise<Map<string, number>> {
  const now = new Date().toISOString();
  const since = new Date(Date.now() - 72 * 3600_000).toISOString();
  const rows = await listWhere(`select=items&check_in=lt.${checkOut}&check_out=gt.${checkIn}`
    + `&or=(and(status.eq.pending,expires_at.gt.${now}),and(status.in.(paid,delivered),keyed_at.is.null,paid_at.gt.${since}))`);
  const holds = new Map<string, number>();
  for (const row of rows) for (const item of row.items) holds.set(item.roomTypeUuid, (holds.get(item.roomTypeUuid) ?? 0) + item.quantity);
  return holds;
}
