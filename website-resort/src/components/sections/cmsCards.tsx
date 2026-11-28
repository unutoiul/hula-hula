import ArrowOutward from '@mui/icons-material/ArrowOutward';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import East from '@mui/icons-material/East';
import type { ReactNode } from 'react';
import type { Offer, SiteEvent } from '../../../shared/siteContent';
import { ONSITE_BOOKING, toBookHref, toISODate, useBookingSearch } from '../../context/BookingSearchContext';
import { useContactForm } from '../../context/ContactFormContext';
import { useSiteContent } from '../../context/SiteContentContext';
import { photoAssets as p } from '../../data/photos';
import { isPicture } from '../common/EventMedia';
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
  /** An event's cover and its other photos and videos. */
  media?: string[];
  /** A page on this site the card and its button open (an event's own page). */
  link?: string;
  ctaLabel?: string;
  onCta?: () => void;
  ctaHref?: string;
  ctaIcon?: ReactNode;
}

const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const dayOnly = new Intl.DateTimeFormat('en-GB', { day: 'numeric' });
const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const asDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** "24 – 26 Dec", "30 Dec – 2 Jan" */
const dayRange = (from: string, to: string) => {
  const a = asDay(from),
    b = asDay(to);
  return a.getMonth() === b.getMonth() ? `${dayOnly.format(a)} – ${dayMonth.format(b)}` : `${dayMonth.format(a)} – ${dayMonth.format(b)}`;
};

function eventDates({ startsOn, endsOn }: SiteEvent): string {
  if (startsOn && endsOn && endsOn !== startsOn) return dayRange(startsOn, endsOn);
  return startsOn || endsOn ? day.format(asDay((startsOn ?? endsOn)!)) : '';
}

/** "Check-in 20 Dec – 5 Jan · min. 3 nights · book 60+ days ahead · book by 15 Dec" */
function offerTerms({ stayFrom, stayTo, minNights, minAdvanceDays, validTo }: Offer): string | null {
  const arrivals =
    stayFrom && stayTo
      ? `check-in ${dayRange(stayFrom, stayTo)}`
      : stayFrom
        ? `check-in from ${dayMonth.format(asDay(stayFrom))}`
        : stayTo
          ? `check-in until ${dayMonth.format(asDay(stayTo))}`
          : '';
  const nights = minNights && minNights > 1 ? `min. ${minNights} nights` : '';
  const ahead = minAdvanceDays ? `book ${minAdvanceDays}+ days ahead` : '';
  const bookBy = validTo ? `book by ${dayMonth.format(asDay(validTo))}` : '';
  const terms = [arrivals, nights, ahead, bookBy].filter(Boolean).join(' · ');
  return terms ? terms[0].toUpperCase() + terms.slice(1) : null;
}

const longDay = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const longStart = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

/** For an event's page: "Saturday 24 January 2027", "Fri 23 Jan – Sunday 25 January 2027", or null when it's ongoing. */
export function eventDatesLong({ startsOn, endsOn }: SiteEvent): string | null {
  if (startsOn && endsOn && endsOn !== startsOn) return `${longStart.format(asDay(startsOn))} – ${longDay.format(asDay(endsOn))}`;
  return startsOn || endsOn ? longDay.format(asDay((startsOn ?? endsOn)!)) : null;
}

export function eventWhen(event: SiteEvent): string {
  return [eventDates(event), event.timeLabel].filter(Boolean).join(' · ') || 'Ongoing';
}

// Dates that qualify for an offer (the same rules as api/_lib/dealRules.ts):
// the guest's dates if they already fit, otherwise the first long-enough stay
// arriving inside the offer's check-in dates, far enough ahead for an early bird.
function offerDates(offer: Offer, checkIn: Date, checkOut: Date): [Date, Date] {
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
  const minNights = offer.minNights ?? 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const earliest = new Date(today);
  earliest.setDate(earliest.getDate() + Math.max(1, offer.minAdvanceDays ?? 0));
  const arrival = toISODate(checkIn);
  const fits =
    nights >= minNights &&
    (!offer.minAdvanceDays || checkIn >= earliest) &&
    (!offer.stayFrom || arrival >= offer.stayFrom) &&
    (!offer.stayTo || arrival <= offer.stayTo);
  if (fits) return [checkIn, checkOut];
  const start = offer.stayFrom && asDay(offer.stayFrom) > earliest ? asDay(offer.stayFrom) : earliest;
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(nights, minNights));
  return [start, end];
}

const bookIcon = <East sx={{ fontSize: 17 }} />;
const askIcon = <ChatBubbleOutlineRounded sx={{ fontSize: 17 }} />;

