import ArrowOutward from '@mui/icons-material/ArrowOutward';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import East from '@mui/icons-material/East';
import type { ReactNode } from 'react';
import type { Offer, SiteEvent } from '../../../shared/siteContent';
import { ONSITE_BOOKING, toBookHref, useBookingSearch } from '../../context/BookingSearchContext';
import { useContactForm } from '../../context/ContactFormContext';
import { photoAssets as p } from '../../data/photos';
import { navigate } from '../../router';
import type { CarouselCardData } from '../../types';

// Turning CMS events and offers into the site's carousel cards, and wiring
// their buttons: ask us (the contact popup), book (with an offer's promo
// code already applied) or a link.

export interface CmsCard extends CarouselCardData { ctaLabel?: string; onCta?: () => void; ctaHref?: string; ctaIcon?: ReactNode }

const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const dayOnly = new Intl.DateTimeFormat('en-GB', { day: 'numeric' });
const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const asDay = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };

export function eventWhen(event: SiteEvent): string {
  const { startsOn, endsOn, timeLabel } = event;
  let when = '';
  if (startsOn && endsOn && endsOn !== startsOn) {
    const a = asDay(startsOn), b = asDay(endsOn);
    when = a.getMonth() === b.getMonth() ? `${dayOnly.format(a)} – ${dayMonth.format(b)}` : `${dayMonth.format(a)} – ${dayMonth.format(b)}`;
  } else if (startsOn || endsOn) {
    when = day.format(asDay((startsOn ?? endsOn)!));
  }
  return [when, timeLabel].filter(Boolean).join(' · ') || 'Ongoing';
}

export function useEventCards(events: SiteEvent[]): CmsCard[] {
  const openContact = useContactForm();
  const search = useBookingSearch();
  return events.map((event) => {
    const base = { id: event.id, kicker: eventWhen(event), title: event.title, detail: event.summary, images: [event.imageUrl ?? p.banquet.src] };
    switch (event.cta.type) {
      case 'none': return base;
      case 'link': return event.cta.url ? { ...base, ctaLabel: event.cta.label || 'Find out more', ctaHref: event.cta.url, ctaIcon: <ArrowOutward sx={{ fontSize: 17 }} /> } : base;
      case 'book': {
        const href = toBookHref(search.checkIn, search.checkOut, search.adults, search.children, search.promoCode);
        return { ...base, ctaLabel: event.cta.label || 'Book your stay', ...(ONSITE_BOOKING ? { onCta: () => navigate(href) } : { ctaHref: search.siteMinderUrl }), ctaIcon: <East sx={{ fontSize: 17 }} /> };
      }
      default: return {
        ...base, ctaLabel: event.cta.label || 'Ask about this', ctaIcon: <ChatBubbleOutlineRounded sx={{ fontSize: 17 }} />,
        onCta: () => openContact({ topic: event.title, message: `Hi Hula Hula! I’d love to hear more about “${event.title}” (${eventWhen(event)}).`, page: 'What’s on' }),
      };
    }
  });
}

// Dates that qualify for an offer: the guest's dates, stretched to the
// offer's minimum stay if they're shorter.
function offerDates(offer: Offer, checkIn: Date, checkOut: Date): [Date, Date] {
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
  const minNights = offer.minNights ?? 1;
  if (nights >= minNights) return [checkIn, checkOut];
  const end = new Date(checkIn); end.setDate(end.getDate() + minNights);
  return [checkIn, end];
}

export function useOfferCards(offers: Offer[]): CmsCard[] {
  const openContact = useContactForm();
  const search = useBookingSearch();
  return offers.map((offer) => {
    const perks = offer.perks.length ? `Includes ${offer.perks.join(', ').toLowerCase()}.` : '';
    const base = {
      id: offer.id, title: offer.title, images: [offer.imageUrl ?? p.poolOverview.src],
      kicker: offer.kicker || [offer.badge || 'Special offer', offer.discountPercent > 0 ? `−${offer.discountPercent}%` : ''].filter(Boolean).join(' · '),
      detail: [offer.description, perks, offer.minNights && offer.minNights > 1 ? `Minimum ${offer.minNights} nights.` : ''].filter(Boolean).join(' '),
    };
    // Offers are priced by our own booking page; while that's switched off
    // (SiteMinder's engine doesn't know them), guests ask the team instead.
    if (ONSITE_BOOKING) {
      const code = offer.promoCode ?? '';
      const book = () => {
        const [from, to] = offerDates(offer, search.checkIn, search.checkOut);
        search.setPromoCode(code);
        navigate(toBookHref(from, to, search.adults, search.children, code));
      };
      return { ...base, ctaLabel: offer.ctaLabel || (code ? `Book with code ${code}` : 'Book this offer'), onCta: book, ctaIcon: <East sx={{ fontSize: 17 }} /> };
    }
    return {
      ...base, ctaLabel: offer.ctaLabel || 'Ask about this', ctaIcon: <ChatBubbleOutlineRounded sx={{ fontSize: 17 }} />,
      onCta: () => openContact({ topic: offer.title, message: `Hi Hula Hula! I’d like to book the “${offer.title}” offer.`, page: 'Offers' }),
    };
  });
}
