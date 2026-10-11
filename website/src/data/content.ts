import type { CarouselCardData, ContactInfo, EventFact, HeroSlide, Meal, NavItem } from '../types';
import { photoAssets as p } from './photos';

export const navItems: NavItem[] = [
  ['Stay', '#hotel'], ['Dine', '#dine'], ['Play', '#ways'], ['Celebrate', '#events'], ['Plan your stay', '#arrival'], ['Say hello', '#contact'],
];

export const heroSlides: HeroSlide[] = [
  { image: p.heroPool.src, headline: ['Pool days,', 'happy days.'], text: 'Palms overhead. A pool at your feet. Welcome to your happy place.' },
  { image: p.heroBreakfast.src, headline: ['Breakfast with', 'a splash.'], text: 'Slow mornings taste even better with a floating breakfast.' },
  { image: p.heroGolf.src, headline: ['A little play', 'goes a long way.'], text: 'Gather your favourite people for a day at Hula Hula Golf Club.' },
];

export const rooms: CarouselCardData[] = [
  { id: 'deluxe-garden', kicker: 'A sunny little escape', title: 'Deluxe Garden Street View', detail: 'Bright bedrooms, a garden outlook, and space to switch to holiday mode.', images: [p.deluxeBedroom.src, p.deluxeRoom.src, p.deluxeBathroom.src] },
  { id: 'premier-pool-mountain', kicker: 'Views to wake up to', title: 'Premier Pool Mountain View', detail: 'Step onto your balcony and take in the pool and tropical surroundings.', images: [p.premierBedroom.src, p.premierRoom.src] },
  { id: 'signature-spa-villa', kicker: 'Your own little retreat', title: 'Signature Spa Villa', detail: 'Warm wood, tropical touches, and a spa bath for a slower kind of evening.', images: [p.signatureBedroom.src, p.signatureRoom.src, p.spaBathroom.src] },
  { id: 'two-storey-pool-villa', kicker: 'Extra room for good times', title: 'Two-Storey Pool Villa', detail: 'Your own pool terrace, a four-poster bedroom, and room to spread out.', images: [p.poolVillaTerrace.src, p.poolVillaBedroom.src, p.poolVillaLiving.src] },
  { id: 'villa-spa-premier', kicker: 'Soak up the holiday', title: 'Villa Spa Premier', detail: 'A cosy villa, leafy balcony, and a spa bath made for unwinding.', images: [p.spaPremierBedroom.src, p.spaPremierBalcony.src, p.spaBathroom.src] },
  { id: 'junior-pool-access', kicker: 'From bed to pool', title: 'Junior Suite Pool Access Mountain View', detail: 'Open the doors to a tropical terrace and make pool time part of your day.', images: [p.juniorBedroom.src, p.juniorTerrace.src, p.juniorBathroom.src] },
  { id: 'family-two-bedrooms', kicker: 'Bring the whole crew', title: 'Family Two Bedrooms', detail: 'Space to come together, with a living area for all your holiday plans.', images: [p.familyLiving.src, p.familyBedroom.src, p.familyBathroom.src] },
];

export const meals: Meal[] = [
  { name: 'Make breakfast float', hours: 'Poolside mornings', detail: 'Tropical fruit, eggs, toast, and a splash of something special. Ask our team about floating breakfast.', image: p.breakfast.src },
  { name: 'A taste of Thailand', hours: 'Chang Restaurant', detail: 'Pineapple fried rice, colourful Thai dishes, and relaxed garden-side dining.', image: p.pineappleRice.src },
  { name: 'Treat yourself', hours: 'Pom Pom Cafe', detail: 'Burgers, shakes, fresh coconuts, and whatever your holiday appetite is calling for.', image: p.burger.src },
  { name: 'Cheers to good times', hours: 'Cocktails & cool drinks', detail: 'A tropical cocktail or a fruity shake. Pick your favourite and settle into the afternoon.', image: p.cocktail.src },
];

export const experiences: CarouselCardData[] = [
  { id: 'pool-days', kicker: 'Splash', title: 'Pool days are the best days', detail: 'Take a dip, find a lounger, and enjoy the tropical pool.', images: [p.poolOverview.src, p.poolBar.src] },
  { id: 'golf-days', kicker: 'Play', title: 'Tee up a little fun', detail: 'Golf, footgolf, and good company at Hula Hula Golf Club.', images: [p.heroGolf.src, p.golfSwing.src, p.golfCourse.src] },
  { id: 'krabi-days', kicker: 'Explore', title: 'Hello, beautiful Krabi', detail: 'Longtail boats, turquoise water, and the limestone cliffs of Railay.', images: [p.longtail.src, p.railay.src] },
  { id: 'slow-days', kicker: 'Unwind', title: 'A little time for you', detail: 'Slow down with tropical surroundings and a moment of me time. Ask about our wellness experiences.', images: [p.wellness.src, p.garden.src] },
  { id: 'move-days', kicker: 'Move', title: 'Feel good, your way', detail: 'Keep your holiday moving in our bright, garden-facing fitness centre.', images: [p.gym.src] },
];

export const eventFacts: EventFact[] = [
  { value: 'Gather', unit: 'Banquets & celebrations', label: 'Good company' },
  { value: 'Connect', unit: 'Meetings & team get-togethers', label: 'Fresh ideas' },
];

export interface GalleryPhoto { image: string; title: string; category: string }
export const galleryPhotos: GalleryPhoto[] = [
  { image: p.poolOverview.src, title: 'A pool day in paradise', category: 'Pool days' },
  { image: p.breakfastPortrait.src, title: 'Floating breakfast, holiday style', category: 'Good food' },
  { image: p.poolVillaBedroom.src, title: 'Your four-poster hideaway', category: 'Stay a while' },
  { image: p.watermelon.src, title: 'A fresh watermelon moment', category: 'Good food' },
  { image: p.heroGolf.src, title: 'Good times with the whole crew', category: 'Out & about' },
  { image: p.poolNight.src, title: 'When the pool lights come on', category: 'Pool days' },
  { image: p.garden.src, title: 'Take the leafy route', category: 'Stay a while' },
  { image: p.thaiFood.src, title: 'A table full of Thai favourites', category: 'Good food' },
  { image: p.railay.src, title: 'Hello from Railay', category: 'Out & about' },
  { image: p.juniorTerrace.src, title: 'Your terrace, your pool time', category: 'Stay a while' },
  { image: p.poolLifestyle.src, title: 'Nothing on the agenda but sunshine', category: 'Pool days' },
  { image: p.coconut.src, title: 'Fresh coconut, anyone?', category: 'Good food' },
];

export const CONTACT: ContactInfo = {
  phone: '+66 91 998 8891', tel: 'tel:+66919988891',
  address: '222 Moo 3, Klonghang Road, Ao Nang, Muang, Krabi 81180, Thailand',
  facebook: 'https://www.facebook.com/hulahulagolfclub', instagram: 'https://www.instagram.com/hulahulagolfclub',
  line: 'http://line.me/ti/p/@hulahulagolfclub', whatsapp: 'https://wa.me/66919988891',
};
