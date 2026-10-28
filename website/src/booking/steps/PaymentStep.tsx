import LockRounded from '@mui/icons-material/LockRounded';
import West from '@mui/icons-material/West';
import { Alert, Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { navigate } from '../../router';
import { fonts } from '../../theme';
import { useBookingFlow } from '../BookingFlowContext';
import { money } from '../format';
import { loadPgwSdk, PGW_CANCELLED, PGW_COMPLETED } from '../payment/pgwSdk';

type UiState = 'loading' | 'ready' | 'cancelled' | 'failed' | 'unavailable';

// Step 3: pay. 2C2P's own payment form opens right here (Drop-in UI), for
// exactly the amount the server worked out when the booking was created. If
// the form can't load, the guest can still pay on 2C2P's page and come back.
export function PaymentStep() {
  const { payment, totals } = useBookingFlow();
  const [state, setState] = useState<UiState>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const remaining = useCountdown(payment?.expiresAt);

  const open = useCallback(async () => {
    if (!payment) return;
    setState('loading');
    try {
      const sdk = await loadPgwSdk(payment.webPaymentUrl);
      setState('ready');
      sdk.paymentUI({ url: payment.webPaymentUrl, mode: 'DropIn', cancelConfirmation: false }, (result) => {
        if (result.responseCode === PGW_COMPLETED) navigate(`/book/confirmation?ref=${payment.ref}`);
        else if (result.responseCode === PGW_CANCELLED) setState('cancelled');
        else { setMessage(result.responseDescription ?? null); setState('failed'); }
      });
    } catch {
      setState('unavailable');
    }
  }, [payment]);

  useEffect(() => { void open(); }, [open, attempt]);

  if (!payment) return null;
  const expired = remaining !== null && remaining <= 0;
  const priceMoved = Math.abs(payment.total - totals.total) > 1 && totals.total > 0;

  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' }, gap: { xs: 3, md: 4 }, alignItems: 'start' }}>
    <Box sx={{ minWidth: 0 }}>
      <Button onClick={() => navigate('/book/details')} startIcon={<West />} size="small" sx={{ mb: 1, minHeight: 0 }}>Edit details</Button>
      <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.1 }}>Secure payment</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LockRounded sx={{ fontSize: 18 }} /> Paid through 2C2P — card details go straight to them, never to us.
      </Typography>

      {priceMoved && <Alert severity="info" sx={{ mb: 2 }}>Prices were updated when we confirmed your rooms — the amounts on this page are the ones you’ll pay.</Alert>}
      {expired
        ? <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => navigate('/book')}>Start again</Button>}>Your rooms were held for 15 minutes and the hold has run out. Please check prices again.</Alert>
        : remaining !== null && <Typography sx={{ fontSize: 13, color: remaining < 120 ? 'warning.dark' : 'text.secondary', mb: 2 }} aria-live="polite">
          Rooms held for you for another {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
        </Typography>}

      {!expired && <Box sx={{ position: 'relative', minHeight: 420, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '24px', overflow: 'hidden' }}>
        {state === 'loading' && <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ position: 'absolute', inset: 0 }}><CircularProgress /><Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Opening the secure payment form…</Typography></Stack>}
        {(state === 'cancelled' || state === 'failed' || state === 'unavailable') && <Stack spacing={2} sx={{ p: 3 }}>
          <Alert severity={state === 'cancelled' ? 'info' : 'warning'}>
            {state === 'cancelled' ? 'Payment cancelled — nothing was charged.'
              : state === 'failed' ? `The payment didn’t go through${message ? ` (${message})` : ''}. Nothing was charged — you can try again or use another card.`
              : 'The payment form couldn’t load here. You can pay on 2C2P’s secure page instead — you’ll come straight back.'}
          </Alert>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            {state !== 'unavailable' && <Button variant="contained" onClick={() => setAttempt((n) => n + 1)}>Try again</Button>}
            <Button variant={state === 'unavailable' ? 'contained' : 'outlined'} href={payment.webPaymentUrl}>Pay on 2C2P’s secure page</Button>
          </Stack>
        </Stack>}
        {/* 2C2P renders its form into this exact id. */}
        <Box id="pgw-ui-container" key={attempt} sx={{ display: state === 'ready' ? 'block' : 'none', minHeight: 420 }} />
      </Box>}
    </Box>

    <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderTop: '5px solid #50830d', bgcolor: 'background.paper', borderRadius: '24px', p: { xs: 2.5, md: 3 } }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Booking {payment.ref}</Typography>
        <Stack spacing={.75} sx={{ mt: 1 }}>
          <Stack direction="row" justifyContent="space-between"><Typography>Total for your stay</Typography><Typography>{money(payment.total, payment.currency)}</Typography></Stack>
          {payment.balance > 0 && <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Pay at the hotel</Typography><Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{money(payment.balance, payment.currency)}</Typography></Stack>}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="baseline"><Typography sx={{ fontWeight: 700 }}>Pay now</Typography><Typography sx={{ fontFamily: fonts.playful, fontSize: 26 }}>{money(payment.deposit, payment.currency)}</Typography></Stack>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1 }}>Confirmation goes to {payment.email}.</Typography>
      </Box>
    </Box>
  </Box>;
}

function useCountdown(until: string | undefined): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [until]);
  return until ? Math.max(0, Math.round((Date.parse(until) - now) / 1000)) : null;
}
