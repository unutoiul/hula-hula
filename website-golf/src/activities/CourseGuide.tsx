import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import OpenInFullRounded from '@mui/icons-material/OpenInFullRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, Button, Container, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { courseMapImage, golfHole } from '../data/course';
import { SectionHeading } from '../components/common/SectionHeading';
import { linkClick } from '../router';

export function CourseGuide({ id }: { id: string }) {
  const [selected, setSelected] = useState(1);
  const [enlarged, setEnlarged] = useState(false);
  if (id !== 'golf' && id !== 'footgolf') return null;
  const football = id === 'footgolf';
  const hole = football ? null : golfHole(selected);
  const source = courseMapImage(id, selected);
  const label = hole ? `Golf · Hole ${selected} · Par ${hole.par}` : `FootGolf · Hole ${selected}`;
  return <Box component="section" id="course-layout" aria-labelledby="course-layout-heading" sx={{ py: { xs: 6, md: 8 }, mt: 7, bgcolor: '#f1f4e8' }}><Container maxWidth="lg">
    <SectionHeading eyebrow="Know the course" title={football ? '18 holes. Every kick counts.' : 'Explore your 18-hole round.'} description={football ? 'Browse all 18 FootGolf layouts, from your first kick to the last cup.' : 'The club’s nine physical holes are played twice for an 18-hole round. Select a hole to explore its layout and tee distances for that round.'} />
    <Stack direction="row" spacing={1} sx={{ mb: 3 }}><Button variant={football ? 'outlined' : 'contained'} href="/course#course-layout" onClick={linkClick('/course#course-layout')} size="small">Golf</Button><Button variant={football ? 'contained' : 'outlined'} href="/activities/footgolf#course-layout" onClick={linkClick('/activities/footgolf#course-layout')} size="small">FootGolf</Button></Stack>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: '280px minmax(0,1fr)' }, border: '1px solid', borderColor: 'divider', borderRadius: '24px', overflow: 'hidden', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 3, borderRight: { md: '1px solid' }, borderBottom: { xs: '1px solid', md: 0 }, borderColor: 'divider', bgcolor: '#fbfcf6' }}>
        <Typography variant="overline" color="success.dark">{football ? '18 distinct FootGolf holes' : '9 physical holes · 2 rounds'}</Typography>
        <Typography id="course-layout-heading" variant="h3" sx={{ fontSize: 26, mt: 1, mb: 2 }}>Choose your hole</Typography>
        {[0, 1].map(round => <Box key={round} sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1, color: 'text.secondary' }}>{football ? (round ? 'Holes 10–18' : 'Holes 1–9') : (round ? 'Second round · 10–18' : 'First round · 1–9')}</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(9,minmax(0,1fr))', md: 'repeat(3,minmax(0,1fr))' }, gap: .5 }}>{Array.from({ length: 9 }, (_, i) => i + 1 + round * 9).map(number => <Button key={number} variant={selected === number ? 'contained' : 'outlined'} size="small" aria-pressed={selected === number} aria-label={`Hole ${number}`} onClick={() => setSelected(number)} sx={{ minWidth: 0, px: .25, minHeight: 40, borderRadius: '10px', fontVariantNumeric: 'tabular-nums', borderColor: selected === number ? 'primary.main' : 'divider' }}>{number}</Button>)}</Box>
        </Box>)}
        {hole && <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5 }}>Hole {selected} · Round {hole.round}</Typography>
          {['Blue', 'White', 'Red'].map((tee, i) => <Stack key={tee} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ['#365a94', '#fff', '#cb4c43'][i], border: '1px solid #b5c4b4' }} /><Typography sx={{ fontSize: 13 }}>{tee} tee</Typography></Stack><Typography sx={{ fontSize: 14, fontWeight: 800 }}>{hole.yards[i]} yd</Typography></Stack>)}
        </Box>}
      </Box>
      <Box component="figure" sx={{ m: 0, minWidth: 0 }}>
        <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h3" sx={{ fontSize: 26 }}>{label}</Typography>
          {hole && <Typography sx={{ mt: .5, fontSize: 12, color: 'text.secondary' }}>Physical hole {hole.physical} · {hole.round === 1 ? 'first' : 'second'} round</Typography>}
        </Box>
        <Box component="img" key={source} src={source} alt={`${label} course layout`} sx={{ display: 'block', width: '100%', height: { xs: 460, md: 650 }, objectFit: 'contain', bgcolor: 'white', p: { xs: 1, md: 2 } }} />
        <Box component="figcaption" sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}><IconButton aria-label="Previous hole" disabled={selected === 1} onClick={() => setSelected(n => n - 1)}><ArrowBackRounded /></IconButton><Button onClick={() => setEnlarged(true)} startIcon={<OpenInFullRounded />} size="small">Enlarge map</Button><IconButton aria-label="Next hole" disabled={selected === 18} onClick={() => setSelected(n => n + 1)}><ArrowForwardRounded /></IconButton></Stack>
          <Typography sx={{ mt: 1, textAlign: 'center', fontSize: 11, color: 'text.secondary' }}>Illustrated course guide, not a surveyed map. {football ? 'Your caddie can help you find each start.' : 'Golf maps include tee distances for both rounds.'}</Typography>
        </Box>
      </Box>
    </Box>
    <Dialog open={enlarged} onClose={() => setEnlarged(false)} maxWidth="lg" fullWidth aria-labelledby="enlarged-map-title"><DialogTitle id="enlarged-map-title" sx={{ pr: 7 }}>{label}<IconButton onClick={() => setEnlarged(false)} aria-label="Close map" sx={{ position: 'absolute', right: 12, top: 12 }}><CloseRounded /></IconButton></DialogTitle><DialogContent><Box component="img" src={source} alt={label} sx={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }} /></DialogContent></Dialog>
  </Container></Box>;
}
