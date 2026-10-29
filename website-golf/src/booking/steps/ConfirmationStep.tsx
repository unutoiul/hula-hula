import AirportShuttleRounded from '@mui/icons-material/AirportShuttleRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import EventRounded from '@mui/icons-material/EventRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { useContact, useSite } from '../../context/SiteDataContext';
import { linkClick, navigate } from '../../router';
import { fonts } from '../../theme';
import { ActivityIcon } from '../activityIcons';
import { useBookingFlow } from '../BookingFlowContext';
import { downloadIcs, googleCalendarUrl } from '../calendar';
import { clubRules, findActivity } from '../config';
import { dayLabel, durationLabel, timeLabel } from '../dates';
import { money, peopleLabel } from '../pricing';

// The end of the booking: the reference, when and where, what to pay at the
// club, a calendar entry, and the few things worth knowing before the day.
export function ConfirmationStep() {
  const CONTACT = useContact();
  const site = useSite();
  const { reservation, startOver } = useBookingFlow();
  if (!reservation) return null;
  const activity = findActivity(site, reservation.activity);
  const calendarItem = { uid: reservation.ref, title: `${reservation.activityName} · ${reservation.optionLabel}`, date: reservation.date, time: reservation.time, minutes: reservation.minutes, note: `Booking ${reservation.ref}. Please arrive 20–30 minutes early.` };
  const whatsappText = encodeURIComponent(`Hi Hula Hula Golf Club! About my booking ${reservation.ref} on ${dayLabel(reservation.date)} at ${timeLabel(reservation.time)}: `);

  return <Box sx={{ maxWidth: 720, mx: 'auto' }}>
    <Box sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '28px', p: { xs: 3, md: 4.5 }, boxShadow: '0 18px 55px rgba(23,60,44,.07)' }}>
      <Stack direction="row" spacing={1.5} alignItems="center"><CheckCircleRounded sx={{ color: 'success.main', fontSize: 40 }} /><Typography variant="overline" sx={{ color: 'success.dark' }}>Booked · {reservation.ref}</Typography></Stack>
      <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 46 }, mt: 1, lineHeight: 1.08 }}>You’re on the tee sheet!</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1.25 }}>
        {reservation.emailed ? <>We’ve sent the confirmation to <strong>{reservation.email}</strong>.</> : <>Keep this page handy — your confirmation email may take a little while.</>} Quote <strong>{reservation.ref}</strong> if you get in touch.
      </Typography>

      <Box sx={{ mt: 3, p: { xs: 2.5, md: 3 }, bgcolor: 'primary.light', borderRadius: '20px', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' }, gap: 2.5, alignItems: 'center' }}>
        <Box aria-hidden sx={{ width: 64, height: 64, borderRadius: '50%', display: { xs: 'none', sm: 'grid' }, placeItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', '& svg': { fontSize: 32 } }}><ActivityIcon icon={activity?.icon} /></Box>
        <Box>
          <Typography sx={{ fontFamily: fonts.playful, fontSize: { xs: 24, md: 28 }, lineHeight: 1.15, color: 'primary.dark' }}>{timeLabel(reservation.time)} · {dayLabel(reservation.date)}</Typography>
          <Typography sx={{ mt: .5 }}>{reservation.activityName} · {reservation.optionLabel} · {peopleLabel(activity ?? { peopleNoun: 'player' }, reservation.players)} · about {durationLabel(reservation.minutes)}</Typography>
          {reservation.transfer && <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, color: 'primary.dark' }}><AirportShuttleRounded sx={{ fontSize: 18 }} /><Typography sx={{ fontSize: 14 }}>Free pick-up at {timeLabel(reservation.transfer)} from {reservation.pickupFrom} — we’ll confirm the spot on WhatsApp.</Typography></Stack>}
        </Box>
      </Box>

      <Stack spacing={1} sx={{ mt: 3 }}>
        {reservation.lines.map((line) => <Stack key={line.label} direction="row" justifyContent="space-between" spacing={2}>
          <Typography sx={{ fontSize: 15 }}>{line.label}{line.detail ? <Box component="span" sx={{ color: 'text.secondary', fontSize: 13 }}> · {line.detail}</Box> : null}</Typography>
          <Typography sx={{ fontSize: 15, whiteSpace: 'nowrap' }}>{money(line.amount)}</Typography>
        </Stack>)}
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="baseline"><Typography sx={{ fontWeight: 700 }}>To pay at the club</Typography><Typography sx={{ fontFamily: fonts.playful, fontSize: 26 }}>{money(reservation.total)}</Typography></Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3.5 }}>
        <Button variant="contained" startIcon={<CalendarMonthRounded />} href={googleCalendarUrl(calendarItem, CONTACT)} target="_blank" rel="noopener noreferrer">Add to Google Calendar</Button>
        <Button variant="outlined" startIcon={<EventRounded />} onClick={() => downloadIcs(calendarItem, CONTACT)}>Apple / Outlook (.ics)</Button>
      </Stack>
    </Box>

    <Box sx={{ mt: 3, p: { xs: 3, md: 4 }, borderRadius: '28px', bgcolor: 'success.light' }}>
      <Typography variant="h3" sx={{ fontSize: { xs: 24, md: 28 } }}>Before you come</Typography>
      <Stack spacing={1.25} sx={{ mt: 2 }}>
        {clubRules(activity?.wear ?? '', site.club).map((rule) => <Stack key={rule.title} direction="row" spacing={1.25} alignItems="flex-start">
          <CheckCircleRounded sx={{ fontSize: 18, color: 'success.main', mt: '2px' }} />
          <Typography sx={{ fontSize: 14 }}><strong>{rule.title}.</strong> {rule.text}</Typography>
        </Stack>)}
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
        <Button variant="outlined" startIcon={<WhatsApp />} href={`${CONTACT.whatsapp}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer">Change or ask something</Button>
        <Button variant="outlined" onClick={() => { startOver(); navigate('/book'); }}>Book another time</Button>
        <Button href="/" onClick={linkClick('/')} color="inherit">Back to the club</Button>
      </Stack>
    </Box>
  </Box>;
}
