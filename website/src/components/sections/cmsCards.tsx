import ArrowOutward from '@mui/icons-material/ArrowOutward';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import East from '@mui/icons-material/East';
import type { ReactNode } from 'react';
import type { Offer, SiteEvent } from '../../../shared/siteContent';
import { ONSITE_BOOKING, toBookHref, toSiteMinderUrl, useBookingSearch } from '../../context/BookingSearchContext';
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

export function useOfferCards(offers: Offer[]): CmsCard[] {
  const openContact = useContactForm();
  const search = useBookingSearch();
  return offers.map((offer) => {
    const base = {
      id: offer.id, title: offer.title, detail: offer.description, images: [offer.imageUrl ?? p.poolOverview.src],
      kicker: offer.kicker || (offer.validTo ? `Until ${dayMonth.format(asDay(offer.validTo))}` : 'Special offer'),
    };
    if (offer.promoCode) {
      const code = offer.promoCode;
      const book = () => {
        search.setPromoCode(code);
        if (ONSITE_BOOKING) navigate(toBookHref(search.checkIn, search.checkOut, search.adults, search.children, code));
        else window.open(toSiteMinderUrl(search.checkIn, search.checkOut, search.adults, search.children, code), '_blank', 'noopener');
      };
      return { ...base, ctaLabel: offer.ctaLabel || `Book with code ${code}`, onCta: book, ctaIcon: <East sx={{ fontSize: 17 }} /> };
    }
    return {
      ...base, ctaLabel: offer.ctaLabel || 'Ask about this', ctaIcon: <ChatBubbleOutlineRounded sx={{ fontSize: 17 }} />,
      onCta: () => openContact({ topic: offer.title, message: `Hi Hula Hula! I’d like to know more about the “${offer.title}” offer.`, page: 'Offers' }),
    };
  });
}
