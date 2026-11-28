import { Box } from '@mui/material';

export const tropicalSectionSx = {
  position: 'relative',
  isolation: 'isolate',
  '& > .MuiContainer-root': { position: 'relative', zIndex: 1 },
} as const;

// Display-sized copies of the 800px artwork (scripts/prepare-golf-decor.py).
const LEAVES = '/images/illustrations/tropical-foliage';
const leafSet = (ext: string) => [240, 480].map((w) => `${LEAVES}-${w}.${ext} ${w}w`).join(', ');

// One faint corner, reserved for the header and footer. The clipped artwork
// cannot capture input or cover the content above it.
export function TropicalBackdrop({
  side = 'right',
  anchor = 'top',
  compact = false,
}: {
  side?: 'left' | 'right';
  anchor?: 'top' | 'bottom';
  compact?: boolean;
}) {
  const sizes = compact ? '(min-width: 900px) 150px, 75px' : '(min-width: 900px) 240px, 120px';
  return (
    <Box
      aria-hidden="true"
      data-tropical-backdrop
      sx={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none' }}
    >
      <Box component="picture" sx={{ display: 'contents' }}>
        <source type="image/avif" srcSet={leafSet('avif')} sizes={sizes} />
        <Box
          component="img"
          src={`${LEAVES}-480.webp`}
          srcSet={leafSet('webp')}
          sizes={sizes}
          alt=""
          width="800"
          height="800"
          loading={compact ? 'eager' : 'lazy'}
          decoding="async"
          sx={{
            position: 'absolute',
            width: { xs: compact ? 75 : 120, md: compact ? 150 : 240 },
            height: 'auto',
            maxWidth: 'none',
            [side]: { xs: -24, md: -32 },
            [anchor]: { xs: -20, md: -28 },
            opacity: { xs: compact ? 0.16 : 0.23, md: compact ? 0.22 : 0.3 },
            transform: `scale(${side === 'right' ? -1 : 1}, ${anchor === 'bottom' ? -1 : 1})`,
          }}
        />
      </Box>
    </Box>
  );
}
