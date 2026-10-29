import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods } from './_lib/http.ts';
import { loadSite } from './_lib/site.ts';

// GET /api/site — the activities, prices, rental clubs and club settings
// every page is built from. Cached at the edge for a few seconds, so a change
// saved in /admin shows on the website within about half a minute.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=300');
  return res.status(200).json(await loadSite());
}
