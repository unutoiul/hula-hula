import DirectionsBusRounded from '@mui/icons-material/DirectionsBusRounded';
import East from '@mui/icons-material/East';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { photoAssets as p } from '../../data/photos';
import { WEEKDAYS, useProgramme } from '../../hooks/krabiDay';
import { brand, fonts } from '../../theme';
import { BookingSearchBar } from '../booking/BookingSearchBar';
import { ResortPhoto } from '../common/ResortPhoto';
import { HeroMetaCompact } from './HeroMetaCompact';

const SLIDES = [
  { image: p.poolFlamingo.src, alt: 'The pool at Royal Pineapple Hotel, with a pink flamingo float and the yellow hotel behind', position: '62% center' },
  { image: p.poolLoungers.src, alt: 'Pink loungers on the pool deck in front of the hotel’s yellow arches', position: 'center 60%' },
  { image: p.facadeShuttle.src, alt: 'The hotel’s arched entrance, with the Hula Hula Golf Club shuttle waiting outside', position: 'center 55%' },
  { image: p.floatingBreakfast.src, alt: 'A floating breakfast tray in the pool', position: 'center 62%' },
];
const SLIDE_MS = 6500;

// The front door: the hotel full-bleed (a slow crossfade between the pool,
// the arches and breakfast), the hotel's own welcome as the headline, today's
// trip from the 7-day programme, and the booking bar resting on the photo's
// bottom edge. Motion off: the first photo, still.
export function Hero() {
  const { reduced } = useMotionPreference();
  const [slide, setSlide] = useState(0);
  const { todayTrip, today } = useProgramme();
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [reduced, slide]);
  const current = SLIDES[reduced ? 0 : slide];

  return <Box component="section" aria-label="Welcome to Royal Pineapple Hotel" sx={{ position: 'relative', pt: { xs: '134px', md: '172px' } }}>
    <Box sx={{ position: 'relative', height: { xs: 'max(560px, 74svh)', md: 'clamp(620px, 84vh, 860px)' }, overflow: 'hidden', bgcolor: 'primary.dark' }}>
      <AnimatePresence initial={false}>
        <motion.div key={current.image} style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 1.4, ease: 'easeInOut' }}>
          <motion.div style={{ position: 'absolute', inset: 0 }} initial={{ scale: reduced ? 1 : 1.07 }} animate={{ scale: 1 }} transition={{ duration: reduced ? 0 : (SLIDE_MS + 1400) / 1000, ease: 'linear' }}>
            <ResortPhoto image={current.image} alt={current.alt} eager={current === SLIDES[0]} sizes="100vw" sx={{ objectPosition: current.position }} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      {/* Plum light from the left and the foot, so white type reads on any of the photos. */}
      <Box aria-hidden sx={{ position: 'absolute', inset: 0, background: { xs: 'linear-gradient(0deg, rgba(58,24,48,.86) 0%, rgba(58,24,48,.5) 42%, rgba(58,24,48,.1) 75%)', md: 'linear-gradient(90deg, rgba(58,24,48,.78) 0%, rgba(58,24,48,.42) 42%, rgba(58,24,48,0) 72%), linear-gradient(0deg, rgba(58,24,48,.55) 0%, rgba(58,24,48,0) 38%)' } }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pb: { xs: 9, md: 12 } }}>
        <Box sx={{ maxWidth: 720, color: 'common.white', textAlign: { xs: 'center', md: 'left' } }}>
          <HeroMetaCompact light />
          <Typography component="h1" sx={{ fontFamily: fonts.playful, fontWeight: 600, letterSpacing: '-0.035em', fontSize: { xs: 44, sm: 62, md: 82 }, lineHeight: { xs: 1.02, md: .98 }, mt: { xs: 1.5, md: 2 }, textShadow: '0 2px 24px rgba(58,24,48,.35)' }}>
            A welcome to wealth & good fortune.
          </Typography>
          <Typography sx={{ mt: { xs: 2, md: 2.5 }, fontSize: { xs: 16, md: 19 }, lineHeight: 1.65, maxWidth: 540, mx: { xs: 'auto', md: 0 }, color: 'rgba(255,255,255,.92)' }}>
            Stay local, explore more. A boutique hotel with a pool in the heart of Krabi Town, and a different Krabi trip every day of the week.
          </Typography>
          <Stack direction="row" justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: { xs: 2.5, md: 3.5 } }}>
            <Button href="#rooms" variant="contained" color="secondary" endIcon={<East />}>See the rooms</Button>
            <Button href="#programme" variant="outlined" sx={{ color: 'common.white', borderColor: 'rgba(255,255,255,.7)', '&:hover': { borderColor: 'common.white', bgcolor: 'rgba(255,255,255,.1)' } }}>This week in Krabi</Button>
          </Stack>
        </Box>

        {/* Today's trip from the 7-day programme, in Krabi time (large screens; phones see it under the booking bar). */}
        {todayTrip && <Box component="a" href="#programme" sx={{
          display: { xs: 'none', lg: 'flex' }, position: 'absolute', right: 48, bottom: 104, width: 340, gap: 1.75, alignItems: 'center', p: 1.25, pr: 2,
          borderRadius: '22px', textDecoration: 'none', color: 'text.primary', bgcolor: 'rgba(255,253,249,.94)', backdropFilter: 'blur(10px)', boxShadow: '0 18px 40px rgba(58,24,48,.28)',
          transition: 'transform .25s ease', '&:hover': { transform: 'translateY(-3px)' }, '&:hover .today-go': { transform: 'translateX(3px)' },
        }}>
          <Box sx={{ width: 84, height: 84, flexShrink: 0, borderRadius: '16px', overflow: 'hidden' }}><ResortPhoto image={todayTrip.images[0]} alt="" sizes="84px" /></Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontSize: 10.5, lineHeight: 1.4 }}>Today, {WEEKDAYS[today - 1]}</Typography>
            <Typography sx={{ fontFamily: fonts.playful, fontSize: 18, lineHeight: 1.15, mt: .25 }}>{todayTrip.title}</Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: .5, display: 'flex', alignItems: 'center', gap: .5 }}>
              {todayTrip.timeLabel}{todayTrip.freeBus && <><DirectionsBusRounded sx={{ fontSize: 14, color: 'success.main', ml: .75 }} />Free bus</>}
            </Typography>
          </Box>
          <East className="today-go" sx={{ fontSize: 18, color: 'primary.main', transition: 'transform .2s ease' }} />
        </Box>}

        {/* Which photo is showing; each dot shows its photo. */}
        {!reduced && <Stack direction="row" spacing={1} sx={{ position: 'absolute', right: { xs: '50%', md: 48 }, transform: { xs: 'translateX(50%)', md: 'none' }, bottom: { xs: 52, md: 64 }, display: { xs: 'flex', lg: todayTrip ? 'none' : 'flex' } }}>
          {SLIDES.map((s, i) => <Box key={s.image} component="button" type="button" aria-label={`Show photo ${i + 1} of ${SLIDES.length}`} aria-pressed={i === slide} onClick={() => setSlide(i)} sx={{
            width: i === slide ? 26 : 9, height: 9, p: 0, border: 0, borderRadius: 999, cursor: 'pointer', bgcolor: i === slide ? brand.pineapple : 'rgba(255,255,255,.6)', transition: 'width .3s ease, background-color .3s ease',
            position: 'relative', '&::before': { content: '""', position: 'absolute', inset: -10 },
          }} />)}
        </Stack>}
      </Container>
    </Box>

    {/* The booking bar rests on the photo's bottom edge. */}
    <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 3, mt: { xs: -5, sm: -4.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}><BookingSearchBar wide /></Box>
      {todayTrip && <Box component="a" href="#programme" sx={{ display: { xs: 'flex', lg: 'none' }, mt: 2, mx: 'auto', maxWidth: 520, alignItems: 'center', gap: 1.25, p: 1, pr: 1.75, borderRadius: '18px', textDecoration: 'none', color: 'text.primary', bgcolor: 'primary.light' }}>
        <Box sx={{ width: 56, height: 56, flexShrink: 0, borderRadius: '12px', overflow: 'hidden' }}><ResortPhoto image={todayTrip.images[0]} alt="" sizes="56px" /></Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontSize: 10, lineHeight: 1.4 }}>Today, {WEEKDAYS[today - 1]}</Typography>
          <Typography sx={{ fontFamily: fonts.playful, fontSize: 16, lineHeight: 1.2 }}>{todayTrip.title}</Typography>
        </Box>
        <East sx={{ fontSize: 18, color: 'primary.main' }} />
      </Box>}
    </Container>
  </Box>;
}
