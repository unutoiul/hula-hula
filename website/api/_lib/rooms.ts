import type { AvailabilityResponse, DepositType, RateOffer, RoomCapacity, RoomTypeOffer } from '../../shared/bookingContract.js';
import { bestDeal, type Deal, nightlyDiscounts } from './dealRules.js';
import { depositFor, type DefaultDeposit } from './deposit.js';
import { fromSatang, toSatang } from './money.js';
import type { Catalog, SmPenalty, SmQuote, SmRoomRate, SmRoomType } from './siteminder.js';

// Turns SiteMinder's three separate answers — the room types, their rates
// (meal plan, deposit, cancellation terms) and the live quote for one stay —
// plus the special offers from /admin into the room list the booking page
// shows, the same way for the availability lookup and for booking creation,
// so the price a guest saw is the price we charge.

export const maxRoomsPerBooking = () => Math.max(1, Math.min(10, Number(process.env.BOOKING_MAX_ROOMS) || 5));

export interface PricedRate {
  roomType: SmRoomType;
  rate: SmRoomRate;
  capacity: RoomCapacity;
  available: number;
  /** All in satang, for one room. `total` is after the special offer, `originalTotal` before. */
  total: number;
  originalTotal: number;
  offer: { title: string; badge: string | null; percent: number; perks: string[]; savings: number; byCode: boolean } | null;
  dueNow: number;
  depositType: DepositType;
  nightly: { date: string; amount: number }[];
  promoDiscount: number;
  cancellation: { refundable: boolean | null; summary: string };
}

const smallest = (...values: (number | null | undefined)[]) => {
  const set = values.filter((v): v is number => typeof v === 'number' && v > 0);
  return set.length ? Math.min(...set) : 0;
};

export function capacityOf(roomType: SmRoomType, rate: SmRoomRate): RoomCapacity {
  const guests = smallest(roomType.maxOccupancy, rate.maxOccupancy) || 2;
  return {
    guests,
    adults: smallest(roomType.maxAdultOccupancy, rate.maxAdultOccupancy) || guests,
    children: smallest(roomType.maxChildOccupancy, rate.maxChildOccupancy),
  };
}

function describePenalty(rule: { penaltyType: string; amount: number | null }, currency: string): string {
  switch (rule.penaltyType) {
    case 'full-amount': return 'the full stay is charged';
    case 'first-night': return 'the first night is charged';
    case 'percentage': return `${rule.amount ?? 100}% of the stay is charged`;
    case 'fixed-amount': return `${currency} ${rule.amount ?? 0} is charged`;
    default: return 'a cancellation fee applies';
  }
}

// SiteMinder describes cancellation as penalty rules ("from N days before
// check-in, charge X"); the rate's own rules win over the property default.
export function cancellationTerms(ratePenalties: SmPenalty[] | undefined, propertyPenalties: SmPenalty[] | undefined, checkIn: string, currency: string): { refundable: boolean | null; summary: string } {
  const pick = (list: SmPenalty[] | undefined) => {
    if (!list?.length) return undefined;
    return list.find((p) => !p.isDefault && (!p.startDate || p.startDate.slice(0, 10) <= checkIn) && (!p.endDate || p.endDate.slice(0, 10) >= checkIn))
      ?? list.find((p) => p.isDefault) ?? list[0];
  };
  const penalty = pick(ratePenalties) ?? pick(propertyPenalties);
  const rules = [...(penalty?.penaltyRules ?? [])].filter((r) => r.penaltyType !== 'no-penalty').sort((a, b) => b.daysPriorCheckIn - a.daysPriorCheckIn);
  if (!rules.length) return { refundable: null, summary: 'Cancellation terms are confirmed by the resort with your booking.' };
  const first = rules[0];
  if (first.daysPriorCheckIn >= 365) {
    return first.penaltyType === 'full-amount'
      ? { refundable: false, summary: 'Non-refundable: the full stay is charged if you cancel, change or don’t arrive.' }
      : { refundable: false, summary: `If you cancel, ${describePenalty(first, currency)}.` };
  }
  const days = first.daysPriorCheckIn;
  return { refundable: true, summary: `Free cancellation until ${days === 0 ? 'the day of arrival' : `${days} day${days === 1 ? '' : 's'} before arrival`}; after that ${describePenalty(first, currency)}.` };
}

