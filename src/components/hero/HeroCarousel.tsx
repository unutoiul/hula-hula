import { Box, Button, Stack, Typography } from '@mui/material';
import type { HeroSlide } from '../../types';
import { ResortPhoto } from '../common/ResortPhoto';

export function HeroCarousel({ slides, index, onSelect }: { slides: HeroSlide[]; index: number; onSelect: (i: number) => void }) {
  const slide = slides[index];
  return <Box sx={{ position: 'relative', height: '100%' }}>
    <ResortPhoto image={slide.image} alt={index === 0 ? 'Hula Hula reception counter and lounge with tropical plants' : slide.headline.join(' ')} eager sizes="(max-width: 900px) 90vw, 45vw" sx={{ objectPosition: index === 0 ? 'center 45%' : index === 2 ? 'center' : 'center 55%' }} />
    <Box sx={{ position: 'absolute', inset: '45% 0 0', background: 'linear-gradient(transparent, rgba(18,78,57,.8))', pointerEvents: 'none' }} />
    <Box sx={{ position: 'absolute', bottom: 22, left: { xs: 20, md: 30 }, right: 20, pl: { xs: 16, md: 19 }, color: 'white' }}>
      <Typography variant="h3" sx={{ fontSize: { xs: 23, md: 28 }, lineHeight: 1.1, mb: 1.5 }}>{slide.headline.join(' ')}</Typography>
      <Stack direction="row" spacing={.6} flexWrap="wrap" useFlexGap>
        {['Welcome', 'Breakfast', 'Play time'].map((label, i) => <Button key={label} onClick={() => onSelect(i)} aria-pressed={i === index} aria-label={`Show ${label.toLowerCase()} photo`} size="small" sx={{ fontSize: 10, minWidth: 0, py: .6, px: 1.1, color: i === index ? 'text.primary' : 'white', bgcolor: i === index ? 'secondary.main' : 'rgba(255,255,255,.16)', '&:hover': { bgcolor: 'secondary.main', color: 'text.primary' } }}>{label}</Button>)}
      </Stack>
    </Box>
  </Box>;
}
