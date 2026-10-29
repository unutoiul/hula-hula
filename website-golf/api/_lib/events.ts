import type { EventOrderStatus, EventOrderView, PublicEvent, ScheduleItem } from '../../src/booking/contract.ts';
import { krabiNow } from '../../src/booking/dates.ts';
import { rest } from './db.ts';
import { eventClubEmail, eventGuestEmail, type PaidOrder } from './emails.ts';
import { emailConfigured, sendEmail, splitAddresses } from './resend.ts';
import { contactLinks } from '../../src/booking/config.ts';
import { loadSite } from './site.ts';
import { isTestMode, PAID, paymentInquiry } from './twoc2p.ts';

// Events and their orders in Supabase (supabase/events.sql), read and
// written with the secret key. confirmOrderPayment() is the one path from
// "this might be paid" to "paid, and both emails sent": 2C2P's notification,
// the confirmation page's polling and the daily cron all call it, possibly at
// the same time, so every step is a conditional update only one can win.

export interface EventRow {
  id: string; slug: string; title: string; tagline: string; starts_on: string; ends_on: string | null;
  start_time: string | null; end_time: string | null; description: string; highlights: string[]; schedule: ScheduleItem[];
  cover_image: string | null; published: boolean; sales_open: boolean;
}
export interface PackageRow { id: string; event_id: string; name: string; description: string; includes: string[]; price: number; capacity: number; max_per_order: number; sort_order: number; active: boolean }
export interface OrderRow {
  id: string; ref: string; invoice_no: string | null; access_key_hash: string | null; event_id: string; package_id: string;
  event_title: string; package_name: string; quantity: number; unit_price: number; total: number;
  first_name: string; last_name: string; email: string; phone: string; country: string; notes: string;
  status: EventOrderStatus; test_payment: boolean; flags: string[]; expires_at: string | null;
  resp_code: string | null; resp_desc: string | null; last_inquiry_at: string | null; emailed_at: string | null; emails_claimed_at: string | null;
}

const hhmm = (time: string | null) => (time ? time.slice(0, 5) : null);

/** Places taken per package: paid, or pending inside the payment window. */
async function takenByPackage(packageIds: string[]): Promise<Map<string, number>> {
  const taken = new Map<string, number>();
  if (!packageIds.length) return taken;
  const rows = await rest<{ package_id: string; quantity: number; status: string; expires_at: string | null }[]>(
    `/golf_event_orders?select=package_id,quantity,status,expires_at&package_id=in.(${packageIds.join(',')})&status=in.(paid,pending)`);
  const now = Date.now();
  for (const r of rows) if (r.status === 'paid' || (r.expires_at && Date.parse(r.expires_at) > now)) taken.set(r.package_id, (taken.get(r.package_id) ?? 0) + r.quantity);
  return taken;
}

/** Published events that haven't finished yet (or one by its slug), with what's still for sale. */
export async function loadPublicEvents(slug?: string): Promise<PublicEvent[]> {
  const today = krabiNow().date;
  const filter = slug ? `slug=eq.${encodeURIComponent(slug)}` : `or=(ends_on.gte.${today},and(ends_on.is.null,starts_on.gte.${today}))`;
  const events = await rest<EventRow[]>(`/golf_events?select=*&published=eq.true&${filter}&order=starts_on,start_time`);
  if (!events.length) return [];
  const packages = await rest<PackageRow[]>(`/golf_event_packages?select=*&active=eq.true&event_id=in.(${events.map((e) => e.id).join(',')})&order=sort_order,created_at`);
  const taken = await takenByPackage(packages.map((p) => p.id));
  return events.map((e) => {
    const past = (e.ends_on ?? e.starts_on) < today;
    return {
      slug: e.slug, title: e.title, tagline: e.tagline, startsOn: e.starts_on, endsOn: e.ends_on, startTime: hhmm(e.start_time), endTime: hhmm(e.end_time),
      description: e.description, highlights: e.highlights, schedule: e.schedule, coverImage: e.cover_image, salesOpen: e.sales_open && !past,
      packages: packages.filter((p) => p.event_id === e.id).map((p) => ({
        id: p.id, name: p.name, description: p.description, includes: p.includes, price: p.price, maxPerOrder: p.max_per_order,
        left: Math.max(0, p.capacity - (taken.get(p.id) ?? 0)),
      })),
    };
  });
}

export const getOrder = async (filter: string) => (await rest<OrderRow[]>(`/golf_event_orders?select=*&${filter}&limit=1`))[0] ?? null;
export const updateOrders = (filter: string, patch: Record<string, unknown>) =>
  rest<OrderRow[]>(`/golf_event_orders?${filter}`, { method: 'PATCH', body: patch, prefer: 'return=representation' });

