import type { ContactInfo, Meal, NavItem, RoomContent } from '../types';
import { photoAssets as p } from './photos';

// Everything the Royal Pineapple website says, from the hotel's own content
// documents (assets/ROYAL PINEAPPLE HOTEL/Content & Information, and the
// longer write-up in marketing/). Room sizes and names follow the newer
// September brief; bed types the August one.

export const navItems: NavItem[] = [
  ['Stay', '#rooms'],
  ['Dine', '#dine'],
  ['Wellness', '#wellness'],
  ['Meet & celebrate', '#meet'],
  ['Explore Krabi', '#explore'],
  ['Say hello', '#contact'],
];

/** "Stay. Recharge. Connect. Meet. Explore." — the five reasons to stay, each a door into the page. */
export const pillars = [
  { word: 'Stay', line: 'Rooms made for a good night’s sleep', href: '#rooms' },
  { word: 'Recharge', line: 'Hair, beauty & massage at On Cloud, opening soon', href: '#wellness' },
  { word: 'Connect', line: 'Poolside, any hour, at Tick Tock 24/7', href: '#tick-tock' },
  { word: 'Meet', line: 'Rooms for 10 to 200 people', href: '#meet' },
  { word: 'Explore', line: 'Real Krabi, beyond the tourist trail', href: '#explore' },
] as const;

/** In every room. */
export const roomFeatures = [
  'Air conditioning',
  'Private balcony',
  'Tea & coffee',
  'Private bathroom with shower',
  'Flat-screen TV with cable',
  'Safe',
  'Hairdryer',
  'Toiletries',
  'Free Wi-Fi',
];

/** Where the pool villas are: at the golf club, not the hotel. */
const villaLocation = {
  name: 'Hula Hula Golf Club',
  detail: 'Near Krabi International Airport, not at the hotel in Krabi Town.',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hula+Hula+Golf+Club+Krabi',
};

/** In both villas, from SiteMinder's description and the hotel's photos. */
const villaFeatures = [
  'Air conditioning',
  'Living room',
  'Shared pool',
  'Flat-screen TV with cable',
  'Fridge',
  'Electric kettle',
  'Safe',
  'Private bathroom',
  'Toiletries',
];

