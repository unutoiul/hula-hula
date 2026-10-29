// Which special offer a room gets, and how much it takes off — the rules
// staff set at /admin → Offers. Pure functions, so the same answer comes out
// of the availability lookup and of booking creation (and the unit tests).
// Money here is in satang; dates are "YYYY-MM-DD" stay dates.

export interface Deal {
  id: string;
  title: string;
  badge: string | null;
  discountPercent: number;
  perks: string[];
  promoCode: string | null;
  minNights: number | null;
  minDaysBefore: number | null;
  maxDaysBefore: number | null;
  roomTypeUuids: string[];
  sortOrder: number;
}

export interface DealContext {
  /** Today at the resort. */
  today: string;
  checkIn: string;
  /** Every night of the stay, in order. */
  nightDates: string[];
  roomTypeUuid: string;
  promo?: string;
}

const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

export function isEligible(deal: Deal, ctx: DealContext): boolean {
  if (deal.discountPercent <= 0 && deal.perks.length === 0) return false;
  // A code-only offer needs its code; an automatic one applies to everyone.
  if (deal.promoCode && deal.promoCode.toUpperCase() !== (ctx.promo ?? '').trim().toUpperCase()) return false;
  if (deal.minNights && ctx.nightDates.length < deal.minNights) return false;
  const daysAhead = daysBetween(ctx.today, ctx.checkIn);
  if (deal.minDaysBefore != null && daysAhead < deal.minDaysBefore) return false;
  if (deal.maxDaysBefore != null && daysAhead > deal.maxDaysBefore) return false;
  return !deal.roomTypeUuids.length || deal.roomTypeUuids.includes(ctx.roomTypeUuid);
}

/** The one offer a room gets: the biggest discount, then the most perks, then the admin's order. Offers never stack. */
export function bestDeal(deals: Deal[], ctx: DealContext): Deal | null {
  const matches = deals.filter((deal) => isEligible(deal, ctx));
  matches.sort((a, b) => b.discountPercent - a.discountPercent || b.perks.length - a.perks.length || a.sortOrder - b.sortOrder);
  return matches[0] ?? null;
}

/** The discount on each night (satang), rounded to whole baht like hotel prices. */
export function nightlyDiscounts(deal: Deal, nights: { date: string; amount: number }[]): number[] {
  return nights.map((night) => (deal.discountPercent > 0 ? Math.round(night.amount * deal.discountPercent / 10_000) * 100 : 0));
}
