import East from '@mui/icons-material/East';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import RestaurantMenuRounded from '@mui/icons-material/RestaurantMenuRounded';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Container, Stack, Typography } from '@mui/material';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { bothSides, fitQuestions, localPicks, nearby, travelTimes } from '../../data/content';
import { photoAssets as p } from '../../data/photos';
import { SECTION_HEADING, SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { sectionLink, useLocation } from '../../router';
import { brand, fonts } from '../../theme';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal } from '../common/ScrollMotion';
import { PostcardFrame } from '../common/PostcardFrame';

/** How far everything is, as a road out of town: the hotel at one end, the stops along it. */
function TravelRoute() {
  const { reduced } = useMotionPreference();
  return <Box sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '28px', bgcolor: 'primary.light' }}>
    <Typography variant="h3" sx={{ fontSize: { xs: 24, md: 30 } }}>From our front door</Typography>
    <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, mt: 2.5, position: 'relative' }}>
      {/* The road: drawn in as it comes into view. */}
      <Box aria-hidden sx={{ position: 'absolute', left: 21, top: 18, bottom: 18, width: 4 }}>
        <svg viewBox="0 0 4 100" preserveAspectRatio="none" width="4" height="100%"><motion.line x1="2" y1="0" x2="2" y2="100" stroke={brand.royal} strokeWidth="4" strokeDasharray="0" strokeLinecap="round" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: reduced ? 1 : 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: .6 }} transition={{ duration: 1.6, ease: 'easeInOut' }} /></svg>
      </Box>
      <Stack component="li" direction="row" spacing={2} alignItems="center" sx={{ position: 'relative', pb: 1.5 }}>
        <Box sx={{ width: 46, height: 46, borderRadius: '50%', bgcolor: brand.royal, border: '4px solid #fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Box component="img" src="/logo/royal-pineapple-white.svg" alt="" sx={{ width: 26, aspectRatio: '863 / 733', objectFit: 'contain' }} />
        </Box>
        <Typography sx={{ fontWeight: 800 }}>Royal Pineapple, Maharaj Road</Typography>
      </Stack>
      {travelTimes.map((stop) => <Stack component="li" key={stop.place} direction="row" spacing={2} alignItems="center" sx={{ position: 'relative', py: 1 }}>
        <Box sx={{ width: 46, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: brand.pineapple, border: '3px solid #fff', boxShadow: '0 0 0 2px rgba(201,47,107,.3)' }} /></Box>
        <Typography sx={{ flex: 1, fontSize: 15 }}>{stop.place}</Typography>
        <Typography sx={{ fontFamily: fonts.playful, fontSize: 20, color: 'primary.main', whiteSpace: 'nowrap' }}>{stop.minutes} min</Typography>
      </Stack>)}
    </Box>
    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 1.5 }}>By car. The hotel shuttle goes to several of these; ask the front desk for today’s times.</Typography>
  </Box>;
}