// siteminderRoomTypeUuid: from SiteMinder's room types (GET /room-types) —
// what links these photos to the live rates on the booking page. Until the
// hotel's SiteMinder keys are in, rooms are matched by their OTA name.
export const rooms: RoomContent[] = [
  {
    id: 'signature-pineapple',
    siteminderRoomTypeUuid: 'f660e0b0-4687-457c-8312-5a0ba6a2fd3c',
    otaName: 'Signature Pineapple',
    kicker: 'Our signature room',
    title: 'Signature Pineapple',
    detail: 'A window cut right through the wall, framed in carved wood, and a big table for getting things done.',
    sqm: 36,
    beds: 'King bed',
    sleeps: 2,
    view: 'Street view',
    bestFor: 'Workations',
    highlights: ['Carved wooden window between the work nook and the bed', 'Big working table', 'Private balcony', 'Quiet street side'],
    about:
      'The room the hotel is named for. A carved wooden frame opens the wall between the work nook and the bed, so the room feels like two. There’s a big table for the laptop days and a balcony for the rest.',
    images: [p.signature.src, p.signatureWindow.src, p.signatureBed.src, p.signatureDesk.src],
  },
  {
    id: 'emerald-pool-access',
    siteminderRoomTypeUuid: '7db25b14-a9ec-4ca2-90ac-5592a30a6dc0',
    otaName: 'Premier Pool Access',
    kicker: 'Straight into the pool',
    title: 'Emerald Pool Access',
    detail: 'Ground floor, arched glass doors and the pool a few steps away. The room kids (and couples) ask for.',
    sqm: 38,
    beds: 'King bed',
    sleeps: 2,
    view: 'Pool access',
    bestFor: 'Kids & couples',
    highlights: ['Arched doors onto the pool terrace', 'Ground floor', 'Sea-blue walls and coral quilts', 'Work desk'],
    about:
      'On the ground floor, behind the arches you see from the pool. Open the doors and the pool is right there, so morning swims start in your flip-flops.',
    images: [p.emerald.src, p.emeraldPool.src, p.emeraldBed.src, p.emeraldBath.src],
  },
  {
    id: 'premier-blue-sky',
    siteminderRoomTypeUuid: '9d2d5468-41ca-4f8c-8e7e-ecaa00b49ca0',
    otaName: 'Premier Pool Town View',
    kicker: 'Quiet corner, pool view',
    title: 'Premier Blue Sky Holiday',
    detail: 'Sky-blue walls, a long desk and a balcony over the pool, in the quieter corner of the building.',
    sqm: 34,
    beds: 'King bed',
    sleeps: 2,
    view: 'Pool view',
    bestFor: 'Long stays & staycations',
    highlights: ['Balcony over the pool', 'Long desk', 'Quieter corner of the hotel', 'Starfish quilt'],
    about:
      'A calm room for longer stays. The long desk faces a wall of carved panels, the balcony looks down on the pool, and the corner it sits in is the quietest in the hotel.',
    images: [p.blueSky.src, p.blueSkyView.src, p.blueSkyDesk.src, p.blueSkyBed.src],
  },
  {
    id: 'double-hibiscus',
    siteminderRoomTypeUuid: '73cf71b9-a735-4fb3-80e9-b54bbfaa28d4',
    otaName: 'Deluxe Town View',
    kicker: 'Pretty in pink',
    title: 'Double Hibiscus',
    detail: 'Blush-pink walls, a hibiscus quilt and a carved flower frame you’ll want in your photos.',
    sqm: 28,
    beds: 'King bed',
    sleeps: 2,
    view: 'Town view',
    bestFor: 'Short stays & business trips',
    highlights: ['Balcony over Krabi Town', 'Carved flower frame above the bed', 'Desk and dressing table', 'Pink terrazzo bathroom'],
    about: 'Good value and a good night’s sleep, with the prettiest walls in the building. The balcony looks over Krabi Town to the hills.',
    images: [p.hibiscus.src, p.hibiscusBed.src, p.hibiscusDesk.src, p.hibiscusBath.src],
  },
  {
    id: 'twin-coco',
    siteminderRoomTypeUuid: 'c82ed00a-447e-4bae-b04c-0bdc8d585137',
    otaName: 'Deluxe Twin Room',
    kicker: 'Two beds, good value',
    title: 'Twin Coco',
    detail: 'Two single beds, soft green walls and coconut cushions. Easy for friends and work trips.',
    sqm: 32,
    beds: 'Two single beds',
    sleeps: 2,
    view: 'Street view',
    bestFor: 'Friends & colleagues',
    highlights: ['Two single beds', 'Patterned tile floor', 'Desk and dressing table', 'Private balcony'],
    about:
      'A light, leafy-green room with two single beds, a patterned tile floor and coconut cushions. Good value and a good night’s sleep for two.',
    images: [p.twinCoco.src, p.twinCocoBeds.src, p.twinCocoDesk.src, p.twinCocoBath.src],
  },
  {
    id: 'triple-coco',
    siteminderRoomTypeUuid: '0ff2e747-0c2e-41f2-986c-3bd48703784e',
    otaName: 'Triple Street View',
    kicker: 'Room for three',
    title: 'Triple Coco',
    detail: 'Three beds in a long green room, with coconut cushions and a balcony.',
    sqm: 32,
    beds: 'Three single beds',
    sleeps: 3,
    view: 'Street view',
    bestFor: 'Three friends',
    highlights: ['Three single beds', 'Patterned tile floor', 'Long room with a desk', 'Private balcony'],
    about: 'The Twin Coco with a third bed. A long green room for three friends, or two and a little one.',
    images: [p.tripleCoco.src, p.tripleCocoBeds.src, p.tripleCocoRoom.src, p.tripleCocoBath.src],
  },
  {
    id: 'triple-blue-sky',
    siteminderRoomTypeUuid: '18bb9bc3-07a3-4454-8bad-a38515a3925a',
    otaName: 'Triple Pool View',
    kicker: 'Three by the pool',
    title: 'Triple Blue Sky',
    detail: 'Sky-blue walls, starfish quilts, room for three and a balcony over the pool.',
    sqm: 34,
    beds: 'Three single beds',
    sleeps: 3,
    view: 'Pool view',
    bestFor: 'Small families',
    highlights: ['Three beds', 'Balcony over the pool', 'Starfish quilts', 'Work desk'],
    about: 'A bright blue room for three with a balcony looking down on the pool and the pink loungers.',
    images: [p.tripleBlue.src, p.tripleBlueBeds.src, p.tripleBlueRoom.src, p.tripleBluePool.src],
  },
  {
    id: 'family-friend-suite',
    siteminderRoomTypeUuid: 'fbdbba82-9f7d-4c30-9244-43296f66ddf6',
    otaName: 'Family Suite Town View',
    kicker: 'Top floor, room for all',
    title: 'Family/Friend Suite',
    detail: 'Our biggest: a bedroom, a living room with a sofa, and green views over Krabi Town from the top floor.',
    sqm: 80,
    beds: 'Two queen beds',
    sleeps: 4,
    view: 'Krabi Town green view',
    bestFor: 'Families & groups',
    highlights: ['Separate bedroom and living room', 'Top floor, wide town views', 'Sofa and coffee table', 'Room for four'],
    about:
      'On the fifth and top floor: a separate bedroom, a living room with a sofa through the arch, and windows looking out over the green of Krabi Town to the limestone hills.',
    images: [p.suite.src, p.suiteBedroom.src, p.suiteArch.src, p.suiteView.src],
  },
  // The two villas are not at the hotel: they share a pool at Hula Hula Golf
  // Club, near the airport, but are sold through Royal Pineapple's SiteMinder.
  // Photos: assets/RP WEBSITE PHOTOS UPDATE. Sizes, beds and guests are
  // SiteMinder's; the 2-bedroom villa has no size there yet.
  {
    id: 'one-bedroom-pool-villa',
    siteminderRoomTypeUuid: '8390f184-a617-4c3b-b945-ba15a288547a',
    otaName: '1-bedroom pool villa with shared pool',
    kicker: 'At Hula Hula Golf Club',
    title: '1-Bedroom Pool Villa',
    detail: 'A villa of your own at our sister golf club: a bedroom, a living room looking onto the shared pool, and a freestanding bathtub.',
    sqm: 42,
    beds: 'Double bed',
    sleeps: 2,
    view: 'Shared pool · Hula Hula Golf Club',
    bestFor: 'Couples & golfers',
    highlights: [
      'Separate bedroom and living room',
      'Big picture window onto the shared pool',
      'Freestanding bathtub',
      'Fridge and microwave',
      'Fairways and the clubhouse café nearby',
    ],
    about:
      'Swap town for the fairways. This villa sits by a shared pool at Hula Hula Golf Club, near Krabi International Airport, with a bedroom, a living room whose big window looks onto the pool, a fridge and microwave, and a bathroom with a freestanding tub.',
    location: villaLocation,
    features: villaFeatures,
    images: [
      p.villa1Living.src,
      p.villaPool.src,
      p.villa1Bedroom.src,
      p.villa1Bath.src,
      p.villa1Lounge.src,
      p.villa1Basin.src,
      p.golfFairway.src,
    ],
  },
  {
    id: 'two-bedroom-pool-villa',
    siteminderRoomTypeUuid: '67989485-da6a-4503-9d96-f5fb51fbdb39',
    otaName: '2-bedroom pool villa with shared pool',
    kicker: 'At Hula Hula Golf Club',
    title: '2-Bedroom Pool Villa',
    detail: 'Room for four at our sister golf club: a living and dining room, a big main bedroom, a twin room and a shared pool outside.',
    beds: 'Double & twin beds',
    sleeps: 4,
    view: 'Shared pool · Hula Hula Golf Club',
    bestFor: 'Families & friends',
    highlights: [
      'Living room and dining table under a carved wooden arch',
      'Main bedroom with wardrobes, a desk and a TV',
      'Twin room for the kids or friends',
      'Shared pool with loungers',
      'Fairways and the clubhouse café nearby',
    ],
    about:
      'A whole house for a family or a few friends, by a shared pool at Hula Hula Golf Club, near Krabi International Airport. There’s a living room with a big TV, a dining table under a carved wooden arch, a main bedroom with its own wardrobes and desk, and a twin room.',
    location: villaLocation,
    features: villaFeatures,
    images: [
      p.villaPool.src,
      p.villa2Master.src,
      p.villa2Living.src,
      p.villa2Dining.src,
      p.villa2Bedroom.src,
      p.villa2MasterBed.src,
      p.villa2Twin.src,
      p.villa2Lounge.src,
      p.golfFairway.src,
    ],
  },
];

