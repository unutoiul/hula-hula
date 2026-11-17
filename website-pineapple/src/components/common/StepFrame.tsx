import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

// The hotel's signature shape: a rectangle with stepped, cut-in corners —
// the cut-outs in the pool wall, the carved panels on the room walls and the
// bathroom mirrors at Royal Pineapple all use it. Photos and cards across
// the site wear it as their frame.

/** clip-path for a stepped-corner rectangle, `step` px into each corner. */
export const stepClip = (step: number) => `polygon(${step}px 0, calc(100% - ${step}px) 0, calc(100% - ${step}px) ${step}px, 100% ${step}px, 100% calc(100% - ${step}px), calc(100% - ${step}px) calc(100% - ${step}px), calc(100% - ${step}px) 100%, ${step}px 100%, ${step}px calc(100% - ${step}px), 0 calc(100% - ${step}px), 0 ${step}px, ${step}px ${step}px)`;

/**
 * A stepped frame around its content: `border` px of `color` (paper by
 * default) following the same shape, and a soft shadow (drop-shadow, since
 * clip-path would cut a box-shadow off).
 */
export function StepFrame({ children, step = 22, border = 7, color = '#fffdf9', shadow = true, sx, innerSx }: {
  children: ReactNode; step?: number; border?: number; color?: string; shadow?: boolean; sx?: SxProps<Theme>; innerSx?: SxProps<Theme>;
}) {
  return <Box sx={[{ position: 'relative', filter: shadow ? 'drop-shadow(0 16px 30px rgba(90,36,72,.16))' : undefined }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
    <Box sx={{ height: '100%', p: `${border}px`, bgcolor: color, clipPath: stepClip(step) }}>
      {/* Inset by the border, the notch keeps its size: the frame is the same width all round. */}
      <Box sx={[{ position: 'relative', height: '100%', overflow: 'hidden', clipPath: stepClip(step) }, ...(Array.isArray(innerSx) ? innerSx : innerSx ? [innerSx] : [])]}>{children}</Box>
    </Box>
  </Box>;
}
