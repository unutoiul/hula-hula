import { Box } from '@mui/material';
import { useInView } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { brand } from '../../theme';
import { MotionBox } from './motionPrimitives';
import { SunDoodle } from './VacationDecor';

// Section backgrounds the seams flow between.
export const SEAM = {
  cream: brand.cream,
  blush: brand.blush,
  pool: brand.poolLight,
  plum: brand.plum,
  butter: brand.butter,
  sun: brand.pineapple,
};

const WAVE = 'M0 22 Q120 0 240 22 T480 22 T720 22 T960 22 T1200 22 T1440 22 V45 H0Z';

// The join between two differently coloured sections: one wave flowing from
// `from` straight into `to` (no band of page colour between them).
// `behind` sits under the wave (e.g. the sun rising over the footer);
// `children` sit on top of it.
export function SectionSeam({
  from,
  to,
  mirror = false,
  behind,
  children,
}: {
  from: string;
  to: string;
  mirror?: boolean;
  behind?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        zIndex: 2,
        flexShrink: 0,
        bgcolor: from,
        pointerEvents: 'none',
        pt: behind ? { xs: '16px', md: '20px' } : 0,
      }}
    >
      {behind}
      <Box
        component="svg"
        viewBox="0 0 1440 45"
        preserveAspectRatio="none"
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'block',
          width: '100%',
          height: { xs: 28, md: 46 },
          transform: mirror ? 'scaleX(-1)' : undefined,
        }}
      >
        <path fill={to} d={WAVE} />
      </Box>
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 2 }}>{children}</Box>
    </Box>
  );
}

// Leave the full doodle above the wave, including its rays and gentle sway.
export function RisingSun({ left }: { left: string }) {
  const { reduced } = useMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '120px' });
  return (
    <MotionBox
      ref={ref}
      animate={reduced || !inView ? undefined : { rotate: [-6, 6, -6], y: [0, -4, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      sx={{
        position: 'absolute',
        left: { xs: `min(${left}, calc(100% - 90px))`, md: `min(${left}, calc(100% - 128px))` },
        bottom: { xs: 22, md: 24 },
        zIndex: 0,
      }}
    >
      <SunDoodle color={brand.royal} sx={{ width: { xs: 70, md: 104 }, height: { xs: 70, md: 104 } }} />
    </MotionBox>
  );
}
