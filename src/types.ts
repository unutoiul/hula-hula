// Shared shapes used across the page's sections and data files.

export interface HeroSlide {
  image: string;
  /** Always exactly two lines — see the length note in data/content.ts. */
  headline: [string, string];
  text: string;
}

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

export interface Meal {
  name: string;
  hours: string;
  detail: string;
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
  phone: string;
  tel: string;
  address: string;
  facebook: string;
  instagram: string;
  line: string;
  whatsapp: string;
}
