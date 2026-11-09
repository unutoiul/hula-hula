import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods, queryString } from '../_lib/http.ts';
import { ACCESS_KEY_PATTERN, BOOKING_REF_PATTERN, ORDER_REF_PATTERN } from '../_lib/ids.ts';

// /api/payment/payso-return — where Payso sends the guest's browser after
// paying. A payment provider may form-post here, which a single-page app can't
// receive, so this only forwards the guest to their confirmation page (a tee
// time's, ?booking=, or an event order's, ?ref=); that page checks the real
// status. Nothing here is trusted or changes anything.
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  const booking = queryString(req, 'booking');
  const ref = queryString(req, 'ref');
  const key = queryString(req, 'key');
  const isBooking = BOOKING_REF_PATTERN.test(booking);

  const params = new URLSearchParams();
  if (isBooking) params.set('ref', booking);
  else if (ORDER_REF_PATTERN.test(ref)) params.set('ref', ref);
  if (ACCESS_KEY_PATTERN.test(key)) params.set('key', key);

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Location', `${isBooking ? '/book/confirmation' : '/events/order'}${params.size ? `?${params}` : ''}`);
  return res.status(303).end();
}