// Krabi Town from the hotel: both sides of Krabi, how far things are, where the team eats, what's
// nearby, and honest answers on whether a town base is right for you.
export function ExploreSection() {
  const { pathname } = useLocation();
  const [meal, setMeal] = useState(0);
  const pick = localPicks[meal];
  return <Box id="explore" component="section" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET, py: SECTION_Y }}>
    <Container maxWidth="xl">
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.1fr) minmax(0,1fr)' }, gap: { xs: 5, md: 8 }, alignItems: 'center' }}>
        <Reveal sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="overline" color="primary.main">Your launchpad for Krabi</Typography>
          <Typography variant="h2" sx={{ fontSize: SECTION_HEADING, lineHeight: 1.08, mt: 1.5 }}>Out you go.<br />Krabi is waiting.</Typography>
          <Typography sx={{ mt: 2.5, color: 'text.secondary', lineHeight: 1.8, maxWidth: 540, mx: { xs: 'auto', md: 0 } }}>
            Hidden cafés, Southern Thai cooking, riverside walks and night markets are right on the doorstep. Krabi’s famous beaches and islands lie one way, waterfalls, temples and hot springs the other. See the real Krabi by day, then come home to a peaceful tropical retreat.
          </Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 3 }}>
            {nearby.map((place) => <Box key={place} sx={{ px: 1.5, py: .6, borderRadius: 999, border: '1px solid', borderColor: 'divider', fontSize: 13.5, fontWeight: 600, bgcolor: 'background.paper' }}>{place}</Box>)}
          </Stack>
        </Reveal>
        <Reveal delay={0.12} sx={{ position: 'relative', minWidth: 0 }}>
            <PostcardFrame sx={{ aspectRatio: '4 / 3' }}>
              <ResortPhoto image={p.khanapNamSunset.src} alt="Sunset over Khao Khanap Nam, the twin limestone peaks on the Krabi River" sizes="(max-width: 900px) 92vw, 46vw" />
            </PostcardFrame>
          <Box sx={{ position: 'absolute', right: { xs: 10, md: -16 }, bottom: { xs: -22, md: -28 }, width: { xs: 130, md: 170 }, height: { xs: 130, md: 170 }, borderRadius: '50%', overflow: 'hidden', border: '6px solid #fffdf9', boxShadow: '0 12px 28px rgba(90,36,72,.2)' }}>
            <ResortPhoto image={p.blackCrab.src} alt="Poo Dam, the giant black crab statue by the Krabi River" sizes="170px" />
          </Box>
        </Reveal>
      </Box>

      <Reveal>
        <Box sx={{ mt: { xs: 8, md: 10 } }}>
          <Typography variant="h3" sx={{ fontSize: { xs: 26, md: 34 }, textAlign: { xs: 'center', md: 'left' } }}>Both sides of Krabi, one happy base</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2,minmax(0,1fr))' }, gap: 2, mt: 2.5 }}>
            {bothSides.map((side, i) => <Box key={side.side} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '28px', bgcolor: i ? '#fdf3d8' : 'primary.light' }}>
              <Typography variant="overline" sx={{ color: i ? 'secondary.dark' : 'primary.main' }}>{side.side}</Typography>
              <Typography sx={{ fontFamily: fonts.playful, fontSize: { xs: 22, md: 25 }, lineHeight: 1.2, mt: .5 }}>{side.title}</Typography>
              <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 2 }}>
                {side.places.map((place) => <Box key={place} sx={{ px: 1.5, py: .6, borderRadius: 999, bgcolor: 'rgba(255,253,249,.8)', fontSize: 13.5, fontWeight: 600 }}>{place}</Box>)}
              </Stack>
            </Box>)}
          </Box>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 1.5, textAlign: { xs: 'center', md: 'left' } }}>Every one a day trip from our door. The tour desk will happily set it up.</Typography>
        </Box>
      </Reveal>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) minmax(0,1.2fr)' }, gap: { xs: 4, md: 5 }, mt: { xs: 5, md: 6 }, alignItems: 'start' }}>
        <Reveal><TravelRoute /></Reveal>
        <Reveal delay={0.1}>
          <Box sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '28px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1.25} alignItems="center"><RestaurantMenuRounded sx={{ color: 'primary.main' }} /><Typography variant="h3" sx={{ fontSize: { xs: 24, md: 30 } }}>Where we eat</Typography></Stack>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: .75 }}>The team’s own favourites, a short walk or ride away.</Typography>
            <Stack direction="row" role="tablist" aria-label="Meals" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 2.5 }}>
              {localPicks.map((m, i) => <Button key={m.meal} role="tab" aria-selected={i === meal} onClick={() => setMeal(i)} size="small" variant={i === meal ? 'contained' : 'outlined'} color={i === meal ? 'primary' : 'inherit'} sx={{ borderColor: 'divider' }}>{m.meal}</Button>)}
            </Stack>
            <Box role="tabpanel" component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 2 }}>
              {pick.places.map((place) => <Box component="li" key={place.name} sx={{ py: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                <Typography sx={{ fontFamily: fonts.playful, fontSize: 19 }}>{place.name}</Typography>
                <Typography sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.6, mt: .25 }}>{place.note}</Typography>
              </Box>)}
            </Box>
          </Box>
        </Reveal>
      </Box>

      <Reveal>
        <Box sx={{ mt: { xs: 7, md: 9 }, maxWidth: 900, mx: 'auto' }}>
          <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 38 }, textAlign: 'center', mb: 3 }}>Is Royal Pineapple right for you?</Typography>
          {fitQuestions.map((item) => {
            const link = item.link ? sectionLink(item.link.href, pathname) : null;
            return <Accordion key={item.q} disableGutters elevation={0} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '18px !important', mb: 1.25, '&::before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreRounded />} sx={{ px: { xs: 2, md: 3 }, '& .MuiAccordionSummary-content': { my: 2 } }}><Typography sx={{ fontWeight: 700, fontSize: { xs: 15.5, md: 17 } }}>{item.q}</Typography></AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 2.5 }}>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.8 }}>{item.a}</Typography>
                {item.link && link && <Button href={link.href} onClick={link.onClick} target={item.link.href.startsWith('http') ? '_blank' : undefined} rel={item.link.href.startsWith('http') ? 'noopener' : undefined} endIcon={<East />} sx={{ mt: 1 }} color="inherit">{item.link.label}</Button>}
              </AccordionDetails>
            </Accordion>;
          })}
        </Box>
      </Reveal>
    </Container>
  </Box>;
}
