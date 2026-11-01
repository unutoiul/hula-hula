import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import East from '@mui/icons-material/East';
import EventRounded from '@mui/icons-material/EventRounded';
import Instagram from '@mui/icons-material/Instagram';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import type { PublicEvent } from '../../booking/contract';
import { dayOfMonth, monthLabel } from '../../booking/dates';
import { money } from '../../booking/pricing';
import { useContact } from '../../context/SiteDataContext';
import { photoAssets as p } from '../../data/photos';
import { eventWhen, fromPriceOf, placesLeft } from '../../events/api';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { linkClick } from '../../router';
import { fonts } from '../../theme';
import { ClubPhoto } from '../common/ClubPhoto';
import { Reveal, ScrollTilt } from '../common/ScrollMotion';
import { SEAM } from '../common/SectionSeam';
import { Sticker, SunDoodle } from '../common/VacationDecor';

// Events at the club, on a deep green band of their own right under the hero
// so they can't be missed: the next event as a big poster (date, places
// left, price, "Book your place"), any others as smaller cards, each opening
// its own page with the details and the packages to buy. With nothing
// scheduled it stays, inviting guests to plan a day of their own. Events are
// made and published in /admin.
export function EventsSection({ events, loaded, home = false }: { events: PublicEvent[]; loaded: boolean; home?: boolean }) {
  const [featured, ...more] = events;
  return <Box id="events" component="section" aria-labelledby="events-heading" sx={{
    scrollMarginTop: SECTION_SCROLL_OFFSET, py: { xs: 6, md: 8 }, bgcolor: 'primary.dark', color: 'white', position: 'relative', overflow: 'hidden',
    // The glows fade out before the top and bottom edges, so the band meets the
    // plain forest-green waves above and below it without a visible line.
    backgroundImage: `linear-gradient(180deg, ${SEAM.forest} 0, rgba(18,78,57,0) 160px), linear-gradient(0deg, ${SEAM.forest} 0, rgba(18,78,57,0) 160px), radial-gradient(ellipse at 85% 20%, rgba(249,247,12,.14), transparent 55%), radial-gradient(ellipse at 0% 85%, rgba(0,109,138,.35), transparent 55%)`,
  }}>
    <Container maxWidth="lg" sx={{ position: 'relative' }}>
      <SunDoodle size={80} color="#f9f70c" sx={{ position: 'absolute', right: 420, top: -40, display: { xs: 'none', lg: 'block' }, transform: 'rotate(14deg)', opacity: .9 }} />
      <Reveal><Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-end' }} justifyContent="space-between" gap={3} sx={{ mb: { xs: 4, md: 5 }, textAlign: { xs: 'center', md: 'left' } }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.3} justifyContent={{ xs: 'center', md: 'flex-start' }}>
            <Box sx={{ width: 28, height: 3, bgcolor: 'secondary.main', borderRadius: 2 }} />
            <Typography variant="overline" sx={{ color: 'secondary.main' }}>Events at the club</Typography>
          </Stack>
          <Typography id="events-heading" variant="h2" sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.08, mt: 1.5, color: 'white' }}>{featured ? 'Coming up at the club.' : 'Bring your people.'}<br /><Box component="span" sx={{ color: 'secondary.main' }}>{featured ? 'Make a date of it.' : 'We’ll make a day of it.'}</Box></Typography>
        </Box>
        <Typography sx={{ maxWidth: 380, color: 'rgba(255,255,255,.82)', lineHeight: 1.8 }}>
          {featured ? 'Pro days, tournaments and parties at Hula Hula. Pick a package and pay securely right here — places are limited.' : 'Pro days, tournaments and parties — and golf days for your own crew, team or celebration.'}
        </Typography>
      </Stack></Reveal>

      {featured ? <>
        <FeaturedEvent event={featured} />
        {more.length > 0 && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2.5, mt: 3 }}>
          {more.map((event) => <SmallEvent key={event.slug} event={event} />)}
        </Box>}
      </> : loaded && <NothingScheduled />}
      {home && <Box sx={{ mt: 3, textAlign: 'right' }}><Button href="/events" onClick={linkClick('/events')} sx={{ color: 'white' }} endIcon={<East />}>All events & group days</Button></Box>}
    </Container>
  </Box>;
}

