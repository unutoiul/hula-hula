import East from '@mui/icons-material/East';
import EventRounded from '@mui/icons-material/EventRounded';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import type { PublicEvent } from '../../booking/contract';
import { dayOfMonth, monthLabel } from '../../booking/dates';
import { money } from '../../booking/pricing';
import { photoAssets as p } from '../../data/photos';
import { eventWhen, fromPriceOf, placesLeft } from '../../events/api';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { linkClick } from '../../router';
import { fonts } from '../../theme';
import { ClubPhoto } from '../common/ClubPhoto';
import { Reveal } from '../common/ScrollMotion';
import { Sticker } from '../common/VacationDecor';

// Coming up at the club: the next event as a big poster, any others as
// smaller cards. Only there while something's on (events are made in /admin).
export function EventsSection({ events }: { events: PublicEvent[] }) {
  if (!events.length) return null;
  const [featured, ...more] = events;
  return <Box id="events" component="section" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET, pt: { xs: 7, md: 10 }, pb: { xs: 2, md: 4 } }}>
    <Container maxWidth="xl">
      <Reveal><Stack direction="row" alignItems="center" spacing={1.3} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 2.5 }}>
        <Box sx={{ width: 28, height: 3, bgcolor: 'info.main', borderRadius: 2 }} />
        <Typography variant="overline" color="success.main">Coming up at the club</Typography>
      </Stack></Reveal>
      <FeaturedEvent event={featured} />
      {more.length > 0 && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2.5, mt: 3 }}>
        {more.map((event) => <SmallEvent key={event.slug} event={event} />)}
      </Box>}
    </Container>
  </Box>;
}

const href = (event: PublicEvent) => `/events/${event.slug}`;

function DateStamp({ date }: { date: string }) {
  return <Box aria-hidden sx={{ display: 'grid', justifyItems: 'center', width: 76, py: 1, borderRadius: '16px', bgcolor: 'secondary.main', color: 'text.primary', boxShadow: '0 4px 0 rgba(23,60,44,.12)', transform: 'rotate(-4deg)' }}>
    <Box component="span" sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>{monthLabel(date)}</Box>
    <Box component="span" sx={{ fontFamily: fonts.playful, fontSize: 34, lineHeight: 1 }}>{dayOfMonth(date)}</Box>
  </Box>;
}

function FeaturedEvent({ event }: { event: PublicEvent }) {
  const from = fromPriceOf(event);
  const left = placesLeft(event);
  return <Reveal>
    <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, borderRadius: { xs: '28px', md: '36px' }, overflow: 'hidden', bgcolor: 'primary.dark', color: 'white', boxShadow: '0 22px 60px rgba(23,60,44,.18)' }}>
      <Box sx={{ position: 'relative', minHeight: { xs: 260, sm: 340, md: 480 } }}>
        <Box sx={{ position: 'absolute', inset: 0 }}><ClubPhoto image={event.coverImage || p.fairwayBalcony.src} alt={event.title} sizes="(max-width: 900px) 100vw, 55vw" /></Box>
        <Box sx={{ position: 'absolute', top: { xs: 16, md: 24 }, left: { xs: 16, md: 24 } }}><DateStamp date={event.startsOn} /></Box>
        {event.salesOpen && left > 0 && left <= 20 && <Sticker rotate={8} color="#e7f4cc" sx={{ position: 'absolute', right: { xs: 14, md: 22 }, bottom: { xs: 14, md: 22 }, width: { xs: 92, md: 108 }, height: { xs: 92, md: 108 }, fontSize: { xs: 16, md: 18 } }}>Only {left}<br />left!</Sticker>}
      </Box>
      <Box sx={{ p: { xs: 3, sm: 4, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundImage: 'radial-gradient(ellipse at 100% 0%, rgba(249,247,12,.16), transparent 60%)' }}>
        <Chip icon={<EventRounded sx={{ color: 'inherit !important' }} />} label={eventWhen(event)} sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,.14)', color: 'white', fontWeight: 700 }} />
        <Typography variant="h2" sx={{ fontSize: { xs: 38, md: 56 }, lineHeight: 1.04, mt: 2, color: 'white' }}>{event.title}</Typography>
        {event.tagline && <Typography sx={{ mt: 2, fontSize: { xs: 16, md: 18 }, lineHeight: 1.7, color: 'rgba(255,255,255,.85)', maxWidth: 480 }}>{event.tagline}</Typography>}
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 3.5 }}>
          <Button href={href(event)} onClick={linkClick(href(event))} variant="contained" color="secondary" endIcon={<East />}>{event.salesOpen && left > 0 ? 'See packages' : 'See the event'}</Button>
          {from !== null && <Typography sx={{ color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>{event.salesOpen && left === 0 ? 'Sold out' : `Packages from ${money(from)}`}</Typography>}
        </Stack>
      </Box>
    </Box>
  </Reveal>;
}

function SmallEvent({ event }: { event: PublicEvent }) {
  const from = fromPriceOf(event);
  return <Reveal sx={{ display: 'flex' }}>
    <Box component="a" href={href(event)} onClick={linkClick(href(event))} sx={{ display: 'flex', flexDirection: 'column', width: '100%', p: .9, bgcolor: 'background.paper', color: 'text.primary', textDecoration: 'none', borderRadius: '22px', border: '1px solid rgba(23,60,44,.10)', boxShadow: '0 8px 22px rgba(23,60,44,.07)', '&:hover img': { transform: 'scale(1.04)' } }}>
      <Box sx={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', borderRadius: '15px', '& img': { transition: 'transform .4s ease' } }}>
        <ClubPhoto image={event.coverImage || p.sunnyFairway.src} alt={event.title} sizes="(max-width: 600px) 90vw, 30vw" />
        <Box sx={{ position: 'absolute', top: 12, left: 12 }}><DateStamp date={event.startsOn} /></Box>
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="overline" sx={{ color: 'success.main', fontSize: 11 }}>{eventWhen(event)}</Typography>
        <Typography variant="h3" sx={{ fontSize: 26, lineHeight: 1.1, mt: .5 }}>{event.title}</Typography>
        {from !== null && <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 1 }}>From {money(from)}</Typography>}
      </Box>
    </Box>
  </Reveal>;
}
