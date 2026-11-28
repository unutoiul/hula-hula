// Which special offer a room gets, and how much it takes off — the rules
// staff set at /admin → Offers. Pure functions, so the same answer comes out
// of the availability lookup and of booking creation (and the unit tests).
// Money here is in satang; dates are "YYYY-MM-DD" stay dates.
//
// One offer per room, never stacked, decided by the CHECK-IN day: an offer
// qualifies when the guest arrives inside its stay dates (and the booking
// meets its minimum stay and how far ahead it must be made), and then
// discounts every night of the stay alike. The biggest discount wins — so
// e.g. Early Bird 55% (60 days ahead) beats Minimum 4 Nights 53%, which beats
// Direct 50% — and a bigger offer the guest doesn't qualify for never blocks
// a smaller one they do.

export interface Deal {
  id: string;
  title: string;
  badge: string | null;
  discountPercent: number;
  perks: string[];
  promoCode: string | null;
  /** When it can be booked (and shows on the website); null = no limit. */
  validFrom: string | null;
  validTo: string | null;
  /** Which arrival days it's for; null = no limit. It then discounts the whole stay. */
  stayFrom: string | null;
  stayTo: string | null;
  minNights: number | null;
  /** Early bird: booked at least this many days before check-in; null = any time. */
  minAdvanceDays: number | null;
  roomTypeUuids: string[];
  sortOrder: number;
}

export interface DealContext {
  /** Today at the hotel. */
  today: string;
  /** Every night of the stay, in order. */
  nightDates: string[];
  roomTypeUuid: string;
  promo?: string;
}

/** Whether a check-in day falls inside the offer's stay dates (both ends count). */
export const coversCheckIn = (deal: Deal, checkIn: string) =>
  (!deal.stayFrom || checkIn >= deal.stayFrom) && (!deal.stayTo || checkIn <= deal.stayTo);

/** Whole days from `today` to `checkIn` (both calendar days at the hotel): booking on 27 Nov for 26 Jan is 60. */
export const daysAhead = (today: string, checkIn: string) =>
  Math.round((Date.parse(`${checkIn}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);

export function isEligible(deal: Deal, ctx: DealContext): boolean {
  if (deal.discountPercent <= 0 && deal.perks.length === 0) return false;
  if (deal.validFrom && ctx.today < deal.validFrom) return false;
  if (deal.validTo && ctx.today > deal.validTo) return false;
  // A code-only offer needs its code; an automatic one applies to everyone.
  if (deal.promoCode && deal.promoCode.toUpperCase() !== (ctx.promo ?? '').trim().toUpperCase()) return false;
  if (deal.minNights && ctx.nightDates.length < deal.minNights) return false;
  if (deal.roomTypeUuids.length && !deal.roomTypeUuids.includes(ctx.roomTypeUuid)) return false;
  const checkIn = ctx.nightDates[0];
  if (!checkIn || !coversCheckIn(deal, checkIn)) return false;
  return !deal.minAdvanceDays || daysAhead(ctx.today, checkIn) >= deal.minAdvanceDays;
}

/** The one offer a room gets: the biggest discount, then the most perks, then the admin's order. Offers never stack. */
export function bestDeal(deals: Deal[], ctx: DealContext): Deal | null {
  const matches = deals.filter((deal) => isEligible(deal, ctx));
  matches.sort((a, b) => b.discountPercent - a.discountPercent || b.perks.length - a.perks.length || a.sortOrder - b.sortOrder);
  return matches[0] ?? null;
}

/** The discount on each night (satang), rounded to whole baht like hotel prices — the same percentage on every night of the stay. */
export function nightlyDiscounts(deal: Deal, nights: { date: string; amount: number }[]): number[] {
  return nights.map((night) => (deal.discountPercent > 0 ? Math.round((night.amount * deal.discountPercent) / 10_000) * 100 : 0));
}
