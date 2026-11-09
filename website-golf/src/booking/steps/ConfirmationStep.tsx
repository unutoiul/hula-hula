import AirportShuttleRounded from '@mui/icons-material/AirportShuttleRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import EventRounded from '@mui/icons-material/EventRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Alert, Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';
import { useContact, useSite } from '../../context/SiteDataContext';
import { linkClick, navigate, useLocation } from '../../router';
import { fonts } from '../../theme';
import { ActivityIcon } from '../activityIcons';
import { fetchReservation, type ReservationView } from '../api';
import { useBookingFlow } from '../BookingFlowContext';
import { downloadIcs, googleCalendarUrl } from '../calendar';
import { clubRules, findActivity } from '../config';
import { dayLabel, durationLabel, timeLabel } from '../dates';
import { money, peopleLabel } from '../pricing';
import { CARD_PEEK, PineappleGolfer } from '../../components/common/PineappleGolfer';

const POLL_FOR_MS = 2 * 60_000;

// The end of the booking, where the guest lands after paying: it waits for
// the payment to be confirmed, then shows the reference, when and where, what
// was paid, a calendar entry, and the few things worth knowing before the day.
export function ConfirmationStep() {
  const CONTACT = useContact();
  const site = useSite();
  const { query } = useLocation();
  const { startOver, forgetGuest } = useBookingFlow();
  const ref = query.get('ref') ?? '';
  const key = query.get('key') ?? '';
  const [reservation, setReservation] = useState<ReservationView | null>(null);
  const [problem, setProblem] = useState<'missing' | 'slow' | null>(null);

  useEffect(() => {
    let cancelled = false, timer = 0, seen = false;
    const started = Date.now();
    const poll = async (delay: number) => {
      try {
        const next = await fetchReservation(ref, key);
        if (cancelled) return;
        seen = true;
        setReservation(next);
        if (next.status !== 'pending') return;
      } catch {
        if (cancelled) return;
        if (!seen) { setProblem('missing'); return; }
      }
      if (Date.now() - started > POLL_FOR_MS) { setProblem('slow'); return; }
      timer = window.setTimeout(() => void poll(Math.min(delay * 1.5, 5000)), delay);
    };
    void poll(1500);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [ref, key]);

  const confirmed = reservation?.status === 'confirmed';
  useEffect(() => { if (confirmed) forgetGuest(); }, [confirmed, forgetGuest]);

  const card = (children: ReactNode) => <Box sx={{ maxWidth: 560, mx: 'auto', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '28px', p: { xs: 3, md: 4.5 }, boxShadow: '0 18px 55px rgba(23,60,44,.07)' }}>{children}</Box>;

  if (problem === 'missing') return card(<>
    <Typography variant="h1" sx={{ fontSize: 32 }}>Check your email</Typography>
    <Typography sx={{ color: 'text.secondary', mt: 1.5 }}>We can’t show this booking here. If you paid, your confirmation is on its way by email (booking {ref}). Questions? WhatsApp us on {CONTACT.phone}.</Typography>
    <Button href="/" onClick={linkClick('/')} variant="outlined" sx={{ mt: 3 }}>Back to the club</Button>
  </>);

  if (!reservation || reservation.status === 'pending') return card(<Box sx={{ textAlign: 'center' }} aria-live="polite">
    {problem === 'slow'
      ? <>
        <Typography variant="h1" sx={{ fontSize: 30 }}>Still waiting for the payment</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1.5 }}>The bank hasn’t confirmed it yet. If you completed the payment, your confirmation will arrive by email shortly — there’s no need to pay again. If you cancelled, nothing was charged and your time is released within 20 minutes. Booking {ref}.</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mt: 3 }}>
          <Button variant="contained" onClick={() => window.location.reload()}>Check again</Button>
          <Button variant="outlined" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp us</Button>
        </Stack>
      </>
      : <>
        <CircularProgress />
        <Typography variant="h1" sx={{ fontSize: 30, mt: 2 }}>Confirming your payment…</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1 }}>This usually takes a few seconds. Please keep this page open.</Typography>
      </>}
  </Box>);

  if (reservation.status !== 'confirmed') return card(<>
    <Typography variant="h1" sx={{ fontSize: 30 }}>{reservation.status === 'expired' ? 'This booking ran out of time' : 'This booking was cancelled'}</Typography>
    <Alert severity="warning" sx={{ mt: 2 }}>{reservation.status === 'expired' ? 'The payment window closed before the payment finished, so nothing was charged.' : 'If you’ve paid and have a question about it, please WhatsApp us.'}</Alert>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
      <Button variant="contained" onClick={() => { startOver(); navigate('/book'); }}>Book again</Button>
      <Button variant="outlined" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp us</Button>
    </Stack>
  </>);

  const activity = findActivity(site, reservation.activity);
  const calendarItem = { uid: reservation.ref, title: `${reservation.activityName} · ${reservation.optionLabel}`, date: reservation.date, time: reservation.time, minutes: reservation.minutes, note: `Booking ${reservation.ref}. Please arrive 20–30 minutes early.` };
  const whatsappText = encodeURIComponent(`Hi Hula Hula Golf Club! About my booking ${reservation.ref} on ${dayLabel(reservation.date)} at ${timeLabel(reservation.time)}: `);

  return <Box sx={{ maxWidth: 720, mx: 'auto' }}>
    <Box sx={{ position: 'relative', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '28px', p: { xs: 3, md: 4.5 }, boxShadow: '0 18px 55px rgba(23,60,44,.07)' }}>
      <PineappleGolfer sizes="110px" sx={CARD_PEEK} />
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
      <Stack direction="row" justifyContent="space-between" alignItems="baseline"><Typography sx={{ fontWeight: 700 }}>{reservation.total === 0 ? 'Nothing to pay' : reservation.testPayment ? 'Test payment — nothing charged' : 'Paid online'}</Typography><Typography sx={{ fontFamily: fonts.playful, fontSize: 26 }}>{money(reservation.total)}</Typography></Stack>

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
