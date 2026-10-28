// Who sleeps where: shared by the cart (to tell the guest whether the rooms
// they picked fit everyone) and by /api/booking/create (to refuse a room
// asked to hold more people than SiteMinder allows). Pure functions only —
// the API loads this file at runtime too, so type imports are all it may have.
import type { RoomCapacity } from './bookingContract';

export interface Occupancy { adults: number; children: number }

/** Every room needs an adult; children count against the room's total, and
 * against its adult places when it has no separate child places. */
export function fits(capacity: RoomCapacity, adults: number, children: number): boolean {
  if (adults < 1 || adults + children > capacity.guests) return false;
  if (capacity.children > 0) return adults <= capacity.adults && children <= capacity.children;
  return adults + children <= capacity.adults;
}

/** Spreads the party over the chosen rooms (one adult in each first, then the
 * rest wherever there's most space left), or null when they don't fit. The
 * result lines up with `rooms`. */
export function distributeGuests(rooms: RoomCapacity[], adults: number, children: number): Occupancy[] | null {
  if (rooms.length === 0 || adults < rooms.length) return null;
  const plan: Occupancy[] = rooms.map(() => ({ adults: 1, children: 0 }));
  const place = (kind: keyof Occupancy, count: number) => {
    for (let i = 0; i < count; i++) {
      let best = -1;
      let bestSpace = 0;
      plan.forEach((occ, index) => {
        const next = { ...occ, [kind]: occ[kind] + 1 };
        const space = rooms[index].guests - occ.adults - occ.children;
        if (fits(rooms[index], next.adults, next.children) && space > bestSpace) { best = index; bestSpace = space; }
      });
      if (best < 0) return false;
      plan[best][kind] += 1;
    }
    return true;
  };
  if (!rooms.every((capacity) => fits(capacity, 1, 0))) return null;
  return place('adults', adults - rooms.length) && place('children', children) ? plan : null;
}
