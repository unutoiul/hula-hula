import type { VercelRequest, VercelResponse } from '@vercel/node';

const SITEMINDER_BASE = 'https://directbooking.siteminder.com/public-api/api';

interface SiteMinderProperty {
  name: string;
  currencyIsoCode: string;
  bookingEngineUrl: string | null;
}

// Public-facing property summary (name + the hosted booking-engine URL guests
// get sent to complete a reservation). Deliberately narrow: the upstream
// response also carries legal text (terms & conditions, cancellation policy)
// that the search bar has no use for, so we don't forward it.
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

  try {
    const upstream = await fetch(`${SITEMINDER_BASE}/properties/${propertyId}`, {
      headers: { 'x-sm-api-key': apiKey, accept: 'application/json' },
    });
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'SiteMinder request failed' });
    }
    const data = await upstream.json() as SiteMinderProperty;
    // This barely changes call to call — cache it at the edge for an hour
    // rather than hitting SiteMinder on every page load.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({
      name: data.name,
      currencyIsoCode: data.currencyIsoCode,
      bookingEngineUrl: data.bookingEngineUrl ?? null,
    });
  } catch {
    return res.status(502).json({ error: 'Could not reach SiteMinder' });
  }
}
