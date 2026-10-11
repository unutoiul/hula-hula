import { Box } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';
import { useInView } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { MotionBox } from './motionPrimitives';
import { SunDoodle } from './VacationDecor';

// Section backgrounds the seams flow between.
export const SEAM = { cream: '#fbfdf4', pool: '#d9f5fc', lime: '#e7f4cc', sea: '#006d8a', sun: '#f9f70c' };

const WAVE = 'M0 22 Q120 0 240 22 T480 22 T720 22 T960 22 T1200 22 T1440 22 V45 H0Z';

// The join between two differently coloured sections: one wave flowing from
// `from` straight into `to` (no band of page colour between them), with a
// little holiday "sticker" or two bobbing on it. Every seam on the page uses
// this, so the decorations read as one family: white outlines, soft shadows,
// the same gentle bob — and they all hold still when motion is off.
// `behind` sits under the wave (e.g. a sun rising from behind it).
export function SectionSeam({ from, to, mirror = false, behind, children }: { from: string; to: string; mirror?: boolean; behind?: ReactNode; children?: ReactNode }) {
  return <Box aria-hidden sx={{ position: 'relative', zIndex: 2, bgcolor: from, pointerEvents: 'none' }}>
    {behind}
    <Box component="svg" viewBox="0 0 1440 45" preserveAspectRatio="none" sx={{ position: 'relative', zIndex: 1, display: 'block', width: '100%', height: { xs: 28, md: 46 }, transform: mirror ? 'scaleX(-1)' : undefined }}>
      <path fill={to} d={WAVE} />
    </Box>
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 2 }}>{children}</Box>
  </Box>;
}

type Place = SystemStyleObject<Theme>;
interface BobProps { place: Place; lift?: number; rock?: number; drift?: number; duration?: number; delay?: number; children: ReactNode }

// Each decoration sits on a seam's wave by default (`left` along it); `sx`
// places it anywhere else — inside a section, against a photo's corner —
// e.g. { top: 'auto', bottom: 24, left: 'auto', right: 16 }.
interface DecorProps { left?: string; sx?: Place }

// Seam placement by default; a placement that sets top or bottom wins.
const at = (left: string | undefined, top: { xs: number; md: number }, sx?: Place): Place =>
  ({ left, ...(sx && ('top' in sx || 'bottom' in sx) ? {} : { top }), ...sx });

// Gentle float: up/down, optionally rocking or drifting sideways. Only
// animates while on screen, so nothing off-screen costs work during scrolling.
function Bob({ place, lift = 8, rock = 0, drift = 0, duration = 3.6, delay = 0, children }: BobProps) {
  const { reduced } = useMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '120px' });
  return <MotionBox ref={ref}
    animate={reduced || !inView ? undefined : { y: [0, -lift, 0], ...(rock ? { rotate: [-rock, rock, -rock] } : {}), ...(drift ? { x: [0, drift, 0] } : {}) }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    sx={{ position: 'absolute', zIndex: 2, pointerEvents: 'none', filter: 'drop-shadow(0 5px 8px rgba(23,60,44,.14))', ...place }}>{children}</MotionBox>;
}

const BUBBLES = [{ left: '5%', top: 4, size: 16 }, { left: '12%', top: -12, size: 28 }, { left: '27%', top: 10, size: 11 }, { left: '46%', top: -6, size: 20 }, { left: '61%', top: 12, size: 13 }, { left: '93%', top: 2, size: 15 }];

const bubble = (size: number): Place => ({
  width: size, height: size, borderRadius: '50%', border: '2px solid rgba(255,255,255,.95)',
  background: 'radial-gradient(circle at 32% 30%, #fff 0 18%, rgba(255,255,255,.35) 20% 100%)',
  // A faint sea-blue ring keeps white bubbles visible on cream too.
  boxShadow: 'inset 0 0 0 1px rgba(0,109,138,.28), 0 0 0 1px rgba(0,109,138,.18)',
});

export function Bubbles() {
  return <>{BUBBLES.map((b, i) => <Box key={i} sx={{ display: { xs: i % 2 ? 'none' : 'block', sm: 'block' } }}>
    <Bob place={{ left: b.left, top: b.top }} lift={8} duration={3.2 + (i % 3) * 0.7} delay={i * 0.35}><Box sx={bubble(b.size)} /></Bob>
  </Box>)}</>;
}

export function SwimRing({ left, sx }: DecorProps) {
  return <Bob place={at(left, { xs: -18, md: -26 }, sx)} lift={6} rock={8} duration={5}>
    <Box sx={{
      width: { xs: 46, md: 62 }, height: { xs: 46, md: 62 }, borderRadius: '50%',
      background: 'conic-gradient(#f9f70c 0 25%, #fff 0 50%, #f9f70c 0 75%, #fff 0)',
      mask: 'radial-gradient(circle, transparent 42%, #000 43%)', WebkitMask: 'radial-gradient(circle, transparent 42%, #000 43%)',
    }} />
  </Bob>;
}

