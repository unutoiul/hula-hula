import { timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ErrorResponse, EventOrderStarted, EventOrderView } from '../src/booking/contract.ts';
import { DbError, rest } from './_lib/db.ts';
import { confirmOrderPayment, getOrder, loadPublicEvents, updateOrders, viewOf, type OrderRow } from './_lib/events.ts';
import { allowMethods, queryString, readJsonBody, siteUrl } from './_lib/http.ts';
import { ACCESS_KEY_PATTERN, invoiceNoFor, newAccessKey, newOrderRef, ORDER_REF_PATTERN, sha256Hex } from './_lib/ids.ts';
import { createPaymentToken, isConfigured as paymentConfigured, isTestMode } from './_lib/twoc2p.ts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\d\s.-]{6,30}$/;
const HOLD_MINUTES = 20;
const INQUIRY_EVERY_MS = 5_000;

// /api/event-order
//   POST — buy event packages: checks the event, package and places again,
//          holds the places for HOLD_MINUTES (golf_event_reserve), and asks
//          2C2P for a payment page for exactly that amount. The browser goes
//          there; 2C2P sends it back through /api/payment/2c2p-return.
//   GET ?ref&key — the order's status for /events/order. While it's pending
//          this asks 2C2P directly (at most every few seconds), so a
//          confirmation never depends on 2C2P's notification arriving.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  res.setHeader('Cache-Control', 'no-store');
  return req.method === 'POST' ? start(req, res) : status(req, res);
}

async function start(req: VercelRequest, res: VercelResponse) {
  const fail = (code: number, error: string, kind?: ErrorResponse['code']) => res.status(code).json({ error, ...(kind && { code: kind }) } satisfies ErrorResponse);
  const body = readJsonBody(req);
  if (body.hp) return fail(400, 'Please try again.');
  if (typeof body.elapsedMs === 'number' && body.elapsedMs < 3000) return fail(429, 'Please wait a few seconds and try again.');
  if (!paymentConfigured()) return fail(503, 'Online payment isn’t switched on yet — please WhatsApp us and we’ll book you in.', 'unavailable');

  const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
  const slug = text(body.slug, 60);
  const quantity = Number(body.quantity);
  const g = (body.guest ?? {}) as Record<string, unknown>;
  const guest = { firstName: text(g.firstName, 60), lastName: text(g.lastName, 60), email: text(g.email, 120).toLowerCase(), phone: text(g.phone, 30), country: text(g.country, 2).toUpperCase(), notes: text(g.notes, 1000) };
  if (!guest.firstName || !guest.lastName || !EMAIL.test(guest.email) || !PHONE.test(guest.phone) || !/^[A-Z]{2}$/.test(guest.country)) {
    return fail(400, 'Please check your name, email, phone and country.', 'invalid');
  }

  try {
    const [event] = /^[a-z0-9-]{1,60}$/.test(slug) ? await loadPublicEvents(slug) : [];
    const pack = event?.packages.find((p) => p.id === body.packageId);
    if (!event || !pack) return fail(404, 'We couldn’t find that package. Please reload the page.', 'invalid');
    if (!event.salesOpen) return fail(409, 'Sales for this event are closed.', 'sold_out');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > pack.maxPerOrder) return fail(400, `You can book 1 to ${pack.maxPerOrder} at a time.`, 'invalid');
    if (quantity > pack.left) return fail(409, pack.left ? `Only ${pack.left} left — please choose fewer.` : 'Sorry — that package has just sold out.', 'sold_out');

    const key = newAccessKey();
    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000);
    let ref = newOrderRef();
    let orderId: string;
    for (let attempt = 0; ; attempt++) {
      try {
        orderId = await rest<string>('/rpc/golf_event_reserve', {
          method: 'POST',
          body: { p_order: {
            ref, invoice_no: invoiceNoFor(ref), access_key_hash: sha256Hex(key), package_id: pack.id, quantity,
            first_name: guest.firstName, last_name: guest.lastName, email: guest.email, phone: guest.phone, country: guest.country, notes: guest.notes,
            source: 'online', test_payment: isTestMode(), expires_at: expiresAt.toISOString(),
          } },
        });
        break;
      } catch (error) {
        // A reference already taken (one in a billion) — draw another once.
        if (error instanceof DbError && error.message.includes('duplicate') && attempt === 0) { ref = newOrderRef(); continue; }
        throw error;
      }
    }

    const site = siteUrl(req);
    try {
      const { webPaymentUrl, paymentToken } = await createPaymentToken({
        invoiceNo: invoiceNoFor(ref),
        description: `Hula Hula Golf Club · ${event.title} · ${pack.name} × ${quantity} · ${ref}`,
        amount: pack.price * quantity, currencyCode: 'THB', paymentExpiry: expiresAt,
        frontendReturnUrl: `${site}/api/payment/2c2p-return?ref=${ref}&key=${key}`,
        backendReturnUrl: `${site}/api/payment/2c2p-backend`,
        ref, guest: { name: `${guest.firstName} ${guest.lastName}`, email: guest.email, country: guest.country },
      });
      await updateOrders(`id=eq.${orderId}`, { payment_token: paymentToken });
      console.info('Event order pending payment', ref, event.slug, pack.name, quantity);
      return res.status(200).json({ ref, key, webPaymentUrl } satisfies EventOrderStarted);
    } catch (error) {
      console.error('Event order: 2C2P payment token failed', ref, error);
      await updateOrders(`id=eq.${orderId}`, { status: 'failed' }).catch(() => {});
      return fail(502, 'Our payment provider isn’t responding — please try again in a few minutes.', 'unavailable');
    }
  } catch (error) {
    if (error instanceof DbError && error.message.includes('sold out')) return fail(409, 'Sorry — that package has just sold out.', 'sold_out');
    console.error('Event order failed', error);
    return fail(500, 'We couldn’t start your order just now. Please try again, or WhatsApp us.');
  }
}

