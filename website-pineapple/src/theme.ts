import { alpha, createTheme } from '@mui/material/styles';

// Royal Pineapple's palette, on the Hula Hula family's type and shapes (same
// fonts, buttons and spacing as the resort and golf club). Colours come from
// the hotel itself: the pink of its pineapple logo, a deeper "royal" pink
// that white text can sit on (5.1:1), the plum of its doors and the pineapple
// yellow of its façade. Brand pink #f06598 is for artwork only; text on it is plum.
export const fonts = {
  serif: '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif',
  sans: '"DM Sans", Arial, sans-serif',
  mono: '"DM Sans", Arial, sans-serif',
  playful: '"Fredoka", "Trebuchet MS", sans-serif',
};

export const brand = {
  pink: '#f06598', royal: '#c92f6b', blush: '#fde6ee', plum: '#5a2448', ink: '#3a1830',
  pineapple: '#f5c04a', butter: '#fdf1cf', pool: '#27a5b5', poolLight: '#dff6f7', leaf: '#3d7a4a', leafLight: '#e3f1e4',
  cream: '#fff9f2', paper: '#fffdf9',
};

// The names the family's shared components use for their backgrounds.
export const vacationColors = { cream: brand.cream, coral: brand.royal, pink: brand.blush, leaf: brand.leaf, yellow: brand.pineapple, sea: brand.royal };

const theme = createTheme({
  palette: {
    primary: { main: brand.royal, dark: brand.plum, light: brand.blush, contrastText: '#ffffff' },
    secondary: { main: brand.pineapple, dark: '#8a6514', light: brand.butter, contrastText: brand.ink },
    info: { main: brand.pool, light: brand.poolLight, dark: '#16707c', contrastText: '#ffffff' },
    success: { main: brand.leaf, light: brand.leafLight, dark: '#2a5a35' },
    background: { default: brand.cream, paper: brand.paper },
    text: { primary: brand.ink, secondary: '#6b4a5e' },
    divider: '#f0dce4',
  },
  typography: {
    fontFamily: fonts.sans,
    h1: { fontFamily: fonts.serif, fontWeight: 400, letterSpacing: '-0.035em', lineHeight: 1.08 },
    h2: { fontFamily: fonts.serif, fontWeight: 400, letterSpacing: '-0.035em', lineHeight: 1.1 },
    h3: { fontFamily: fonts.serif, fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.15 },
    overline: { fontFamily: fonts.sans, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', lineHeight: 1.6 },
    button: { fontFamily: fonts.sans, fontSize: '0.86rem', fontWeight: 700, letterSpacing: 0, textTransform: 'none' },
  },
  shape: { borderRadius: 18 },
  components: {
    MuiContainer: { styleOverrides: {
      root: {
        paddingLeft: 20, paddingRight: 20,
        '@media (min-width: 600px)': { paddingLeft: 24, paddingRight: 24 },
        '@media (min-width: 900px)': { paddingLeft: 32, paddingRight: 32 },
        '@media (min-width: 1200px)': { paddingLeft: 48, paddingRight: 48 },
      },
      maxWidthXl: { '@media (min-width: 1200px)': { maxWidth: 1416 } },
    } },
    // One button system for the whole site: every pill is 48px tall (small: 40px,
    // used for filter chips and in-card actions), outlined pills lose a pixel of
    // padding to their border so they match contained ones exactly, and the text
    // variant is always an underlined link-style CTA.
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999, minHeight: 48, padding: '12px 24px', lineHeight: 1.5,
          variants: [
            { props: { variant: 'outlined' }, style: { padding: '11px 23px' } },
            { props: { size: 'small' }, style: { minHeight: 40, padding: '8px 18px', fontSize: '0.8rem' } },
            { props: { size: 'small', variant: 'outlined' }, style: { padding: '7px 17px' } },
            {
              props: { variant: 'text' },
              style: {
                minWidth: 0, padding: '12px 2px', borderRadius: 0,
                textDecoration: 'underline', textDecorationColor: brand.pink, textDecorationThickness: 2, textUnderlineOffset: 8,
                '&:hover': { backgroundColor: 'transparent', textDecorationColor: 'currentColor' },
              },
            },
          ],
        },
        containedPrimary: { '&:hover': { backgroundColor: '#b0265c' } },
        containedSecondary: { '&:hover': { backgroundColor: '#efb22e' } },
      },
    },
    MuiIconButton: { styleOverrides: { root: { '&:focus-visible': { outline: `3px solid ${brand.royal}`, outlineOffset: 3 } } } },
    MuiCssBaseline: { styleOverrides: `html{scroll-behavior:smooth}body{overflow-x:clip}::selection{background:${brand.pineapple};color:${brand.ink}}a:focus-visible,button:focus-visible{outline:3px solid ${brand.royal};outline-offset:4px}em{font-style:normal}img{max-width:100%}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}` },
  },
});

export const scrim = (opacity: number) => alpha(brand.plum, opacity);
export default theme;
