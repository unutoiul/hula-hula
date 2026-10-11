import type { VercelRequest, VercelResponse } from '@vercel/node';

const SITEMINDER_BASE = 'https://directbooking.siteminder.com/public-api/api';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Proxies SiteMinder's real-time pricing/availability quote for a stay so the
// hero search bar can tell "no rooms left" from "here's the price" before
// sending the guest on to the hosted booking engine to actually reserve and
// pay. Read-only — this API has no endpoint that creates or changes a
// booking, by design (SiteMinder keeps payment/PCI scope on its own hosted
// checkout).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SITEMINDER_API_KEY;
  const propertyId = process.env.SITEMINDER_PROPERTY_ID;
  if (!apiKey || !propertyId) {
    return res.status(500).json({ error: 'SiteMinder is not configured on the server' });
  }

  const { checkIn, checkOut, adults = '1', children = '0' } = req.query;
  if (typeof checkIn !== 'string' || typeof checkOut !== 'string' || !ISO_DATE.test(checkIn) || !ISO_DATE.test(checkOut)) {
    return res.status(400).json({ error: 'checkIn and checkOut are required, as YYYY-MM-DD' });
  }
  if (checkOut <= checkIn) {
    return res.status(400).json({ error: 'checkOut must be after checkIn' });
  }

  const params = new URLSearchParams({
    checkIn,
    checkOut,
    adults: String(adults),
    children: String(children),
  });

  try {
    const upstream = await fetch(`${SITEMINDER_BASE}/properties/${propertyId}/quotes?${params}`, {
      headers: { 'x-sm-api-key': apiKey, accept: 'application/json' },
    });
    if (upstream.status === 429) {
      return res.status(429).json({ error: 'Rate limited by SiteMinder, try again shortly' });
    }
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'SiteMinder request failed' });
    }
    const quotes = await upstream.json();
    // Quotes change with every date/occupancy combination — never cache these.
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(quotes);
  } catch {
    return res.status(502).json({ error: 'Could not reach SiteMinder' });
  }
}
