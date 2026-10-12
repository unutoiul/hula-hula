import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { photoAssets } from '../../data/photos';
import { fonts } from '../../theme';
import { BookingSearchBar } from '../booking/BookingSearchBar';
import { Polaroid, Sticker, SunDoodle } from '../common/VacationDecor';
import { HeroHeadline } from './HeroHeadline';
import { HeroMetaCompact } from './HeroMetaCompact';
import { HeroVideo } from './HeroVideo';
import { ScrollTilt } from '../common/ScrollMotion';

export function Hero() {
  return <Box component="section" aria-label="Welcome to Hula Hula Resort" sx={{ pt: { xs: 15, md: 21 }, pb: { xs: 6, md: 9 }, overflow: 'hidden', position: 'relative' }}>
    <Container maxWidth="xl">
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1.12fr' }, alignItems: 'center', gap: { xs: 5, md: 6 }, minHeight: { md: 700 } }}>
        <Box sx={{ position: 'relative', zIndex: 2, display: { xs: 'contents', md: 'block' } }}>
          <Box sx={{ order: 1, textAlign: { xs: 'center', md: 'left' } }}>
          <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={1.3} sx={{ mb: 2.5 }}>
            <Box sx={{ width: 28, height: 3, bgcolor: 'info.main', borderRadius: 2 }} />
            <Typography variant="overline" color="success.main">Your happy place in Ao Nang</Typography>
          </Stack>
          <HeroHeadline />
          <Typography sx={{ fontSize: { xs: 16, md: 18 }, lineHeight: 1.75, color: 'text.secondary', maxWidth: 390, mx: { xs: 'auto', md: 0 }, mt: 3 }}>
            Pool dips. Pineapple sips. Good times with your favourite people. This is Hula Hula, Krabi.
          </Typography>
          <Stack direction="row" justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={1.8} flexWrap="wrap" useFlexGap sx={{ mt: 3.5 }}>
            <Button href="#hotel" variant="contained" endIcon={<ArrowOutward />}>Find your happy place</Button>
            <Button href="#floating-breakfast" color="inherit">Make breakfast float</Button>
          </Stack>
          </Box>
          <Box sx={{ mt: { xs: 0, md: 4 }, maxWidth: 530, order: 3 }}>
            <Typography variant="overline" sx={{ display: 'block', mb: 1, textAlign: { xs: 'center', md: 'left' } }}>Good times start with a date</Typography>
            <BookingSearchBar />
            <Box sx={{ mt: 2 }}><HeroMetaCompact /></Box>
          </Box>
        </Box>
        <Box sx={{ position: 'relative', ml: { xs: 1, md: 2 }, mb: { xs: 4, md: 3 }, order: 2 }}>
          <ScrollTilt amount={1.5}>
            <Box sx={{ border: '8px solid white', borderRadius: '140px 140px 30px 30px', height: { xs: 460, sm: 580, md: 680 }, overflow: 'hidden', transform: 'rotate(2deg)', boxShadow: '0 18px 55px rgba(23,60,44,.10)', bgcolor: 'primary.dark' }}>
              <HeroVideo />
            </Box>
          </ScrollTilt>
          <Sticker color="#e7f4cc" rotate={9} sx={{ position: 'absolute', top: { xs: 5, md: 22 }, right: { xs: -6, md: -18 }, width: { xs: 95, md: 122 }, height: { xs: 95, md: 122 }, fontSize: { xs: 20, md: 23 } }}>Less worry.<br />More Hula.</Sticker>
          <Box sx={{ position: 'absolute', bottom: -42, right: { sm: 28, md: 36 }, display: { xs: 'none', sm: 'block' } }}><SunDoodle size={92} color="#50830d" sx={{ transform: 'rotate(-10deg)' }} /></Box>
          <Box sx={{ position: 'absolute', width: { xs: 150, md: 202 }, height: { xs: 180, md: 232 }, left: { xs: -18, md: -46 }, bottom: { xs: -26, md: -33 } }}>
          <ScrollTilt amount={-4} sx={{ height: '100%' }}>
            <Polaroid image={photoAssets.breakfastPortrait.src} alt="Guest enjoying a floating breakfast in a Hula Hula private pool" caption="Make a splash!" rotate={-9} sizes="210px" objectPosition="center 60%" />
          </ScrollTilt>
          </Box>
        </Box>
      </Box>
    </Container>
    <Box sx={{ mt: { xs: 5, md: 7 }, py: 2.1, bgcolor: 'secondary.main', transform: 'rotate(-1deg)', width: '102%', ml: '-1%' }}>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={{ xs: 2, md: 5 }} sx={{ fontFamily: fonts.playful, fontSize: { xs: 18, md: 25 }, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {['Tropical stays', '✳', 'Happy days', '✳', 'Pineapple ways', '✳', 'Hula always'].map((text, i) => <Box key={i}>{text}</Box>)}
      </Stack>
    </Box>
  </Box>;
}
