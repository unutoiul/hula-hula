import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { linkClick } from '../../router';
import { useMemo } from 'react';
import { thingsToDo } from '../../activities/things';
import { useSite } from '../../context/SiteDataContext';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { ThingCard } from '../activities/ThingCard';
import { Reveal } from '../common/ScrollMotion';
import { SunDoodle } from '../common/VacationDecor';

// Everything there is to do, one card each, every card opening its own page:
// the activities switched on in /admin (in their order), then the café and
// the pool villa.
export function ActivitiesSection() {
  const site = useSite();
  const things = useMemo(() => thingsToDo(site), [site]);
  return <Box id="play" component="section" aria-labelledby="play-heading" sx={{ position: 'relative', bgcolor: 'primary.main', color: 'white', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl" sx={{ py: { xs: 6, md: 9 }, position: 'relative' }}>
      <SunDoodle size={100} color="#f9f70c" sx={{ position: 'absolute', right: { md: 120, lg: 460 }, top: 20, display: { xs: 'none', md: 'block' }, transform: 'rotate(12deg)' }} />
      <Reveal><Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-end' }} justifyContent="space-between" gap={3} sx={{ mb: { xs: 4, md: 6 }, textAlign: { xs: 'center', md: 'left' } }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'secondary.main' }}>{things.length} ways to spend the day</Typography>
          <Typography id="play-heading" variant="h2" sx={{ fontSize: { xs: 43, md: 64 }, lineHeight: 1.03, mt: 1.5 }}>Swing a little.<br /><Box component="span" color="secondary.main">Laugh a lot.</Box></Typography>
        </Box>
        <Typography sx={{ maxWidth: 380, color: 'rgba(255,255,255,.86)', lineHeight: 1.8 }}>Golf, games for every level, a café with a view and a pool villa to stay in. Pick one to see what it’s like, what it costs and how to book.</Typography>
      </Stack></Reveal>
      <Reveal>
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 1.5, md: 3 } }}>
          {things.slice(0, 6).map((thing) => <Box component="li" key={thing.id}><ThingCard thing={thing} /></Box>)}
        </Box>
      </Reveal>
      <Stack direction="row" justifyContent="center" flexWrap="wrap" useFlexGap gap={2} sx={{ mt: 4 }}><Button variant="contained" color="secondary" href="/activities" onClick={linkClick('/activities')}>All activities →</Button><Button variant="outlined" href="/prices" onClick={linkClick('/prices')} sx={{ color: 'white', borderColor: 'rgba(255,255,255,.5)' }}>Prices & packages</Button></Stack>
    </Container>
  </Box>;
}
