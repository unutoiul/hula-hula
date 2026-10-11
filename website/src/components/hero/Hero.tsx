import { Box, Container } from '@mui/material';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import { heroSlides } from '../../data/content';
import { useHeroIndex } from '../../hooks/useHeroIndex';
import { BookingSearchBar } from '../booking/BookingSearchBar';
import { MotionTypography } from '../common/motionPrimitives';
import { HeroCarousel } from './HeroCarousel';
import { HeroMetaCompact } from './HeroMetaCompact';

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [heroIndex, setHeroIndex] = useHeroIndex(heroSlides.length);
  const heroSlide = heroSlides[heroIndex];

  return <Box component="section" sx={{
    minHeight: { xs: 680, md: 760 }, position: 'relative', overflow: 'hidden', color: 'common.white', isolation: 'isolate',
  }}>
    <HeroCarousel slides={heroSlides} index={heroIndex} onSelect={setHeroIndex} />
    <Container maxWidth="xl" sx={{ minHeight: { xs: 570, md: 660 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: { xs: 9, md: 11 } }}>
      <Box sx={{ maxWidth: 720, pt: { xs: 3, md: 8 } }}>
        <HeroMetaCompact />
        <AnimatePresence mode="wait">
          <MotionTypography key={heroSlide.headline.join('|')} variant="h1"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: 'easeOut' }}
            sx={{ fontSize: 'clamp(2.25rem, 1.75rem + 4vw, 6.5rem)', lineHeight: .9, mt: { xs: 2, md: 3 }, mb: 4 }}
          >{heroSlide.headline[0]}<br /><Box component="em">{heroSlide.headline[1]}</Box></MotionTypography>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <MotionTypography key={heroSlide.text}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: 'easeOut', delay: reduceMotion ? 0 : 0.08 }}
            sx={{ maxWidth: 400, color: 'rgba(255,255,255,.87)', lineHeight: 1.55 }}
          >{heroSlide.text}</MotionTypography>
        </AnimatePresence>
        <Box sx={{ mt: 5 }}><BookingSearchBar /></Box>
      </Box>
    </Container>
  </Box>;
}
