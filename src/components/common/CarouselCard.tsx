import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import type { CarouselCardData } from '../../types';
import { MetaLabel } from './MetaLabel';
import { MotionBox } from './motionPrimitives';
import { Scene } from './Scene';

interface CarouselCardProps extends CarouselCardData {
  active: boolean;
  onClick: () => void;
  /** Fills its parent slot — the parent (DragCarousel) owns the actual responsive sizing. */
  width?: number | string;
  ctaLabel: string;
  ctaHref: string;
  ctaIcon?: ReactNode;
  ctaIconPosition?: 'start' | 'end';
}

// One card in a DragCarousel row. Click it (or drag it into the middle) and
// it grows and brightens in place — no layout/width animation, just scale +
// opacity, so it stays smooth — rises above its neighbors, and reveals a CTA.
// Everything else settles back.
//
// If the item carries more than one photo, small arrows and dots appear over
// it once active, so you can flip through its other angles without leaving
// it. With exactly one photo there's nothing to navigate to, so neither
// renders — this is the same gallery behavior whether it's a room with four
// angles or an activity with just the one shot.
export function CarouselCard({ active, onClick, images, kicker, title, detail, width = '100%', ctaLabel, ctaHref, ctaIcon, ctaIconPosition = 'end' }: CarouselCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const hasGallery = images.length > 1;

  const showPhoto = (i: number, e: MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((i + images.length) % images.length);
  };

  return <MotionBox
    onClick={onClick}
    animate={{ scale: active ? 1.1 : 0.92, opacity: active ? 1 : 0.62 }}
    whileHover={active ? undefined : { opacity: 0.85 }}
    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
    sx={{ flexShrink: 0, width, zIndex: active ? 2 : 1, cursor: 'pointer' }}
  >
    <Scene image={images[photoIndex]} sx={{ width: '100%' }}>
      {active && hasGallery && <>
        <IconButton aria-label="Previous photo" size="small" onClick={(e) => showPhoto(photoIndex - 1, e)} sx={{
          position: 'absolute', left: 8, top: '50%', mt: '-18px', bgcolor: 'rgba(0,0,0,.35)', color: '#fff',
          '&:hover': { bgcolor: 'rgba(0,0,0,.55)' },
        }}><ChevronLeft /></IconButton>
        <IconButton aria-label="Next photo" size="small" onClick={(e) => showPhoto(photoIndex + 1, e)} sx={{
          position: 'absolute', right: 8, top: '50%', mt: '-18px', bgcolor: 'rgba(0,0,0,.35)', color: '#fff',
          '&:hover': { bgcolor: 'rgba(0,0,0,.55)' },
        }}><ChevronRight /></IconButton>
        <Stack direction="row" spacing={.6} sx={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)' }}>
          {images.map((image, i) => <Box key={image} sx={{
            width: i === photoIndex ? 14 : 5, height: 5, borderRadius: 4,
            bgcolor: i === photoIndex ? 'info.main' : 'rgba(255,255,255,.5)',
            transition: 'width .25s ease, background-color .25s ease',
          }} />)}
        </Stack>
      </>}
      <Box sx={{ p: { xs: 2.25, md: 3 } }}>
        <MetaLabel>{kicker}</MetaLabel>
        <Typography variant="h3" sx={{ maxWidth: '80%', fontSize: { xs: 24, md: 28 }, lineHeight: .95, mt: 1.2, mb: .8 }}>{title}</Typography>
        <Typography sx={{ maxWidth: '70%', fontSize: 12.5, lineHeight: 1.5, color: 'rgba(255,255,255,.78)' }}>{detail}</Typography>
        <AnimatePresence>
          {active && <MotionBox initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: .3 }} sx={{ mt: 2 }}>
            <Button href={ctaHref} onClick={(e) => e.stopPropagation()} variant="outlined" color="inherit" size="small"
              startIcon={ctaIconPosition === 'start' ? ctaIcon : undefined} endIcon={ctaIconPosition === 'end' ? ctaIcon : undefined}
              sx={{
                borderColor: 'rgba(255,255,255,.5)', px: 1.8, py: .6, fontSize: 10.5,
                '&:hover': { borderColor: 'info.main', bgcolor: 'info.main', color: 'info.contrastText' },
              }}>{ctaLabel}</Button>
          </MotionBox>}
        </AnimatePresence>
      </Box>
    </Scene>
  </MotionBox>;
}