/** What an offer's card shows (the /admin preview uses this too); useHighlights adds what its button does. */
export function offerHighlight(offer: Offer): Highlight {
  const code = offer.promoCode ?? '';
  return {
    id: offer.id,
    kind: 'offer',
    label: offer.kicker || offer.badge || 'Special offer',
    tag: offer.discountPercent > 0 ? `−${offer.discountPercent}%` : null,
    title: offer.title,
    description: offer.description,
    perks: offer.perks,
    note: offerTerms(offer),
    image: offer.imageUrl ?? p.poolOverview.src,
    // Offers are priced by our own booking page; while that's switched off
    // (SiteMinder's engine doesn't know them), guests ask the team instead.
    ...(ONSITE_BOOKING
      ? { ctaLabel: offer.ctaLabel || (code ? `Book with code ${code}` : 'Book this offer'), ctaIcon: bookIcon }
      : { ctaLabel: offer.ctaLabel || 'Ask about this', ctaIcon: askIcon }),
  };
}

const slugify = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');

/** An event's own page: "/events/full-moon-pool-party-1a2b3c4d" — the title for people, the start of its id to find it (so a renamed event's old links still work). */
export const eventPath = (event: Pick<SiteEvent, 'id' | 'title'>) =>
  `/events/${[slugify(event.title), event.id.slice(0, 8)].filter(Boolean).join('-')}`;

/** The event a /events/… address is for, among those running. */
export function eventAt(pathname: string, events: SiteEvent[]): SiteEvent | null {
  const key = /^\/events\/(?:.*-)?([0-9a-f]{8})\/?$/i.exec(pathname)?.[1]?.toLowerCase();
  return key ? (events.find((event) => event.id.toLowerCase().startsWith(key)) ?? null) : null;
}

/** What an event's card shows (the /admin preview uses this too): its button opens the event's own page. */
export function eventHighlight(event: SiteEvent): Highlight {
  const dates = eventDates(event);
  const gallery = event.gallery ?? [];
  return {
    id: event.id,
    kind: 'event',
    label: 'What’s on',
    tag: dates || null,
    title: event.title,
    description: event.summary,
    perks: [],
    note: [dates, event.timeLabel].filter(Boolean).join(' · ') || null,
    // No cover picked: the first photo from the gallery, then a resort photo.
    image: event.imageUrl ?? gallery.find(isPicture) ?? p.banquet.src,
    media: [...new Set([...(event.imageUrl ? [event.imageUrl] : []), ...gallery])],
    link: eventPath(event),
    ctaLabel: 'See details',
    ctaIcon: bookIcon,
  };
}

/** The button on an event's page, as set at /admin: ask us, book a stay, a link, or none. */
export interface EventAction {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  href?: string;
}

export function useEventAction(event: SiteEvent | null): EventAction | null {
  const openContact = useContactForm();
  const search = useBookingSearch();
  if (!event) return null;
  switch (event.cta.type) {
    case 'none':
      return null;
    case 'link':
      return event.cta.url
        ? { label: event.cta.label || 'Find out more', icon: <ArrowOutward sx={{ fontSize: 17 }} />, href: event.cta.url }
        : null;
    case 'book':
      return ONSITE_BOOKING
        ? {
            label: event.cta.label || 'Book your stay',
            icon: bookIcon,
            onClick: () => navigate(toBookHref(search.checkIn, search.checkOut, search.adults, search.children, search.promoCode)),
          }
        : { label: event.cta.label || 'Book your stay', icon: bookIcon, href: search.siteMinderUrl };
    default:
      return {
        label: event.cta.label || 'Ask about this',
        icon: askIcon,
        onClick: () =>
          openContact({
            topic: event.title,
            message: `Hi Hula Hula! I’d love to hear more about “${event.title}” (${eventWhen(event)}).`,
            page: 'What’s on',
          }),
      };
  }
}

/** The running offers, in the order set at /admin — with their buttons wired up. */
export function useOfferHighlights(): Highlight[] {
  const { offers } = useSiteContent();
  const openContact = useContactForm();
  const search = useBookingSearch();
  return offers.map((offer): Highlight => {
    const card = offerHighlight(offer);
    if (!ONSITE_BOOKING)
      return {
        ...card,
        onCta: () =>
          openContact({ topic: offer.title, message: `Hi Hula Hula! I’d like to book the “${offer.title}” offer.`, page: 'Offers' }),
      };
    const code = offer.promoCode ?? '';
    const [from, to] = offerDates(offer, search.checkIn, search.checkOut);
    return {
      ...card,
      onCta: () => {
        search.setPromoCode(code);
        navigate(toBookHref(from, to, search.adults, search.children, code));
      },
    };
  });
}

/** The running events, in the order set at /admin; each opens its own page. */
export function useEventHighlights(): Highlight[] {
  return useSiteContent().events.map(eventHighlight);
}

/** Offers, then events — the hero's rotating card shows both. */
export function useHighlights(): Highlight[] {
  return [...useOfferHighlights(), ...useEventHighlights()];
}
