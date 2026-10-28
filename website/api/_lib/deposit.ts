import type { DepositType } from '../../shared/bookingContract.js';

// How much of one room's stay is paid online, following the deposit set on
// the SiteMinder rate (Direct Booking → rates → deposit). The rest is paid at
// the hotel. A rate with no deposit would, on SiteMinder's own engine, only
// need a card guarantee — something this site can't hold — so it falls back
// to BOOKING_DEFAULT_DEPOSIT ("full" unless set to "first-night").
// Everything here is in satang.

export type DefaultDeposit = 'full' | 'first-night';

export interface DepositQuote {
  total: number;
  /** Per night, before any discount; the discounts come separately. */
  nights: { gross: number; discount: number; promoDiscount: number }[];
}

export interface DepositRule { depositType: string | null; depositAmount: number | null }

const KNOWN = new Set(['full-amount', 'first-night', 'fixed-amount', 'percentage']);

function firstNight({ total, nights }: DepositQuote): number {
  if (nights.length === 0) return total;
  // SiteMinder doesn't say whether a day's gross is before or after its
  // discounts, so check which reading adds up to the stay's total and fall
  // back to the first night's share of the total if neither does.
  const effective = nights.map((night) => night.gross - night.discount - night.promoDiscount);
  if (Math.abs(effective.reduce((sum, n) => sum + n, 0) - total) <= 100) return effective[0];
  if (Math.abs(nights.reduce((sum, n) => sum + n.gross, 0) - total) <= 100) return nights[0].gross;
  const grossSum = nights.reduce((sum, n) => sum + n.gross, 0);
  return grossSum > 0 ? Math.round(total * nights[0].gross / grossSum) : total;
}

export function depositFor(quote: DepositQuote, rule: DepositRule, fallback: DefaultDeposit): { type: DepositType; dueNow: number } {
  const type = rule.depositType && KNOWN.has(rule.depositType) ? rule.depositType as Exclude<DepositType, null> : null;
  let dueNow: number;
  switch (type) {
    case 'full-amount': dueNow = quote.total; break;
    case 'first-night': dueNow = firstNight(quote); break;
    case 'percentage': dueNow = Math.round(quote.total * Math.min(100, Math.max(0, rule.depositAmount ?? 100)) / 100); break;
    case 'fixed-amount': dueNow = Math.round((rule.depositAmount ?? 0) * 100); break;
    default: dueNow = 0;
  }
  dueNow = Math.min(quote.total, Math.max(0, dueNow));
  if (dueNow > 0) return { type, dueNow };
  return { type, dueNow: fallback === 'first-night' ? Math.min(quote.total, firstNight(quote)) : quote.total };
}

export const defaultDeposit = (): DefaultDeposit => (process.env.BOOKING_DEFAULT_DEPOSIT === 'first-night' ? 'first-night' : 'full');