export const meals: Meal[] = [
  {
    name: 'Breakfast',
    hours: '6:30 – 10:00 am',
    detail: 'Thai favourites, international classics and fresh fruit, served in the arched dining room.',
    objectPosition: 'center 62%',
    image: p.breakfastBuffet.src,
    imageAlt: 'Breakfast buffet beneath the pink flamingo murals at Chaba Restaurant',
  },
  {
    name: 'Lunch',
    hours: '10:00 am – 4:00 pm',
    detail: 'Freshly made Thai and international dishes, with Indian, vegetarian and vegan choices too.',
    image: p.chabaLunch.src,
    imageAlt: 'Wooden lunch table set with green plates and fresh flowers beside the windows at Chaba',
  },
  {
    name: 'Dinner',
    hours: 'Evenings',
    detail: 'A relaxed dinner after a day out in Krabi.',
    image: p.chabaDinner.src,
    imageAlt: 'Candlelit dinner table beside the illuminated Royal Pineapple pool',
  },
];

export const dietaryChoices = ['Thai', 'International', 'Indian', 'Vegetarian', 'Vegan'];

/** Treats to add to a stay. */
export const celebrations = [
  { title: 'Floating breakfast', detail: 'A breakfast basket in the pool, made for couples and photos.' },
  { title: 'Bed decoration', detail: 'Flowers and towel art for birthdays, anniversaries and proposals.' },
  { title: 'Cake', detail: 'Ready-made designs for every kind of celebration.' },
  { title: 'Flower bouquet', detail: 'A bouquet waiting in the room for someone special.' },
];

