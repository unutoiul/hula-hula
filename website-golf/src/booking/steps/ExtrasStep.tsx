import AirportShuttleRounded from '@mui/icons-material/AirportShuttleRounded';
import East from '@mui/icons-material/East';
import SportsGolfRounded from '@mui/icons-material/SportsGolfRounded';
import VolunteerActivismRounded from '@mui/icons-material/VolunteerActivismRounded';
import West from '@mui/icons-material/West';
import { Alert, Box, Button, FormControlLabel, Link, MenuItem, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';
import { GuestStepper } from '../../components/booking/GuestStepper';
import { useContact, useSite } from '../../context/SiteDataContext';
import { navigate } from '../../router';
import { useBookingFlow } from '../BookingFlowContext';
import { BookingSummary } from '../components/BookingSummary';
import { EXPERIENCE_LEVELS, pickupFor } from '../config';
import { fromMinutes, timeLabel, toMinutes } from '../dates';
import { money } from '../pricing';

// Step 2: rental clubs, the free shuttle and — for lessons — how much golf
// they've played. Everything here is optional except a pick-up address when
// the shuttle is wanted.
export function ExtrasStep() {
  const CONTACT = useContact();
  const { club, rentals } = useSite();
  const { activity, search, time, extras, updateExtras } = useBookingFlow();
  const [tried, setTried] = useState(false);
  useEffect(() => { if (activity.askExperience && !extras.experience) updateExtras({ experience: EXPERIENCE_LEVELS[0] }); }, [activity.id]);
  const pickup = time ? pickupFor(time, club) : null;
  const needsAddress = !!extras.transfer && !extras.pickupFrom.trim();

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
        {activity.rentals && rentals.length > 0 && <Card icon={<SportsGolfRounded />} title="Rental clubs" hint="Bringing your own? Skip this. Sets are paid at the club with your booking.">
          <Stack spacing={1.5} sx={{ maxWidth: 420 }}>
            {rentals.map((r) => <GuestStepper key={r.id} label={`${r.label} · ${money(r.price)}`} value={extras.rentals[r.id] ?? 0} min={0}
              max={search.players - rentals.filter((o) => o.id !== r.id).reduce((sum, o) => sum + (extras.rentals[o.id] ?? 0), 0)}
              onChange={(count) => updateExtras({ rentals: { ...extras.rentals, [r.id]: count } })} />)}
          </Stack>
        </Card>}

        {club.transfer.pickups.length > 0 && <Card icon={<AirportShuttleRounded />} title="Free shuttle" hint={`Our free transfer has pick-ups at ${club.transfer.pickups.map(timeLabel).join(' and ')}.`}>
          {pickup
            ? <>
              <RadioGroup value={extras.transfer ?? 'none'} onChange={(e) => updateExtras({ transfer: e.target.value === 'none' ? null : e.target.value })}>
                <FormControlLabel value={pickup} control={<Radio />} label={<Typography sx={{ fontSize: 15 }}><strong>Yes please</strong> — pick us up at {timeLabel(pickup)}</Typography>} />
                <FormControlLabel value="none" control={<Radio />} label={<Typography sx={{ fontSize: 15 }}>No thanks, we’ll make our own way</Typography>} />
              </RadioGroup>
              {extras.transfer && <TextField label="Where should we pick you up?" required fullWidth placeholder="Hotel name and area, e.g. Hula Hula Resort, Ao Nang" value={extras.pickupFrom}
                onChange={(e) => updateExtras({ pickupFrom: e.target.value.slice(0, 160) })} error={tried && needsAddress}
                helperText={tried && needsAddress ? 'Please tell us where to pick you up' : 'We’ll confirm the exact pick-up time and spot with you on WhatsApp.'} sx={{ mt: 1.5 }} />}
            </>
            : <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              The shuttle doesn’t line up with a {time ? timeLabel(time) : ''} start — it suits starts from about {earliestWithShuttle.join(' or ')}. You can <Link component="button" onClick={() => navigate('/book')}>pick another time</Link>, or make your own way: <Link href={CONTACT.maps} target="_blank" rel="noopener noreferrer">find us on the map</Link>.
            </Typography>}
        </Card>}

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

    <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
      <BookingSummary action={<Button fullWidth variant="contained" onClick={goOn} endIcon={<East />}>Continue</Button>} />
    </Box>
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
