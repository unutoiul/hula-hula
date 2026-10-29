import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Activity, EventCta, Offer, SiteContent, SiteEvent } from '../shared/siteContent.js';
import { dbConfigured, rest } from './_lib/db.js';
import { allowMethods } from './_lib/http.js';

interface ActivityRow { id: string; kicker: string; title: string; detail: string; images: string[]; cta_label: string | null }
interface EventRow { id: string; title: string; summary: string; image_url: string | null; starts_on: string | null; ends_on: string | null; time_label: string | null; cta_type: EventCta; cta_label: string | null; cta_url: string | null }
interface OfferRow {
  id: string; kicker: string | null; title: string; description: string; image_url: string | null; promo_code: string | null;
  discount_percent: number | string; badge: string | null; perks: string[]; min_nights: number | null; cta_label: string | null;
}

// GET /api/content — the activities, events and offers staff edit at /admin.
// Read with the public (anon) key, so Supabase's row level security decides
// what's visible: published items, events that are still to come, and offers
// that are switched on. Cached at the edge for a minute; the homepage falls back to its
// built-in activities if this fails.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  if (!dbConfigured('anon')) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'Content is not configured' });
  }
  try {
    const [activities, events, offers] = await Promise.all([
      rest<ActivityRow[]>('/activities?select=id,kicker,title,detail,images,cta_label&order=sort_order.asc,created_at.asc', { role: 'anon' }),
      rest<EventRow[]>('/events?select=id,title,summary,image_url,starts_on,ends_on,time_label,cta_type,cta_label,cta_url&order=sort_order.asc,starts_on.asc.nullslast', { role: 'anon' }),
      rest<OfferRow[]>('/offers?select=id,kicker,title,description,image_url,promo_code,discount_percent,badge,perks,min_nights,cta_label&order=sort_order.asc,created_at.asc', { role: 'anon' }),
    ]);
    const content: SiteContent = {
      activities: activities.map((a): Activity => ({ id: a.id, kicker: a.kicker, title: a.title, detail: a.detail, images: a.images, ctaLabel: a.cta_label })),
      events: events.map((e): SiteEvent => ({
        id: e.id, title: e.title, summary: e.summary, imageUrl: e.image_url, startsOn: e.starts_on, endsOn: e.ends_on, timeLabel: e.time_label,
        cta: { type: e.cta_type, label: e.cta_label, url: e.cta_url },
      })),
      offers: offers.map((o): Offer => ({
        id: o.id, kicker: o.kicker, title: o.title, description: o.description, imageUrl: o.image_url,
        promoCode: o.promo_code, ctaLabel: o.cta_label,
        discountPercent: Number(o.discount_percent) || 0, badge: o.badge, perks: o.perks ?? [], minNights: o.min_nights,
      })),
    };
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
    return res.status(200).json(content);
  } catch (error) {
    console.error('Content read failed', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Could not load content' });
  }
}