export async function viewOf(order: OrderRow): Promise<EventOrderView> {
  const [event] = await rest<Pick<EventRow, 'slug' | 'starts_on' | 'start_time' | 'end_time'>[]>(`/golf_events?select=slug,starts_on,start_time,end_time&id=eq.${order.event_id}`);
  return {
    ref: order.ref, status: order.status, eventTitle: order.event_title, eventSlug: event?.slug ?? '', startsOn: event?.starts_on ?? '', startTime: hhmm(event?.start_time ?? null), endTime: hhmm(event?.end_time ?? null),
    packageName: order.package_name, quantity: order.quantity, total: order.total, email: order.email, testPayment: order.test_payment,
  };
}

export async function confirmOrderPayment(invoiceNo: string, source: 'webhook' | 'status' | 'cron'): Promise<OrderRow | null> {
  const order = await getOrder(`invoice_no=eq.${invoiceNo}`);
  if (!order) { console.error('2C2P invoice with no event order', invoiceNo, source); return null; }
  if (order.status === 'paid') return sendOrderEmails(order);
  if (order.status !== 'pending' && order.status !== 'expired') return order;

  const inquiry = await paymentInquiry(invoiceNo);
  if (inquiry.respCode !== PAID) {
    if (order.status === 'pending' && inquiry.respCode !== order.resp_code) {
      await updateOrders(`id=eq.${order.id}&status=eq.pending`, { resp_code: inquiry.respCode, resp_desc: inquiry.respDesc ?? null });
      return { ...order, resp_code: inquiry.respCode, resp_desc: inquiry.respDesc ?? null };
    }
    return order;
  }

  const flags = new Set(order.flags);
  // Paid after its hold ran out: the places may have gone to someone else meanwhile.
  if (order.status === 'expired' || (order.expires_at && Date.now() > Date.parse(order.expires_at))) flags.add('paid_after_expiry');
  if (typeof inquiry.amount === 'number' && Math.round(inquiry.amount * 100) !== order.total * 100) flags.add('amount_mismatch');
  const [paid] = await updateOrders(`id=eq.${order.id}&status=in.(pending,expired)`, {
    status: 'paid', paid_at: new Date().toISOString(), paid_amount: inquiry.amount ?? order.total, tran_ref: inquiry.tranRef ?? null,
    channel_code: inquiry.channelCode ?? null, resp_code: inquiry.respCode, resp_desc: inquiry.respDesc ?? null, test_payment: isTestMode(), flags: [...flags],
  });
  if (paid) console.info('Event order paid', paid.ref, source);
  const current = paid ?? await getOrder(`id=eq.${order.id}`);
  return current?.status === 'paid' ? sendOrderEmails(current) : current;
}

const CLAIM_STALE_MS = 5 * 60_000;

/** The guest's confirmation and the club's alert — once, whoever gets here first. */
export async function sendOrderEmails(order: OrderRow, siteUrl = process.env.SITE_URL || 'https://hulahula-golf.vercel.app'): Promise<OrderRow> {
  if (order.emailed_at || !emailConfigured()) return order;
  const stale = new Date(Date.now() - CLAIM_STALE_MS).toISOString();
  const [claimed] = await updateOrders(`id=eq.${order.id}&emailed_at=is.null&or=(emails_claimed_at.is.null,emails_claimed_at.lt.${stale})`, { emails_claimed_at: new Date().toISOString() });
  if (!claimed) return order;

  const site = await loadSite();
  const contact = contactLinks(site.club.contact);
  const view = await viewOf(claimed);
  const paidOrder: PaidOrder = { ...view, firstName: claimed.first_name, lastName: claimed.last_name, phone: claimed.phone, country: claimed.country, notes: claimed.notes, unitPrice: claimed.unit_price };
  const from = process.env.GOLF_EMAIL_FROM || 'Hula Hula Golf Club <golf@hulahularesort.com>';
  const url = siteUrl.replace(/\/$/, '');
  const results = await Promise.allSettled([
    claimed.email ? sendEmail({ from, to: [claimed.email], replyTo: contact.email, ...eventGuestEmail(paidOrder, url, site) }) : Promise.resolve({ ok: true, status: 200, body: '' }),
    sendEmail({ from, to: splitAddresses(process.env.GOLF_BOOKINGS_TO || contact.email), bcc: splitAddresses(process.env.GOLF_BOOKINGS_BCC ?? ''), replyTo: claimed.email || undefined, ...eventClubEmail(paidOrder, url, site) }),
  ]);
  const ok = results.every((r) => r.status === 'fulfilled' && r.value.ok);
  if (!ok) {
    console.error('Event order emails failed', claimed.ref, results.map((r) => (r.status === 'rejected' ? String(r.reason) : r.value.body)));
    await updateOrders(`id=eq.${claimed.id}`, { emails_claimed_at: null });
    return claimed;
  }
  const [done] = await updateOrders(`id=eq.${claimed.id}`, { emailed_at: new Date().toISOString() });
  return done ?? claimed;
}
