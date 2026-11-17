import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { badgeFrames, type BadgeFrameName } from './badgeFrames';

/**
 * A fixed decorative frame with its picture/content behind the frame's alpha
 * mask. `shadow` is the drop shadow around the whole cut-out shape.
 */
export function BadgePicture({ frameName, children, label, eager = false, shadow = '0 12px 18px #5a24481c' }: {
  frameName: BadgeFrameName; children: ReactNode; label?: string; eager?: boolean; shadow?: string;
}) {
  const frame = badgeFrames[frameName];
  const mask = `url("${frame.mask}")`;
  return <Box sx={{ position: 'relative', width: '100%', aspectRatio: `${frame.width} / ${frame.height}`, isolation: 'isolate', filter: `drop-shadow(${shadow})` }}>
    <Box sx={{
      position: 'absolute', inset: 0, maskImage: mask, WebkitMaskImage: mask,
      maskSize: '100% 100%', WebkitMaskSize: '100% 100%', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskMode: 'alpha',
    }}>
      <Box role={label ? 'img' : undefined} aria-label={label} sx={{
        position: 'absolute', left: `${frame.window.left}%`, top: `${frame.window.top}%`, width: `${frame.window.width}%`, height: `${frame.window.height}%`,
        overflow: 'hidden', isolation: 'isolate', bgcolor: '#ead5c6',
      }}>
        {children}
      </Box>
    </Box>
    <Box component="img" src={frame.image} alt="" aria-hidden="true" width={frame.width} height={frame.height}
      loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" draggable={false}
      sx={{ position: 'absolute', zIndex: 2, inset: 0, display: 'block', width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }} />
  </Box>;
}
