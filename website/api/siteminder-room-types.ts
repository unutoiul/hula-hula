import type { VercelRequest, VercelResponse } from '@vercel/node';

const SITEMINDER_BASE = 'https://directbooking.siteminder.com/public-api/api';

interface RoomTypesResponse {
  results: { uuid: string; name: string }[];
}

// Room type names, so the search results can show "Deluxe Garden Street View"
// instead of a bare roomTypeUuid from the quotes endpoint. This barely
// changes, so it's cached the same way as the property summary.
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
    const upstream = await fetch(`${SITEMINDER_BASE}/properties/${propertyId}/room-types?perPage=50`, {
      headers: { 'x-sm-api-key': apiKey, accept: 'application/json' },
    });
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'SiteMinder request failed' });
    }
    const data = await upstream.json() as RoomTypesResponse;
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data.results.map((rt) => ({ uuid: rt.uuid, name: rt.name })));
  } catch {
    return res.status(502).json({ error: 'Could not reach SiteMinder' });
  }
}
