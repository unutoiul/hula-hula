import { Box } from '@mui/material';
import type { ReactNode } from 'react';

const POSTCARD_IMAGE = '/images/royal-pineapple/royal-pineapple-greeting-postcard.png';
const POSTCARD_OUTLINE = 'url("/images/royal-pineapple/badge-frames/greeting-postcard-outline.svg")';
const POSTCARD_WINDOW = 'url("/images/royal-pineapple/badge-frames/greeting-postcard-window.svg")';

/** Keep the supplied postcard's lettering and paper fixed around the photo reel. */
export function PostcardGreeting({ children, label }: { children: ReactNode; label: string }) {
  return <Box role="img" aria-label={`Greetings from Royal Pineapple Hotel. ${label}`} sx={{
    position: 'relative', width: '100%', aspectRatio: '1536 / 1024', isolation: 'isolate',
    filter: 'drop-shadow(0 12px 18px #5a244821)',
  }}>
    <Box component="img" src={POSTCARD_IMAGE} alt="" aria-hidden="true"
      width={1536} height={1024} fetchPriority="high" decoding="async" draggable={false}
      sx={{
        position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', userSelect: 'none', pointerEvents: 'none',
        maskImage: POSTCARD_OUTLINE, WebkitMaskImage: POSTCARD_OUTLINE,
        maskSize: '100% 100%', WebkitMaskSize: '100% 100%', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
      }} />
    <Box sx={{
      position: 'absolute', inset: 0, maskImage: POSTCARD_WINDOW, WebkitMaskImage: POSTCARD_WINDOW,
      maskSize: '100% 100%', WebkitMaskSize: '100% 100%', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
    }}>
      <Box sx={{ position: 'absolute', left: '5.4%', top: '28.3%', width: '88.4%', height: '65.3%', overflow: 'hidden', isolation: 'isolate' }}>
        {children}
      </Box>
    </Box>
  </Box>;
}
