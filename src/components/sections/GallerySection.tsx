import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import CloseRounded from '@mui/icons-material/CloseRounded';
import OpenInFull from '@mui/icons-material/OpenInFull';
import { Box, Button, Container, Dialog, IconButton, Stack, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { galleryPhotos } from '../../data/content';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal } from '../common/ScrollMotion';

const categories = ['All the good times', ...new Set(galleryPhotos.map(photo => photo.category))];

// Light round controls that read clearly on the viewer's dark backdrop — same
// look as the photo arrows on the room cards.
const viewerButtonSx = { width: 48, height: 48, bgcolor: '#fbfdf4', color: 'text.primary', '&:hover': { bgcolor: 'secondary.main' } } as const;

export function GallerySection() {
  const [category, setCategory] = useState(categories[0]);
  const [selected, setSelected] = useState<number | null>(null);
  const visible = category === categories[0] ? galleryPhotos : galleryPhotos.filter(photo => photo.category === category);
  const photo = selected === null ? null : visible[selected];
  const move = (step: number) => setSelected(current => current === null ? null : (current + step + visible.length) % visible.length);
  const close = () => setSelected(null);
  // Horizontal swipe on touch screens pages through the photos.
  const touchStartX = useRef<number | null>(null);
  return <Box component="section" id="gallery" aria-label="Resort photo gallery" sx={{ py: { xs: 8, md: 11 }, scrollMarginTop: 100 }}>
    <Container maxWidth="xl">
      <Reveal sx={{ textAlign: 'center', position: 'relative' }}><Typography variant="h2" sx={{ fontSize: { xs: 42, md: 63 }, mt: 1.5, lineHeight: 1.04 }}>Good times.<br /><Box component="span" color="primary.main">In full colour.</Box></Typography><Typography sx={{ mt: 2, color: 'text.secondary' }}>A little peek at life, Hula Hula style.</Typography></Reveal>
      <Stack direction="row" justifyContent="center" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 4, mb: 4 }}>
        {categories.map(value => <Button key={value} onClick={() => setCategory(value)} aria-pressed={category === value} size="small" variant={category === value ? 'contained' : 'outlined'} color={category === value ? 'primary' : 'inherit'} sx={{ borderColor: 'divider' }}>{value}</Button>)}
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: { xs: 1.5, md: 2.5 } }}>
        {visible.map((item, index) => <Box key={item.image} component="button" type="button" onClick={() => setSelected(index)} aria-label={`View ${item.title.toLowerCase()}`} sx={{ display: 'block', width: '100%', p: 0, border: 0, bgcolor: 'primary.light', color: 'white', borderRadius: index % 3 === 1 ? '70px 20px 20px 20px' : '20px', overflow: 'hidden', position: 'relative', aspectRatio: '1 / 1.08', cursor: 'pointer', '& img': { transition: 'transform .4s ease' }, '&:hover img': { transform: 'scale(1.05)' }, '&:hover .photo-expand': { bgcolor: 'secondary.main', color: 'text.primary' } }}>
          <ResortPhoto image={item.image} alt={item.title} sizes="(max-width: 900px) 45vw, 23vw" />
          <Box className="photo-expand" sx={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(18,78,57,.6)' }}><OpenInFull sx={{ fontSize: 15 }} /></Box>
          <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, px: 2, pt: 5, pb: 2, textAlign: 'left', background: 'linear-gradient(transparent,rgba(18,78,57,.8))', fontSize: { xs: 12, md: 14 }, fontWeight: 600 }}>{item.title}</Box>
        </Box>)}
      </Box>
      {/* A full-screen photo viewer: the photo at its natural shape on a deep-green
          backdrop (no letterbox bands), category and count up top, title below.
          Arrows flank the photo on desktop and sit beside the title on phones,
          where they'd otherwise cover it. Arrow keys and swiping also page. */}
      <Dialog open={selected !== null} onClose={close} fullScreen aria-labelledby="gallery-photo-title"
        onKeyDown={event => { if (event.key === 'ArrowRight') move(1); if (event.key === 'ArrowLeft') move(-1); }}
        slotProps={{ paper: { sx: { bgcolor: '#10291f', color: 'common.white', backgroundImage: 'none' } } }}>
        {photo && <Box
          onTouchStart={event => { touchStartX.current = event.touches[0].clientX; }}
          onTouchEnd={event => {
            if (touchStartX.current === null) return;
            const dx = event.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
          }}
          sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', gap: { xs: 2, md: 2.5 }, p: { xs: 2, md: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,.75)' }}>{photo.category} · {(selected ?? 0) + 1} / {visible.length}</Typography>
            <IconButton onClick={close} aria-label="Close photo" sx={viewerButtonSx}><CloseRounded /></IconButton>
          </Stack>
          <Box sx={{ position: 'relative', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { md: 10 } }}>
            <ResortPhoto key={photo.image} image={photo.image} alt={photo.title} eager sizes="(max-width: 900px) 100vw, 85vw"
              sx={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '20px' }} />
            <IconButton aria-label="Previous gallery photo" onClick={() => move(-1)} sx={{ ...viewerButtonSx, display: { xs: 'none', md: 'inline-flex' }, position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}><ChevronLeft /></IconButton>
            <IconButton aria-label="Next gallery photo" onClick={() => move(1)} sx={{ ...viewerButtonSx, display: { xs: 'none', md: 'inline-flex' }, position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}><ChevronRight /></IconButton>
          </Box>
          <Stack direction="row" alignItems="center" justifyContent={{ xs: 'space-between', md: 'center' }} spacing={2}>
            <Typography id="gallery-photo-title" variant="h3" sx={{ fontSize: { xs: 22, md: 28 }, lineHeight: 1.15, color: 'common.white' }}>{photo.title}</Typography>
            <Stack direction="row" spacing={1} sx={{ display: { md: 'none' }, flexShrink: 0 }}>
              <IconButton aria-label="Previous gallery photo" onClick={() => move(-1)} sx={viewerButtonSx}><ChevronLeft /></IconButton>
              <IconButton aria-label="Next gallery photo" onClick={() => move(1)} sx={viewerButtonSx}><ChevronRight /></IconButton>
            </Stack>
          </Stack>
        </Box>}
      </Dialog>
    </Container>
  </Box>;
}
