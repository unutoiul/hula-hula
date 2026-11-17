import { Box } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';
import { useInView } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { brand } from '../../theme';
import { MotionBox } from './motionPrimitives';
import { SunDoodle } from './VacationDecor';

// Section backgrounds the seams flow between.
export const SEAM = { cream: brand.cream, blush: brand.blush, pool: brand.poolLight, plum: brand.plum, butter: brand.butter, sun: brand.pineapple };

const WAVE = 'M0 22 Q120 0 240 22 T480 22 T720 22 T960 22 T1200 22 T1440 22 V45 H0Z';

// The join between two differently coloured sections: one wave flowing from
// `from` straight into `to` (no band of page colour between them), with a
// little sticker bobbing on it, each one something you'd find at the hotel:
// the pool flamingo, a hibiscus, the pineapple, the golf shuttle, a longtail.
// White outlines, soft shadows, the same gentle bob — and they all hold
// still when motion is off. `behind` sits under the wave (e.g. a sun rising).
export function SectionSeam({ from, to, mirror = false, behind, children }: { from: string; to: string; mirror?: boolean; behind?: ReactNode; children?: ReactNode }) {
  return <Box aria-hidden sx={{ position: 'relative', zIndex: 2, flexShrink: 0, bgcolor: from, pointerEvents: 'none', pt: behind ? { xs: '16px', md: '20px' } : 0 }}>
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
    sx={{ position: 'absolute', zIndex: 2, pointerEvents: 'none', filter: 'drop-shadow(0 5px 8px rgba(90,36,72,.16))', ...place }}>{children}</MotionBox>;
}

/** The pink flamingo float from the hotel pool. */
export function Flamingo({ left, sx }: DecorProps) {
  return <Bob place={at(left, { xs: -40, md: -58 }, sx)} lift={6} rock={5} duration={4.6}>
    <Box component="svg" viewBox="0 0 96 84" sx={{ display: 'block', width: { xs: 70, md: 96 } }}>
      <g strokeLinecap="round" strokeLinejoin="round" stroke="#fff" strokeWidth="3">
        <path d="M14 58 C10 44 26 36 44 40 C60 43 76 40 86 52 C92 60 84 72 66 74 L30 74 C20 74 15 66 14 58 Z" fill={brand.pink} />
        <path d="M58 46 C54 30 56 16 64 10 C72 4 82 8 80 18 C79 24 72 24 70 20" fill="none" stroke={brand.pink} strokeWidth="8" />
        <path d="M80 16 L90 20 L82 24 Z" fill={brand.ink} strokeWidth="2" />
        <circle cx="74" cy="13" r="1.8" fill={brand.ink} stroke="none" />
        <path d="M26 54 C34 50 44 52 50 58" fill="none" stroke={brand.royal} strokeWidth="2.5" />
      </g>
    </Box>
  </Bob>;
}

/** A pink hibiscus, the flower on the Double Hibiscus quilts. */
export function Hibiscus({ left, sx }: DecorProps) {
  return <Bob place={at(left, { xs: -24, md: -34 }, sx)} lift={7} rock={10} duration={4.2}>
    <Box component="svg" viewBox="0 0 64 64" sx={{ display: 'block', width: { xs: 46, md: 62 } }}>
      <g stroke="#fff" strokeWidth="2.5" strokeLinejoin="round">
        {[0, 72, 144, 216, 288].map((r) => <path key={r} d="M32 32 C22 22 22 6 32 4 C42 6 42 22 32 32 Z" fill={brand.pink} transform={`rotate(${r} 32 32)`} />)}
        <circle cx="32" cy="32" r="6" fill={brand.royal} />
        <path d="M32 32 L44 20" stroke={brand.pineapple} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="45" cy="19" r="3" fill={brand.pineapple} strokeWidth="1.5" />
      </g>
    </Box>
  </Bob>;
}

