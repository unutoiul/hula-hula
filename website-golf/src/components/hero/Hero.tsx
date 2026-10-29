import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { photoAssets as p } from '../../data/photos';
import { fonts } from '../../theme';
import { QuickBook } from '../booking/QuickBook';
import { ClubPhoto } from '../common/ClubPhoto';
import { ScrollTilt } from '../common/ScrollMotion';
import { Polaroid, Sticker } from '../common/VacationDecor';
import { HeroHeadline } from './HeroHeadline';

export function Hero() {
  return <Box component="section" aria-label="Welcome to Hula Hula Golf Club" sx={{ position: 'relative', pt: { xs: 20, md: 27 }, pb: { xs: 6, md: 9 }, overflow: 'hidden' }}>
    <Container maxWidth="xl">
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1.12fr' }, alignItems: 'center', gap: { xs: 5, md: 6 }, minHeight: { md: 700 } }}>
        <Box sx={{ position: 'relative', zIndex: 2, display: { xs: 'contents', md: 'block' } }}>
          <Box sx={{ order: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={1.3} sx={{ mb: 2.5 }}>
              <Box sx={{ width: 28, height: 3, bgcolor: 'info.main', borderRadius: 2 }} />
              <Typography variant="overline" color="success.main">Tropical golf near Krabi Airport</Typography>
            </Stack>
            <HeroHeadline />
            <Typography sx={{ fontSize: { xs: 16, md: 18 }, lineHeight: 1.75, color: 'text.secondary', maxWidth: 420, mx: { xs: 'auto', md: 0 }, mt: 3 }}>
              Nine tropical holes, FootGolf, Putt-Golf and private range bays. Bring your swing — or just your sense of fun.
            </Typography>
            <Stack direction="row" justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={1.8} flexWrap="wrap" useFlexGap sx={{ mt: 3.5 }}>
              <Button href="#play" variant="contained" endIcon={<ArrowOutward />}>See what to play</Button>
              <Button href="#prices" color="inherit">Check the prices</Button>
            </Stack>
          </Box>
          <Box sx={{ mt: { xs: 0, md: 4 }, maxWidth: 560, mx: { xs: 'auto', md: 0 }, width: '100%', order: 3 }}>
            <Typography variant="overline" sx={{ display: 'block', mb: 1, textAlign: { xs: 'center', md: 'left' } }}>Grab a tee time in a minute</Typography>
            <QuickBook />
          </Box>
        </Box>
        <Box sx={{ position: 'relative', ml: { xs: 1, md: 2 }, mb: { xs: 4, md: 3 }, order: 2 }}>
          <ScrollTilt amount={1.5}>
            <Box sx={{ border: '8px solid white', borderRadius: '140px 140px 30px 30px', height: { xs: 460, sm: 580, md: 680 }, overflow: 'hidden', transform: 'rotate(2deg)', boxShadow: '0 18px 55px rgba(23,60,44,.10)', bgcolor: 'primary.dark' }}>
              <ClubPhoto image={p.fairwaySign.src} alt="Freshly striped fairway with the Hula Hula sign, palms and blue sky" eager sizes="(max-width: 900px) 95vw, 55vw" sx={{ objectPosition: '40% center' }} />
            </Box>
          </ScrollTilt>
          <Sticker color="#e7f4cc" rotate={9} sx={{ position: 'absolute', top: { xs: 5, md: 22 }, right: { xs: -6, md: -18 }, width: { xs: 95, md: 122 }, height: { xs: 95, md: 122 }, fontSize: { xs: 15, md: 21 } }}>No skills?<br />No problem.</Sticker>
          <Box sx={{ position: 'absolute', width: { xs: 150, md: 202 }, height: { xs: 180, md: 232 }, left: { xs: -18, md: -46 }, bottom: { xs: -26, md: -33 } }}>
            <ScrollTilt amount={-4} sx={{ height: '100%' }}>
              <Polaroid image={p.footgolfGroup.src} alt="A happy FootGolf group with their footballs beside the hole 8 flag" caption="Kick it in!" rotate={-9} sizes="210px" objectPosition="center 40%" />
            </ScrollTilt>
          </Box>
        </Box>
      </Box>
    </Container>
    <Box sx={{ mt: { xs: 5, md: 7 }, py: 2.1, bgcolor: 'secondary.main', transform: 'rotate(-1deg)', width: '102%', ml: '-1%' }}>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={{ xs: 2, md: 5 }} sx={{ fontFamily: fonts.playful, fontSize: { xs: 18, md: 25 }, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {['Tee times', '✳', 'Fun times', '✳', 'Pineapple putts', '✳', 'Hula always'].map((text, i) => <Box key={i}>{text}</Box>)}
      </Stack>
    </Box>
  </Box>;
}
