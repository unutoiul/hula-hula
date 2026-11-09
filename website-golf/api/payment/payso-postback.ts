import type { VercelRequest, VercelResponse } from '@vercel/node';
import { confirmOrderPayment } from '../_lib/events.ts';
import { allowMethods, queryString, readJsonBody } from '../_lib/http.ts';
import { PAYMENT_REF_PATTERN } from '../_lib/ids.ts';

// /api/payment/payso-postback — Payso's server-to-server notice that a payment
// succeeded: a GET to the URL we send with each payment, or a form POST to the
// default URL in Payso's control panel. It carries no signature, so it's only
// a prompt: confirmOrderPayment() asks Payso's inquiry API before anything
// changes. All the work happens before we answer, because the function may be
// frozen as soon as the response is sent. The daily cron and the order page's
// polling cover a notification that never comes.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  res.setHeader('Cache-Control', 'no-store');

  const posted = readJsonBody(req).refno;
  const refno = queryString(req, 'refno') || (typeof posted === 'string' ? posted : '');
  if (!PAYMENT_REF_PATTERN.test(refno)) return res.status(400).json({ error: 'Invalid notification' });

  try {
    await confirmOrderPayment(refno, 'webhook');
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Payso notification could not be processed', refno, error);
    return res.status(500).json({ error: 'Try again later' });
  }
}
