import type { CarouselCardData, ContactInfo, EventFact, HeroSlide, Meal, NavItem } from '../types';

export const navItems: NavItem[] = [
  ['Hotel', '#hotel'],
  ['Restaurant', '#dine'],
  ['Activities', '#ways'],
  ['Events', '#events'],
  ['Arrival', '#arrival'],
  ['Contact', '#contact'],
];

const photos = {
  climb: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1000&q=85',
  // The actual limestone karsts at Railay/Phra Nang Beach — verified by
  // downloading and viewing it, not just trusting the source caption (an
  // earlier "Railay sunrise" candidate turned out, on inspection, to be a
  // generic hazy dock scene with no cliffs in it at all).
  railay: 'https://images.unsplash.com/photo-1671838416230-e85f3d81b19d?auto=format&fit=crop&w=1000&q=85',
  aerial: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=85',
  mangrove: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=1000&q=85',
};

// One dish per meal — the restaurant showcase crossfades between these as the
// visitor (or the auto-rotation) moves through the day.
const mealImages = {
  breakfast: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1400&q=85',
  lunch: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=85',
  dinner: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1400&q=85',
  coffee: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1400&q=85',
};

// Krabi / Andaman-style hero imagery — real curated photography (limestone karst,
// longtail boats, turquoise lagoons) standing in until on-brand photography is generated.
// Short (≤15 char) headline lines by design — they render at up to ~130px, so long
// phrases wrap into an unreadable stack. Each slide rotates with its image, in sync.
// Each slide previews one part of the hotel — Hotel, Restaurant, Golf & pool, Activities,
// Events — so the rotation doubles as a tour of what's actually here, not just scenery.
export const heroSlides: HeroSlide[] = [
  { image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=2400&q=85', headline: ['A hotel on', "Krabi's coast."], text: 'Rooms and villas available minutes from Ao Nang and Railay Beach.' },
  { image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=2400&q=85', headline: ['Breakfast to', 'sunset dinner.'], text: "Thai flavors from Krabi's markets, cooked slow and served open-air, with a coffee bar open all day." },
  { image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2400&q=85', headline: ['Tee off,', 'then unwind.'], text: 'Sunrise tee times, a pool that meets the sea, and nowhere you have to be.' },
  { image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=2400&q=85', headline: ['A longtail ride', 'to Railay.'], text: 'Sunset by boat, an early tee time, cliffs to climb — all just minutes from the hotel.' },
  { image: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=2400&q=85', headline: ['Weddings and', 'quiet events.'], text: 'A garden lawn for vows at sunset, and a room for meetings, planned start to finish.' },
];

export const experiences: CarouselCardData[] = [
  { id: '01', kicker: '01', title: 'Cliffs above the tide', detail: 'Rock climbing at Railay, cliff to open sea.', images: [photos.climb] },
  { id: '02', kicker: '02', title: 'Sunset in Railay', detail: 'A longtail ride to dinner on the sand.', images: [photos.railay] },
  { id: '03', kicker: '03', title: 'Above the bay', detail: 'Climb Khao Ngon Nak for a view of the whole coast.', images: [photos.aerial] },
  { id: '04', kicker: '04', title: 'Into the mangroves', detail: 'Kayak the quiet backwaters at first light.', images: [photos.mangrove] },
];

// Real photography of the hotel's own rooms and villas — several angles per
// room, so each card can carry its own mini photo gallery.
export const rooms: CarouselCardData[] = [
  { id: 'deluxe-garden', kicker: '01', title: 'Deluxe Garden Street View', detail: 'One bedroom · Garden and street view · Rain shower', images: ['/rooms/deluxe-garden-1.jpg', '/rooms/deluxe-garden-2.jpg', '/rooms/deluxe-garden-3.jpg'] },
  { id: 'premier-pool-mountain', kicker: '02', title: 'Premier Pool Mountain View', detail: 'One bedroom · Pool and mountain view · Balcony', images: ['/rooms/premier-pool-mountain-1.png', '/rooms/premier-pool-mountain-2.png'] },
  { id: 'signature-spa-villa', kicker: '03', title: 'Signature Spa Villa', detail: 'One bedroom · Private spa bath · Garden villa', images: ['/rooms/signature-spa-villa-1.jpg', '/rooms/signature-spa-villa-2.jpg', '/rooms/signature-spa-villa-3.png', '/rooms/signature-spa-villa-4.png'] },
  { id: 'two-storey-pool-villa', kicker: '04', title: 'Two-Storey Pool Villa', detail: 'Two floors · Private plunge pool · Garden terrace', images: ['/rooms/two-storey-pool-villa-1.jpg', '/rooms/two-storey-pool-villa-2.jpg', '/rooms/two-storey-pool-villa-3.jpg', '/rooms/two-storey-pool-villa-4.jpg'] },
  { id: 'villa-spa-premier', kicker: '05', title: 'Villa Spa Premier', detail: 'One bedroom · Spa bath · Garden outlook', images: ['/rooms/villa-spa-premier-1.jpg'] },
];

export const meals: Meal[] = [
  { name: 'Breakfast', hours: '7:00 – 10:30', detail: 'Rice porridge, tropical fruit, coffee from the highlands.', image: mealImages.breakfast },
  { name: 'Lunch', hours: '12:00 – 15:00', detail: 'Noodles, curries and cold coconut by the pool.', image: mealImages.lunch },
  { name: 'Dinner', hours: '18:00 – 22:00', detail: "The day's catch, grilled over charcoal, best at sunset.", image: mealImages.dinner },
  { name: 'Coffee bar', hours: '6:00 – 23:00', detail: 'Espresso and Thai iced tea, open from the lobby all day.', image: mealImages.coffee },
];

export const eventFacts: EventFact[] = [
  { value: '120', unit: 'guests', label: 'Up to' },
  { value: '3', unit: 'indoor & garden lawn', label: 'Venues' },
  { value: '40', unit: 'seats, boardroom style', label: 'Meeting room' },
  { value: '1', unit: 'from first call to send-off', label: 'Dedicated planner' },
];

// The hotel's real public contact details (from its Facebook/Instagram/Line/WhatsApp listings).
export const CONTACT: ContactInfo = {
  phone: '+66 91 998 8891',
  tel: 'tel:+66919988891',
  address: '222 Moo 3, Klonghang Road, Ao Nang, Muang, Krabi 81180, Thailand',
  facebook: 'https://www.facebook.com/hulahulagolfclub',
  instagram: 'https://www.instagram.com/hulahulagolfclub',
  line: 'http://line.me/ti/p/@hulahulagolfclub',
  whatsapp: 'https://wa.me/66919988891',
};
