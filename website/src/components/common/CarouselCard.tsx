import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';
import type { CarouselCardData } from '../../types';
import { ResortPhoto } from './ResortPhoto';

interface CarouselCardProps extends CarouselCardData {
  active: boolean; onClick: () => void; width?: number | string;
  ctaLabel: string; ctaHref: string; ctaIcon?: ReactNode; ctaIconPosition?: 'start' | 'end';
}

export function CarouselCard({ images, kicker, title, detail, ctaLabel, ctaHref, ctaIcon, ctaIconPosition = 'end' }: CarouselCardProps) {
  const [index, setIndex] = useState(0);
  return <Box component="article" sx={{ width: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white', color: 'text.primary', borderRadius: '22px', overflow: 'hidden', border: '1px solid rgba(23,60,44,.08)' }}>
    <Box sx={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden' }}>
      <ResortPhoto image={images[index]} alt={`${title}, photo ${index + 1}`} sizes="(max-width: 600px) 85vw, (max-width: 1200px) 45vw, 30vw" />
      {images.length > 1 && <>
        <IconButton aria-label={`Previous photo of ${title}`} onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)} sx={{ position: 'absolute', left: 12, top: '45%', bgcolor: '#fbfdf4', color: 'text.primary', width: 34, height: 34, '&:hover': { bgcolor: 'secondary.main' } }}><ChevronLeft fontSize="small" /></IconButton>
        <IconButton aria-label={`Next photo of ${title}`} onClick={() => setIndex((i) => (i + 1) % images.length)} sx={{ position: 'absolute', right: 12, top: '45%', bgcolor: '#fbfdf4', color: 'text.primary', width: 34, height: 34, '&:hover': { bgcolor: 'secondary.main' } }}><ChevronRight fontSize="small" /></IconButton>
        <Box sx={{ position: 'absolute', bottom: 12, right: 12, borderRadius: 99, bgcolor: '#fbfdf4', fontSize: 11, fontWeight: 700, py: .4, px: 1.2 }} aria-live="polite">{index + 1} / {images.length}</Box>
      </>}
    </Box>
    <Box sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Typography variant="overline" sx={{ color: 'success.main', fontSize: 10 }}>{kicker}</Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 26, md: 29 }, lineHeight: 1.1, mt: 1, mb: 1.5 }}>{title}</Typography>
      <Typography sx={{ fontSize: 14, lineHeight: 1.7, color: 'text.secondary', mb: 3 }}>{detail}</Typography>
      <Stack direction="row" sx={{ mt: 'auto' }}><Button href={ctaHref} variant="outlined" size="small" startIcon={ctaIconPosition === 'start' ? ctaIcon : undefined} endIcon={ctaIconPosition === 'end' ? ctaIcon : undefined} sx={{ py: .9, px: 2.1 }}>{ctaLabel}</Button></Stack>
    </Box>
  </Box>;
}
