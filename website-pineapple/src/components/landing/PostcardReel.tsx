import { motion } from 'motion/react';
import { useMemo, type ReactNode } from 'react';
import { photoAssets as p } from '../../data/photos';

export const postcardScenes = [
  { id: 'pool', image: p.poolFlamingo.src, title: 'Pink pool days. The real thing.', alt: 'The real hotel pool, with pink loungers, a flamingo float and yellow arched balconies' },
  { id: 'arrival', image: p.facade.src, title: 'A very royal arrival.', alt: 'The golden Royal Pineapple Hotel entrance, white arches and tropical palms' },
  { id: 'room', image: p.hibiscus.src, title: 'Your little home in pink.', alt: 'The real Double Hibiscus guest room with pink decor and a hibiscus bedspread' },
];

export const wrapReelIndex = (index: number, count: number) => ((index % count) + count) % count;

/** Homepage-only reel: a quick run, horizontal blur, then a slow, clear landing. */
export function PostcardReel({ sequence, moving, direction, onSettled, children }: {
  sequence: number[]; moving: boolean; direction: -1 | 1; onSettled?: () => void; children: (index: number) => ReactNode;
}) {
  const animation = useMemo(() => moving ? {
    x: ['0%', `${direction * 200}%`, `${direction * 400}%`],
    filter: ['blur(0px)', 'blur(9px)', 'blur(10px)', 'blur(3px)', 'blur(0px)'],
  } : { x: '0%', filter: 'blur(0px)' }, [moving, direction]);

  return <motion.div className="home-slot-strip" data-direction={direction} aria-hidden="true"
    initial={{ x: '0%', filter: 'blur(0px)' }} animate={animation}
    transition={moving ? {
      x: { duration: 2.3, times: [0, .22, 1], ease: ['linear', [.2, .7, .25, 1]] },
      filter: { duration: 2.3, times: [0, .08, .34, .8, 1], ease: 'linear' },
    } : { duration: 0 }} onAnimationComplete={moving ? onSettled : undefined}>
    {sequence.map((index, position) => <div className="home-slot-tile" key={`${index}-${position}`}>{children(index)}</div>)}
  </motion.div>;
}
