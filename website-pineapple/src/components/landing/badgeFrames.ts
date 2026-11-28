// The badge frames: each frame image and the window cut out of its alpha, with that window's position in percent.
export const badgeFrames = {
  'greeting-postcard': {
    image: '/images/royal-pineapple/badge-frames/greeting-postcard-frame-v3.png',
    mask: '/images/royal-pineapple/badge-frames/greeting-postcard-window-v2.svg',
    width: 1536,
    height: 1024,
    window: {
      left: 5.794,
      top: 29.102,
      width: 88.411,
      height: 62.695,
    },
  },
  'pool-club': {
    image: '/images/royal-pineapple/badge-frames/12-pool-club-frame.webp',
    mask: '/images/royal-pineapple/badge-frames/12-pool-club-frame-window.svg',
    width: 1536,
    height: 1024,
    window: {
      left: 4.427,
      top: 19.531,
      width: 89.974,
      height: 65.43,
    },
  },
  'evening-garden': {
    image: '/images/royal-pineapple/badge-frames/13-evening-garden-frame.webp',
    mask: '/images/royal-pineapple/badge-frames/13-evening-garden-frame-window.svg',
    width: 1536,
    height: 1024,
    window: {
      left: 10.156,
      top: 19.336,
      width: 79.427,
      height: 66.211,
    },
  },
  'grand-arrival': {
    image: '/images/royal-pineapple/badge-frames/14-grand-arrival-frame.webp',
    mask: '/images/royal-pineapple/badge-frames/14-grand-arrival-frame-window.svg',
    width: 1385,
    height: 1136,
    window: {
      left: 5.599,
      top: 19.841,
      width: 88.021,
      height: 61.587,
    },
  },
  'riviera-postcard': {
    image: '/images/royal-pineapple/badge-frames/22-balanced-botanical-postcard.webp',
    mask: '/images/royal-pineapple/badge-frames/22-balanced-botanical-postcard-window.svg',
    width: 1536,
    height: 1024,
    window: {
      left: 2.214,
      top: 8.594,
      width: 95.443,
      height: 84.961,
    },
  },
} as const;
export type BadgeFrameName = keyof typeof badgeFrames;
