import { DEFAULT_SITE, normaliseActivity, normaliseClub, normaliseRentals, type SiteData } from '../../src/booking/config.ts';
import { rest } from './db.ts';

// Everything staff edit in /admin — activities (only the ones switched on),
// rental clubs and the club settings — read fresh from Supabase and checked
// field by field. If the database can't be reached the site keeps working on
// the defaults in src/booking/config.ts.

export async function loadSite(): Promise<SiteData> {
  try {
    const [activities, settings] = await Promise.all([
      rest<{ id: string; data: Record<string, unknown> }[]>('/golf_activities?select=id,data&active=eq.true&order=sort_order,id'),
      rest<{ key: string; value: unknown }[]>('/golf_settings?select=key,value'),
    ]);
    const setting = (key: string) => settings.find((s) => s.key === key)?.value;
    return {
      activities: activities.length ? activities.map((a) => normaliseActivity(a.data, a.id)) : DEFAULT_SITE.activities,
      rentals: setting('rentals') === undefined ? DEFAULT_SITE.rentals : normaliseRentals(setting('rentals')),
      club: normaliseClub(setting('club')),
    };
  } catch (error) {
    console.error('Site settings unavailable, using defaults', error);
    return DEFAULT_SITE;
  }
}
