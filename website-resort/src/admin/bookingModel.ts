// The reservations desk's view of a website booking: the row from
// admin_booking_list() (supabase/migrations/0006_booking_desk.sql) and what
// staff need to know about it — has it been paid, is it in SiteMinder yet —
// plus the filters on /admin → Bookings.

import { countryName } from '../booking/countries';
import { dayLabel, money } from '../booking/format';
import { isReversedPayment, paymentStatus } from '../../shared/paymentStatus';

export interface DeskItem {
  roomTypeName: string;
  rateName: string;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  cancellation: string;
  adults: number;
  children: number;
  quantity: number;
  unitTotal: number;
  unitOriginalTotal?: number;
  offer?: { title: string; percent: number; perks: string[]; savings: number } | null;
  nightly: { date: string; amount: number }[];
}

export interface DeskBooking {
  id: string;
  ref: string;
  invoice_no: string;
  status: 'pending' | 'paid' | 'delivered' | 'failed' | 'expired';
  check_in: string;
  check_out: string;
  promo_code: string | null;
  items: DeskItem[];
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
  paid_amount: number | null;
  tran_ref: string | null;
  reference_no: string | null;
  approval_code: string | null;
  channel_code: string | null;
  resp_code: string | null;
  resp_desc: string | null;
  paid_at: string | null;
  last_inquiry_at: string | null;
  delivery_method: 'email' | 'siteconnect' | null;
  delivery_attempts: number;
  delivery_error: string | null;
  delivered_at: string | null;
  guest_emailed_at: string | null;
  siteminder_res_id: string | null;
  keyed_at: string | null;
  keyed_by: string | null;
  archived_at: string | null;
  archived_by: string | null;
  staff_notes: string | null;
  flags: string[];
  expires_at: string;
  created_at: string;
}

type Tone = 'success' | 'warning' | 'error' | 'default' | 'info';
export interface Badge { label: string; tone: Tone }

export const isReversed = (b: DeskBooking) => isReversedPayment(b.resp_code);
export const isPaid = (b: DeskBooking) => !isReversed(b) && (b.status === 'paid' || b.status === 'delivered');
export const isTest = (b: DeskBooking) => b.flags.includes('test_payment');
export const guestName = (b: DeskBooking) => [b.guest_first_name, b.guest_last_name].filter(Boolean).join(' ') || (b.pii_wiped_at ? 'Details deleted' : 'No name');
export const roomCount = (b: DeskBooking) => b.items.reduce((sum, item) => sum + item.quantity, 0);
export const guestCount = (b: DeskBooking) => b.items.reduce((sum, item) => ({ adults: sum.adults + item.adults * item.quantity, children: sum.children + item.children * item.quantity }), { adults: 0, children: 0 });
export const nightCount = (b: DeskBooking) => Math.round((Date.parse(`${b.check_out}T00:00:00Z`) - Date.parse(`${b.check_in}T00:00:00Z`)) / 86_400_000);
export const savingsOf = (b: DeskBooking) => b.items.reduce((sum, item) => sum + (item.offer?.savings ?? 0) * item.quantity, 0);

export function paymentBadge(b: DeskBooking, now = Date.now()): Badge {
  if (isReversed(b)) return { label: paymentStatus(b.resp_code) === 'voided' ? 'Voided' : 'Refunded', tone: 'warning' };
  if (isPaid(b) && b.resp_code === '4110') return { label: 'Settled', tone: 'success' };
  if (isPaid(b)) return { label: b.balance_amount > 0 ? 'Deposit paid' : 'Paid', tone: 'success' };
  if (b.status === 'pending' && Date.parse(b.expires_at) > now) return { label: 'Paying now', tone: 'info' };
  if (b.status === 'failed') return { label: 'Payment page error', tone: 'error' };
  return { label: b.resp_code && b.resp_code !== '0000' ? 'Payment declined' : 'Not paid', tone: 'default' };
}

export function siteMinderBadge(b: DeskBooking): Badge | null {
  if (isReversed(b)) return { label: b.keyed_at ? 'Review in SiteMinder' : 'Review reservation', tone: 'warning' };
  if (!isPaid(b)) return null;
  if (b.keyed_at) return { label: 'In SiteMinder', tone: 'success' };
  if (b.delivery_method === 'siteconnect' && b.siteminder_res_id) return { label: 'Sent to SiteMinder', tone: 'success' };
  if (b.status === 'paid') return { label: b.delivery_error ? 'Email to reservations failing' : 'Sending to reservations', tone: 'error' };
  return { label: 'To enter in SiteMinder', tone: 'warning' };
}

