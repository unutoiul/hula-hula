import type { ActivityId } from '../booking/config';
import type { CarouselCardData, NavItem } from '../types';
import { photoAssets as p } from './photos';

export const navItems: NavItem[] = [
  ['The course', '#course'], ['Play', '#play'], ['Prices', '#prices'], ['Clubhouse', '#clubhouse'], ['Visit', '#visit'], ['Say hello', '#contact'],
];

export { CONTACT } from './contact';

export const COURSE_FACTS = [
  { value: '9', label: 'holes' },
  { value: '36', label: 'par' },
  { value: '3,011', label: 'yards' },
  { value: '8.5–9', label: 'ft green speed' },
];

export interface PlayCard extends CarouselCardData { activity: ActivityId }

export const playCards: PlayCard[] = [
  { id: 'golf', activity: 'golf', kicker: 'Golf · 9 or 18 holes', title: 'Tee off in the tropics', detail: 'Narrow fairways, water to carry and quick greens, with Phanom Bencha mountain on the horizon. Green fee, caddie and cart included.', images: [p.fairwaySign.src, p.golfSwing.src, p.sunnyFairway.src] },
  { id: 'footgolf', activity: 'footgolf', kicker: 'FootGolf · 9 or 18 holes', title: 'Golf rules. Football feet.', detail: 'A full 18-hole FootGolf course right on the fairways. Kick, chase, laugh, repeat — fun for all ages.', images: [p.footgolfGroup.src, p.footgolfKick.src, p.footgolfFairway.src] },
  { id: 'puttgolf', activity: 'puttgolf', kicker: 'Putt-Golf · 1 hour', title: 'Mini-golf on real greens', detail: 'Ride a cart from green to green while your caddie sets fun starting points. Perfect for families and first-timers.', images: [p.puttingGreen.src, p.pondFairway.src] },
  { id: 'range', activity: 'range', kicker: 'Driving range · by the hour', title: 'Your own private bay', detail: 'Cosy bays for up to five, each with a sofa, a launch monitor and food and drinks brought to you. Chipping and putting course included.', images: [p.rangeBays.src] },
  { id: 'lesson', activity: 'lesson', kicker: 'Golf lesson · half day', title: 'Your very first swing', detail: 'A relaxed 3.5-hour session for complete beginners, with coaching, range time and all the equipment. Not too serious — just fun.', images: [p.teeShot.src, p.golfSwing.src] },
];

export interface CafeMoment { name: string; detail: string; image: string; objectPosition?: string }
export const cafeMoments: CafeMoment[] = [
  { name: 'Before your round', detail: 'Lattes, matcha and fresh pastries, served on little putting greens.', image: p.cafeCoffee.src },
  { name: 'After your round', detail: 'Plates to share and cold shakes on the balcony, looking down the fairways.', image: p.cafeView.src, objectPosition: 'center 70%' },
  { name: 'Any time at all', detail: 'Sink into the lounge, cool off, and swap stories about the one that nearly went in.', image: p.cafeLounge.src },
];

export interface GalleryPhoto { image: string; title: string; category: string }
export const galleryPhotos: GalleryPhoto[] = [
  { image: p.fairwayBalcony.src, title: 'The view from the clubhouse', category: 'The course' },
  { image: p.footgolfGroup.src, title: 'Squad goals on hole 8', category: 'FootGolf' },
  { image: p.puttingGreen.src, title: 'Over the water, onto the green', category: 'The course' },
  { image: p.cafeCoffee.src, title: 'Coffee, Hula Hula style', category: 'Clubhouse' },
  { image: p.golfSwing.src, title: 'Swing, and enjoy the ride', category: 'The course' },
  { image: p.footgolfKick.src, title: 'Lining up the big kick', category: 'FootGolf' },
  { image: p.clubhouse.src, title: 'Welcome to the clubhouse', category: 'Clubhouse' },
  { image: p.pondFairway.src, title: 'Blue skies, green fairways', category: 'The course' },
  { image: p.footgolfFlag.src, title: 'Who’s got the honours?', category: 'FootGolf' },
  { image: p.cafeInterior.src, title: 'Cool and green inside', category: 'Clubhouse' },
  { image: p.sunnyFairway.src, title: 'Freshly striped fairways', category: 'The course' },
  { image: p.footgolfFairway.src, title: 'Chasing it down the fairway', category: 'FootGolf' },
];
