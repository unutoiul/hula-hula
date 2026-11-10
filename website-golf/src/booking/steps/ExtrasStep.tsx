import AirportShuttleRounded from '@mui/icons-material/AirportShuttleRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import DirectionsCarRounded from '@mui/icons-material/DirectionsCarRounded';
import East from '@mui/icons-material/East';
import PlaceRounded from '@mui/icons-material/PlaceRounded';
import SportsGolfRounded from '@mui/icons-material/SportsGolfRounded';
import VolunteerActivismRounded from '@mui/icons-material/VolunteerActivismRounded';
import West from '@mui/icons-material/West';
import { Alert, Box, Button, Link, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';
import { GuestStepper } from '../../components/booking/GuestStepper';
import { useContact, useSite } from '../../context/SiteDataContext';
import { navigate } from '../../router';
import { useBookingFlow } from '../BookingFlowContext';
import { BookingSummary } from '../components/BookingSummary';
import { EXPERIENCE_LEVELS, pickupFor, rentalName, rentalsFor } from '../config';
import { ActivityIcon } from '../activityIcons';
import { fromMinutes, timeLabel, toMinutes } from '../dates';
import { money } from '../pricing';
import { rentalLimit } from '../rentals';
import { RentalSets } from '../../components/activities/RentalCard';
import { STICKY_TOP } from '../../layoutConstants';

// Step 2: rental clubs, how they're getting here (free shuttle, a private
// transfer or their own way) and — for lessons — how much golf they've played.
// Everything here is optional except a pick-up address when they want collecting.
export function ExtrasStep() {
  const CONTACT = useContact();
  const { club, rentals } = useSite();
  const { activity, search, time, extras, updateExtras } = useBookingFlow();
  const [tried, setTried] = useState(false);
  useEffect(() => { if (activity.askExperience && !extras.experience) updateExtras({ experience: EXPERIENCE_LEVELS[0] }); }, [activity.id]);
  const pickup = time ? pickupFor(time, club) : null;
  const transport = extras.privateTransfer ? 'private' : extras.transfer ? 'shuttle' : 'none';
  const chooseTransport = (choice: typeof transport) => updateExtras({ transfer: choice === 'shuttle' ? pickup : null, privateTransfer: choice === 'private' });
  const shuttleRuns = club.transfer.pickups.length > 0;
  const needsAddress = transport !== 'none' && !extras.pickupFrom.trim();
  const offered = rentalsFor(activity, rentals);

  const goOn = () => {
    setTried(true);
    if (!needsAddress) navigate('/book/details');
  };
  const earliestWithShuttle = club.transfer.pickups.map((p) => timeLabel(fromMinutes(toMinutes(p) + club.transfer.leadMinutes)));

  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' }, gap: { xs: 3, md: 4 }, alignItems: 'start' }}>
    <Box sx={{ minWidth: 0 }}>
      <Button onClick={() => navigate('/book')} startIcon={<West />} size="small" sx={{ mb: 1, minHeight: 0 }}>Change time</Button>
      <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.1 }}>A few extras</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>All optional — skip anything you don’t need.</Typography>

      <Stack spacing={2.5}>
        {offered.length > 0 && <Card icon={<ActivityIcon icon={activity.icon} />} title="Equipment" hint={offered.every(item => item.price === 0) ? 'Included at no extra charge. Choose how many kits your group needs.' : 'Choose your equipment below. Any paid rentals are added to your booking.'}>
          <RentalSets rentals={offered} compact control={(r, label) => <GuestStepper label={label} name={rentalName(r)} value={extras.rentals[r.id] ?? 0} min={0}
            max={rentalLimit(r, search.players, extras.rentals, offered)}
            onChange={(count) => updateExtras({ rentals: { ...extras.rentals, [r.id]: count } })} />} />
        </Card>}

        <Card icon={<AirportShuttleRounded />} title="Getting here" hint={shuttleRuns ? `Our free shuttle has pick-ups at ${club.transfer.pickups.map(timeLabel).join(' and ')}, or we can arrange a car just for you.` : 'We can arrange a car just for you, or you can make your own way.'}>
          <Box role="radiogroup" aria-label="How you’re getting here" sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: `repeat(${shuttleRuns ? 3 : 2}, minmax(0, 1fr))` }, gap: 1.25 }}>
            {shuttleRuns && <TransportOption icon={<AirportShuttleRounded />} title="Free shuttle" detail={pickup ? `Pick-up at ${timeLabel(pickup)}` : 'Not at this start time'} selected={transport === 'shuttle'} disabled={!pickup} onSelect={() => chooseTransport('shuttle')} />}
            <TransportOption icon={<DirectionsCarRounded />} title="Private transfer" detail="A car just for your group. We’ll WhatsApp you the price." selected={transport === 'private'} onSelect={() => chooseTransport('private')} />
            <TransportOption icon={<PlaceRounded />} title="Our own way" detail="We’ll meet you at the club." selected={transport === 'none'} onSelect={() => chooseTransport('none')} />
          </Box>
          {transport !== 'none' && <TextField label="Where should we pick you up?" required fullWidth placeholder="Hotel name and area, e.g. Hula Hula Resort, Ao Nang" value={extras.pickupFrom}
            onChange={(e) => updateExtras({ pickupFrom: e.target.value.slice(0, 160) })} error={tried && needsAddress}
            helperText={tried && needsAddress ? 'Please tell us where to pick you up' : transport === 'private' ? 'We’ll confirm the price and pick-up time with you on WhatsApp. It’s paid at the club, not online.' : 'We’ll confirm the exact pick-up time and spot with you on WhatsApp.'} sx={{ mt: 2 }} />}
          {shuttleRuns && !pickup && <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 1.5 }}>
            The shuttle doesn’t line up with a {time ? timeLabel(time) : ''} start — it suits starts from about {earliestWithShuttle.join(' or ')}. You can <Link component="button" onClick={() => navigate('/book')}>pick another time</Link>.
          </Typography>}
          {transport === 'none' && <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 1.5 }}><Link href={CONTACT.maps} target="_blank" rel="noopener noreferrer">Find us on the map</Link></Typography>}
        </Card>

        {activity.askExperience && <Card icon={<SportsGolfRounded />} title="How much golf have you played?" hint="So your coach can plan the session around you.">
          <TextField select fullWidth label="Experience" value={extras.experience || EXPERIENCE_LEVELS[0]} onChange={(e) => updateExtras({ experience: e.target.value })} sx={{ maxWidth: 420 }}>
            {EXPERIENCE_LEVELS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
        </Card>}

        {activity.caddie && <Alert icon={<VolunteerActivismRounded />} severity="info" sx={{ borderRadius: '18px' }}>
          A caddie comes with your booking, already in the price. Caddie tip not included — {money(club.booking.caddieTip)} per caddie is customary, in cash.
        </Alert>}
      </Stack>

      <Button variant="contained" size="large" onClick={goOn} endIcon={<East />} sx={{ mt: 3, display: { xs: 'none', md: 'inline-flex' } }}>Continue to your details</Button>
    </Box>

    <Box sx={{ position: { md: 'sticky' }, top: { md: STICKY_TOP } }}>
      <BookingSummary action={<Button fullWidth variant="contained" onClick={goOn} endIcon={<East />}>Continue</Button>} />
    </Box>
  </Box>;
}

