import { Box } from '@mui/material';
import { useMemo, type ReactNode } from 'react';
import { photoAssets as p } from '../../data/photos';
import { MotionBox } from '../common/motionPrimitives';

export const postcardScenes = [
  { id: 'pool', image: p.poolFlamingo.src, title: 'Pool courtyard', alt: 'The hotel pool with pink loungers, a flamingo float and yellow arched balconies' },
  { id: 'arrival', image: p.facade.src, title: 'Hotel entrance', alt: 'The golden Royal Pineapple Hotel entrance, white arches and tropical palms' },
  { id: 'room', image: p.hibiscus.src, title: 'Double Hibiscus room', alt: 'The Double Hibiscus guest room with pink decor and a hibiscus bedspread' },
];

export const wrapReelIndex = (index: number, count: number) => ((index % count) + count) % count;

const tileSx = {
  position: 'relative', flex: '0 0 100%', minWidth: '100%', width: '100%', height: '100%', overflow: 'hidden',
  '& > img': { display: 'block', width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none' },
} as const;

/** Homepage-only reel: a quick run, horizontal blur, then a slow, clear landing. */
export function PostcardReel({ sequence, moving, direction, onSettled, children }: {
  sequence: number[]; moving: boolean; direction: -1 | 1; onSettled?: () => void; children: (index: number) => ReactNode;
}) {
  const animation = useMemo(() => moving ? {
    x: ['0%', `${direction * 200}%`, `${direction * 400}%`],
    filter: ['blur(0px)', 'blur(9px)', 'blur(10px)', 'blur(3px)', 'blur(0px)'],
  } : { x: '0%', filter: 'blur(0px)' }, [moving, direction]);

  return <MotionBox aria-hidden="true" sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: direction === 1 ? 'row-reverse' : 'row', width: '100%', height: '100%' }}
    initial={{ x: '0%', filter: 'blur(0px)' }} animate={animation}
    transition={moving ? {
      x: { duration: 2.3, times: [0, .22, 1], ease: ['linear', [.2, .7, .25, 1]] },
      filter: { duration: 2.3, times: [0, .08, .34, .8, 1], ease: 'linear' },
    } : { duration: 0 }} onAnimationComplete={moving ? onSettled : undefined}>
    {sequence.map((index, position) => <Box key={`${index}-${position}`} sx={tileSx}>{children(index)}</Box>)}
  </MotionBox>;
}
