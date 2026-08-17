import { Box, Link } from '@mui/material';

// The new crop (viewBox 159×137.25) is denser than the previous one (318×225
// — much more margin baked in) — the same height reads noticeably bigger now,
// so these are scaled back down from where they were tuned for the old file.
const SIZES = {
  compact: { xs: 46, md: 62 }, // header, scrolled/condensed
  default: { xs: 60, md: 84 }, // header, parked at the top
  large: { xs: 78, md: 104 }, // footer — plenty of room, reads as a closing signature
};

// Vector, pre-cropped to the mark itself (no dead canvas to fight, unlike the
// original PNG export) — sized directly via height, width follows from the
// SVG's own aspect ratio (viewBox 159×137.25, a tighter crop than the
// previous export).
//
// `size` drives which tier above is used; the header additionally animates
// between compact/default on its own scroll state, so its height transitions
// while the other contexts (footer, cookie dialog) render at a fixed size.
export function ClubMark({ size = 'default' }: { size?: keyof typeof SIZES }) {
  return <Link href="#top" aria-label="Hula Hula Resort home" sx={{ display: 'inline-flex', lineHeight: 0 }}>
    <Box component="img" src="/logo/hula-hula.svg" alt="Hula Hula Resort" sx={{
      height: SIZES[size],
      width: 'auto',
      aspectRatio: '159 / 137.25',
      transition: 'height .35s ease',
    }} />
  </Link>;
}