// One selectable box: a real radio button underneath, so the keyboard and screen readers work as usual.
function TransportOption({ icon, title, detail, selected, disabled = false, onSelect }: { icon: ReactNode; title: string; detail: string; selected: boolean; disabled?: boolean; onSelect: () => void }) {
  return <Box component="label" sx={{
    position: 'relative', display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 1.25, p: 1.75, borderRadius: '18px', border: '2px solid',
    borderColor: selected ? 'primary.main' : 'divider', bgcolor: selected ? 'primary.light' : 'background.paper', opacity: disabled ? .55 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'border-color .2s ease, background-color .2s ease', '&:hover': disabled ? undefined : { borderColor: 'primary.main' },
    '&:has(input:focus-visible)': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: '2px' },
  }}>
    <Box component="input" type="radio" name="transport" checked={selected} disabled={disabled} onChange={onSelect} sx={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
    <Box aria-hidden sx={{ width: 42, height: 42, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: selected ? 'primary.main' : 'success.light', color: selected ? 'primary.contrastText' : 'success.dark', '& svg': { fontSize: 23 } }}>{icon}</Box>
    <Box sx={{ minWidth: 0, pr: { xs: 3, sm: 0 } }}>
      <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{title}</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.4, mt: .25 }}>{detail}</Typography>
    </Box>
    {selected && <CheckCircleRounded aria-hidden sx={{ position: 'absolute', top: { xs: '50%', sm: 10 }, right: 10, transform: { xs: 'translateY(-50%)', sm: 'none' }, fontSize: 22, color: 'primary.main' }} />}
  </Box>;
}

function Card({ icon, title, hint, children }: { icon: ReactNode; title: string; hint: string; children: ReactNode }) {
  return <Box component="section" aria-label={title} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '24px', p: { xs: 2.5, md: 3 } }}>
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
      <Box aria-hidden sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'success.light', color: 'success.dark', '& svg': { fontSize: 21 } }}>{icon}</Box>
      <Box>
        <Typography variant="h3" sx={{ fontSize: { xs: 21, md: 24 } }}>{title}</Typography>
        <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: .25 }}>{hint}</Typography>
      </Box>
    </Stack>
    {children}
  </Box>;
}
