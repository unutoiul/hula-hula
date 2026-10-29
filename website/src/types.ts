// Shared shapes used across the page's sections and data files.

/**
 * One card in a DragCarousel (Activities, Rooms & villas, ...). `images` is
 * usually one photo (Activities) but can be several (Rooms) — the card
 * itself carries a mini gallery, arrows/dots only appearing when there's
 * more than one to flip through.
 */
export interface CarouselCardData {
  id: string;
  kicker: string;
  title: string;
  detail: string;
  images: string[];
}

/** A room card that is also a SiteMinder room type — the id links the
 * homepage photos and copy to the live rates on /book. */
export interface RoomContent extends CarouselCardData {
  siteminderRoomTypeUuid?: string;
}

export interface Meal {
  name: string;
  hours: string;
  detail: string;
  /** Which part of the photo to keep when it's cropped to the frame. */
  objectPosition?: string;
  image: string;
}

export interface EventFact {
  value: string;
  unit: string;
  label: string;
}

/** [label, href] — href is an in-page anchor like "#hotel". */
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
  line: string;
  whatsapp: string;
}
