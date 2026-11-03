import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteWhere, listWhere, updateWhere } from '../_lib/bookings.js';
import { confirmPayment, deliver } from '../_lib/finalize.js';
import { allowMethods } from '../_lib/http.js';

const GRACE_MS = 2 * 3600_000;
const KEEP_DAYS = 30;

// GET /api/cron/reconcile — run nightly by Vercel Cron (vercel.json), which
// sends CRON_SECRET as a bearer token. It sweeps up whatever the webhook and
// the confirmation page didn't finish:
//   • pending bookings well past their payment window: one last check with
//     2C2P, then expired
//   • paid bookings whose hand-off email failed: try again
//   • expired and failed bookings (never paid) older than 30 days: delete,
//     guest details and all. Paid bookings stay, for /admin → Bookings.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized' });

  const counts = { checked: 0, expired: 0, redelivered: 0, deleted: 0, errors: 0 };

  const stale = await listWhere(`status=eq.pending&expires_at=lt.${new Date(Date.now() - GRACE_MS).toISOString()}&limit=100`);
  for (const row of stale) {
    counts.checked++;
    try {
      const after = await confirmPayment(row.invoice_no, 'cron');
      if (after?.status === 'pending') {
        const expired = await updateWhere(`id=eq.${row.id}&status=eq.pending`, { status: 'expired' });
        counts.expired += expired.length;
      }
    } catch (error) {
      counts.errors++;
      console.error('Cron: could not settle pending booking', row.ref, error);
    }
  }

  for (const row of await listWhere('status=eq.paid&limit=100')) {
    try {
      const after = await deliver(row);
      if (after.status === 'delivered') counts.redelivered++;
    } catch (error) {
      counts.errors++;
      console.error('Cron: redelivery failed', row.ref, error);
    }
  }

  counts.deleted += await deleteWhere(`status=in.(expired,failed)&created_at=lt.${new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString()}`);

  console.info('Cron reconcile', counts);
  return res.status(200).json(counts);
}
