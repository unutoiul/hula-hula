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
// The 600px PNG is the master; pages get a 160/320/480px AVIF or WebP copy
// (scripts/prepare-golf-decor.py) chosen for the size shown and the screen.
const LOGO = '/logo/hula-hula-golf';
const logoSet = (ext: string) => [160, 320, 480].map((w) => `${LOGO}-${w}.${ext} ${w}w`).join(', ');

export function ClubMarkArt({ size = 'default' }: { size?: MarkSize }) {
  const { xs, md } = MARK_SIZES[size];
  const sizes = `(min-width: 900px) ${md}px, ${xs}px`;
  return (
    <Box component="picture" sx={{ display: 'contents' }}>
      <source type="image/avif" srcSet={logoSet('avif')} sizes={sizes} />
      <Box
        component="img"
        src={`${LOGO}-320.webp`}
        srcSet={logoSet('webp')}
        sizes={sizes}
        alt=""
        width="600"
        height="600"
        sx={{ display: 'block', height: MARK_SIZES[size], width: 'auto', objectFit: 'contain', transition: 'height .35s ease' }}
      />
    </Box>
  );
}

// The mark as a link: "#top" scrolls the homepage; any other path navigates in-app.
export function ClubMark({ size = 'default', href = '#top' }: { size?: MarkSize; href?: string }) {
  return (
    <Link
      href={href}
      onClick={href.startsWith('/') ? linkClick(href) : undefined}
      aria-label="Hula Hula Golf Club home"
      underline="none"
      sx={{ display: 'inline-flex', lineHeight: 0 }}
    >
      <ClubMarkArt size={size} />
    </Link>
  );
}
