import type { VercelRequest, VercelResponse } from '@vercel/node';
import { softHolds } from '../_lib/bookings.js';
import { loadDeals } from '../_lib/deals.js';
import { dbConfigured } from '../_lib/db.js';
import { defaultDeposit } from '../_lib/deposit.js';
import { allowMethods } from '../_lib/http.js';
import { buildAvailability, priceQuotes } from '../_lib/rooms.js';
import { parseStay } from '../_lib/search.js';
import { getCatalog, getQuotes, SiteMinderError } from '../_lib/siteminder.js';

// GET /api/booking/availability?checkIn&checkOut&adults&children&promo
// The rooms and rates the booking page lists for one stay: SiteMinder's live
// quote, joined with each rate's meal plan, deposit and cancellation terms.
// Live prices — never cached.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  res.setHeader('Cache-Control', 'no-store');

  const stay = parseStay(req.query);
  if ('error' in stay) return res.status(400).json({ error: stay.error });

  try {
    const [quotes, catalog, holds, deals] = await Promise.all([
      getQuotes(stay),
      getCatalog(),
      // Before Supabase is set up there's nothing of ours to hold back.
      dbConfigured() ? softHolds(stay.checkIn, stay.checkOut).catch((error) => { console.error('Could not read soft holds', error); return new Map<string, number>(); }) : new Map<string, number>(),
      loadDeals(),
    ]);
    const priced = priceQuotes(quotes, catalog, holds, stay.checkIn, stay.promo, defaultDeposit(), deals);
    return res.status(200).json(buildAvailability(priced, catalog, stay));
  } catch (error) {
    if (error instanceof SiteMinderError && error.status === 429) return res.status(429).json({ error: 'We’re a little busy — please try again in a minute.' });
    console.error('Availability lookup failed', error);
    return res.status(502).json({ error: 'Could not check availability right now — please try again.' });
  }
}
