import { rooms } from '../data/content';
import { photoAssets as p } from '../data/photos';

// SiteMinder's API has no photos, so the booking page borrows the homepage's
// room cards (content.ts → rooms), matched on siteminderRoomTypeUuid, then on
// the name — the website's name or the one the room still has on the booking
// sites (otaName). `title` is the website's name for the room ("Twin Coco"),
// so a guest finds the room they clicked; `listedAs` is SiteMinder's name when
// it differs, which is the one on the reservation. A room type with no card
// still shows, under SiteMinder's name, with a hotel photo.

// Tolerates a missing name (SiteMinder can send a room type without one).
const normalise = (name: string | null | undefined) => (name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function roomContent(
  roomTypeUuid: string,
  name: string | null,
): { title: string; listedAs: string | null; images: string[]; blurb: string | null } {
  const wanted = normalise(name);
  const card =
    rooms.find((room) => room.siteminderRoomTypeUuid === roomTypeUuid) ??
    rooms.find((room) => normalise(room.title) === wanted || normalise(room.otaName) === wanted);
  if (card) return { title: card.title, listedAs: normalise(card.title) === wanted ? null : name, images: card.images, blurb: card.detail };
  return { title: name || 'Room', listedAs: null, images: [p.poolFlamingo.src, p.poolLoungers.src], blurb: null };
}
