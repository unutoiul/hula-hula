import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import CloseRounded from '@mui/icons-material/CloseRounded';
import OpenInFull from '@mui/icons-material/OpenInFull';
import { Box, Button, Container, Dialog, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { galleryPhotos } from '../../data/content';
import { ResortPhoto } from '../common/ResortPhoto';

const categories = ['All the good times', ...new Set(galleryPhotos.map(photo => photo.category))];

export function GallerySection() {
  const [category, setCategory] = useState(categories[0]);
  const [selected, setSelected] = useState<number | null>(null);
  const visible = category === categories[0] ? galleryPhotos : galleryPhotos.filter(photo => photo.category === category);
  const photo = selected === null ? null : visible[selected];
  const move = (step: number) => setSelected(current => current === null ? null : (current + step + visible.length) % visible.length);
  return <Box component="section" id="gallery" aria-label="Resort photo gallery" sx={{ py: { xs: 8, md: 11 }, scrollMarginTop: 100 }}>
    <Container maxWidth="xl">
      <Box sx={{ textAlign: 'center' }}><Typography variant="h2" sx={{ fontSize: { xs: 42, md: 63 }, mt: 1.5, lineHeight: 1.04 }}>Good times.<br /><Box component="span" color="primary.main">In full colour.</Box></Typography><Typography sx={{ mt: 2, color: 'text.secondary' }}>A little peek at life, Hula Hula style.</Typography></Box>
      <Stack direction="row" justifyContent="center" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 4, mb: 4 }}>
        {categories.map(value => <Button key={value} onClick={() => setCategory(value)} aria-pressed={category === value} variant={category === value ? 'contained' : 'outlined'} color={category === value ? 'primary' : 'inherit'} sx={{ py: 1, px: 2.2, fontSize: 12, borderColor: 'divider' }}>{value}</Button>)}
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: { xs: 1.5, md: 2.5 } }}>
        {visible.map((item, index) => <Box key={item.image} component="button" type="button" onClick={() => setSelected(index)} aria-label={`View ${item.title.toLowerCase()}`} sx={{ p: 0, border: 0, bgcolor: 'primary.light', color: 'white', borderRadius: index % 3 === 1 ? '70px 20px 20px 20px' : '20px', overflow: 'hidden', position: 'relative', aspectRatio: '1 / 1.08', cursor: 'pointer', '& img': { transition: 'transform .4s ease' }, '&:hover img': { transform: 'scale(1.05)' }, '&:hover .photo-expand': { bgcolor: 'secondary.main', color: 'text.primary' } }}>
          <ResortPhoto image={item.image} alt={item.title} sizes="(max-width: 900px) 45vw, 23vw" />
          <Box className="photo-expand" sx={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(18,78,57,.6)' }}><OpenInFull sx={{ fontSize: 15 }} /></Box>
          <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, px: 2, pt: 5, pb: 2, textAlign: 'left', background: 'linear-gradient(transparent,rgba(18,78,57,.8))', fontSize: { xs: 12, md: 14 }, fontWeight: 600 }}>{item.title}</Box>
        </Box>)}
      </Box>
      <Dialog open={selected !== null} onClose={() => setSelected(null)} maxWidth="lg" fullWidth aria-labelledby="gallery-photo-title" onKeyDown={event => { if (event.key === 'ArrowRight') move(1); if (event.key === 'ArrowLeft') move(-1); }} slotProps={{ paper: { sx: { bgcolor: 'background.default', borderRadius: 3, overflow: 'hidden' } } }}>
        {photo && <><Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}><Box><Typography id="gallery-photo-title" variant="h3" sx={{ fontSize: { xs: 20, md: 26 } }}>{photo.title}</Typography><Typography sx={{ mt: .5, fontSize: 12, color: 'text.secondary' }}>{(selected ?? 0) + 1} / {visible.length} · {photo.category}</Typography></Box><IconButton onClick={() => setSelected(null)} aria-label="Close photo"><CloseRounded /></IconButton></Stack><Box sx={{ height: '65vh', bgcolor: '#e9efde' }}><ResortPhoto image={photo.image} alt={photo.title} eager sizes="90vw" sx={{ objectFit: 'contain' }} /></Box><Stack direction="row" justifyContent="center" spacing={3} sx={{ p: 1.5 }}><IconButton aria-label="Previous gallery photo" onClick={() => move(-1)}><ChevronLeft /></IconButton><IconButton aria-label="Next gallery photo" onClick={() => move(1)}><ChevronRight /></IconButton></Stack></>}
      </Dialog>
    </Container>
  </Box>;
}
