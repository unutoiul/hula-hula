import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { COURSE_FACTS } from '../../data/content';
import { photoAssets as p } from '../../data/photos';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { linkClick } from '../../router';
import { fonts } from '../../theme';
import { ClubPhoto } from '../common/ClubPhoto';
import { Reveal, ScrollTilt } from '../common/ScrollMotion';
import { Sticker, SunDoodle } from '../common/VacationDecor';

// The course itself: the facts from the club's brochure (9 holes, par 36,
// 3,011 yards, 8.5–9 ft greens) and what every round includes.
export function CourseSection() {
  return <Box id="course" component="section" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET, pb: SECTION_Y }}>
    <Container maxWidth="xl">
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: { xs: 5, md: 9 }, alignItems: 'center', py: { xs: 5, md: 9 } }}>
        <Reveal sx={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.3fr .8fr', gap: 2, alignItems: 'center' }}>
          <ScrollTilt amount={2}><Box sx={{ height: { xs: 310, md: 420 }, borderRadius: '24px 24px 90px 24px', overflow: 'hidden', border: '7px solid #fffef8', boxShadow: '0 14px 32px rgba(23,60,44,.10)' }}><ClubPhoto image={p.puttingGreen.src} alt="A green with a red pin flag beside the water hazard, palms behind" /></Box></ScrollTilt>
          <ScrollTilt amount={-4}><Box sx={{ height: { xs: 260, md: 330 }, overflow: 'hidden', border: '6px solid white', borderRadius: 3, transform: 'rotate(5deg)' }}><ClubPhoto image={p.clubhouse.src} alt="The Hula Hula Golf Club clubhouse and sign across the lawn" sizes="25vw" sx={{ objectPosition: '45% center' }} /></Box></ScrollTilt>
          <Sticker sx={{ position: 'absolute', bottom: -30, left: '45%' }}>Hello,<br />fairway!</Sticker>
        </Reveal>
        <Reveal delay={0.12} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="overline" color="success.main">The course</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: 42, md: 59 }, lineHeight: 1.06, mt: 1.5 }}>Nine holes.<br /><Box component="span" color="primary.main">Not one dull moment.</Box></Typography>
          <Typography sx={{ mt: 3, color: 'text.secondary', fontSize: 16, lineHeight: 1.8, maxWidth: 470, mx: { xs: 'auto', md: 0 } }}>
            A par 36 course for every level that still asks for strategy: narrow fairways, water hazards and greens running 8.5 to 9 feet. From the clubhouse, it’s fairways all the way to Phanom Bencha mountain.
          </Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 3 }}>
            {['Green fee', 'Caddie', 'Golf cart'].map((item) => <Chip key={item} label={`${item} included`} sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 700 }} />)}
          </Stack>
          <Stack direction="row" spacing={3} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 3 }}>
            <Button href="/book?activity=golf" onClick={linkClick('/book?activity=golf')} color="inherit" endIcon={<ArrowOutward />}>Book a round</Button>
            <SunDoodle size={54} color="#50830d" />
          </Stack>
        </Reveal>
      </Box>

      {/* The scorecard: four big numbers on a stitched card. */}
      <Reveal>
        <Box component="dl" sx={{ m: 0, mt: { xs: 4, md: 2 }, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '28px', p: { xs: 1, md: 1.5 }, boxShadow: '0 12px 32px rgba(23,60,44,.06)' }}>
          {COURSE_FACTS.map((fact, i) => <Box key={fact.label} sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', py: { xs: 2.5, md: 3.5 }, px: 1,
            borderRight: { md: i < COURSE_FACTS.length - 1 ? '1px dashed #d6e1ce' : 'none' }, borderBottom: { xs: i < 2 ? '1px dashed #d6e1ce' : 'none', md: 'none' },
            borderLeft: { xs: i % 2 ? '1px dashed #d6e1ce' : 'none', md: 'none' },
          }}>
            {/* The label comes first for screen readers, the number first on screen. */}
            <Box component="dt" sx={{ order: 2, mt: 1, fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'text.secondary' }}>{fact.label}</Box>
            <Box component="dd" sx={{ order: 1, m: 0, fontFamily: fonts.playful, fontWeight: 500, fontSize: { xs: 40, md: 58 }, lineHeight: 1, color: 'primary.main' }}>{fact.value}</Box>
          </Box>)}
        </Box>
      </Reveal>
    </Container>
  </Box>;
}
