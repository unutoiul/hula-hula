import type { CSSInterpolation, CSSObject, Theme } from '@mui/material/styles';

// Page-wide styles, given to MUI's CssBaseline by the theme, so the site has
// no separate stylesheets: the self-hosted fonts (preloaded in index.html),
// then the few rules that apply to every element of a kind.

const fontFaces: CSSObject[] = [
  { '@font-face': { fontFamily: 'Fredoka', src: "url('/fonts/fredoka-variable.ttf') format('truetype')", fontStyle: 'normal', fontWeight: '300 700', fontDisplay: 'swap' } },
  { '@font-face': { fontFamily: 'DM Sans', src: "url('/fonts/dm-sans-variable.ttf') format('truetype')", fontStyle: 'normal', fontWeight: '100 1000', fontDisplay: 'swap' } },
];

const base = ({ palette }: Theme): CSSObject => ({
  html: { scrollBehavior: 'smooth', scrollbarColor: `${palette.primary.main} ${palette.primary.light}` },
  body: { overflowX: 'clip' },
  '::selection': { background: palette.secondary.main, color: palette.text.primary },
  'a:focus-visible, button:focus-visible': { outline: `3px solid ${palette.primary.main}`, outlineOffset: 4 },
  em: { fontStyle: 'normal' },
  img: { maxWidth: '100%' },
  'h1, h2, h3': { textWrap: 'balance', overflowWrap: 'break-word' },
  p: { textWrap: 'pretty' },
  'button, a': { WebkitTapHighlightColor: 'transparent' },
  'button:active, a.MuiButton-root:active': { transform: 'translateY(1px)' },
  '@media (prefers-reduced-motion: reduce)': {
    html: { scrollBehavior: 'auto' },
    '*, *::before, *::after': { animationDuration: '.01ms !important', transitionDuration: '.01ms !important' },
  },
});

export const globalStyles = (theme: Theme): CSSInterpolation => [...fontFaces, base(theme)];
