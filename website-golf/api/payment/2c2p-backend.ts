import type { VercelRequest, VercelResponse } from '@vercel/node';
import { confirmOrderPayment } from '../_lib/events.ts';
import { allowMethods, readJsonBody } from '../_lib/http.ts';
import { verifyNotification } from '../_lib/twoc2p.ts';

// POST /api/payment/2c2p-backend — 2C2P's server-to-server payment
// notification (the backendReturnUrl). The signature proves it's from 2C2P;
// even so, confirmOrderPayment() asks 2C2P's inquiry API before anything
// changes. All the work happens before we answer, because the function may
// be frozen as soon as the response is sent. A 500 lets 2C2P try again; the
// daily cron and the order page's polling cover a notification that never comes.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['POST'])) return;
  res.setHeader('Cache-Control', 'no-store');

  let invoiceNo: string | undefined;
  try {
    invoiceNo = verifyNotification(readJsonBody(req)).invoiceNo;
  } catch (error) {
    console.warn('Ignored a 2C2P notification that failed verification', String(error));
    return res.status(400).json({ error: 'Invalid notification' });
  }
  if (!invoiceNo) return res.status(400).json({ error: 'Invalid notification' });

  try {
    await confirmOrderPayment(invoiceNo, 'webhook');
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('2C2P notification could not be processed', invoiceNo, error);
    return res.status(500).json({ error: 'Try again later' });
  }
}
