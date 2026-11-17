import { rooms } from '../data/content';
import { photoAssets as p } from '../data/photos';

// SiteMinder's API has no photos, so the booking page borrows the homepage's
// room cards (content.ts → rooms), matched on siteminderRoomTypeUuid, then on
// the name — the website's name or the one the room still has on the booking
// sites (otaName). A room type with no card still shows, with a hotel photo.

const normalise = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

export function roomContent(roomTypeUuid: string, name: string): { images: string[]; blurb: string | null } {
  const wanted = normalise(name);
  const card = rooms.find((room) => room.siteminderRoomTypeUuid === roomTypeUuid)
    ?? rooms.find((room) => normalise(room.title) === wanted || normalise(room.otaName) === wanted);
  if (card) return { images: card.images, blurb: card.detail };
  return { images: [p.poolFlamingo.src, p.poolLoungers.src], blurb: null };
}
