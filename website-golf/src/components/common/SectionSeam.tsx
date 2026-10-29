import { Box } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';
import { useInView } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { MotionBox } from './motionPrimitives';
import { SunDoodle } from './VacationDecor';
import { vacationColors } from '../../theme';

// Section backgrounds the seams flow between.
export const SEAM = { cream: vacationColors.cream, pool: '#d9f5fc', lime: '#e7f4cc', sea: '#006d8a', sun: '#f9f70c' };

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

// Golf balls resting along the wave (on cream the white needs the faint ring).
export function GolfBalls() {
  return <>{BUBBLES.map((b, i) => <Box key={i} sx={{ display: { xs: i % 2 ? 'none' : 'block', sm: 'block' } }}>
    <Bob place={{ left: b.left, top: b.top - 4 }} lift={6} duration={3.4 + (i % 3) * 0.6} delay={i * 0.3}><Box sx={golfBall(b.size + 6)} /></Bob>
  </Box>)}</>;
}

const golfBall = (size: number): Place => ({
  width: size, height: size, borderRadius: '50%', bgcolor: '#fff',
  // Dimples: a fine dot grid, shaded towards the lower right.
  backgroundImage: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,1) 0 22%, transparent 23%), radial-gradient(rgba(23,60,44,.16) 18%, transparent 20%), radial-gradient(circle at 70% 75%, rgba(23,60,44,.18), transparent 60%)',
  backgroundSize: '100% 100%, 4px 4px, 100% 100%',
  boxShadow: 'inset 0 0 0 1px rgba(0,109,138,.22), 0 0 0 1px rgba(0,109,138,.12)',
});

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

// The course's red pin flag, waving a little on its pole.
export function PinFlag({ left, sx }: DecorProps) {
  return <Bob place={at(left, { xs: -46, md: -64 }, sx)} lift={5} rock={5} duration={4.2}>
    <Box component="svg" viewBox="0 0 54 78" sx={{ display: 'block', width: { xs: 40, md: 54 } }}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="18" cy="72" rx="15" ry="4.5" fill="#173c2c" opacity=".18" />
        <path d="M18 72 L18 6" stroke="#fff" strokeWidth="5" />
        <path d="M18 72 L18 6" stroke="#f9f70c" strokeWidth="2.4" />
        <path d="M19 7 C30 4 38 12 50 9 L44 21 L50 33 C38 36 30 28 19 31 Z" fill="#e8402f" stroke="#fff" strokeWidth="3" />
      </g>
    </Box>
  </Bob>;
}

// A FootGolf ball rolling along the wave.
export function FootBall({ left, sx }: DecorProps) {
  return <Bob place={at(left, { xs: -20, md: -28 }, sx)} lift={8} rock={18} drift={10} duration={3.6}>
    <Box component="svg" viewBox="0 0 60 60" sx={{ display: 'block', width: { xs: 40, md: 54 } }}>
      <circle cx="30" cy="30" r="27" fill="#fff" stroke="#fff" strokeWidth="3" />
      <circle cx="30" cy="30" r="25.5" fill="#fff" stroke="#173c2c" strokeWidth="1.6" />
      <g fill="#173c2c">
        <path d="M30 20 L39.5 27 L36 38 L24 38 L20.5 27 Z" />
        <path d="M30 5 L36 9 L30 13 L24 9 Z M53 24 L54.5 31 L48 32 L47 25 Z M44 50 L38 54 L36 48 L42 45 Z M16 50 L22 54 L24 48 L18 45 Z M7 24 L5.5 31 L12 32 L13 25 Z" opacity=".9" />
      </g>
      <g stroke="#173c2c" strokeWidth="1.4" fill="none"><path d="M30 20 V13 M39.5 27 L47 25 M36 38 L42 45 M24 38 L18 45 M20.5 27 L13 25" /></g>
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
