import { Box, Link } from '@mui/material';

// The new crop (viewBox 159×137.25) is denser than the previous one (318×225
// — much more margin baked in) — the same height reads noticeably bigger now,
// so these are scaled back down from where they were tuned for the old file.
export const MARK_SIZES = {
  small: { xs: 52, md: 60 },
  compact: { xs: 66, md: 84 },
  default: { xs: 76, md: 96 },
  header: { xs: 80, md: 116 },
  large: { xs: 110, md: 138 },
};
export type MarkSize = keyof typeof MARK_SIZES;

// Vector, pre-cropped to the mark itself (no dead canvas to fight, unlike the
// original PNG export) — sized directly via height, width follows from the
// SVG's own aspect ratio (viewBox 159×137.25, a tighter crop than the
// previous export).
//
// `size` drives which tier above is used; the header switches between
// header (at the top of the page) and small (once scrolled), so its height
// transitions while the other contexts (footer, cookie dialog) render at a
// fixed size. Just the artwork: the header wraps it in the site switcher,
// everywhere else in a link (ClubMark).
export function ClubMarkArt({ size = 'default' }: { size?: MarkSize }) {
  return <Box component="img" src="/logo/hula-hula.svg" alt="" sx={{
    height: MARK_SIZES[size],
    width: 'auto',
    aspectRatio: '159 / 137.25',
    transition: 'height .35s ease',
  }} />;
}

export function ClubMark({ size = 'default' }: { size?: MarkSize }) {
  return <Link href="#top" aria-label="Hula Hula Resort home" sx={{ display: 'inline-flex', lineHeight: 0 }}>
    <ClubMarkArt size={size} />
  </Link>;
}