const href = (event: PublicEvent) => `/events/${event.slug}`;

function DateStamp({ date, big = false }: { date: string; big?: boolean }) {
  return <Box aria-hidden sx={{ display: 'grid', justifyItems: 'center', width: big ? 88 : 72, py: big ? 1.25 : 1, borderRadius: '18px', bgcolor: 'secondary.main', color: 'text.primary', border: '3px solid #fffef8', boxShadow: '0 6px 0 rgba(23,60,44,.18)', transform: 'rotate(-5deg)' }}>
    <Box component="span" sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>{monthLabel(date)}</Box>
    <Box component="span" sx={{ fontFamily: fonts.playful, fontSize: big ? 40 : 32, lineHeight: 1 }}>{dayOfMonth(date)}</Box>
  </Box>;
}

function FeaturedEvent({ event }: { event: PublicEvent }) {
  const from = fromPriceOf(event);
  const left = placesLeft(event);
  const soldOut = event.packages.length > 0 && left === 0;
  const selling = event.salesOpen && !soldOut && event.packages.length > 0;
  return <Reveal>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' }, gap: { xs: 0, md: 1.5 }, p: { xs: 1, md: 1.5 }, borderRadius: { xs: '28px', md: '36px' }, bgcolor: '#fffef8', color: 'text.primary', boxShadow: '0 30px 70px rgba(0,0,0,.28)' }}>
      <Box component="a" href={href(event)} onClick={linkClick(href(event))} aria-label={`${event.title} — see the details`} sx={{ position: 'relative', display: 'block', minHeight: { xs: 240, sm: 340, md: 460 }, borderRadius: { xs: '22px', md: '26px' }, overflow: 'hidden', '& img': { transition: 'transform .6s ease' }, '&:hover img': { transform: 'scale(1.03)' } }}>
        <Box sx={{ position: 'absolute', inset: 0 }}><ClubPhoto image={event.coverImage || p.fairwayBalcony.src} alt={event.title} sizes="(max-width: 900px) 100vw, 55vw" /></Box>
        <Box sx={{ position: 'absolute', top: { xs: 14, md: 22 }, left: { xs: 14, md: 22 } }}><DateStamp date={event.startsOn} big /></Box>
        {selling && left <= 20 && <Sticker rotate={8} color="#e7f4cc" sx={{ position: 'absolute', right: { xs: 12, md: 20 }, bottom: { xs: 12, md: 20 }, width: { xs: 92, md: 108 }, height: { xs: 92, md: 108 }, fontSize: { xs: 16, md: 18 } }}>Only {left}<br />left!</Sticker>}
      </Box>
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
          <Chip icon={<EventRounded sx={{ color: 'inherit !important' }} />} label={eventWhen(event)} sx={{ bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 700 }} />
          {soldOut && <Chip label="Sold out" sx={{ fontWeight: 700 }} />}
        </Stack>
        <Typography variant="h3" sx={{ fontSize: { xs: 36, md: 52 }, lineHeight: 1.04, mt: 2 }}>{event.title}</Typography>
        {event.tagline && <Typography sx={{ mt: 1.75, fontSize: { xs: 16, md: 18 }, lineHeight: 1.7, color: 'text.secondary', maxWidth: 480 }}>{event.tagline}</Typography>}
        {event.highlights.length > 0 && <Stack direction="row" flexWrap="wrap" useFlexGap gap={.75} sx={{ mt: 2 }}>
          {event.highlights.slice(0, 4).map((h) => <Chip key={h} size="small" label={h} sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }} />)}
        </Stack>}
        <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 3.5 }}>
          <Button href={href(event)} onClick={linkClick(href(event))} variant="contained" size="large" endIcon={<East />}>{selling ? 'Book your place' : 'See the event'}</Button>
          {from !== null && !soldOut && <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'text.secondary' }}>Packages from</Typography>
            <Typography sx={{ fontFamily: fonts.playful, fontSize: 26, lineHeight: 1.1, color: 'primary.main' }}>{money(from)}</Typography>
          </Box>}
        </Stack>
      </Box>
    </Box>
  </Reveal>;
}