// 2C2P answers that mean "nothing final yet"; anything else that isn't a
// success is a decline or cancellation of the last attempt.
const NOT_FINAL = new Set(['0001', '0999', '2001', '2002', '2003']);

async function status(req: VercelRequest, res: VercelResponse) {
  const notFound = () => res.status(404).json({ error: 'We couldn’t find that order.' });
  const ref = queryString(req, 'ref');
  const key = queryString(req, 'key');
  if (!ORDER_REF_PATTERN.test(ref) || !ACCESS_KEY_PATTERN.test(key)) return notFound();
  try {
    let order: OrderRow | null = await getOrder(`ref=eq.${ref}`);
    if (!order?.access_key_hash || !sameHash(sha256Hex(key), order.access_key_hash)) return notFound();
    if (order.status === 'pending' && order.invoice_no) {
      const [won] = await updateOrders(`id=eq.${order.id}&status=eq.pending&or=(last_inquiry_at.is.null,last_inquiry_at.lt.${new Date(Date.now() - INQUIRY_EVERY_MS).toISOString()})`, { last_inquiry_at: new Date().toISOString() });
      if (won) order = (await confirmOrderPayment(order.invoice_no, 'status').catch((error) => { console.error('Order status: inquiry failed', ref, error); return null; })) ?? order;
    }
    const view: EventOrderView = await viewOf(order);
    const declined = order.status === 'pending' && !!order.resp_code && order.resp_code !== '0000' && !NOT_FINAL.has(order.resp_code);
    const expired = order.status === 'pending' && !!order.expires_at && Date.now() > Date.parse(order.expires_at) + 60_000;
    return res.status(200).json({
      ...view,
      status: declined ? 'failed' : expired ? 'expired' : view.status,
      ...(declined && { failureReason: order.resp_code === '0003' ? 'The payment was cancelled.' : order.resp_desc ? `The payment was declined: ${order.resp_desc}.` : 'The payment was declined.' }),
    } satisfies EventOrderView);
  } catch (error) {
    console.error('Order status failed', ref, error);
    return res.status(502).json({ error: 'Could not check your order right now.' });
  }
}

function sameHash(a: string, b: string) {
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