export type FacilityIcon =
  | 'pool'
  | 'gym'
  | 'cowork'
  | 'laundry'
  | 'restaurant'
  | 'cafe'
  | 'spa'
  | 'massage'
  | 'meeting'
  | 'shuttle'
  | 'tour'
  | 'motorbike'
  | 'parking'
  | 'wifi'
  | 'celebrate';
export const facilities: { icon: FacilityIcon; title: string; detail: string; hours?: string; href?: string }[] = [
  { icon: 'pool', title: 'Pool & sun deck', detail: 'Pink loungers, a shallow end and one famous flamingo.', href: '#tick-tock' },
  { icon: 'cafe', title: 'Tick Tock 24/7', detail: 'The poolside café and social hub.', hours: '24 hours', href: '#tick-tock' },
  { icon: 'restaurant', title: 'Chaba Restaurant', detail: 'Breakfast, lunch and dinner.', hours: 'From 6:30 am', href: '#dine' },
  { icon: 'spa', title: 'On Cloud Wellness', detail: 'Aveda salon & beauty spa.', hours: 'Opening soon', href: '#wellness' },
  { icon: 'massage', title: 'Thai massage', detail: 'Body, coconut-oil and facial massage.', hours: 'Opening soon', href: '#wellness' },
  { icon: 'cowork', title: 'Co-working space', detail: 'Free Wi-Fi, water, coffee, tea and biscuits.', hours: '24 hours' },
  { icon: 'gym', title: 'Gym', detail: 'Cardio machines, weights and a cable station.', hours: '24 hours' },
  { icon: 'laundry', title: 'Laundry', detail: 'Wash and dry, whenever you need it.', hours: '24 hours' },
  { icon: 'meeting', title: 'Meeting rooms', detail: 'Four rooms and the pool terrace, for 10 to 200.', href: '/meetings' },
  { icon: 'shuttle', title: 'Shuttle bus', detail: 'To the river, Central, Ao Nang and the golf club.', href: '#explore' },
  { icon: 'tour', title: 'Taxi & tour desk', detail: 'Island trips, taxis and the 7-day programme.', href: '/experiences' },
  { icon: 'motorbike', title: 'Motorbike rental', detail: 'See Krabi Town your own way.' },
  { icon: 'parking', title: 'Free parking', detail: 'Plenty of space for cars on site.' },
  { icon: 'wifi', title: 'Free Wi-Fi', detail: 'In every room and all around the hotel.' },
  {
    icon: 'celebrate',
    title: 'Celebrations',
    detail: 'Cakes, flowers, bed decoration, floating breakfast.',
    href: '/experiences#celebrate',
  },
];

