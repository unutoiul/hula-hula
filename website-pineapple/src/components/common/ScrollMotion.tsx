import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { MotionBox } from './motionPrimitives';

const EASE = [0.22, 1, 0.36, 1] as const;

interface ScrollMotionProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

// Fades and lifts its content in the first time it scrolls into view. With
// motion off (the Motion switch or the OS setting) it's just a plain Box.
export function Reveal({ children, delay = 0, y = 36, sx }: ScrollMotionProps & { delay?: number; y?: number }) {
  const { reduced } = useMotionPreference();
  if (reduced) return <Box sx={sx}>{children}</Box>;
  return (
    <MotionBox
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      sx={sx}
    >
      {children}
    </MotionBox>
  );
}
