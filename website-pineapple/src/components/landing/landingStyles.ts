import { brand, fonts } from '../../theme';

// Looks shared by the homepage's hand-built sections (hero, welcome, offers,
// contact). Responsive values follow the theme's breakpoints: xs phones,
// sm tablets, md small laptops, lg desktops. Pixel values are strings so MUI
// doesn't read them as spacing or radius units.

/** Hairlines between the homepage's sections and rows. */
export const RULE = '#e8ced7';

/** Small spaced capitals above a heading; an empty first <span> draws the little rule before them. */
export const eyebrowSx = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  m: 0,
  mb: { xs: '20px', sm: '24px' },
  color: brand.royal,
  fontSize: { xs: 9, sm: 10 },
  fontWeight: 700,
  lineHeight: 1.7,
  letterSpacing: { xs: '.17em', sm: '.2em' },
  textTransform: 'uppercase',
  '& > span': { width: 28, height: '1px', bgcolor: 'currentColor' },
} as const;

/** A quiet underlined link; its trailing <span> holds the arrow. */
export const textLinkSx = {
  fontSize: { xs: 11, sm: 12 },
  fontWeight: 600,
  color: brand.plum,
  textDecoration: 'none',
  borderBottom: '1px solid #d4a0b5',
  py: '9px',
  '& span': { ml: '8px' },
} as const;

/** The big serif headings; an <em> inside turns rose. */
export const serifHeadingSx = {
  fontFamily: fonts.serif,
  fontWeight: 400,
  color: brand.plum,
  '& em': { color: brand.royal, fontWeight: 400 },
} as const;