export function BeachBall({ left, sx }: DecorProps) {
  return <Bob place={at(left, { xs: -20, md: -30 }, sx)} lift={10} rock={14} duration={3.4}>
    <Box sx={{
      width: { xs: 42, md: 58 }, height: { xs: 42, md: 58 }, borderRadius: '50%', border: '3px solid #fff',
      background: 'radial-gradient(circle at 34% 28%, rgba(255,255,255,.75) 0 10%, transparent 11%), conic-gradient(from 20deg, #f9f70c 0 60deg, #fff 0 120deg, #006d8a 0 180deg, #fff 0 240deg, #50830d 0 300deg, #fff 0)',
    }} />
  </Bob>;
}

export function Longtail({ left, sx }: DecorProps) {
  return <Bob place={at(left, { xs: -26, md: -38 }, sx)} lift={5} rock={4} duration={4.4}>
    <Box component="svg" viewBox="0 0 132 58" sx={{ display: 'block', width: { xs: 92, md: 132 } }}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M124 16 L117 3 M124 16 L124 1 M124 16 L130 5" stroke="#f9f70c" strokeWidth="3" />
        <path d="M34 34 L38 18 L80 18 L84 34" fill="#f9f70c" stroke="#fff" strokeWidth="3" />
        <path d="M6 32 C30 50 86 52 106 44 L124 16 C112 28 92 34 6 32 Z" fill="#9a5b2e" stroke="#fff" strokeWidth="3" />
        <path d="M20 38 C44 46 82 46 102 40" stroke="#f9f70c" strokeWidth="2" fill="none" />
      </g>
    </Box>
  </Bob>;
}

export function PaperBoat({ left, sx }: DecorProps) {
  return <Bob place={at(left, { xs: -22, md: -30 }, sx)} lift={6} rock={6} duration={4}>
    <Box component="svg" viewBox="0 0 72 46" sx={{ display: 'block', width: { xs: 54, md: 72 } }}>
      <g stroke="#006d8a" strokeWidth="2.5" strokeLinejoin="round" fill="#fff">
        <path d="M19 27 L37 4 L55 27 Z" />
        <path d="M4 27 L68 27 L57 42 L15 42 Z" />
        <path d="M37 4 L37 27" fill="none" />
      </g>
    </Box>
  </Bob>;
}

export function Pineapple({ left, sx }: DecorProps) {
  return <Bob place={at(left, { xs: -34, md: -46 }, sx)} lift={7} rock={7} duration={3.8}>
    <Box component="svg" viewBox="0 0 50 72" sx={{ display: 'block', width: { xs: 32, md: 44 } }}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M25 28 L17 8 L24 16 L25 2 L28 16 L35 6 L31 28 Z" fill="#50830d" stroke="#fff" strokeWidth="2.5" />
        <ellipse cx="25" cy="48" rx="16" ry="20" fill="#f9f70c" stroke="#fff" strokeWidth="3" />
        <path d="M14 38 L34 60 M12 50 L26 65 M20 30 L39 51 M36 36 L15 59 M39 47 L24 66 M30 29 L11 48" stroke="#c99a00" strokeWidth="1.6" opacity=".6" fill="none" />
      </g>
    </Box>
  </Bob>;
}

export function Gulls({ left, sx, color = '#173c2c' }: DecorProps & { color?: string }) {
  return <Bob place={at(left, { xs: -30, md: -42 }, sx)} lift={6} drift={26} duration={7}>
    <Box component="svg" viewBox="0 0 62 26" sx={{ display: 'block', width: { xs: 46, md: 62 }, filter: 'none' }}>
      <g fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round">
        <path d="M2 14 Q8 5 14 14 Q20 5 26 14" />
        <path d="M36 8 Q40.5 2 45 8 Q49.5 2 54 8" />
      </g>
    </Box>
  </Bob>;
}

// A doodle sun peeking up from behind the wave, swaying a little.
export function RisingSun({ left }: { left: string }) {
  const { reduced } = useMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '120px' });
  return <MotionBox ref={ref} animate={reduced || !inView ? undefined : { rotate: [-6, 6, -6], y: [0, -4, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    sx={{ position: 'absolute', left, bottom: 0, zIndex: 0 }}>
    <SunDoodle color="#50830d" sx={{ width: { xs: 70, md: 104 }, height: { xs: 70, md: 104 } }} />
  </MotionBox>;
}