// ── The 7-day programme ───────────────────────────────────────────────────
// Built-in copy of the hotel's "7-Day Activities" poster; staff edit the live
// one in /admin (Activities), which replaces this as soon as it's published.
export interface ProgrammeDay {
  id: string;
  weekday: number; // 1 = Monday … 7 = Sunday
  kicker: string;
  title: string;
  place: string;
  detail: string;
  timeLabel: string;
  transport: string;
  priceNote: string;
  freeBus: boolean;
  images: string[];
}
export const programme: ProgrammeDay[] = [
  {
    id: 'monday',
    weekday: 1,
    kicker: 'Eco-tourism island',
    title: 'Koh Klang & the twin mountains',
    place: 'Koh Klang',
    timeLabel: '10:00 – 12:00',
    transport: 'Longtail boat, with a local guide',
    priceNote: '150 THB per person, min. 2',
    freeBus: false,
    detail:
      'Cross the Krabi river mouth past Khao Khanap Nam, the twin limestone peaks, to the fishing village on Koh Klang: its floating restaurant and farm, rice fields, honeybees and batik painting.',
    images: [p.dayMonday.src, p.longtail.src],
  },
  {
    id: 'tuesday',
    weekday: 2,
    kicker: 'Sport day',
    title: 'FootGolf at Hula Hula Golf Club',
    place: 'Hula Hula Golf Club',
    timeLabel: '08:30 – 12:30',
    transport: 'Hotel bus, with the golf club’s chauffeur',
    priceNote: 'Free bus · FootGolf 850 THB, Crolf 100 THB',
    freeBus: true,
    detail:
      'A morning on our sister golf club’s fairways: FootGolf or Crolf, then a cold drink at the clubhouse café. No golf skills needed.',
    images: [p.dayTuesday.src, p.golfFairway.src, p.golfCafe.src, p.golfClubhouse.src],
  },
  {
    id: 'wednesday',
    weekday: 3,
    kicker: 'Thai kitchen',
    title: 'Maharaj Market & a cooking class',
    place: 'Maharaj Morning Market',
    timeLabel: '09:30 – 12:50',
    transport: 'Hotel bus, with our chef',
    priceNote: 'Free bus',
    freeBus: true,
    detail: 'Shop Krabi’s morning market with our chef, then cook what you bought: sweet and sour, the Thai way.',
    images: [p.dayWednesday.src],
  },
  {
    id: 'thursday',
    weekday: 4,
    kicker: 'Temple & forest',
    title: 'Tiger Cave Temple',
    place: 'Wat Tham Suea',
    timeLabel: '09:00 – 12:30',
    transport: 'Hotel bus',
    priceNote: '300 THB per person, min. 2',
    freeBus: false,
    detail:
      'One of Krabi’s best-known temples, in the forest outside town. Climb to the golden Buddha on the peak, or stay below among the caves and old trees.',
    images: [p.dayThursday.src, p.tigerCave.src],
  },
  {
    id: 'friday',
    weekday: 5,
    kicker: 'Shopping day',
    title: 'Central Krabi',
    place: 'Central Krabi',
    timeLabel: '11:30 – 14:35',
    transport: 'Hotel bus',
    priceNote: 'Free bus',
    freeBus: true,
    detail:
      'Krabi’s new mall, billed as the first sustainable living mall, full of trees and shade. Shopping, cafés and an air-conditioned lunch.',
    images: [p.dayFriday.src],
  },
  {
    id: 'saturday',
    weekday: 6,
    kicker: 'Beach fun',
    title: 'Ao Nang & Railay Bay',
    place: 'Ao Nang, Nopparat Thara, Railay',
    timeLabel: '11:30 – 17:10',
    transport: 'Hotel bus',
    priceNote: 'Free bus',
    freeBus: true,
    detail: 'A day at the coast: Ao Nang Beach, Nopparat Thara Bay and a longtail across to the cliffs and caves of Railay.',
    images: [p.daySaturday.src, p.railay.src],
  },
  {
    id: 'sunday',
    weekday: 7,
    kicker: 'Culture of Buddhism',
    title: 'Panurat Temple Community',
    place: 'Panurat Temple',
    timeLabel: '09:30 – 11:30',
    transport: 'A short trip from the hotel',
    priceNote: '50 THB per person, min. 2',
    freeBus: false,
    detail:
      'A morning with the temple community: Dharma talk, meditation, offering food to the monks and sharing a meal with the neighbours.',
    images: [p.daySunday.src],
  },
];

/** The extra Koh Klang day on the hotel's recommendation list. */
export const recommendedDay = {
  title: 'Koh Klang & Khao Khanap Nam, morning to night',
  morning: {
    time: '09:30 – 12:00',
    items: ['Longtail to Khao Khanap Nam', 'Mangrove forest', 'Koh Klang village', 'Batik painting and longtail model crafting'],
    note: 'Boat and local guide included. Lunch at Baan Ma Ying riverside restaurant, if you like (self-paid).',
  },
  evening: {
    time: '16:00 – 21:00',
    items: ['Sunset at Khao Khanap Nam', 'Poo Dam (Black Crab) and the street art', 'Krabi Walking Street', 'Poo Dam Night Market'],
  },
};

export const tours = [
  { title: '4 Islands', detail: 'Beaches and snorkelling around the islands off Krabi.', image: p.lagoon.src },
  { title: 'Phi Phi Islands', detail: 'Thailand’s most famous islands, in a day.', image: p.railay.src },
  { title: 'Hong Island', detail: 'Clear water, a hidden lagoon and white sand.', image: p.khanapNam.src },
];

// ── Krabi Town ─────────────────────────────────────────────────────────────
export const travelTimes = [
  { place: 'Krabi River & town centre', minutes: 2 },
  { place: 'Central Krabi', minutes: 5 },
  { place: 'Koh Klang', minutes: 10 },
  { place: 'Ao Nang Beach', minutes: 20 },
  { place: 'Hula Hula Golf Club', minutes: 20 },
  { place: 'Krabi Airport', minutes: 20 },
];

/** Krabi Town sits between the province's two sides; every place here is a day trip from the hotel. */
export const bothSides = [
  {
    side: 'West side',
    title: 'Beaches & islands',
    places: ['Ao Nang Beach', 'Railay Beach', 'Phi Phi Islands', 'Island hopping', 'Klong Root clear-water kayaking'],
  },
  {
    side: 'East side',
    title: 'Waterfalls, temples & hot springs',
    places: ['Huay To Waterfall', 'Tiger Cave Temple', 'Hula Hula Golf Club', 'The hot spring waterfall', 'The Emerald Pool'],
  },
];

