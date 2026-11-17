import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteWhere, listWhere, updateWhere } from '../_lib/bookings.js';
import { confirmPayment } from '../_lib/finalize.js';
import { allowMethods } from '../_lib/http.js';
import { canInquire, stripeCheckoutPrefix } from '../_lib/payments.js';

const GRACE_MS = 2 * 3600_000;
const KEEP_DAYS = 30;

// GET /api/cron/reconcile — run nightly by Vercel Cron (vercel.json), which
// sends CRON_SECRET as a bearer token. It sweeps up whatever the webhook and
// the confirmation page didn't finish:
//   • pending bookings well past their payment window: one last check with
//     Stripe, then expired
//   • paid/delivered bookings: check for portal voids/refunds, retry hand-off
//   • expired and failed bookings (never paid) older than 30 days: delete,
//     guest details and all. Paid bookings stay, for /admin → Bookings.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized' });

  const counts = { checked: 0, expired: 0, redelivered: 0, reversed: 0, deleted: 0, errors: 0 };

  const stale = await listWhere(`status=eq.pending&expires_at=lt.${new Date(Date.now() - GRACE_MS).toISOString()}&limit=100`);
  for (const row of stale) {
    counts.checked++;
    try {
      const after = canInquire(row) ? await confirmPayment(row.invoice_no, 'cron') : row;
      if (after?.status === 'pending') {
        const expired = await updateWhere(`id=eq.${row.id}&status=eq.pending`, { status: 'expired' });
        counts.expired += expired.length;
      }
    } catch (error) {
      counts.errors++;
      console.error('Cron: could not settle pending booking', row.ref, error);
    }
  }

  // Oldest checked first so subsequent runs progress through every booking,
  // including archived stays. Portal changes need not trigger a webhook.
  for (const row of await listWhere(`status=in.(paid,delivered)&payment_token=like.${stripeCheckoutPrefix()}*&or=(resp_code.is.null,resp_code.not.in.(4047,4120))&order=last_inquiry_at.asc.nullsfirst,created_at.asc&limit=100`)) {
    counts.checked++;
    try {
      await updateWhere(`id=eq.${row.id}`, { last_inquiry_at: new Date().toISOString() });
      const after = await confirmPayment(row.invoice_no, 'cron');
      if (after?.resp_code === '4047' || after?.resp_code === '4120') counts.reversed++;
      else if (row.status === 'paid' && after?.status === 'delivered') counts.redelivered++;
    } catch (error) {
      counts.errors++;
      console.error('Cron: payment reconciliation failed', row.ref, error);
    }
  }

  counts.deleted += await deleteWhere(`status=in.(expired,failed)&created_at=lt.${new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString()}`);

  console.info('Cron reconcile', counts);
  return res.status(200).json(counts);
}
