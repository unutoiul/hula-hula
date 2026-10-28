import { rooms } from '../data/content';
import { photoAssets as p } from '../data/photos';

// SiteMinder's API has no photos, so the booking page borrows the homepage's
// room cards (content.ts → rooms), matched on siteminderRoomTypeUuid, then on
// the name. A room type with no card still shows, with a resort photo.

// Deluxe Sea Town View shares the Deluxe interiors; there's no sea-view photo yet.
const EXTRA_PHOTOS: Record<string, string[]> = {
  gjzz2w06atklvkoz: [p.deluxeBedroom.src, p.deluxeRoom.src, p.deluxeBathroom.src],
};

const normalise = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

export function roomContent(roomTypeUuid: string, name: string): { images: string[]; blurb: string | null } {
  const card = rooms.find((room) => room.siteminderRoomTypeUuid === roomTypeUuid) ?? rooms.find((room) => normalise(room.title) === normalise(name));
  if (card) return { images: card.images, blurb: card.detail };
  return { images: EXTRA_PHOTOS[roomTypeUuid] ?? [p.poolOverview.src, p.garden.src], blurb: null };
}
