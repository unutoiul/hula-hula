import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { fonts } from '../../theme';
import { MotionBox } from './motionPrimitives';

export function SunDoodle({ size = 96, color = 'currentColor', sx }: { size?: number; color?: string; sx?: SxProps<Theme> }) {
  return <Box component="svg" aria-hidden="true" viewBox="0 0 100 100" sx={[{ width: size, height: size, color, flexShrink: 0 }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <circle cx="50" cy="50" r="26" />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d="M50 5 L50 14" transform={`rotate(${i * 30} 50 50)`} />)}
      <path d="M38 48v3 M61 48v3 M39 59q11 12 23-1" />
    </g>
  </Box>;
}

export function Sticker({ children, color = '#f9f70c', rotate = -7, sx }: { children: ReactNode; color?: string; rotate?: number; sx?: SxProps<Theme> }) {
  return <Box sx={[{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', bgcolor: color, color: '#173c2c', border: '3px solid #fbfdf4', borderRadius: '50%', width: 116, height: 116, px: 1.5, fontFamily: fonts.playful, fontWeight: 500, fontSize: 21, textAlign: 'center', lineHeight: 1.1, transform: `rotate(${rotate}deg)`, boxShadow: '0 5px 0 rgba(23,60,44,.09)' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>{children}</Box>;
}

export function WaveEdge({ fill = '#fbfdf4', flip = false }: { fill?: string; flip?: boolean }) {
  return <Box component="svg" aria-hidden="true" viewBox="0 0 1440 45" preserveAspectRatio="none" sx={{ display: 'block', width: '100%', height: { xs: 24, md: 42 }, transform: flip ? 'rotate(180deg)' : undefined }}>
    <path fill={fill} d="M0 22 Q120 0 240 22 T480 22 T720 22 T960 22 T1200 22 T1440 22 V45 H0Z" />
  </Box>;
}

// Pool bubbles and a little striped swim ring bobbing on the wave where the
// (pool-blue) breakfast section flows into the dining section. Purely
// decorative; they hold still when motion is off.
const BUBBLES = [
  { left: '5%', top: 6, size: 16 }, { left: '12%', top: -10, size: 28 }, { left: '27%', top: 12, size: 11 },
  { left: '46%', top: -4, size: 20 }, { left: '61%', top: 14, size: 13 }, { left: '72%', top: -14, size: 24 },
  { left: '94%', top: 4, size: 15 },
];

export function PoolBubbles() {
  const { reduced } = useMotionPreference();
  const bob = (i: number, lift: number) => reduced ? {} : {
    animate: { y: [0, -lift, 0] },
    transition: { duration: 3.2 + (i % 3) * 0.7, delay: i * 0.35, repeat: Infinity, ease: 'easeInOut' as const },
  };
  return <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
    {BUBBLES.map((b, i) => <MotionBox key={i} {...bob(i, 8)} sx={{
      position: 'absolute', left: b.left, top: b.top, width: b.size, height: b.size, borderRadius: '50%',
      border: '2px solid rgba(255,255,255,.95)', background: 'radial-gradient(circle at 32% 30%, #fff 0 18%, rgba(255,255,255,.35) 20% 100%)',
      display: { xs: i % 2 ? 'none' : 'block', sm: 'block' },
    }} />)}
    <MotionBox {...bob(2, 6)} sx={{ position: 'absolute', left: { xs: '78%', md: '82%' }, top: { xs: -18, md: -26 }, width: { xs: 46, md: 62 }, height: { xs: 46, md: 62 } }}>
      <MotionBox animate={reduced ? undefined : { rotate: [-8, 8, -8] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} sx={{
        width: '100%', height: '100%', borderRadius: '50%', transform: 'rotate(-8deg)',
        background: 'conic-gradient(#f9f70c 0 25%, #fff 0 50%, #f9f70c 0 75%, #fff 0)',
        mask: 'radial-gradient(circle, transparent 42%, #000 43%)', WebkitMask: 'radial-gradient(circle, transparent 42%, #000 43%)',
        boxShadow: '0 6px 14px rgba(23,60,44,.12)',
      }} />
    </MotionBox>
  </Box>;
}