export const nearby = [
  'Khao Khanap Nam',
  'Koh Klang floating village',
  'Wat Kaew (the White Temple)',
  'Krabi Walking Street',
  'Poo Dam, the Black Crab',
  'Maharaj Morning Market',
];

/** Where the team eats, from the hotel's own list. */
export const localPicks = [
  {
    meal: 'Breakfast',
    places: [
      { name: 'Paeyim Dimsum by Chef Fon', note: 'Homemade Thai dim sum.' },
      { name: 'Kao Gang Pa Ann', note: 'All sorts of Thai home cooking, ready from the morning.' },
      { name: 'Kanom jeen', note: 'Curry over fresh rice noodles, the Southern breakfast.' },
    ],
  },
  {
    meal: 'Lunch',
    places: [
      { name: 'Naipon', note: 'Any Thai dish you can think of, at friendly Thai prices.' },
      { name: 'Koh Klang seafood', note: 'Lunch on the island. The shrimp with oregano is the signature.' },
    ],
  },
  {
    meal: 'Dinner',
    places: [
      {
        name: 'Anchalee Restaurant',
        note: 'Southern Thai for over 30 years. Auntie Aun knows every Krabi speciality, and many of the vegetables come from her own garden.',
      },
      {
        name: 'Nongjane Restaurant',
        note: 'Named after Chef Wat’s daughter, Jane. He shops Maharaj Market himself every morning, and his tom yum deserves a Michelin star. Try the Southern orange curry with sea bass. From 6 pm; food takes 20–60 minutes, so don’t arrive starving.',
      },
      { name: 'Koeyyai Seafood', note: 'Thai omelette, crispy pork, pomfret hotpot, and crab or shrimp stir-fried in curry powder.' },
    ],
  },
  {
    meal: 'Coffee',
    places: [
      {
        name: 'Botany Café',
        note: 'Leafy, minimalist and very photogenic, indoors and out. Good coffee, fresh juices, amazing matcha and desserts. Good for working, too.',
      },
    ],
  },
];

/** "Is Royal Pineapple right for you?" — honest answers, from the brief. */
export const fitQuestions = [
  {
    q: 'I’m coming from Europe or further. Is Krabi Town right for me?',
    a: 'If you like local culture, real Thai food and a quieter base for island trips, yes. We’re in Krabi Town, about 20 minutes from Ao Nang Beach, and the tour desk books every island. If you want to stay right on the beach, our sister hotel, Hula Hula Resort in Ao Nang, may suit you better.',
    link: { label: 'Visit Hula Hula Resort', href: 'https://www.hulahularesort.com' },
  },
  {
    q: 'We’re driving from elsewhere in Thailand. Is there parking?',
    a: 'Plenty, and it’s free. Southern Thai food is all around us: dim sum mornings, kraprao or noodle lunches and seafood dinners, all within walking distance. Central Krabi is 5 minutes away by car.',
  },
  {
    q: 'Can we hold a meeting or a party?',
    a: 'Yes, from 10 people right up to 2,000. Our four meeting rooms and the pool terrace take 10 to 200, and for the big ones there’s the Hula Hula family’s Takanta Event Hall at Hula Hula Golf Club, near the airport: halls and lawns for 30 to 2,000 guests.',
    link: { label: 'Meetings, events & weddings', href: '/meetings' },
  },
];

// ── Meetings & events ──────────────────────────────────────────────────────
export interface Venue {
  name: string;
  floor?: string;
  sqm: number | null;
  ceiling?: string;
  classroom?: string;
  theatre?: string;
  banquet?: string;
  uShape?: string;
  cocktail?: string;
  image?: string;
  note?: string;
}
export const venues: Venue[] = [
  {
    name: 'Sunshine',
    floor: '4th floor',
    sqm: 130,
    ceiling: '4 m',
    classroom: '100',
    theatre: '180',
    banquet: '100',
    uShape: '80',
    cocktail: '150',
    image: p.meetingSunshine.src,
  },
  {
    name: 'Summer',
    floor: '3rd floor',
    sqm: 150,
    ceiling: '4 m',
    classroom: '150',
    theatre: '160',
    banquet: '120',
    uShape: '100',
    cocktail: '150',
    image: p.meetingSummer.src,
  },
  {
    name: 'Sand Sea',
    floor: '2nd floor',
    sqm: 110,
    ceiling: '3 m',
    classroom: '80',
    theatre: '100',
    banquet: '60',
    uShape: '50',
    cocktail: '80',
    image: p.meetingSandSea.src,
  },
  {
    name: 'Chaba',
    floor: '1st floor',
    sqm: 65,
    ceiling: '2.8 m',
    classroom: '30',
    theatre: '40',
    banquet: '30',
    uShape: '25',
    cocktail: '50',
    image: p.meetingChaba.src,
  },
  { name: 'Pool Terrace', floor: 'Outdoors', sqm: 150, theatre: '180', banquet: '120', cocktail: '150', image: p.poolParty.src },
];

