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
  validFrom: string | null;
  validTo: string | null;
  stayFrom: string | null;
  stayTo: string | null;
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

/** Whether a night falls inside the offer's stay dates. */
export const coversNight = (deal: Deal, date: string) => (!deal.stayFrom || date >= deal.stayFrom) && (!deal.stayTo || date <= deal.stayTo);

export function isEligible(deal: Deal, ctx: DealContext): boolean {
  if (deal.discountPercent <= 0 && deal.perks.length === 0) return false;
  if (deal.validFrom && ctx.today < deal.validFrom) return false;
  if (deal.validTo && ctx.today > deal.validTo) return false;
  // A code-only offer needs its code; an automatic one applies to everyone.
  if (deal.promoCode && deal.promoCode.toUpperCase() !== (ctx.promo ?? '').trim().toUpperCase()) return false;
  if (deal.minNights && ctx.nightDates.length < deal.minNights) return false;
  const daysAhead = daysBetween(ctx.today, ctx.checkIn);
  if (deal.minDaysBefore != null && daysAhead < deal.minDaysBefore) return false;
  if (deal.maxDaysBefore != null && daysAhead > deal.maxDaysBefore) return false;
  if (deal.roomTypeUuids.length && !deal.roomTypeUuids.includes(ctx.roomTypeUuid)) return false;
  return ctx.nightDates.some((date) => coversNight(deal, date));
}

/** The one offer a room gets: the biggest discount, then the most perks, then the admin's order. Offers never stack. */
export function bestDeal(deals: Deal[], ctx: DealContext): Deal | null {
  const matches = deals.filter((deal) => isEligible(deal, ctx));
  matches.sort((a, b) => b.discountPercent - a.discountPercent || b.perks.length - a.perks.length || a.sortOrder - b.sortOrder);
  return matches[0] ?? null;
}

/** The discount on each night (satang) — only the nights inside the offer's stay dates. */
export function nightlyDiscounts(deal: Deal, nights: { date: string; amount: number }[]): number[] {
  return nights.map((night) => (deal.discountPercent > 0 && coversNight(deal, night.date) ? Math.round(night.amount * deal.discountPercent / 100) : 0));
}
