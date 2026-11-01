import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods } from './_lib/http.ts';
import { loadSite } from './_lib/site.ts';
import { activeOffers } from '../src/booking/offers.ts';

// GET /api/site — the activities, prices, rental clubs and club settings
// every page is built from. Do not serve stale promotions after staff hide them.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    const site = await loadSite({ fallback: false });
    return res.status(200).json({ ...site, club: { ...site.club, offers: activeOffers(site.club.offers) } });
  } catch (error) {
    console.error('Public site content unavailable', error);
    // The browser keeps its last good data; a failed read must not restore default offers.
    return res.status(503).json({ error: 'Club information is temporarily unavailable.' });
  }
}