// ── Takanta Event Hall ──────────────────────────────────────────────────────
// TK Hall, the Hula Hula family's event venue by Hula Hula Golf Club, near
// the airport. Everything here is from the hall's own fact sheet
// (assets/TAKANTA EVENT HALL/Content & Information/TAKANTA EVENT HALL.docx).
export interface EventSpace {
  name: string;
  area: string;
  size?: string;
  roundTables?: number;
  outdoor?: boolean;
}
export const takantaSpaces: EventSpace[] = [
  { name: 'Takanta Hall', area: '900 m²', size: '15 × 60 m', roundTables: 600 },
  { name: 'Phet Phrao Saeng Hall', area: '465 m²', size: '15 × 32 m', roundTables: 300 },
  { name: 'Ployphailin Hall', area: '375 m²', size: '15 × 25 m', roundTables: 250 },
  { name: 'Rabiang Thong', area: '400 m²', size: '7.5 × 80 m', roundTables: 400, outdoor: true },
  { name: 'Rabiang Ngern', area: '200 m²', outdoor: true },
  { name: 'San Fah Prathan', area: '200 m²', size: '10 × 18 m', outdoor: true },
  { name: 'Front Lawn', area: '200 m²', outdoor: true },
  { name: 'Lom Yen Kitchen', area: '270 m²', size: '15 × 18 m' },
  { name: 'Parking area', area: 'about 2,000 m²' },
];
export const takantaOutdoor = [
  {
    name: 'San Fah Prathan',
    detail: 'An open-air space for outdoor celebrations, group activities, private events and special occasions.',
  },
  { name: 'Front Lawn', detail: 'Open lawn for casual gatherings, outdoor activities, receptions and setups made just for you.' },
  {
    name: 'Rabiang Ngern & Rabiang Thong',
    detail: 'Flexible open-air terraces for receptions, banquets, parties, ceremonies and other special events.',
  },
];
export const takantaEventTypes = [
  { title: 'Meetings', detail: 'Corporate meetings, presentations, conferences and business get-togethers.' },
  { title: 'Seminars', detail: 'Flexible layouts and modern audiovisual kit for seminars, workshops and training.' },
  {
    title: 'Weddings',
    detail: 'Your dream wedding, with your choice of venue, decoration, catering and a team that has done it many times.',
  },
  { title: 'Banquets', detail: 'Elegant dinners with seating arranged your way and catering to match.' },
  { title: 'Corporate events', detail: 'Product launches, company celebrations, conferences and annual parties.' },
  { title: 'Parties & celebrations', detail: 'Birthdays, anniversaries and private parties, in a space designed around your event.' },
];
export const takantaFacilities = [
  'Professional sound system',
  'Two 15-metre LED walls',
  'Zoom meeting support',
  'Wi-Fi',
  'CCTV security',
  'Large car park',
  'Event equipment',
  'Indoor and outdoor spaces',
  'Catering',
  'Event setup and support',
  'A professional event team',
  'Places to stay',
];
export const takantaWhy = [
  { title: 'Easy to reach', detail: 'Near Krabi International Airport.' },
  { title: '30 to 2,000 guests', detail: 'Halls and open-air spaces for every size.' },
  { title: 'Your theme, your way', detail: 'Modern, minimal rooms that become whatever you imagine.' },
  { title: 'Food included', detail: 'Catering for meetings and celebrations.' },
  { title: 'A team on your side', detail: 'Experienced staff from planning to the last song.' },
  { title: 'Plenty of parking', detail: 'About 2,000 m² for guests and organisers.' },
];

/** Hula Hula Resort's event spaces in Ao Nang. */
export const resortVenues = [
  { name: 'Chang Restaurant', sqm: 280, banquet: '200', theatre: '300' },
  { name: 'Oasis Pool Terrace', sqm: 180, banquet: '150', theatre: '220' },
  { name: 'Bird of Paradise', sqm: 140, banquet: '120', theatre: '150' },
];

export const eventEquipment = [
  'Projector & screen',
  'LCD / LED display',
  'Sound system',
  'Wireless microphones',
  'Podium',
  'Flip chart & whiteboard',
  'Notepads & pens',
  'Wi-Fi',
  'Stage',
  'Registration table',
];
export const eventFood = [
  'Breakfast, lunch & dinner',
  'Buffet or set menu',
  'Coffee breaks',
  'Welcome drinks',
  'Cocktail reception',
  'Menus made for your event',
];
export const coffeeBreak = [
  'Coffee & tea',
  'Fresh juice',
  'Soft drinks',
  'Bakery & pastries',
  'Sandwiches',
  'Thai snacks',
  'Seasonal fruit',
  'Desserts',
];
export const poolsideEvents = ['Private parties', 'Group activities', 'Celebrations', 'Cocktail evenings', 'Special dinners'];
export const weddingServices = [
  'Ceremony setup',
  'Reception venue',
  'Buffet or set menu',
  'Welcome drinks',
  'Wedding cake',
  'Flowers & venue decoration',
  'Stage & backdrop',
  'Sound system & microphones',
  'Seating plans',
  'Photo corners',
  'Your own package',
];

