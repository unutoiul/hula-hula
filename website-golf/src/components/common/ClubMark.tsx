import { Box, Link } from '@mui/material';
import { linkClick } from '../../router';
import { fonts } from '../../theme';

// Image heights per tier, the same as the resort's mark (viewBox 159×137.25).
export const MARK_SIZES = {
  small: { xs: 52, md: 60 },
  compact: { xs: 66, md: 84 },
  default: { xs: 76, md: 96 },
  header: { xs: 80, md: 116 },
  large: { xs: 110, md: 138 },
};
export type MarkSize = keyof typeof MARK_SIZES;

// In px strings: a bare number in a margin would be read as theme spacing units.
const scaled = (size: { xs: number; md: number }, factor: number) => ({ xs: `${size.xs * factor}px`, md: `${size.md * factor}px` });

// The Hula Hula island-and-pineapple mark with its "Holiday" tag masked out
// (public/logo/hula-hula-golf.svg) and a "Golf Club" ribbon tucked under it
// instead — live text in the brand font, so it stays crisp and readable at
// every size, from the scrolled header to the footer. Just the artwork: the
// header wraps it in the site switcher, everywhere else in a link (ClubMark).
export function ClubMarkArt({ size = 'default' }: { size?: MarkSize }) {
  const height = MARK_SIZES[size];
  return <Box component="span" sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0 }}>
    <Box component="img" src="/logo/hula-hula-golf.svg" alt="" sx={{ height, width: 'auto', aspectRatio: '159 / 137.25', transition: 'height .35s ease' }} />
    <Box component="span" aria-hidden sx={{
      mt: scaled(height, -0.1), px: '.75em', py: '.28em', borderRadius: 999, border: '2px solid #fffef8', bgcolor: 'primary.main', color: 'primary.contrastText',
      // Never below 9px, so it still reads in the slim scrolled header.
      fontFamily: fonts.playful, fontWeight: 600, fontSize: { xs: `max(${height.xs * 0.095}px, 9px)`, md: `max(${height.md * 0.095}px, 9px)` }, lineHeight: 1, letterSpacing: '.14em', whiteSpace: 'nowrap',
      transform: 'rotate(-3deg)', boxShadow: '0 3px 0 rgba(23,60,44,.12)', transition: 'font-size .35s ease, margin .35s ease',
    }}>GOLF CLUB</Box>
  </Box>;
}

// The mark as a link: "#top" scrolls the homepage; any other path navigates in-app.
export function ClubMark({ size = 'default', href = '#top' }: { size?: MarkSize; href?: string }) {
  return <Link href={href} onClick={href.startsWith('/') ? linkClick(href) : undefined} aria-label="Hula Hula Golf Club home" underline="none" sx={{ display: 'inline-flex', lineHeight: 0 }}>
    <ClubMarkArt size={size} />
  </Link>;
}