export function priceQuotes(quotes: SmQuote[], catalog: Catalog, holds: Map<string, number>, checkIn: string, promo: string | undefined, fallback: DefaultDeposit, deals: Deal[] = []): PricedRate[] {
  const currency = catalog.property.currencyIsoCode || 'THB';
  const priced: PricedRate[] = [];
  for (const quote of quotes) {
    const roomType = catalog.roomTypes.get(quote.roomTypeUuid);
    const rate = catalog.rates.get(quote.roomRateUuid);
    if (!roomType || !rate) continue;
    const nights = (quote.breakdown ?? []).map((day) => ({
      date: day.date.slice(0, 10),
      gross: toSatang(day.gross),
      discount: toSatang(day.discount?.amount ?? 0),
      promoDiscount: toSatang(day.promoDiscount?.amount ?? 0),
    }));
    const promoDiscount = nights.reduce((sum, night) => sum + night.promoDiscount, 0);
    // A promotion-only rate is only bookable when the guest's code unlocked it.
    if (rate.promotionOnly && !(promo && promoDiscount > 0)) continue;
    const available = quote.availability - (holds.get(quote.roomTypeUuid) ?? 0);
    if (available <= 0) continue;
    // The best special offer for this room and stay, taken off the nights it covers.
    const originalTotal = toSatang(quote.price.gross);
    const deal = bestDeal(deals, { nightDates: nights.map((night) => night.date), roomTypeUuid: quote.roomTypeUuid, promo });
    let savings = 0;
    if (deal) {
      const off = nights.length
        ? nightlyDiscounts(deal, nights.map((night) => ({ date: night.date, amount: night.gross - night.discount - night.promoDiscount })))
        : [];
      off.forEach((amount, i) => { nights[i].discount += amount; });
      savings = nights.length ? off.reduce((sum, n) => sum + n, 0) : Math.round(originalTotal * deal.discountPercent / 100);
    }
    const total = originalTotal - savings;
    const deposit = depositFor({ total, nights }, { depositType: rate.depositType ?? quote.depositType, depositAmount: rate.depositAmount ?? quote.depositAmount }, fallback);
    priced.push({
      roomType, rate, available, total, originalTotal, dueNow: deposit.dueNow, depositType: deposit.type, promoDiscount,
      offer: deal ? { title: deal.title, badge: deal.badge, percent: deal.discountPercent, perks: deal.perks, savings, byCode: !!deal.promoCode } : null,
      capacity: capacityOf(roomType, rate),
      nightly: nights.map((night) => ({ date: night.date, amount: night.gross - night.discount - night.promoDiscount })),
      cancellation: cancellationTerms(rate.cancellationPenalties, catalog.property.cancellationPenalties, checkIn, currency),
    });
  }
  return priced;
}

const stripTags = (html: string | null) => html?.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim() || null;

export function buildAvailability(priced: PricedRate[], catalog: Catalog, search: { checkIn: string; checkOut: string; nights: number; adults: number; children: number; promo?: string }): AvailabilityResponse {
  const maxRooms = maxRoomsPerBooking();
  const byType = new Map<string, RoomTypeOffer>();
  for (const p of priced) {
    const rate: RateOffer = {
      roomRateUuid: p.rate.uuid,
      name: p.rate.name,
      description: p.rate.description && p.rate.description.trim() !== '-' ? p.rate.description : null,
      meals: { breakfast: p.rate.breakfastIncluded, lunch: p.rate.lunchIncluded, dinner: p.rate.dinnerIncluded },
      cancellation: p.cancellation,
      total: fromSatang(p.total),
      originalTotal: fromSatang(p.originalTotal),
      offer: p.offer ? { title: p.offer.title, badge: p.offer.badge, percent: p.offer.percent, perks: p.offer.perks, savings: fromSatang(p.offer.savings) } : null,
      nightly: p.nightly.map((n) => ({ date: n.date, amount: fromSatang(n.amount) })),
      promoDiscount: fromSatang(p.promoDiscount),
      deposit: { type: p.depositType, dueNow: fromSatang(p.dueNow), balance: fromSatang(p.total - p.dueNow) },
      maxQuantity: Math.min(p.available, p.rate.maxNumberOfRooms ?? maxRooms, maxRooms),
    };
    const existing = byType.get(p.roomType.uuid);
    if (existing) { existing.rates.push(rate); continue; }
    byType.set(p.roomType.uuid, {
      roomTypeUuid: p.roomType.uuid,
      name: p.roomType.name,
      description: p.roomType.description && p.roomType.description !== p.roomType.name ? p.roomType.description : null,
      roomSize: p.roomType.roomSize,
      roomSizeUnit: p.roomType.roomSizeUnit === 'm^2' ? 'm²' : p.roomType.roomSizeUnit === 'ft^2' ? 'ft²' : p.roomType.roomSizeUnit,
      capacity: p.capacity,
      available: p.available,
      rates: [rate],
    });
  }
  const roomTypes = [...byType.values()];
  roomTypes.forEach((room) => room.rates.sort((a, b) => a.total - b.total));
  roomTypes.sort((a, b) => a.rates[0].total - b.rates[0].total);
  const times = catalog.property.policies?.checkInCheckOut;
  return {
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    nights: search.nights,
    currency: catalog.property.currencyIsoCode || 'THB',
    occupancy: { adults: search.adults, children: search.children },
    promo: search.promo ? { code: search.promo, applied: priced.some((p) => p.promoDiscount > 0 || p.offer?.byCode) } : null,
    roomTypes,
    policies: { terms: stripTags(catalog.property.termsAndConditions), checkInTime: times?.checkInStartTime ?? null, checkOutTime: times?.checkOutEndTime ?? null },
    maxRooms,
  };
}
