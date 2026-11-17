// Validating a stay search (dates, guests, promo code), shared by the
// availability lookup and booking creation so both accept exactly the same.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const PROMO_PATTERN = /^[\w-]{1,40}$/;
export const MAX_NIGHTS = 31; // SiteMinder quotes at most 31 nights at a time
export const MAX_ADULTS = 12;
export const MAX_CHILDREN = 8;

export interface StaySearch { checkIn: string; checkOut: string; nights: number; adults: number; children: number; promo?: string }

/** Today's date at the resort, YYYY-MM-DD. */
export const todayInBangkok = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());

export const nightsBetween = (checkIn: string, checkOut: string) => Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000);

const isRealDate = (value: string) => ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().startsWith(value);

const toInt = (value: unknown, fallback: number) => {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : fallback;
  return Number.isInteger(n) ? n : NaN;
};

export function parseStay(input: { checkIn?: unknown; checkOut?: unknown; adults?: unknown; children?: unknown; promo?: unknown }): StaySearch | { error: string } {
  const checkIn = typeof input.checkIn === 'string' ? input.checkIn : '';
  const checkOut = typeof input.checkOut === 'string' ? input.checkOut : '';
  if (!isRealDate(checkIn) || !isRealDate(checkOut)) return { error: 'checkIn and checkOut are required, as YYYY-MM-DD' };
  if (checkIn < todayInBangkok()) return { error: 'Check-in can’t be in the past' };
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) return { error: 'Check-out must be after check-in' };
  if (nights > MAX_NIGHTS) return { error: `Stays of more than ${MAX_NIGHTS} nights are booked with our team directly` };
  const adults = toInt(input.adults, 1);
  const children = toInt(input.children, 0);
  if (!(adults >= 1 && adults <= MAX_ADULTS) || !(children >= 0 && children <= MAX_CHILDREN)) return { error: 'Please choose between 1 and 12 adults and up to 8 children' };
  const promo = typeof input.promo === 'string' ? input.promo.trim() : '';
  if (promo && !PROMO_PATTERN.test(promo)) return { error: 'That promo code doesn’t look right' };
  return { checkIn, checkOut, nights, adults, children, ...(promo && { promo }) };
}
