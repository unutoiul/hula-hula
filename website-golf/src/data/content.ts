import type { NavItem } from '../types';
import { photoAssets as p } from './photos';

export const navItems: NavItem[] = [
  ['The course', '#course'], ['Play', '#play'], ['Prices', '#prices'], ['Clubhouse', '#clubhouse'], ['Visit', '#visit'], ['Say hello', '#contact'],
];

export const COURSE_FACTS = [
  { value: '9', label: 'holes' },
  { value: '36', label: 'par' },
  { value: '3,011', label: 'yards' },
  { value: '8.5–9', label: 'ft green speed' },
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
