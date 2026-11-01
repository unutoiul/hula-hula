import { Box, type SxProps, type Theme } from '@mui/material';
import { pineappleGolfer as art } from '../../data/photos';

// The club's mascot: the painted pineapple golfer giving a thumbs up. Pure
// decoration (no alt text); the box it's given sets his width.

/** Peeking over the top corner of a confirmation card (the card must be position: relative). */
export const CARD_PEEK = { position: 'absolute', top: { xs: -22, md: -52 }, right: { xs: 14, md: 30 }, width: { xs: 66, md: 104 } } as const;

export function PineappleGolfer({ sizes = '200px', eager = false, sx }: { sizes?: string; eager?: boolean; sx?: SxProps<Theme> }) {
  return <Box aria-hidden sx={[{ lineHeight: 0, pointerEvents: 'none' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
    <picture>
      <source type="image/avif" srcSet={art.avifSrcSet} sizes={sizes} />
      <Box component="img" src={art.src} srcSet={art.srcSet} sizes={sizes} alt="" width={art.width} height={art.height}
        loading={eager ? 'eager' : 'lazy'} decoding="async" sx={{ display: 'block', width: '100%', height: 'auto', filter: 'drop-shadow(0 10px 14px rgba(23,60,44,.16))' }} />
    </picture>
  </Box>;
}
