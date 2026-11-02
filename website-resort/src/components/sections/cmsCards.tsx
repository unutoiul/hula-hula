import ArrowOutward from '@mui/icons-material/ArrowOutward';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import East from '@mui/icons-material/East';
import type { ReactNode } from 'react';
import type { Offer, SiteEvent } from '../../../shared/siteContent';
import { ONSITE_BOOKING, toBookHref, toISODate, useBookingSearch } from '../../context/BookingSearchContext';
import { useContactForm } from '../../context/ContactFormContext';
import { useSiteContent } from '../../context/SiteContentContext';
import { photoAssets as p } from '../../data/photos';
import { navigate } from '../../router';

// Turning the CMS's offers and events into "highlights" — the one list the
// hero's rotating card and the "Offers & what's on" section both show — and
// wiring their buttons: ask us (the contact popup), book (with an offer's
// promo code already applied) or a link.

export interface Highlight {
  id: string;
  kind: 'offer' | 'event';
  /** The offer's badge ("Special offer") or "What's on". */
  label: string;
  /** The big number or date on the photo: "−70%", "24 Dec". */
  tag: string | null;
  title: string;
  description: string;
  perks: string[];
  /** Small print: an offer's stay dates, minimum stay and last booking day, or when an event is on. */
  note: string | null;
  image: string;
  ctaLabel?: string; onCta?: () => void; ctaHref?: string; ctaIcon?: ReactNode;
}

const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const dayOnly = new Intl.DateTimeFormat('en-GB', { day: 'numeric' });
const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const asDay = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };

/** "24 – 26 Dec", "30 Dec – 2 Jan" */
const dayRange = (from: string, to: string) => {
  const a = asDay(from), b = asDay(to);
  return a.getMonth() === b.getMonth() ? `${dayOnly.format(a)} – ${dayMonth.format(b)}` : `${dayMonth.format(a)} – ${dayMonth.format(b)}`;
};

function eventDates({ startsOn, endsOn }: SiteEvent): string {
  if (startsOn && endsOn && endsOn !== startsOn) return dayRange(startsOn, endsOn);
  return startsOn || endsOn ? day.format(asDay((startsOn ?? endsOn)!)) : '';
}

/** "Stays 20 Dec – 5 Jan · min. 3 nights · book by 15 Dec" */
function offerTerms({ stayFrom, stayTo, minNights, validTo }: Offer): string | null {
  const stays = stayFrom && stayTo ? `Stays ${dayRange(stayFrom, stayTo)}`
    : stayFrom ? `Stays from ${dayMonth.format(asDay(stayFrom))}`
      : stayTo ? `Stays until ${dayMonth.format(asDay(stayTo))}` : '';
  const nights = minNights && minNights > 1 ? (stays ? `min. ${minNights} nights` : `Minimum stay ${minNights} nights`) : '';
  const bookBy = validTo ? `${stays || nights ? 'book' : 'Book'} by ${dayMonth.format(asDay(validTo))}` : '';
  return [stays, nights, bookBy].filter(Boolean).join(' · ') || null;
}

export function eventWhen(event: SiteEvent): string {
  return [eventDates(event), event.timeLabel].filter(Boolean).join(' · ') || 'Ongoing';
}

// Dates that qualify for an offer: the guest's dates if they already fit,
// otherwise the first stay inside the offer's stay dates that's long enough.
function offerDates(offer: Offer, checkIn: Date, checkOut: Date): [Date, Date] {
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
  const minNights = offer.minNights ?? 1;
  const fits = nights >= minNights && (!offer.stayTo || toISODate(checkIn) <= offer.stayTo) && (!offer.stayFrom || toISODate(checkOut) > offer.stayFrom);
  if (fits) return [checkIn, checkOut];
  const tomorrow = new Date(); tomorrow.setHours(0, 0, 0, 0); tomorrow.setDate(tomorrow.getDate() + 1);
  const start = offer.stayFrom && asDay(offer.stayFrom) > tomorrow ? asDay(offer.stayFrom) : tomorrow;
  const end = new Date(start); end.setDate(end.getDate() + Math.max(nights, minNights));
  return [start, end];
}

const bookIcon = <East sx={{ fontSize: 17 }} />;
const askIcon = <ChatBubbleOutlineRounded sx={{ fontSize: 17 }} />;

/** What an offer's card shows (the /admin preview uses this too); useHighlights adds what its button does. */
export function offerHighlight(offer: Offer): Highlight {
  const code = offer.promoCode ?? '';
  return {
    id: offer.id, kind: 'offer', label: offer.kicker || offer.badge || 'Special offer',
    tag: offer.discountPercent > 0 ? `−${offer.discountPercent}%` : null,
    title: offer.title, description: offer.description, perks: offer.perks,
    note: offerTerms(offer),
    image: offer.imageUrl ?? p.poolOverview.src,
    // Offers are priced by our own booking page; while that's switched off
    // (SiteMinder's engine doesn't know them), guests ask the team instead.
    ...(ONSITE_BOOKING
      ? { ctaLabel: offer.ctaLabel || (code ? `Book with code ${code}` : 'Book this offer'), ctaIcon: bookIcon }
      : { ctaLabel: offer.ctaLabel || 'Ask about this', ctaIcon: askIcon }),
  };
}

/** What an event's card shows (the /admin preview uses this too). */
export function eventHighlight(event: SiteEvent): Highlight {
  const dates = eventDates(event);
  const base: Highlight = {
    id: event.id, kind: 'event', label: 'What’s on', tag: dates || null,
    title: event.title, description: event.summary, perks: [],
    note: [dates, event.timeLabel].filter(Boolean).join(' · ') || null,
    image: event.imageUrl ?? p.banquet.src,
  };
  switch (event.cta.type) {
    case 'none': return base;
    case 'link': return event.cta.url ? { ...base, ctaLabel: event.cta.label || 'Find out more', ctaHref: event.cta.url, ctaIcon: <ArrowOutward sx={{ fontSize: 17 }} /> } : base;
    case 'book': return { ...base, ctaLabel: event.cta.label || 'Book your stay', ctaIcon: bookIcon };
    default: return { ...base, ctaLabel: event.cta.label || 'Ask about this', ctaIcon: askIcon };
  }
}

/** The running offers, then the events, in the order set at /admin — with their buttons wired up. */
export function useHighlights(): Highlight[] {
  const { offers, events } = useSiteContent();
  const openContact = useContactForm();
  const search = useBookingSearch();
  const bookStay = ([from, to]: [Date, Date], code: string) => () => {
    search.setPromoCode(code);
    navigate(toBookHref(from, to, search.adults, search.children, code));
  };
  return [
    ...offers.map((offer): Highlight => {
      const card = offerHighlight(offer);
      return ONSITE_BOOKING
        ? { ...card, onCta: bookStay(offerDates(offer, search.checkIn, search.checkOut), offer.promoCode ?? '') }
        : { ...card, onCta: () => openContact({ topic: offer.title, message: `Hi Hula Hula! I’d like to book the “${offer.title}” offer.`, page: 'Offers' }) };
    }),
    ...events.map((event): Highlight => {
      const card = eventHighlight(event);
      switch (event.cta.type) {
        case 'none': case 'link': return card;
        case 'book': return ONSITE_BOOKING ? { ...card, onCta: bookStay([search.checkIn, search.checkOut], search.promoCode) } : { ...card, ctaHref: search.siteMinderUrl };
        default: return { ...card, onCta: () => openContact({ topic: event.title, message: `Hi Hula Hula! I’d love to hear more about “${event.title}” (${eventWhen(event)}).`, page: 'What’s on' }) };
      }
    }),
  ];
}
