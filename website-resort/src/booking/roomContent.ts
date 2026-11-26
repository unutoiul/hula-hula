import { rooms } from '../data/content';
import { photoAssets as p } from '../data/photos';

// SiteMinder's API has no photos, so the booking page borrows the homepage's
// room cards (content.ts → rooms), matched on siteminderRoomTypeUuid, then on
// the name. A room type with no card still shows, with a resort photo.

// Room types with no homepage card, but their own photos.
const EXTRA_PHOTOS: Record<string, string[]> = {
  gjzz2w06atklvkoz: [p.seaTownBedroom.src, p.seaTownRoom.src], // Deluxe Sea Town View
};

const normalise = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

export function roomContent(roomTypeUuid: string, name: string): { images: string[]; blurb: string | null } {
  const card = rooms.find((room) => room.siteminderRoomTypeUuid === roomTypeUuid) ?? rooms.find((room) => normalise(room.title) === normalise(name));
  if (card) return { images: card.images, blurb: card.detail };
  return { images: EXTRA_PHOTOS[roomTypeUuid] ?? [p.poolOverview.src, p.garden.src], blurb: null };
}