function SmallEvent({ event }: { event: PublicEvent }) {
  const from = fromPriceOf(event);
  return <Reveal sx={{ display: 'flex' }}>
    <Box component="a" href={href(event)} onClick={linkClick(href(event))} sx={{ display: 'flex', flexDirection: 'column', width: '100%', p: .9, bgcolor: '#fffef8', color: 'text.primary', textDecoration: 'none', borderRadius: '22px', boxShadow: '0 14px 36px rgba(0,0,0,.22)', '&:hover img': { transform: 'scale(1.04)' } }}>
      <Box sx={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', borderRadius: '15px', '& img': { transition: 'transform .4s ease' } }}>
        <ClubPhoto image={event.coverImage || p.sunnyFairway.src} alt={event.title} sizes="(max-width: 600px) 90vw, 30vw" />
        <Box sx={{ position: 'absolute', top: 12, left: 12 }}><DateStamp date={event.startsOn} /></Box>
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="overline" sx={{ color: 'success.main', fontSize: 11 }}>{eventWhen(event)}</Typography>
        <Typography variant="h3" sx={{ fontSize: 26, lineHeight: 1.1, mt: .5 }}>{event.title}</Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{from !== null ? `From ${money(from)}` : 'Details soon'}</Typography>
          <Box aria-hidden sx={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'white', '& svg': { fontSize: 18 } }}><East /></Box>
        </Stack>
      </Box>
    </Box>
  </Reveal>;
}

// No event on the calendar yet: the section stays and turns into an invitation.
function NothingScheduled() {
  const contact = useContact();
  const message = encodeURIComponent('Hi Hula Hula Golf Club! We’d like to plan an event with you: ');
  return <Reveal>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.1fr' }, gap: { xs: 3, md: 6 }, alignItems: 'center', p: { xs: 2, md: 3 }, borderRadius: { xs: '28px', md: '36px' }, border: '1px dashed rgba(255,255,255,.35)' }}>
      <ScrollTilt amount={-2}><Box sx={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: '24px', overflow: 'hidden', border: '6px solid #fffef8', transform: 'rotate(-2deg)' }}>
        <ClubPhoto image={p.footgolfGroup.src} alt="A happy group with footballs beside the hole 8 flag" sizes="(max-width: 900px) 90vw, 45vw" />
      </Box></ScrollTilt>
      <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
        <Typography variant="overline" sx={{ color: 'secondary.main' }}>Next big day: coming soon</Typography>
        <Typography variant="h3" sx={{ fontSize: { xs: 32, md: 42 }, lineHeight: 1.08, mt: 1, color: 'white' }}>Planning a golf day, a birthday round or a team outing?</Typography>
        <Typography sx={{ mt: 2, color: 'rgba(255,255,255,.82)', lineHeight: 1.8, maxWidth: 480, mx: { xs: 'auto', md: 0 } }}>Tell us the date and the size of your group — we’ll put together golf, FootGolf, food and drinks, and the shuttle. Our next club event will be right here first.</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 3 }}>
          <Button href={`${contact.whatsapp}?text=${message}`} target="_blank" rel="noopener noreferrer" variant="contained" color="secondary" startIcon={<ChatBubbleOutlineRounded />}>Plan an event with us</Button>
          {contact.instagram && <Button href={contact.instagram} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<Instagram />} sx={{ color: 'white', borderColor: 'rgba(255,255,255,.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,.08)' } }}>Follow for the next one</Button>}
        </Stack>
      </Box>
    </Box>
  </Reveal>;
}
