import type { Deal } from './dealRules.js';
import { dbConfigured, rest } from './db.js';

// The active special offers from /admin → Offers, read with the secret key
// (secret-code offers aren't visible to visitors) and kept for a minute per
// function instance. If Supabase can't be reached, rooms are simply priced
// without offers rather than not at all.

interface OfferRow {
  id: string; title: string; badge: string | null; discount_percent: number | string; perks: string[]; promo_code: string | null; min_nights: number | null;
  min_days_before_arrival: number | null; max_days_before_arrival: number | null; room_type_uuids: string[]; sort_order: number;
}

const COLUMNS = 'id,title,badge,discount_percent,perks,promo_code,min_nights,min_days_before_arrival,max_days_before_arrival,room_type_uuids,sort_order';
const TTL_MS = 60_000;
let cache: { loadedAt: number; deals: Deal[] } | null = null;

export async function loadDeals(): Promise<Deal[]> {
  if (!dbConfigured()) return [];
  if (cache && Date.now() - cache.loadedAt < TTL_MS) return cache.deals;
  try {
    const rows = await rest<OfferRow[]>(`/offers?select=${COLUMNS}&active=eq.true&order=sort_order.asc`);
    const deals = rows.map((row): Deal => ({
      id: row.id, title: row.title, badge: row.badge, discountPercent: Number(row.discount_percent) || 0, perks: row.perks ?? [],
      promoCode: row.promo_code, minNights: row.min_nights, minDaysBefore: row.min_days_before_arrival, maxDaysBefore: row.max_days_before_arrival,
      roomTypeUuids: row.room_type_uuids ?? [], sortOrder: row.sort_order,
    }));
    cache = { loadedAt: Date.now(), deals };
    return deals;
  } catch (error) {
    console.error('Could not load special offers — pricing without them', error);
    return cache?.deals ?? [];
  }
}
