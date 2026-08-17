import { Box, Container } from '@mui/material';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import { heroSlides } from '../../data/content';
import { useHeroIndex } from '../../hooks/useHeroIndex';
import { scrim } from '../../theme';
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
    // Vertical scrim (top + bottom) keeps header text and the caption/dots legible across
    // every slide; the horizontal scrim keeps the headline readable on the left.
    '&::after': {
      content: '""', position: 'absolute', inset: 0, zIndex: -1,
      background: `linear-gradient(180deg, ${scrim(.55)} 0%, ${scrim(.1)} 26%, ${scrim(0)} 55%, ${scrim(.28)} 100%), linear-gradient(90deg, ${scrim(.74)}, ${scrim(.08)} 68%)`,
    },
  }}>
    <HeroCarousel slides={heroSlides} index={heroIndex} onSelect={setHeroIndex} />
    <Container maxWidth="xl" sx={{ minHeight: { xs: 570, md: 660 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: { xs: 9, md: 11 } }}>
      <Box sx={{ maxWidth: 720, pt: { xs: 3, md: 8 } }}>
        <HeroMetaCompact />
        <AnimatePresence mode="wait">
          <MotionTypography key={heroSlide.headline.join('|')} variant="h1"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: 'easeOut' }}
            sx={{ fontSize: 'clamp(2.75rem, 2rem + 5vw, 8.25rem)', lineHeight: .9, mt: { xs: 2, md: 3 }, mb: 4 }}
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