/** Paid, but nobody has put it in SiteMinder yet — the desk's to-do list. */
export const needsAction = (b: DeskBooking) => !b.archived_at && (isReversed(b) || (isPaid(b) && !b.keyed_at));

export const FLAG_LABELS: Record<string, string> = {
  paid_after_expiry: 'Paid after the room hold ran out — check the room is still free before entering it.',
  amount_mismatch: 'The amount charged differs from the deposit — compare with the payment portal.',
  guest_email_failed: 'The guest’s confirmation email didn’t send — forward it or email them.',
  details_deleted: 'The guest’s details were deleted before this booking was kept — find the payer in the payment portal.',
  test_payment: 'Test payment (2C2P’s test system or Stripe test mode): nothing was charged.',
  preview_site: 'Made on the Stripe test site (a copy of the website), not the live site — check with the web team before entering it in SiteMinder.',
};

/** Which provider took the payment, from what it left behind: Stripe's ids start "pi_" and its channels read "Stripe · …". */
export const paymentProviderOf = (b: Pick<DeskBooking, 'tran_ref' | 'channel_code' | 'resp_desc'>) =>
  (b.tran_ref?.startsWith('pi_') || b.channel_code?.startsWith('Stripe') || b.resp_desc?.includes('Stripe') ? 'Stripe' : '2C2P');
export const paymentPortal = (provider: string) => (provider === 'Stripe' ? 'the Stripe Dashboard' : 'the 2C2P merchant portal');

const CHANNELS: Record<string, string> = { VI: 'Visa', MA: 'Mastercard', JC: 'JCB', AM: 'American Express', UP: 'UnionPay', DI: 'Diners Club', PPQR: 'PromptPay QR', QR: 'QR payment', TRUEMONEY: 'TrueMoney', SHPPAY: 'ShopeePay' };
export const channelName = (code: string | null) => (code ? CHANNELS[code.toUpperCase()] ?? code : null);

// ── Filters ─────────────────────────────────────────────────────────────

export type View = 'action' | 'paid' | 'unfinished' | 'all' | 'archived';
export const VIEWS: { value: View; label: string; hint: string }[] = [
  { value: 'action', label: 'Needs attention', hint: 'Bookings to enter in SiteMinder and reversed payments to review' },
  { value: 'paid', label: 'Paid', hint: 'Every paid booking' },
  { value: 'unfinished', label: 'Unfinished', hint: 'Guests who started booking but didn’t pay — kept for 30 days' },
  { value: 'all', label: 'All', hint: 'Everything except archived bookings' },
  { value: 'archived', label: 'Archived', hint: 'Bookings you’ve archived' },
];

export type StayFilter = 'any' | 'today' | 'week' | 'month' | 'inHouse' | 'upcoming' | 'past' | 'custom';
export const STAY_FILTERS: { value: StayFilter; label: string }[] = [
  { value: 'any', label: 'Any dates' },
  { value: 'today', label: 'Arriving today' },
  { value: 'week', label: 'Arriving in the next 7 days' },
  { value: 'month', label: 'Arriving in the next 30 days' },
  { value: 'inHouse', label: 'Staying now' },
  { value: 'upcoming', label: 'Upcoming stays' },
  { value: 'past', label: 'Past stays' },
  { value: 'custom', label: 'Arrival between…' },
];

export type Sort = 'booked' | 'arrival' | 'arrivalDesc';
export const SORTS: { value: Sort; label: string }[] = [
  { value: 'booked', label: 'Newest booking first' },
  { value: 'arrival', label: 'Arrival, soonest first' },
  { value: 'arrivalDesc', label: 'Arrival, latest first' },
];

export interface Filters { view: View; query: string; stay: StayFilter; from: string; to: string; hideTests: boolean; sort: Sort }
export const DEFAULT_FILTERS: Filters = { view: 'all', query: '', stay: 'any', from: '', to: '', hideTests: false, sort: 'booked' };

export const todayInBangkok = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
export const addDays = (iso: string, days: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };

