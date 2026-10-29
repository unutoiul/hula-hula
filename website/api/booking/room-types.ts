import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods } from '../_lib/http.js';
import { getCatalog } from '../_lib/siteminder.js';

// GET /api/booking/room-types — SiteMinder's room types as [{ uuid, name }],
// for /admin → Offers to choose which rooms an offer covers. Public facts
// (the same names the booking page shows), cached at the edge for an hour.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  try {
    const { roomTypes } = await getCatalog();
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json([...roomTypes.values()].map((rt) => ({ uuid: rt.uuid, name: rt.name })).sort((a, b) => a.name.localeCompare(b.name)));
  } catch (error) {
    console.error('Room types lookup failed', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Could not load room types' });
  }
}
