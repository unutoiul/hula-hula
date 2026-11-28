import { Box, Link } from '@mui/material';
import { linkClick } from '../../router';

// The hotel's pink pineapple logo (public/logo/royal-pineapple.svg, cropped
// to the artwork: viewBox 863×733). Heights per place it's used; the width
// follows from the artwork.
export const MARK_SIZES = {
  small: { xs: 50, md: 58 },
  compact: { xs: 62, md: 78 },
  default: { xs: 72, md: 92 },
  header: { xs: 76, md: 108 },
  large: { xs: 104, md: 130 },
};
export type MarkSize = keyof typeof MARK_SIZES;

// `size` drives which tier above is used; the header switches between header
// (at the top of the page) and small (once scrolled), so its height
// transitions. `white` is for pink and plum backgrounds. Just the artwork: the
// header wraps it in its home link (HomeLogo), everywhere else in ClubMark's.
export function ClubMarkArt({ size = 'default', white = false }: { size?: MarkSize; white?: boolean }) {
  return (
    <Box
      component="img"
      src={white ? '/logo/royal-pineapple-white.svg' : '/logo/royal-pineapple.svg'}
      alt=""
      sx={{
        height: MARK_SIZES[size],
        width: 'auto',
        aspectRatio: '863 / 733',
        transition: 'height .35s ease',
      }}
    />
  );
}

export function ClubMark({ size = 'default', white = false }: { size?: MarkSize; white?: boolean }) {
  return (
    <Link href="/" onClick={linkClick('/')} aria-label="Royal Pineapple Hotel home" sx={{ display: 'inline-flex', lineHeight: 0 }}>
      <ClubMarkArt size={size} white={white} />
    </Link>
  );
}
