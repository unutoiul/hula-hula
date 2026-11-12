import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getByRef } from '../_lib/bookings.js';
import { confirmPayment } from '../_lib/finalize.js';
import { allowMethods, readJsonBody } from '../_lib/http.js';
import { REF_PATTERN } from '../_lib/ids.js';
import { canInquire } from '../_lib/payments.js';

// Staff can check a portal change immediately without waiting for a webhook
// or nightly reconciliation. Authorization uses the caller's JWT and the same
// database is_admin() check as the booking desk, never the service-role key.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['POST'])) return;
  res.setHeader('Cache-Control', 'no-store');
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return res.status(401).json({ error: 'Please sign in again.' });
  const ref = readJsonBody(req)?.ref;
  if (typeof ref !== 'string' || !REF_PATTERN.test(ref)) return res.status(400).json({ error: 'Invalid booking reference.' });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'Payment checks are not configured.' });

  try {
    const permission = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/is_admin`, {
      method: 'POST', headers: { apikey: key, Authorization: authorization, 'Content-Type': 'application/json' },
      body: '{}', signal: AbortSignal.timeout(15_000),
    });
    if (permission.status === 401) return res.status(401).json({ error: 'Please sign in again.' });
    if (permission.status === 403) return res.status(403).json({ error: 'Admin access required.' });
    if (!permission.ok) throw new Error(`Admin verification failed (${permission.status})`);
    if (await permission.json() !== true) return res.status(403).json({ error: 'Admin access required.' });

    const booking = await getByRef(ref);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (!canInquire(booking)) return res.status(409).json({ error: 'This booking has no checkout in the current Stripe mode. Its saved payment details are unchanged.' });
    const updated = await confirmPayment(booking.invoice_no, 'admin');
    if (!updated) return res.status(404).json({ error: 'Booking not found.' });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Admin payment check failed', ref, error);
    return res.status(502).json({ error: 'Could not check the payment right now. Please try again.' });
  }
}
