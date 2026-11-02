// What GET /api/content returns: the CMS-managed activities, events and offers
// (edited at /admin, stored in Supabase). Types only.

export interface Activity {
  id: string;
  kicker: string;
  title: string;
  detail: string;
  images: string[];
  ctaLabel: string | null;
}

export type EventCta = 'contact' | 'book' | 'link' | 'none';

export interface SiteEvent {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  /** YYYY-MM-DD; both null = an ongoing thing ("Every Friday", "On request"). */
  startsOn: string | null;
  endsOn: string | null;
  timeLabel: string | null;
  cta: { type: EventCta; label: string | null; url: string | null };
}

export interface Offer {
  id: string;
  kicker: string | null;
  title: string;
  description: string;
  imageUrl: string | null;
  /** A SiteMinder promo code — the discount itself lives on SiteMinder's rates. */
  promoCode: string | null;
  validFrom: string | null;
  validTo: string | null;
  ctaLabel: string | null;
}

export interface SiteContent { activities: Activity[]; events: SiteEvent[]; offers: Offer[] }
