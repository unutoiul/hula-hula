import type { ClubOffer } from './config.ts';
import { isISODate, krabiNow } from './dates.ts';

export function offerValidation(offer: ClubOffer): string | null {
  if (!offer.title.trim()) return 'Give every offer a title, or remove the empty offer.';
  if ((offer.startsOn && !isISODate(offer.startsOn)) || (offer.endsOn && !isISODate(offer.endsOn))) return 'Use a valid start and end date.';
  if (offer.startsOn && offer.endsOn && offer.endsOn < offer.startsOn) return 'An offer’s end date cannot be before its start date.';
  return null;
}

/** The admin and public pages use exactly the same publication rules. */
export function offerStatus(offer: ClubOffer, today = krabiNow().date): 'hidden' | 'invalid' | 'scheduled' | 'expired' | 'live' {
  if (offerValidation(offer)) return 'invalid';
  if (!offer.active) return 'hidden';
  if (offer.startsOn && offer.startsOn > today) return 'scheduled';
  if (offer.endsOn && offer.endsOn < today) return 'expired';
  return 'live';
}

/** Offer dates are inclusive and use the club's local day, not the visitor's. */
export function activeOffers(offers: ClubOffer[], today = krabiNow().date) {
  return offers.filter(o => offerStatus(o, today) === 'live');
}
