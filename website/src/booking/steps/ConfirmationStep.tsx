import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import { Alert, Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { BookingStatusResponse } from '../../../shared/bookingContract';
import { CONTACT } from '../../data/content';
import { linkClick, navigate, useLocation } from '../../router';
import { fonts } from '../../theme';
import { ApiError, fetchStatus } from '../api';
import { accessKeyStore, useBookingFlow } from '../BookingFlowContext';
import { dayLabel, guestsLabel, money, nightsLabel, plural } from '../format';

const POLL_FOR_MS = 2 * 60_000;

// Step 4: after paying. Asks the server until 2C2P has confirmed the payment
// (the server checks with 2C2P itself), then shows the booking and clears what
// this browser kept about it.
export function ConfirmationStep() {
  const { query } = useLocation();
  const { payment, forgetBooking, resetPayment, hasRooms } = useBookingFlow();
  const ref = query.get('ref') ?? payment?.ref ?? '';
  const [email] = useState(payment?.ref === ref ? payment.email : null);
  const [status, setStatus] = useState<BookingStatusResponse | null>(null);
  const [problem, setProblem] = useState<'missing' | 'slow' | null>(null);
  const forgotten = useRef(false);

  // A key in the address (from 2C2P's redirect) moves into this tab's storage
  // and out of the address bar.
  useEffect(() => {
    const key = query.get('key');
    if (ref && key) {
      accessKeyStore.set(ref, key);
      navigate(`/book/confirmation?ref=${ref}`, { replace: true });
    }
  }, [query, ref]);

  useEffect(() => {
    const key = ref ? accessKeyStore.get(ref) ?? query.get('key') : null;
    if (!ref || !key) { setProblem('missing'); return; }
    let cancelled = false;
    let timer = 0;
    const started = Date.now();
    const poll = async (delay: number) => {
      try {
        const next = await fetchStatus(ref, key);
        if (cancelled) return;
        setStatus(next);
        if (next.status !== 'pending') return;
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) { setProblem('missing'); return; }
      }
      if (Date.now() - started > POLL_FOR_MS) { setProblem('slow'); return; }
      timer = window.setTimeout(() => void poll(Math.min(delay * 1.5, 5000)), delay);
    };
    void poll(2000);
    return () => { cancelled = true; window.clearTimeout(timer); };
    // The key is read once; `query` only changes when the key is tidied away.
  }, [ref]);

  // Once it's confirmed, nothing about the guest needs to stay in the browser.
  useEffect(() => {
    if (status?.status === 'confirmed' && !forgotten.current) { forgotten.current = true; forgetBooking(); }
  }, [status, forgetBooking]);

  const card = { border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '24px', p: { xs: 3, md: 4 }, maxWidth: 680, mx: 'auto' } as const;

  if (problem === 'missing') return <Box sx={card}>
    <Typography variant="h1" sx={{ fontSize: { xs: 30, md: 40 } }}>Check your email</Typography>
    <Typography sx={{ color: 'text.secondary', mt: 1.5 }}>We can’t show this booking in this browser. If you paid, your confirmation is on its way by email{ref ? ` (booking ${ref})` : ''}. Questions? WhatsApp us on {CONTACT.phone}.</Typography>
    <Button href="/" onClick={linkClick('/')} variant="outlined" sx={{ mt: 3 }}>Back to the resort</Button>
  </Box>;

  if (!status || status.status === 'pending') return <Box sx={{ ...card, textAlign: 'center' }} aria-live="polite">
    {problem === 'slow'
      ? <>
        <Typography variant="h1" sx={{ fontSize: { xs: 28, md: 36 } }}>Still waiting for the payment</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1.5 }}>The bank hasn’t confirmed it yet. If you completed the payment, your confirmation will arrive by email shortly — there’s no need to pay again. Booking {ref}.</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mt: 3 }}>
          <Button variant="contained" onClick={() => window.location.reload()}>Check again</Button>
          <Button variant="outlined" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp us</Button>
        </Stack>
      </>
      : <>
        <CircularProgress />
        <Typography variant="h1" sx={{ fontSize: { xs: 28, md: 36 }, mt: 2 }}>Confirming your payment…</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1 }}>This usually takes a few seconds. Please keep this page open.</Typography>
      </>}
  </Box>;

  // Declined (or cancelled) at 2C2P: say why, and let the guest try again with
  // the same rooms and details — a fresh payment, since the last one failed.
  if (status.status === 'failed') return <Box sx={card}>
    <Typography variant="h1" sx={{ fontSize: { xs: 28, md: 36 } }}>Your payment didn’t go through</Typography>
    <Alert severity="warning" sx={{ mt: 2 }}>{status.failureReason ?? 'The payment wasn’t completed.'} Nothing was charged.</Alert>
    <Typography sx={{ color: 'text.secondary', mt: 2 }}>You can try again with the same card or another one — your rooms and details are still here.</Typography>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
      {hasRooms && <Button variant="contained" onClick={() => { resetPayment(); navigate('/book/details'); }}>Try paying again</Button>}
      <Button variant={hasRooms ? 'outlined' : 'contained'} onClick={() => navigate('/book')}>Choose different rooms</Button>
    </Stack>
  </Box>;

  if (status.status === 'expired') return <Box sx={card}>
    <Alert severity="warning">This booking wasn’t completed — the payment window ran out — and nothing was charged.</Alert>
    <Button onClick={() => navigate('/book')} variant="contained" sx={{ mt: 3 }}>Choose rooms again</Button>
  </Box>;

  const rooms = status.lines.reduce((sum, line) => sum + line.quantity, 0);
  const adults = status.lines.reduce((sum, line) => sum + line.adults * line.quantity, 0);
  const children = status.lines.reduce((sum, line) => sum + line.children * line.quantity, 0);
  const paid = status.paidAmount ?? status.deposit;
  return <Box sx={card}>
    <Stack direction="row" spacing={1.5} alignItems="center"><CheckCircleRounded sx={{ color: 'success.main', fontSize: 40 }} /><Typography variant="overline" sx={{ color: 'success.dark' }}>Booking confirmed · {status.ref}</Typography></Stack>
    <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 46 }, mt: 1 }}>You’re booked. Hello, holiday!</Typography>
    <Typography sx={{ color: 'text.secondary', mt: 1 }}>{email ? `We’ve sent the confirmation to ${email}.` : 'Your confirmation is on its way by email.'} Quote <strong>{status.ref}</strong> if you get in touch.</Typography>

    <Box sx={{ mt: 3, p: 2.5, bgcolor: 'success.light', borderRadius: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
      <Box><Typography variant="overline" sx={{ color: 'success.dark' }}>Check-in</Typography><Typography sx={{ fontFamily: fonts.playful, fontSize: 18 }}>{dayLabel(status.checkIn)}</Typography></Box>
      <Box><Typography variant="overline" sx={{ color: 'success.dark' }}>Check-out</Typography><Typography sx={{ fontFamily: fonts.playful, fontSize: 18 }}>{dayLabel(status.checkOut)}</Typography></Box>
      <Typography sx={{ gridColumn: '1 / -1', fontSize: 14, color: 'text.secondary' }}>{nightsLabel(status.nights)} · {plural(rooms, 'room')} · {guestsLabel(adults, children)}</Typography>
    </Box>

    <Stack spacing={1} sx={{ mt: 3 }}>
      {status.lines.map((line) => <Box key={`${line.roomTypeName}-${line.rateName}-${line.adults}-${line.children}`}>
        <Typography sx={{ fontSize: 15 }}>{line.quantity} × <strong>{line.roomTypeName}</strong> · {line.rateName}</Typography>
        {line.offerTitle && <Typography sx={{ fontSize: 13, color: 'secondary.dark', fontWeight: 700 }}>{line.offerTitle}{line.perks?.length ? ` · includes ${line.perks.join(', ').toLowerCase()}` : ''}</Typography>}
      </Box>)}
    </Stack>
    <Divider sx={{ my: 2.5 }} />
    <Stack spacing={.75}>
      <Stack direction="row" justifyContent="space-between"><Typography>Total for your stay</Typography><Typography>{money(status.total, status.currency)}</Typography></Stack>
      <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.dark', fontWeight: 700 }}><Typography sx={{ fontWeight: 700 }}>Paid today</Typography><Typography sx={{ fontWeight: 700 }}>{money(paid, status.currency)}</Typography></Stack>
      {status.balance > 0 && <Stack direction="row" justifyContent="space-between"><Typography>To pay at the hotel</Typography><Typography>{money(status.balance, status.currency)}</Typography></Stack>}
    </Stack>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
      <Button href="/" onClick={linkClick('/')} variant="contained">Back to the resort</Button>
      <Button href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" variant="outlined">Plan something special</Button>
    </Stack>
  </Box>;
}
