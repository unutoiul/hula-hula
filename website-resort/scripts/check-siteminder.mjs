// Read-only smoke test. Uses server credentials from .env.local and never
// creates a booking, charges a card, writes to the database, or sends email.
// Run: node --env-file=.env.local scripts/check-siteminder.mjs 2026-12-10 2026-12-11
import assert from 'node:assert/strict';
import { tsImport } from 'tsx/esm/api';

const key = process.env.SITEMINDER_API_KEY;
const propertyId = process.env.SITEMINDER_PROPERTY_ID;
assert.ok(key && propertyId, 'SITEMINDER_API_KEY and SITEMINDER_PROPERTY_ID must be configured');

const [checkIn, checkOut] = process.argv.slice(2);
assert.ok(checkIn && checkOut && /^\d{4}-\d{2}-\d{2}$/.test(checkIn) && /^\d{4}-\d{2}-\d{2}$/.test(checkOut) && checkOut > checkIn,
  'Pass check-in and check-out dates: scripts/check-siteminder.mjs YYYY-MM-DD YYYY-MM-DD');
const originalFetch = globalThis.fetch;
const requests = [];
globalThis.fetch = async (input, init) => {
  const url = new URL(String(input));
  assert.equal(url.origin, 'https://directbooking.siteminder.com');
  assert.equal(init?.method ?? 'GET', 'GET', 'This diagnostic must remain read-only');
  const response = await originalFetch(input, { ...init, signal: AbortSignal.timeout(20_000) });
  requests.push({ path: url.pathname.replace(propertyId, '{propertyId}'), status: response.status });
  return response;
};

try {
  const { getCatalog, getQuotes } = await tsImport('../api/_lib/siteminder.ts', import.meta.url);
  const catalog = await getCatalog();
  assert.ok(catalog.property.name);
  assert.ok(catalog.roomTypes.size > 0, 'No room types returned');
  assert.ok(catalog.rates.size > 0, 'No room rates returned');
  const quotes = await getQuotes({ checkIn, checkOut, adults: 2, children: 0 });
  assert.ok(Array.isArray(quotes), 'Quotes must be an array');
  for (const quote of quotes) {
    assert.ok(catalog.roomTypes.has(quote.roomTypeUuid), 'Quote room type is missing from the catalog');
    assert.ok(catalog.rates.has(quote.roomRateUuid), 'Quote rate is missing from the catalog');
    assert.ok(Number.isFinite(quote.price.gross));
  }
  console.log(JSON.stringify({
    property: catalog.property.name,
    currency: catalog.property.currencyIsoCode,
    propertyMatchesProvidedId: propertyId === '45ff11cb-12fb-4e6a-ab72-c9d8f285c798',
    roomTypes: catalog.roomTypes.size,
    roomRates: catalog.rates.size,
    stay: { checkIn, checkOut, adults: 2, children: 0 },
    quotes: quotes.length,
    availableQuotes: quotes.filter(quote => quote.availability > 0).length,
    bookingEngineConfigured: Boolean(catalog.property.bookingEngineUrl),
    reservationDelivery: 'email for manual SiteMinder entry',
    requests,
    writes: 0,
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ error: error instanceof Error ? error.message : 'Smoke test failed', requests, writes: 0 }, null, 2));
  process.exitCode = 1;
} finally {
  globalThis.fetch = originalFetch;
}
