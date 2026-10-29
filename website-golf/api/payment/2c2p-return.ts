import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods, queryString, readJsonBody } from '../_lib/http.ts';
import { ACCESS_KEY_PATTERN, ORDER_REF_PATTERN } from '../_lib/ids.ts';
import { decodeFrontendResponse } from '../_lib/twoc2p.ts';

// /api/payment/2c2p-return — where 2C2P sends the guest's browser after
// paying. 2C2P form-posts here, which a single-page app can't receive, so
// this only forwards the guest to /events/order; that page checks the real
// status. Nothing here is trusted or changes anything.
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  const { invoiceNo } = decodeFrontendResponse(readJsonBody(req).paymentResponse);

  let ref = queryString(req, 'ref');
  // If 2C2P ever drops our query string, the invoice number ("GEV" + ref) still leads back.
  if (!ORDER_REF_PATTERN.test(ref) && typeof invoiceNo === 'string' && ORDER_REF_PATTERN.test(invoiceNo.slice(3))) ref = invoiceNo.slice(3);
  const key = queryString(req, 'key');

  const params = new URLSearchParams();
  if (ORDER_REF_PATTERN.test(ref)) params.set('ref', ref);
  if (ACCESS_KEY_PATTERN.test(key)) params.set('key', key);

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Location', `/events/order${params.size ? `?${params}` : ''}`);
  return res.status(303).end();
}