// ── Wellness ──────────────────────────────────────────────────────────────
export type WellnessServiceIcon = 'hair' | 'scalp' | 'coconut' | 'face' | 'wax';
export const onCloudMenu: { icon: WellnessServiceIcon; title: string; detail: string; brand?: 'aveda' | 'cirepil' }[] = [
  { icon: 'hair', title: 'Hair spa', detail: 'A little hair care with natural Krabi ingredients.' },
  { icon: 'scalp', title: 'Scalp treatment', detail: 'A botanical scalp ritual with Aveda products.', brand: 'aveda' },
  { icon: 'coconut', title: 'Coconut-oil massage', detail: 'A warm body massage after a day of exploring.' },
  { icon: 'face', title: 'Facial massage', detail: 'A gentle, 30-minute pause for your face.' },
  { icon: 'wax', title: 'Body waxing', detail: 'Professional body waxing with Cirépil Paris wax.', brand: 'cirepil' },
];

// ── Gallery ───────────────────────────────────────────────────────────────
export interface GalleryPhoto {
  image: string;
  title: string;
  category: string;
}
export const galleryPhotos: GalleryPhoto[] = [
  { image: p.poolFlamingo.src, title: 'Our resident flamingo', category: 'Pool days' },
  { image: p.signatureWindow.src, title: 'The Signature Pineapple window', category: 'Rooms' },
  { image: p.facadeShuttle.src, title: 'Under the arches, with the golf shuttle', category: 'The hotel' },
  { image: p.khanapNamSunset.src, title: 'Sunset at Khao Khanap Nam', category: 'Krabi' },
  { image: p.floatingBreakfast.src, title: 'Breakfast, floating', category: 'Pool days' },
  { image: p.reception.src, title: 'Sawasdee! The front desk', category: 'The hotel' },
  { image: p.hibiscus.src, title: 'Double Hibiscus in pink', category: 'Rooms' },
  { image: p.watKaew.src, title: 'Wat Kaew, the White Temple', category: 'Krabi' },
  { image: p.poolLoungers.src, title: 'Pink loungers, yellow walls', category: 'Pool days' },
  { image: p.lobby.src, title: 'Arches and old Krabi tiles', category: 'The hotel' },
  { image: p.emerald.src, title: 'From your bed to the pool', category: 'Rooms' },
  { image: p.blackCrab.src, title: 'Poo Dam, Krabi’s black crab', category: 'Krabi' },
  { image: p.breakfastRoom.src, title: 'Breakfast at Chaba', category: 'Good food' },
  { image: p.breakfastYoghurt.src, title: 'Yoghurt in blue-and-white pots', category: 'Good food' },
  { image: p.poolFruitBasket.src, title: 'A fruit basket by the pool', category: 'Pool days' },
  { image: p.villaPool.src, title: 'The villas’ pool at the golf club', category: 'Rooms' },
];

export const CONTACT: ContactInfo = {
  phone: '+66 64 123 0789',
  tel: 'tel:+66641230789',
  landline: '+66 75 622 622',
  landlineTel: 'tel:+6675622622',
  email: 'reservation@royalpineapplehotel.com',
  address: '339/9 Maharaj Road, Paknam, Muang, Krabi 81000, Thailand',
  facebook: 'https://www.facebook.com/share/1ACrkWoHC9/',
  instagram: 'https://www.instagram.com/thepineapplehotelkrabi',
  tiktok: 'https://www.tiktok.com/@krabiactivity',
  maps: 'https://maps.app.goo.gl/HwebZkbP3GWMZNpf7',
  whatsapp: 'https://wa.me/66641230789',
  events: { phone: '+66 61 123 6456', tel: 'tel:+66611236456', whatsapp: 'https://wa.me/66611236456', email: 'event@hulahulaholiday.com' },
  weddings: { phone: '+66 62 062 4456', tel: 'tel:+66620624456', email: 'sales@hulahulaholiday.com' },
};

// The hotel's Google rating, shown in the hero. Copied from Google Maps by hand
// (26 Nov 2026), so update it now and then; the link opens the hotel's listing.
export const GOOGLE_REVIEWS = {
  rating: 4.5,
  count: 1524,
  label: '4-star hotel',
  url: 'https://www.google.com/maps/search/?api=1&query=Royal%20Pineapple%20Hotel%20Krabi',
};
