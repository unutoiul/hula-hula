import { Box } from '@mui/material';

export const tropicalSectionSx = {
  position: 'relative',
  isolation: 'isolate',
  '& > .MuiContainer-root': { position: 'relative', zIndex: 1 },
} as const;

// One faint corner, reserved for the header and footer. The clipped artwork
// cannot capture input or cover the content above it.
export function TropicalBackdrop({ side = 'right', anchor = 'top', compact = false }: {
  side?: 'left' | 'right'; anchor?: 'top' | 'bottom'; compact?: boolean;
}) {
  return <Box aria-hidden="true" data-tropical-backdrop sx={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none' }}>
    <Box component="img" src="/images/illustrations/tropical-foliage.webp" alt="" width="800" height="800" loading={compact ? 'eager' : 'lazy'} decoding="async" sx={{
      position: 'absolute', width: { xs: compact ? 75 : 120, md: compact ? 150 : 240 }, height: 'auto', maxWidth: 'none',
      [side]: { xs: -24, md: -32 }, [anchor]: { xs: -20, md: -28 },
      opacity: { xs: compact ? .16 : .23, md: compact ? .22 : .3 },
      transform: `scale(${side === 'right' ? -1 : 1}, ${anchor === 'bottom' ? -1 : 1})`,
    }} />
  </Box>;
}
