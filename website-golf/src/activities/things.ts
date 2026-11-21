import { type Activity, type ActivityIconKey, type SiteData } from '../booking/config';
import { priceTag } from '../booking/pricing';
import { places, type Place } from '../data/content';

// Everything to do at the club as one list: the activities staff have
// switched on in /admin (in their order), then the café and the pool villa.
// Each has its own page at /activities/<id>.

export type ThingIconKey = ActivityIconKey | Place['kind'];

export interface ThingToDo {
  id: string;
  name: string;
  tagline: string;
  /** First photo, if it has any. */
  image?: string;
  icon: ThingIconKey;
  href: string;
  /** "from ฿1,400", "Ask us", "Open to all"… */
  note: string;
}

export const thingHref = (id: string) => id === 'golf' ? '/course' : `/activities/${id}`;

export const priceNote = (activity: Activity) => priceTag(activity);

export function thingsToDo(site: Pick<SiteData, 'activities'>): ThingToDo[] {
  return [
    ...site.activities.map((a) => ({ id: a.id, name: a.name, tagline: a.tagline, image: a.card.images[0], icon: a.icon, href: thingHref(a.id), note: priceNote(a) })),
    ...places.map((pl) => ({ id: pl.id, name: pl.name, tagline: pl.tagline, image: pl.images[0], icon: pl.kind, href: thingHref(pl.id), note: pl.kind === 'cafe' ? 'Open to all' : 'At the resort' })),
  ];
}