/** The pineapple, crowned — the hotel's mark as a sticker. */
export function Pineapple({ left, sx }: DecorProps) {
  return <Bob place={at(left, { xs: -34, md: -46 }, sx)} lift={7} rock={7} duration={3.8}>
    <Box component="svg" viewBox="0 0 50 80" sx={{ display: 'block', width: { xs: 32, md: 44 } }}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 10 L20 3 L25 8 L30 3 L33 10 Z" fill={brand.pineapple} stroke="#fff" strokeWidth="2" />
        <path d="M25 34 L16 15 L24 22 L25 10 L28 22 L35 13 L31 34 Z" fill={brand.leaf} stroke="#fff" strokeWidth="2.5" />
        <ellipse cx="25" cy="55" rx="16" ry="21" fill={brand.pink} stroke="#fff" strokeWidth="3" />
        <path d="M14 45 L34 67 M12 57 L26 72 M20 37 L39 58 M36 43 L15 66 M39 54 L24 73 M30 36 L11 55" stroke="#fff" strokeWidth="1.6" opacity=".7" fill="none" />
      </g>
    </Box>
  </Bob>;
}

/** The Hula Hula Golf Club shuttle that waits under the hotel's arches. */
export function Shuttle({ left, sx }: DecorProps) {
  return <Bob place={at(left, { xs: -30, md: -44 }, sx)} lift={3} drift={18} duration={5.2}>
    <Box component="svg" viewBox="0 0 120 62" sx={{ display: 'block', width: { xs: 84, md: 116 } }}>
      <g stroke="#fff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <path d="M6 14 H70 V48 H6 Z" fill="#fff" />
        <path d="M6 14 H70 V22 H6 Z" fill={brand.leaf} />
        <path d="M12 28 H64 V40 H12 Z" fill="#9fd6a4" strokeWidth="2" />
        <path d="M70 26 H92 L108 38 V48 H70 Z" fill="#fff" />
        <path d="M76 30 H90 L100 38 H76 Z" fill={brand.poolLight} strokeWidth="2" />
        <circle cx="26" cy="50" r="8" fill={brand.ink} />
        <circle cx="90" cy="50" r="8" fill={brand.ink} />
      </g>
    </Box>
  </Bob>;
}

export function Longtail({ left, sx }: DecorProps) {
  return <Bob place={at(left, { xs: -26, md: -38 }, sx)} lift={5} rock={4} duration={4.4}>
    <Box component="svg" viewBox="0 0 132 58" sx={{ display: 'block', width: { xs: 92, md: 132 } }}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M124 16 L117 3 M124 16 L124 1 M124 16 L130 5" stroke={brand.pink} strokeWidth="3" />
        <path d="M34 34 L38 18 L80 18 L84 34" fill={brand.pineapple} stroke="#fff" strokeWidth="3" />
        <path d="M6 32 C30 50 86 52 106 44 L124 16 C112 28 92 34 6 32 Z" fill="#9a5b2e" stroke="#fff" strokeWidth="3" />
        <path d="M20 38 C44 46 82 46 102 40" stroke={brand.pineapple} strokeWidth="2" fill="none" />
      </g>
    </Box>
  </Bob>;
}

export function Gulls({ left, sx, color = brand.ink }: DecorProps & { color?: string }) {
  return <Bob place={at(left, { xs: -30, md: -42 }, sx)} lift={6} drift={26} duration={7}>
    <Box component="svg" viewBox="0 0 62 26" sx={{ display: 'block', width: { xs: 46, md: 62 }, filter: 'none' }}>
      <g fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round">
        <path d="M2 14 Q8 5 14 14 Q20 5 26 14" />
        <path d="M36 8 Q40.5 2 45 8 Q49.5 2 54 8" />
      </g>
    </Box>
  </Bob>;
}

// Leave the full doodle above the wave, including its rays and gentle sway.
export function RisingSun({ left }: { left: string }) {
  const { reduced } = useMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '120px' });
  return <MotionBox ref={ref} animate={reduced || !inView ? undefined : { rotate: [-6, 6, -6], y: [0, -4, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    sx={{ position: 'absolute', left: { xs: `min(${left}, calc(100% - 90px))`, md: `min(${left}, calc(100% - 128px))` }, bottom: { xs: 22, md: 24 }, zIndex: 0 }}>
    <SunDoodle color={brand.royal} sx={{ width: { xs: 70, md: 104 }, height: { xs: 70, md: 104 } }} />
  </MotionBox>;
}
