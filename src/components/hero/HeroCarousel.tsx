import { Box, Stack } from '@mui/material';
import { useReducedMotion } from 'motion/react';
import type { HeroSlide } from '../../types';

const HERO_VIDEO_SRC = '/video/hero.mp4';

interface HeroCarouselProps {
  slides: HeroSlide[];
  index: number;
  onSelect: (i: number) => void;
}

// The background is a single looping video rather than a per-slide crossfade.
// The rotating headline/text (driven by `index`, in Hero.tsx) still cycles on
// its own timer independently of the video — the dots below double as a
// message picker rather than a slide picker.
export function HeroCarousel({ slides, index, onSelect }: HeroCarouselProps) {
  const reduceMotion = useReducedMotion();

  return <>
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: -2, overflow: 'hidden' }}>
      {reduceMotion ? (
        // Respect prefers-reduced-motion: a still frame instead of an autoplaying video.
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `url(${slides[0].image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      ) : (
        <Box component="video" autoPlay muted loop playsInline poster={slides[0].image} src={HERO_VIDEO_SRC} sx={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        }} />
      )}
    </Box>
    <Stack direction="row" spacing={1.1} sx={{ position: 'absolute', right: { xs: 24, md: 48 }, bottom: { xs: 24, md: 40 }, zIndex: 1 }}>
      {slides.map((slide, i) => <Box key={slide.image} component="button" type="button" aria-label={`Show message: ${slide.headline.join(' ')}`} aria-current={i === index} onClick={() => onSelect(i)} sx={{
        width: i === index ? 22 : 7, height: 7, p: 0, border: 'none', borderRadius: 4, cursor: 'pointer',
        bgcolor: i === index ? 'info.main' : 'rgba(255,255,255,.45)',
        transition: 'width .35s ease, background-color .35s ease',
        '&:hover': { bgcolor: i === index ? 'info.main' : 'rgba(255,255,255,.75)' },
      }} />)}
    </Stack>
  </>;
}
