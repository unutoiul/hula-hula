import { useReducedMotion } from 'motion/react';
import { MotionBox } from './motionPrimitives';

export function LiveDot({ size = 6 }: { size?: number }) {
  const reduceMotion = useReducedMotion();
  return <MotionBox
    animate={reduceMotion ? undefined : { opacity: [1, .35, 1], scale: [1, .7, 1] }}
    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    sx={{ width: size, height: size, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }}
  />;
}
