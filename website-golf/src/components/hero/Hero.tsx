import ArrowOutward from '@mui/icons-material/ArrowOutward';
import East from '@mui/icons-material/East';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import type { PublicEvent } from '../../booking/contract';
import { shortDayLabel } from '../../booking/dates';
import { photoAssets as p } from '../../data/photos';
import { linkClick } from '../../router';
import { fonts } from '../../theme';
import { QuickBook } from '../booking/QuickBook';
import { ClubPhoto } from '../common/ClubPhoto';
import { PineappleGolfer } from '../common/PineappleGolfer';
import { ScrollTilt } from '../common/ScrollMotion';
import { Polaroid, Sticker } from '../common/VacationDecor';
import { HeroHeadline } from './HeroHeadline';

export function Hero({ nextEvent }: { nextEvent?: PublicEvent }) {
  return <Box component="section" aria-label="Welcome to Hula Hula Golf Club" sx={{ position: 'relative', pt: { xs: 4, md: 6 }, pb: { xs: 3, md: 4 }, overflow: 'hidden' }}>
    <Container maxWidth="xl">
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'minmax(0,1fr) minmax(0,1fr)' }, alignItems: 'center', gap: { xs: 4, md: 5 }, minHeight: { md: 580 } }}>
        <Box sx={{ position: 'relative', zIndex: 2, display: { xs: 'contents', md: 'block' } }}>
          <Box sx={{ order: 1, textAlign: { xs: 'center', md: 'left' } }}>
            {nextEvent && <EventPill event={nextEvent} />}
            <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={1.3} sx={{ mb: 2.5 }}>
              <Box sx={{ width: 28, height: 3, bgcolor: 'info.main', borderRadius: 2 }} />
              <Typography variant="overline" color="success.main">Tropical golf near Krabi Airport</Typography>
            </Stack>
            <HeroHeadline />
            <Typography sx={{ fontSize: { xs: 16, md: 18 }, lineHeight: 1.75, color: 'text.secondary', maxWidth: 420, mx: { xs: 'auto', md: 0 }, mt: 3 }}>
              Nine tropical holes, FootGolf, Fling Golf, pickleball and private range bays. Bring your swing — or just your sense of fun.
            </Typography>
            <Stack direction="row" justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={1.8} flexWrap="wrap" useFlexGap sx={{ mt: 3.5 }}>
              <Button href="/activities" variant="contained" endIcon={<ArrowOutward />}>See everything to do</Button>
              <Button href="/prices" color="inherit">Check the prices</Button>
            </Stack>
          </Box>
          <Box sx={{ mt: { xs: 0, md: 4 }, maxWidth: 560, mx: { xs: 'auto', md: 0 }, width: '100%', order: 3 }}>
            <Typography variant="overline" sx={{ display: 'block', mb: 1, textAlign: { xs: 'center', md: 'left' } }}>Grab a tee time in a minute</Typography>
            <QuickBook />
          </Box>
        </Box>
        <Box sx={{ position: 'relative', ml: { xs: 1, md: 2 }, mb: { xs: 4, md: 3 }, order: 2 }}>
          <ScrollTilt amount={1.5}>
            <Box sx={{ border: '6px solid white', borderRadius: '100px 100px 24px 24px', height: { xs: 340, sm: 440, md: 550 }, overflow: 'hidden', transform: 'rotate(1deg)', boxShadow: '0 18px 55px rgba(23,60,44,.10)', bgcolor: 'primary.dark' }}>
              <ClubPhoto image={p.fairwaySign.src} alt="Freshly striped fairway with the Hula Hula sign, palms and blue sky" eager sizes="(max-width: 900px) 95vw, 55vw" sx={{ objectPosition: '40% center' }} />
            </Box>
          </ScrollTilt>
          <Sticker color="#e7f4cc" rotate={9} sx={{ position: 'absolute', top: { xs: 5, md: 22 }, right: { xs: -6, md: -18 }, width: { xs: 95, md: 122 }, height: { xs: 95, md: 122 }, fontSize: { xs: 15, md: 21 } }}>No skills?<br />No problem.</Sticker>
          <Box sx={{ position: 'absolute', width: { xs: 150, md: 202 }, height: { xs: 180, md: 232 }, left: { xs: -18, md: -46 }, bottom: { xs: -26, md: -33 } }}>
            <ScrollTilt amount={-4} sx={{ height: '100%' }}>
              <Polaroid image={p.footgolfGroup.src} alt="A happy FootGolf group with their footballs beside the hole 8 flag" caption="Kick it in!" rotate={-9} sizes="210px" objectPosition="center 40%" />
            </ScrollTilt>
          </Box>
          {/* The club's pineapple, thumbs up at the foot of the photo. */}
          <ScrollTilt amount={3} sx={{ position: 'absolute', zIndex: 1, width: { xs: 112, sm: 140, md: 190 }, right: { xs: -8, md: -34 }, bottom: { xs: -40, md: -56 } }}>
            <PineappleGolfer eager sizes="(max-width: 900px) 140px, 190px" />
          </ScrollTilt>
        </Box>
      </Box>
    </Container>
    <Box sx={{ mt: { xs: 5, md: 7 }, py: 2.1, bgcolor: 'secondary.main', transform: 'rotate(-1deg)', width: '102%', ml: '-1%' }}>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={{ xs: 2, md: 5 }} sx={{ fontFamily: fonts.playful, fontSize: { xs: 18, md: 25 }, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {['Tee times', '✳', 'Fun times', '✳', 'Pineapple putts', '✳', 'Hula always'].map((text, i) => <Box key={i}>{text}</Box>)}
      </Stack>
    </Box>
  </Box>;
}

// The next event, flagged above the headline so nobody misses it: a dark
// pill with a yellow "Event" tag, straight to the event's page.
function EventPill({ event }: { event: PublicEvent }) {
  const href = `/events/${event.slug}`;
  return <Box component="a" href={href} onClick={linkClick(href)} sx={{
    display: 'inline-flex', alignItems: 'center', gap: 1, maxWidth: '100%', mb: 2.5, pl: .6, pr: 1.5, py: .6, borderRadius: 999,
    bgcolor: 'primary.dark', color: 'common.white', textDecoration: 'none', boxShadow: '0 8px 22px rgba(18,78,57,.22)',
    transition: 'transform .2s ease, box-shadow .2s ease', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 28px rgba(18,78,57,.3)' }, '&:hover .pill-arrow': { transform: 'translateX(3px)' },
  }}>
    <Box component="span" sx={{ flexShrink: 0, px: 1.1, py: .3, borderRadius: 999, bgcolor: 'secondary.main', color: 'text.primary', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>Event</Box>
    <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: { xs: 13, md: 14 }, fontWeight: 700 }}>{event.title} · {shortDayLabel(event.startsOn)}</Box>
    <East className="pill-arrow" sx={{ flexShrink: 0, fontSize: 17, transition: 'transform .2s ease' }} />
  </Box>;
}