export function inView(b: DeskBooking, view: View): boolean {
  if (view === 'archived') return !!b.archived_at;
  if (b.archived_at) return false;
  if (view === 'action') return needsAction(b);
  if (view === 'paid') return isPaid(b);
  if (view === 'unfinished') return !isPaid(b) && !isReversed(b);
  return true;
}

function inStay(b: DeskBooking, f: Filters, today: string): boolean {
  switch (f.stay) {
    case 'today': return b.check_in === today;
    case 'week': return b.check_in >= today && b.check_in <= addDays(today, 7);
    case 'month': return b.check_in >= today && b.check_in <= addDays(today, 30);
    case 'inHouse': return b.check_in <= today && b.check_out > today;
    case 'upcoming': return b.check_in >= today;
    case 'past': return b.check_out < today;
    case 'custom': return (!f.from || b.check_in >= f.from) && (!f.to || b.check_in <= f.to);
    default: return true;
  }
}

function matches(b: DeskBooking, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const digits = q.replace(/\D/g, '');
  return [b.ref, b.invoice_no, guestName(b), b.guest_email, b.tran_ref, b.siteminder_res_id, b.approval_code, b.promo_code]
    .some((value) => value?.toLowerCase().includes(q))
    || (digits.length >= 4 && !!b.guest_phone?.replace(/\D/g, '').includes(digits));
}

export function applyFilters(rows: DeskBooking[], f: Filters): DeskBooking[] {
  const today = todayInBangkok();
  const list = rows.filter((b) => inView(b, f.view) && inStay(b, f, today) && matches(b, f.query) && !(f.hideTests && isTest(b)));
  if (f.sort === 'arrival') list.sort((a, b) => a.check_in.localeCompare(b.check_in) || b.created_at.localeCompare(a.created_at));
  if (f.sort === 'arrivalDesc') list.sort((a, b) => b.check_in.localeCompare(a.check_in) || b.created_at.localeCompare(a.created_at));
  return list;
}

// ── Formatting ──────────────────────────────────────────────────────────

const stamp = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
const stampShort = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
/** "3 Nov 2026, 02:42" in resort time. */
export const stampLabel = (iso: string) => stamp.format(new Date(iso));
/** "3 Nov, 02:42" this year, with the year otherwise. */
export const stampShortLabel = (iso: string) => (iso.slice(0, 4) === todayInBangkok().slice(0, 4) ? stampShort : stamp).format(new Date(iso));

/** Everything SiteMinder asks for, in the order it's keyed in, for the clipboard. */
export function siteMinderText(b: DeskBooking): string {
  const { adults, children } = guestCount(b);
  return [
    `Website booking ${b.ref}`,
    `Guest: ${guestName(b)}`,
    b.guest_email && `Email: ${b.guest_email}`,
    b.guest_phone && `Phone: ${b.guest_phone}`,
    b.guest_country && `Country: ${countryName(b.guest_country)}`,
    `Stay: ${dayLabel(b.check_in)} → ${dayLabel(b.check_out)} (${nightCount(b)} nights)`,
    `Guests: ${adults} adults${children ? `, ${children} children` : ''}`,
    ...b.items.map((item) => `Room: ${item.quantity} × ${item.roomTypeName} — ${item.rateName} (${item.adults} adults${item.children ? `, ${item.children} children` : ''} each)${item.offer ? ` · offer “${item.offer.title}”${item.offer.percent ? ` −${item.offer.percent}%` : ''}${item.offer.perks.length ? `, perks: ${item.offer.perks.join(', ')}` : ''}` : ''}`),
    isReversed(b)
      ? `Total: ${money(b.total_amount, b.currency)} · payment ${paymentBadge(b).label.toLowerCase()} in ${paymentProviderOf(b)} — review the portal amount and reservation before confirming a balance`
      : `Total: ${money(b.total_amount, b.currency)} · paid ${money(b.paid_amount ?? b.deposit_amount, b.currency)} online${b.balance_amount > 0 ? ` · ${money(b.balance_amount, b.currency)} to pay at the hotel` : ''}`,
    b.tran_ref && `${paymentProviderOf(b)} transaction: ${b.tran_ref} (invoice ${b.invoice_no})`,
    b.arrival_time && `Arrival time: ${b.arrival_time}`,
    b.special_requests && `Special requests: ${b.special_requests}`,
  ].filter(Boolean).join('\n');
}
