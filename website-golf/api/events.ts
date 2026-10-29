import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { EventsResponse } from '../src/booking/contract.ts';
import { loadPublicEvents } from './_lib/events.ts';
import { allowMethods, queryString } from './_lib/http.ts';
import { isTestMode } from './_lib/twoc2p.ts';

// GET /api/events — published events that haven't finished, with each
// package's places left; /api/events?slug=pro-day — just that one.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=60');
  const slug = queryString(req, 'slug');
  if (slug && !/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(404).json({ error: 'We couldn’t find that event.' });
  try {
    const events = await loadPublicEvents(slug || undefined);
    if (slug && !events.length) return res.status(404).json({ error: 'We couldn’t find that event.' });
    return res.status(200).json({ events, testPayments: isTestMode() } satisfies EventsResponse);
  } catch (error) {
    console.error('Events failed', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ error: 'We couldn’t load the events just now.' });
  }
}
