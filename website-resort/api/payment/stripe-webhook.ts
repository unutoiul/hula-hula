import type { VercelRequest, VercelResponse } from '@vercel/node';
import { confirmPayment } from '../_lib/finalize.js';
import { allowMethods, readJsonBody } from '../_lib/http.js';
import { retrieveEvent, type StripeEvent } from '../_lib/stripe.js';

// POST /api/payment/stripe-webhook — Stripe's event notification. The body
// isn't trusted: only its event id is read, and the event is fetched back from
// Stripe with our own key, which proves it's real without a signing secret.
// Even then, confirmPayment() asks Stripe for the booking's own Checkout
// session before anything changes. A 500 makes Stripe retry; the confirmation
// page's polling and the nightly cron cover an event that never arrives.

const HANDLED = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
  'charge.refunded',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['POST'])) return;
  res.setHeader('Cache-Control', 'no-store');

  const id = readJsonBody(req).id;
  if (typeof id !== 'string' || !/^evt_\w{8,}$/.test(id)) return res.status(400).json({ error: 'Invalid event' });

  let event: StripeEvent;
  try {
    event = await retrieveEvent(id);
  } catch (error) {
    console.warn('Ignored a Stripe event that could not be fetched back', id, String(error));
    return res.status(400).json({ error: 'Unknown event' });
  }
  if (!HANDLED.has(event.type)) return res.status(200).json({ ok: true, ignored: event.type });

  // Every Checkout session and payment the website starts carries its invoice number.
  const invoiceNo = event.data.object.metadata?.invoice_no;
  if (!invoiceNo) return res.status(200).json({ ok: true, ignored: 'not a website booking' });

  try {
    await confirmPayment(invoiceNo, 'webhook');
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Stripe event could not be processed', id, invoiceNo, error);
    return res.status(500).json({ error: 'Try again later' });
  }
}
