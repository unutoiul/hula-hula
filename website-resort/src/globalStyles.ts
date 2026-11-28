import type { CSSInterpolation, CSSObject } from '@mui/material/styles';

// Page-wide styles, given to MUI's CssBaseline by the theme, so the site has
// no separate stylesheets: the self-hosted fonts (preloaded in index.html),
// then the few rules that apply to every element of a kind.

const fontFaces: CSSObject[] = [
  {
    '@font-face': {
      fontFamily: 'Fredoka',
      src: "url('/fonts/fredoka-variable.woff2') format('woff2')",
      fontStyle: 'normal',
      fontWeight: '300 700',
      fontDisplay: 'swap',
    },
  },
  {
    '@font-face': {
      fontFamily: 'DM Sans',
      src: "url('/fonts/dm-sans-variable.woff2') format('woff2')",
      fontStyle: 'normal',
      fontWeight: '100 1000',
      fontDisplay: 'swap',
    },
  },
];

const base: CSSObject = {
  html: { scrollBehavior: 'smooth', scrollbarColor: '#50830d #e7f4cc' },
  body: { overflowX: 'clip' },
  '::selection': { background: '#f9f70c', color: '#173c2c' },
  'a:focus-visible, button:focus-visible': { outline: '3px solid #50830d', outlineOffset: 4 },
  em: { fontStyle: 'normal' },
  img: { maxWidth: '100%' },
  'h1, h2, h3': { textWrap: 'balance' },
  p: { textWrap: 'pretty' },
  'button, a': { WebkitTapHighlightColor: 'transparent' },
  // `translate` adds to a button's own transform (e.g. translateY(-50%) centring)
  // instead of replacing it, so centred arrows don't jump when pressed.
  'button:active, a.MuiButton-root:active': { translate: '0 1px' },
  '@media (prefers-reduced-motion: reduce)': {
    html: { scrollBehavior: 'auto' },
    '*, *::before, *::after': { animationDuration: '.01ms !important', transitionDuration: '.01ms !important' },
  },
};

export const globalStyles = (): CSSInterpolation => [...fontFaces, base];
