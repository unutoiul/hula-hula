// SiteMinder's Direct Booking API (read-only): property, room types, room
// rates and live quotes. Server-side only — the key must never reach a
// browser — and limited to 100 calls a minute per key, so everything that
// barely changes is memoised per function instance for an hour.

const BASE = 'https://directbooking.siteminder.com/public-api/api';
const CATALOG_TTL_MS = 60 * 60 * 1000;

export class SiteMinderError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

export interface SmPenaltyRule { daysPriorCheckIn: number; penaltyType: string; amount: number | null }
export interface SmPenalty { isDefault?: boolean; startDate: string | null; endDate: string | null; penaltyRules: SmPenaltyRule[] }

export interface SmProperty {
  name: string;
  currencyIsoCode: string;
  bookingEngineUrl: string | null;
  termsAndConditions: string | null;
  policies?: { checkInCheckOut?: { checkInStartTime: string | null; checkOutEndTime: string | null } };
  cancellationPenalties?: SmPenalty[];
}

export interface SmRoomType {
  uuid: string; name: string; description: string | null;
  roomSize: number | null; roomSizeUnit: string | null;
  maxOccupancy: number | null; maxAdultOccupancy: number | null; maxChildOccupancy: number | null;
}

export interface SmRoomRate {
  uuid: string; roomTypeUuid: string; ratePlanUuid: string; name: string; description: string | null;
  promotionOnly: boolean; breakfastIncluded: boolean; lunchIncluded: boolean; dinnerIncluded: boolean;
  maxOccupancy: number | null; maxAdultOccupancy: number | null; maxChildOccupancy: number | null;
  depositType: string | null; depositAmount: number | null; maxNumberOfRooms: number | null;
  cancellationPenalties?: SmPenalty[];
}

export interface SmBreakdownDay { date: string; gross: number; discount: { amount: number } | null; promoDiscount: { code: string; amount: number } | null }

export interface SmQuote {
  roomTypeUuid: string; roomRateUuid: string; lengthOfStay: number; availability: number;
  price: { gross: number; currency: string };
  depositType: string | null; depositAmount: number | null;
  breakdown: SmBreakdownDay[];
}

interface Page<T> { results: T[]; page: number; totalPages: number }

export interface Catalog { property: SmProperty; roomTypes: Map<string, SmRoomType>; rates: Map<string, SmRoomRate> }

function config() {
  const apiKey = process.env.SITEMINDER_API_KEY;
  const propertyId = process.env.SITEMINDER_PROPERTY_ID;
  if (!apiKey || !propertyId) throw new SiteMinderError(500, 'SiteMinder is not configured on the server');
  return { apiKey, propertyId };
}

async function smGet<T>(path: string): Promise<T> {
  const { apiKey, propertyId } = config();
  const response = await fetch(`${BASE}/properties/${propertyId}${path}`, { headers: { 'x-sm-api-key': apiKey, accept: 'application/json' } });
  if (!response.ok) {
    const trace = response.headers.get('x-sm-trace-token');
    console.error('SiteMinder request failed', response.status, path.split('?')[0], trace ?? '');
    throw new SiteMinderError(response.status, response.status === 429 ? 'Rate limited by SiteMinder' : 'SiteMinder request failed');
  }
  return response.json() as Promise<T>;
}

async function allPages<T>(path: string): Promise<T[]> {
  const results: T[] = [];
  for (let page = 1; ; page++) {
    const data = await smGet<Page<T>>(`${path}?perPage=50&page=${page}`);
    results.push(...data.results);
    if (page >= data.totalPages) return results;
  }
}

async function loadCatalog(): Promise<Catalog> {
  const [property, roomTypes, rates] = await Promise.all([
    smGet<SmProperty>(''),
    allPages<SmRoomType>('/room-types'),
    allPages<SmRoomRate>('/room-rates'),
  ]);
  // The list leaves out cancellation penalties; only the single-rate endpoint
  // has them. A property has a handful of rates, so fetch each once an hour.
  const detailed = await Promise.all(rates.map((rate) => smGet<SmRoomRate>(`/room-rates/${rate.uuid}`).catch(() => rate)));
  return {
    property,
    roomTypes: new Map(roomTypes.map((roomType) => [roomType.uuid, roomType])),
    rates: new Map(detailed.map((rate) => [rate.uuid, rate])),
  };
}

let catalog: { loadedAt: number; promise: Promise<Catalog> } | null = null;

export function getCatalog(): Promise<Catalog> {
  if (!catalog || Date.now() - catalog.loadedAt > CATALOG_TTL_MS) {
    const promise = loadCatalog();
    catalog = { loadedAt: Date.now(), promise };
    promise.catch(() => { if (catalog?.promise === promise) catalog = null; });
  }
  return catalog.promise;
}

export interface QuoteSearch { checkIn: string; checkOut: string; adults: number; children: number; promo?: string }

export function getQuotes({ checkIn, checkOut, adults, children, promo }: QuoteSearch): Promise<SmQuote[]> {
  const params = new URLSearchParams({ checkIn, checkOut, adults: String(adults), children: String(children), infants: '0', withBreakdown: 'true' });
  if (promo) params.set('promocode', promo);
  return smGet<SmQuote[]>(`/quotes?${params}`);
}
