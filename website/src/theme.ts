import { alpha, createTheme } from '@mui/material/styles';

export const fonts = {
  serif: '"Fredoka", "Trebuchet MS", sans-serif',
  sans: '"DM Sans", Arial, sans-serif',
  mono: '"DM Sans", Arial, sans-serif',
  playful: '"Fredoka", "Trebuchet MS", sans-serif',
};

export const vacationColors = { cream: '#fbfdf4', coral: '#50830d', pink: '#e7f4cc', leaf: '#50830d', yellow: '#f9f70c', sea: '#006d8a' };

const theme = createTheme({
  palette: {
    primary: { main: '#006d8a', dark: '#124e39', light: '#d9f5fc', contrastText: '#ffffff' },
    secondary: { main: '#f9f70c', dark: '#686b0b', light: '#f9fbc5', contrastText: '#173c2c' },
    info: { main: '#50830d', light: '#e7f4cc', dark: '#315707', contrastText: '#ffffff' },
    success: { main: '#50830d', light: '#e7f4cc', dark: '#315707' },
    background: { default: '#fbfdf4', paper: '#ffffff' },
    text: { primary: '#173c2c', secondary: '#4b6457' },
    divider: '#d6e1ce',
  },
  typography: {
    fontFamily: fonts.sans,
    h1: { fontFamily: fonts.playful, fontWeight: 600, letterSpacing: '-0.035em' },
    h2: { fontFamily: fonts.playful, fontWeight: 500, letterSpacing: '-0.025em' },
    h3: { fontFamily: fonts.playful, fontWeight: 500, letterSpacing: '-0.015em' },
    overline: { fontFamily: fonts.sans, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', lineHeight: 1.6 },
    button: { fontFamily: fonts.sans, fontSize: '0.86rem', fontWeight: 700, letterSpacing: 0, textTransform: 'none' },
  },
  shape: { borderRadius: 18 },
  components: {
    MuiContainer: { styleOverrides: { root: { '@media (min-width: 1200px)': { paddingLeft: 48, paddingRight: 48 } } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 999, padding: '12px 24px' }, containedSecondary: { '&:hover': { backgroundColor: '#e4e208' } } } },
    MuiIconButton: { styleOverrides: { root: { '&:focus-visible': { outline: '3px solid #50830d', outlineOffset: 3 } } } },
    MuiCssBaseline: { styleOverrides: `html{scroll-behavior:smooth}body{overflow-x:clip}::selection{background:#f9f70c;color:#173c2c}a:focus-visible,button:focus-visible{outline:3px solid #50830d;outline-offset:4px}em{font-style:normal}img{max-width:100%}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}` },
  },
});

export const scrim = (opacity: number) => alpha('#124e39', opacity);
export default theme;
