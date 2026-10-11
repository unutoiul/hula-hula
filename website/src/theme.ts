import { alpha, createTheme } from '@mui/material/styles';

// ---------------------------------------------------------------------------
// Design tokens — the single source of truth for color and type. Components
// should reference theme.palette / fonts / scrim() rather than hardcoding
// hex or rgba values directly, so a palette change only has to happen here.
// ---------------------------------------------------------------------------

export const fonts = {
  serif: '"Playfair Display", serif', // display headlines (h1–h3)
  sans: '"DM Sans", sans-serif', // body copy and small text (the theme default)
  mono: '"DM Mono", monospace', // nav links, buttons — the site's "technical" accent
  playful: '"Comic Neue", cursive', // round comic accent — headlines, booking numbers
};

const theme = createTheme({
  palette: {
    mode: 'light',
    // Re-derived directly from a pixel sample of the logo file (dominant hues
    // by area): the sky/wave blue is the most prominent color in the mark, so
    // it's now the brand color everywhere that used to be green — section
    // washes, the header/hero scrim, the mobile menu. Pineapple gold stays the
    // accent (unchanged, it was already an accurate sample). The logo's leaf
    // green is real but a small part of the mark by area, so it's kept to one
    // deliberate small touch (the live-status dot) via `success` rather than
    // spread across buttons/backgrounds the way it was before.
    primary: { main: '#0f8fc4', dark: '#0a2836', light: '#bfe6f5', contrastText: '#f5fbfd' },
    secondary: { main: '#f3b400', dark: '#c98f00', light: '#ffdd7a', contrastText: '#2a1e00' },
    info: { main: '#29b6e0', light: '#8fe2f5', dark: '#1490b0', contrastText: '#062329' },
    success: { main: '#6fae1f', light: '#c3e79a', dark: '#3f6b12', contrastText: '#0d1f04' },
    background: { default: '#f7fafb', paper: '#eaf3f7' },
    text: { primary: '#132229', secondary: '#55707a' },
  },
  typography: {
    fontFamily: fonts.sans,
    h1: { fontFamily: fonts.playful, fontWeight: 300, letterSpacing: 0 },
    h2: { fontFamily: fonts.playful, fontWeight: 300, letterSpacing: 0 },
    h3: { fontFamily: fonts.playful, fontWeight: 300, letterSpacing: 0 },
    // Kept in DM Sans, not the cartoon face — Chewy is a single-weight display
    // font that turns illegible at kicker-label sizes.
    overline: { fontFamily: fonts.sans, fontSize: '0.64rem', fontWeight: 600, letterSpacing: '0.13em' },
    // Nav links/buttons stay in the mono "technical" accent, not the cartoon face —
    // Chewy's bubble letterforms compress into an illegible smudge at this size.
    button: { fontFamily: fonts.mono, fontSize: '0.66rem', fontWeight: 500, letterSpacing: '0.12em' },
  },
  shape: { borderRadius: 0 },
  components: {
    MuiCssBaseline: {
      // Fonts are loaded via a <link> tag in index.html, not a CSS @import here —
      // see that file for why.
      styleOverrides: `html { scroll-behavior: smooth; } body { overflow-x: hidden; }`,
    },
  },
});

// Every dark overlay in the app (header scrim, hero gradient, card shadows, the
// cookie-consent backdrop) is this one color at different opacities, derived
// from the palette instead of one-off rgba() strings scattered through the UI.
//
// It's a blend of primary.dark and info.dark rather than primary.dark alone —
// now that both are blue, the blend just deepens toward navy/teal instead of
// flattening to one note, which still reads more contrast-y over real hotel
// photography than a flat single-hue dark does.
const SCRIM_BASE = '#0f576d'; // #0a2836 (primary.dark) × #1490b0 (info.dark), ~55/45
export const scrim = (opacity: number) => alpha(SCRIM_BASE, opacity);

export default theme;
