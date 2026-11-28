// Shared shapes used across the page's sections and data files.

/**
 * One card in a DragCarousel (Rooms, ...). `images` can be one photo or
 * several — the card itself carries a mini gallery, arrows/dots only
 * appearing when there's more than one to flip through.
 */
export interface CarouselCardData {
  id: string;
  kicker: string;
  title: string;
  detail: string;
  images: string[];
}

/** A room card that is also a SiteMinder room type — the id links the
 * homepage photos and copy to the live rates on /book, and is its page
 * (/rooms/<id>). */
export interface RoomContent extends CarouselCardData {
  siteminderRoomTypeUuid?: string;
  /** What the room is called on the OTAs today (Agoda, Booking.com…), which SiteMinder may still use. */
  otaName: string;
  /** Left out when the hotel hasn't given a size. */
  sqm?: number;
  beds: string;
  sleeps: number;
  view: string;
  /** Who it's best for, in a few words: "Workation", "Kids' favourite". */
  bestFor: string;
  /** What makes it this room, for its own page. */
  highlights: string[];
  about: string;
  /** Set for a stay away from the hotel (the golf-club villas): where it is, shown on its page. */
  location?: { name: string; detail: string; mapsUrl: string };
  /** What's in it, when that isn't the hotel rooms' list (roomFeatures). */
  features?: string[];
}

export interface Meal {
  name: string;
  hours: string;
  detail: string;
  /** Which part of the photo to keep when it's cropped to the frame. */
  objectPosition?: string;
  image: string;
  imageAlt: string;
}

/** [label, href] — href is an in-page anchor like "#rooms" (or a page, "/meetings"). */
export type NavItem = [label: string, href: string];

export interface ContactInfo {
  /** Mobile number, also the WhatsApp line. */
  phone: string;
  tel: string;
  landline: string;
  landlineTel: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  maps: string;
  whatsapp: string;
  /** Meetings & events team, and weddings. */
  events: { phone: string; tel: string; whatsapp: string; email: string };
  weddings: { phone: string; tel: string; email: string };
}
