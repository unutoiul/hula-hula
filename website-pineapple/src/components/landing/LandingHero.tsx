import East from '@mui/icons-material/East';
import { Box, Button, Container } from '@mui/material';
import { brand, fonts } from '../../theme';
import { BookingSearchBar } from '../booking/BookingSearchBar';
import { KrabiNow } from './KrabiNow';
import { eyebrowSx, RULE, textLinkSx } from './landingStyles';
import { PostcardCollage } from './PostcardCollage';

export function LandingHero() {
  return <Box component="section" aria-labelledby="royal-hero-title" sx={{
    position: 'relative', overflow: 'hidden', pt: { xs: '114px', md: '132px' },
    background: `radial-gradient(ellipse at 88% 24%, #fbe6ed 0, transparent 60%), ${brand.cream}`,
  }}>
    <Container maxWidth="xl">
      <Box sx={{
        display: 'grid', alignItems: 'center', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 40fr) minmax(0, 60fr)' },
        columnGap: { md: '24px', lg: 'clamp(28px, 2.5vw, 36px)' }, rowGap: { xs: '26px', sm: '32px' },
        maxWidth: { xs: 640, md: 'none' }, mx: 'auto', pt: { xs: '28px', sm: '36px', md: '28px' }, pb: { xs: '24px', sm: '30px', md: '28px' },
      }}>
        <Box sx={{ minWidth: 0, pb: { md: '24px' } }}>
          <Box component="p" sx={{ ...eyebrowSx, mb: { xs: '14px', md: '20px' } }}><span aria-hidden="true" />The Royal Pineapple Hotel</Box>
          <Box component="h1" id="royal-hero-title" sx={{
            m: 0, color: brand.plum, fontFamily: fonts.serif, fontWeight: 400,
            fontSize: { xs: 'clamp(42px, 10.6vw, 62px)', md: 'clamp(53px, 5.5vw, 82px)' }, lineHeight: 1, letterSpacing: '-.055em',
            '& em': { display: 'block', mt: '4px', color: brand.royal, fontWeight: 400 },
          }}>Your hideaway <em>in Krabi Town.</em></Box>
          <Box component="p" sx={{
            color: 'text.secondary', fontSize: { xs: 15, lg: 17 }, lineHeight: 1.65,
            maxWidth: '36ch', m: { xs: '16px 0 20px', md: '22px 0 26px' },
          }}>Lounge by the pool, unwind on your own balcony, then step out to explore the neighbourhood.</Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: { xs: '16px', sm: '24px' }, rowGap: '8px' }}>
            <Button href="#booking-search" variant="contained" endIcon={<East />} sx={{ minHeight: '48px', px: { xs: '18px', sm: '24px' }, fontSize: { xs: 12, sm: 13 } }}>Check availability</Button>
            <Box component="a" href="#rooms" sx={{ ...textLinkSx, display: 'inline-flex', alignItems: 'center', minHeight: 44, fontSize: { xs: 12, sm: 13 } }}>Explore rooms <span aria-hidden="true">↓</span></Box>
          </Box>
          <KrabiNow />
        </Box>
        <PostcardCollage />
      </Box>
      <Box id="booking-search" aria-labelledby="booking-search-title" component="section" sx={{
        display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'stretch', lg: 'center' },
        gap: { xs: '12px', lg: '32px' }, pt: '20px', pb: { xs: '28px', md: '34px' }, borderTop: `1px solid ${RULE}`,
        maxWidth: { xs: 640, md: 'none' }, mx: 'auto', scrollMarginTop: '112px',
      }}>
        <Box component="h2" id="booking-search-title" sx={{ m: 0, flexShrink: 0, fontFamily: fonts.serif, fontWeight: 400, letterSpacing: '-.035em', color: brand.plum, fontSize: { xs: 26, lg: 30 } }}>Plan your stay</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}><BookingSearchBar wide /></Box>
      </Box>
    </Container>
  </Box>;
}
