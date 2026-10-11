import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { heroSlides } from '../../data/content';
import { photoAssets } from '../../data/photos';
import { fonts } from '../../theme';
import { BookingSearchBar } from '../booking/BookingSearchBar';
import { ResortPhoto } from '../common/ResortPhoto';
import { Sticker, SunDoodle } from '../common/VacationDecor';
import { HeroCarousel } from './HeroCarousel';
import { HeroMetaCompact } from './HeroMetaCompact';

export function Hero() {
  const [index, setIndex] = useState(0);
  return <Box component="section" data-sc-act="flow" aria-label="Welcome to Hula Hula Resort" sx={{ pt: { xs: 14, md: 17 }, pb: { xs: 6, md: 9 }, overflow: 'hidden', position: 'relative' }}>
    <Container maxWidth="xl">
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.03fr 1fr' }, alignItems: 'center', gap: { xs: 5, md: 6 }, minHeight: { md: 620 } }}>
        <Box sx={{ position: 'relative', zIndex: 2, display: { xs: 'contents', md: 'block' } }}>
          <Box sx={{ order: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.3} sx={{ mb: 2.5 }}>
            <Box sx={{ width: 28, height: 3, bgcolor: 'info.main', borderRadius: 2 }} />
            <Typography variant="overline" color="success.main">Your happy place in Ao Nang</Typography>
          </Stack>
          <Typography variant="h1" sx={{ fontSize: { xs: 'clamp(3.15rem, 12.5vw, 4.8rem)', md: 'clamp(4.8rem, 6.1vw, 6.6rem)' }, lineHeight: 1.02, color: 'primary.main', maxWidth: 680 }}>
            A little<br />tropical.<br />
            <Box component="span" sx={{ position: 'relative', display: 'inline-block', color: 'text.primary', zIndex: 0, '&::after': { content: '""', position: 'absolute', left: -5, right: -8, bottom: 4, height: '28%', bgcolor: 'secondary.main', borderRadius: '45% 25% 40% 30%', transform: 'rotate(-2deg)', zIndex: -1 } }}>A lot of fun.</Box>
          </Typography>
          <Typography sx={{ fontSize: { xs: 16, md: 18 }, lineHeight: 1.75, color: 'text.secondary', maxWidth: 390, mt: 3 }}>
            Pool dips. Pineapple sips. Good times with your favourite people. This is Hula Hula, Krabi.
          </Typography>
          <Stack direction="row" spacing={1.8} flexWrap="wrap" useFlexGap sx={{ mt: 3.5 }}>
            <Button href="#hotel" variant="contained" endIcon={<ArrowOutward />}>Find your happy place</Button>
            <Button href="#floating-breakfast" color="inherit" sx={{ px: 1, borderBottom: '2px solid', borderColor: 'info.main', borderRadius: 0 }}>Make breakfast float</Button>
          </Stack>
          </Box>
          <Box sx={{ mt: { xs: 0, md: 4 }, maxWidth: 530, order: 3 }}>
            <Typography variant="overline" sx={{ display: 'block', mb: 1 }}>Good times start with a date</Typography>
            <BookingSearchBar />
            <Box sx={{ mt: 2 }}><HeroMetaCompact /></Box>
          </Box>
        </Box>
        <Box data-sc-parallax=".6" sx={{ position: 'relative', ml: { xs: 2, md: 2 }, mb: { xs: 4, md: 3 }, order: 2 }}>
          <Box sx={{ border: '8px solid white', borderRadius: '140px 140px 30px 30px', height: { xs: 410, sm: 520, md: 580 }, overflow: 'hidden', transform: 'rotate(2deg)', boxShadow: '0 18px 55px rgba(23,60,44,.10)', bgcolor: 'primary.light' }}>
            <HeroCarousel slides={heroSlides} index={index} onSelect={setIndex} />
          </Box>
          <Sticker color="#e7f4cc" rotate={9} sx={{ position: 'absolute', top: { xs: 5, md: 22 }, right: { xs: -6, md: -18 }, width: { xs: 95, md: 122 }, height: { xs: 95, md: 122 }, fontSize: { xs: 20, md: 23 } }}>Less worry.<br />More Hula.</Sticker>
          <Box data-sc-parallax="1.1" sx={{ position: 'absolute', top: -35, left: -28, display: { xs: 'none', sm: 'block' } }}><SunDoodle size={92} color="#50830d" sx={{ transform: 'rotate(-10deg)' }} /></Box>
          <Box data-sc-parallax="-1.2" sx={{ position: 'absolute', width: { xs: 150, md: 202 }, height: { xs: 180, md: 232 }, left: { xs: -18, md: -46 }, bottom: { xs: -26, md: -33 } }}>
          <Box sx={{ height: '100%', bgcolor: 'white', p: 1, pb: 4.5, transform: 'rotate(-9deg)', boxShadow: '0 12px 30px rgba(23,60,44,.16)', borderRadius: 1 }}>
            <ResortPhoto image={photoAssets.breakfastPortrait.src} alt="Guest enjoying a floating breakfast in a Hula Hula private pool" sizes="210px" sx={{ objectPosition: 'center 60%' }} />
            <Typography sx={{ textAlign: 'center', fontFamily: fonts.playful, fontSize: { xs: 15, md: 19 }, mt: .8 }}>Make a splash!</Typography>
          </Box>
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
