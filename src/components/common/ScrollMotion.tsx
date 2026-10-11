import { Box, type SxProps, type Theme } from '@mui/material';
import { useScroll, useSpring, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { MotionBox } from './motionPrimitives';

const EASE = [0.22, 1, 0.36, 1] as const;

interface ScrollMotionProps { children: ReactNode; sx?: SxProps<Theme> }

// Fades and lifts its content in the first time it scrolls into view. With
// motion off (the Motion switch or the OS setting) it's just a plain Box.
export function Reveal({ children, delay = 0, y = 36, sx }: ScrollMotionProps & { delay?: number; y?: number }) {
  const { reduced } = useMotionPreference();
  if (reduced) return <Box sx={sx}>{children}</Box>;
  return <MotionBox initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.8, delay, ease: EASE }} sx={sx}>{children}</MotionBox>;
}

// Rocks its content a few degrees as it travels through the viewport — from
// -amount as it enters at the bottom to +amount as it leaves at the top (use
// a negative amount to rock the other way). It wraps the card, so the card's
// own resting tilt and hover effects stay as they are. The scroll position
// runs through a spring, so the rotation glides instead of ticking with each
// wheel step. The Motion button turns it off.
export function ScrollTilt({ children, amount = 3, sx }: ScrollMotionProps & { amount?: number }) {
  const { reduced } = useMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.6 });
  const rotate = useTransform(smooth, [0, 1], [-amount, amount]);
  return <MotionBox ref={ref} style={reduced ? undefined : { rotate }} sx={[{ willChange: 'transform' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>{children}</MotionBox>;
}
