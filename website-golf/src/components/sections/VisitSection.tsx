import AirportShuttleRounded from '@mui/icons-material/AirportShuttleRounded';
import CheckroomRounded from '@mui/icons-material/CheckroomRounded';
import FlightLandRounded from '@mui/icons-material/FlightLandRounded';
import MapOutlined from '@mui/icons-material/MapOutlined';
import ScheduleRounded from '@mui/icons-material/ScheduleRounded';
import SportsGolfRounded from '@mui/icons-material/SportsGolfRounded';
import WbSunnyRounded from '@mui/icons-material/WbSunnyRounded';
import { Box, Button, Container, Link, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { RENTALS, TRANSFER_PICKUPS } from '../../booking/config';
import { timeLabel } from '../../booking/dates';
import { money } from '../../booking/pricing';
import { CONTACT } from '../../data/content';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { QuickBook } from '../booking/QuickBook';
import { MetaLabel } from '../common/MetaLabel';
import { Reveal } from '../common/ScrollMotion';
import { SunDoodle } from '../common/VacationDecor';

// Planning the day: where the club is, the free shuttle, the few things worth
// knowing before you come — and the tee time search again, right where the
// decision gets made.
export function VisitSection() {
  return <Box id="visit" component="section" sx={{ py: SECTION_Y, bgcolor: 'primary.light', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl">
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 5, lg: 8 }} alignItems={{ lg: 'flex-start' }}>
        <Reveal sx={{ maxWidth: { lg: 380 }, flexShrink: 0, textAlign: { xs: 'center', lg: 'left' } }}>
          <SunDoodle size={78} color="#006d8a" sx={{ mb: 2, mx: { xs: 'auto', lg: 0 } }} />
          <MetaLabel>Plan your day out</MetaLabel>
          <Typography variant="h2" sx={{ mt: 2.5, fontSize: { xs: 42, md: 52 }, lineHeight: 1.05 }}>Put a little<br />golf in your<br />holiday.</Typography>
          <Typography sx={{ mt: 2.5, fontSize: 15, lineHeight: 1.8, color: 'text.secondary' }}>Pick a day, bring your favourite people, and we’ll have the carts ready. First time? Our caddies will show you the ropes.</Typography>
          <Box sx={{ mt: 3.5, maxWidth: 560, mx: { xs: 'auto', lg: 0 } }}><QuickBook stacked /></Box>
        </Reveal>

        <Reveal delay={0.12} sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
            <Tile icon={<FlightLandRounded />} title="Easy to find">
              We’re a short drive from Krabi International Airport — handy on your first or last day. <Link href={CONTACT.maps} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 700 }}>Open the map</Link>
            </Tile>
            <Tile icon={<AirportShuttleRounded />} title="Free transfer" highlight>
              Twice a day, with pick-ups at {TRANSFER_PICKUPS.map(timeLabel).join(' and ')}. Tick it when you book and tell us where you’re staying.
            </Tile>
            <Tile icon={<ScheduleRounded />} title="Arrive a little early">
              Check in at the clubhouse 20–30 minutes before your tee time — there’s coffee waiting.
            </Tile>
            <Tile icon={<CheckroomRounded />} title="What to wear">
              Golf: a collared shirt and golf shoes or clean trainers. FootGolf: trainers or turf shoes, no metal studs.
            </Tile>
            <Tile icon={<SportsGolfRounded />} title="No clubs? No worries">
              Rental sets from {money(RENTALS[0].price)}. FootGolf, Putt-Golf and lessons include all the equipment.
            </Tile>
            <Tile icon={<WbSunnyRounded />} title="Hello, sunshine">
              Every round comes with a cart for a little shade. Bring a hat and sunscreen — we’ve got the cold drinks.
            </Tile>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent={{ xs: 'center', lg: 'flex-start' }} sx={{ mt: 3 }}>
            <Button href={CONTACT.maps} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<MapOutlined />}>Get directions</Button>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', textAlign: 'center' }}>Making a holiday of it? Stay with us at <Link href={CONTACT.resort} target="_blank" rel="noopener" sx={{ fontWeight: 700 }}>Hula Hula Resort, Ao Nang</Link>.</Typography>
          </Stack>
        </Reveal>
      </Stack>
    </Container>
  </Box>;
}

function Tile({ icon, title, highlight = false, children }: { icon: ReactNode; title: string; highlight?: boolean; children: ReactNode }) {
  return <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '22px', bgcolor: highlight ? 'secondary.main' : 'background.paper', border: '1px solid', borderColor: highlight ? 'transparent' : 'rgba(23,60,44,.10)', boxShadow: '0 8px 22px rgba(23,60,44,.06)' }}>
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
      <Box aria-hidden sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: highlight ? 'background.paper' : 'success.light', color: 'success.dark', '& svg': { fontSize: 21 } }}>{icon}</Box>
      <Typography variant="h3" sx={{ fontSize: 22, lineHeight: 1.15 }}>{title}</Typography>
    </Stack>
    <Typography sx={{ fontSize: 14, lineHeight: 1.7, color: highlight ? 'text.primary' : 'text.secondary' }}>{children}</Typography>
  </Box>;
}
