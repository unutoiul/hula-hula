import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods, queryString, readJsonBody } from '../_lib/http.js';
import { ACCESS_KEY_PATTERN, REF_PATTERN } from '../_lib/ids.js';
import { decodeFrontendResponse } from '../_lib/twoc2p.js';

// /api/payment/2c2p-return — where 2C2P sends the guest's browser after a
// payment that left the page (bank 3-D Secure, QR and app payments). 2C2P
// form-posts here, which a single-page app can't receive, so this only
// forwards the guest to /book/confirmation; that page checks the real status.
// Nothing here is trusted or changes anything.
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  const { invoiceNo, respCode } = decodeFrontendResponse(readJsonBody(req).paymentResponse);

  let ref = queryString(req, 'ref');
  // If 2C2P ever drops our query string, the invoice number ("WEB" + ref) still leads back.
  if (!REF_PATTERN.test(ref) && typeof invoiceNo === 'string' && REF_PATTERN.test(invoiceNo.slice(3))) ref = invoiceNo.slice(3);
  const key = queryString(req, 'key');

  const params = new URLSearchParams();
  if (REF_PATTERN.test(ref)) params.set('ref', ref);
  if (ACCESS_KEY_PATTERN.test(key)) params.set('key', key);
  if (typeof respCode === 'string' && /^\w{1,8}$/.test(respCode)) params.set('r', respCode);

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Location', `/book/confirmation${params.size ? `?${params}` : ''}`);
  return res.status(303).end();
}
