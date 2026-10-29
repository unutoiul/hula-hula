import type { VercelRequest, VercelResponse } from '@vercel/node';
import { confirmOrderPayment, sendOrderEmails, updateOrders, type OrderRow } from '../_lib/events.ts';
import { rest } from '../_lib/db.ts';
import { allowMethods } from '../_lib/http.ts';

// GET /api/cron/reconcile — run daily by Vercel Cron (vercel.json), which
// sends CRON_SECRET as a bearer token when it's set. It sweeps up what the
// webhook and the order page didn't finish:
//   • event orders past their payment window: one last check with 2C2P,
//     then marked expired if still unpaid (which frees their places)
//   • paid orders whose emails failed: try again
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized' });

  const counts = { checked: 0, paid: 0, expired: 0, emailed: 0, errors: 0 };
  const stale = await rest<OrderRow[]>(`/golf_event_orders?select=*&status=eq.pending&invoice_no=not.is.null&expires_at=lt.${new Date(Date.now() - 15 * 60_000).toISOString()}&limit=100`);
  for (const order of stale) {
    counts.checked++;
    try {
      const after = await confirmOrderPayment(order.invoice_no!, 'cron');
      if (after?.status === 'paid') counts.paid++;
      else if (after?.status === 'pending') counts.expired += (await updateOrders(`id=eq.${order.id}&status=eq.pending`, { status: 'expired' })).length;
    } catch (error) {
      counts.errors++;
      console.error('Cron: could not settle event order', order.ref, error);
    }
  }
  for (const order of await rest<OrderRow[]>('/golf_event_orders?select=*&status=eq.paid&emailed_at=is.null&limit=50')) {
    if ((await sendOrderEmails(order)).emailed_at) counts.emailed++;
  }
  console.info('Cron reconcile', counts);
  return res.status(200).json(counts);
}
