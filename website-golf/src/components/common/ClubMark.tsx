import { Box, Link } from '@mui/material';
import { linkClick } from '../../router';

// Shared logo heights keep the header, footer and site switcher aligned.
export const MARK_SIZES = {
  small: { xs: 60, md: 72 },
  compact: { xs: 66, md: 84 },
  default: { xs: 76, md: 96 },
  header: { xs: 80, md: 116 },
  large: { xs: 110, md: 138 },
};
export type MarkSize = keyof typeof MARK_SIZES;

// The supplied golf-ball mark includes its own lettering: no resort logo mask
// or additional ribbon. Preserve its natural proportions at every size.
export function ClubMarkArt({ size = 'default' }: { size?: MarkSize }) {
  return <Box component="img" src="/logo/hula-hula-golf.png" alt="" width="600" height="600"
    sx={{ display: 'block', height: MARK_SIZES[size], width: 'auto', objectFit: 'contain', transition: 'height .35s ease' }} />;
}

// The mark as a link: "#top" scrolls the homepage; any other path navigates in-app.
export function ClubMark({ size = 'default', href = '#top' }: { size?: MarkSize; href?: string }) {
  return <Link href={href} onClick={href.startsWith('/') ? linkClick(href) : undefined} aria-label="Hula Hula Golf Club home" underline="none" sx={{ display: 'inline-flex', lineHeight: 0 }}>
    <ClubMarkArt size={size} />
  </Link>;
}
