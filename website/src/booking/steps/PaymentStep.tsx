import LockRounded from '@mui/icons-material/LockRounded';
import TimerOutlined from '@mui/icons-material/TimerOutlined';
import West from '@mui/icons-material/West';
import { Alert, Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { navigate } from '../../router';
import { fonts } from '../../theme';
import { useBookingFlow } from '../BookingFlowContext';
import { money } from '../format';

// Step 3: pay. The guest pays on 2C2P's own secure page — the bank's 3-D
// Secure check fails when 2C2P's form is embedded in another site, since the
// browser blocks 2C2P's cookies there — and 2C2P sends them back to
// /book/confirmation. "Continue to secure payment" on the details step goes
// straight there; this page is where a guest lands if they come back before
// paying, with the same amount (worked out by the server) and the hold timer.
export function PaymentStep() {
  const { payment, totals } = useBookingFlow();
  const remaining = useCountdown(payment?.expiresAt);
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
        : <Box sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 16px 36px rgba(23,60,44,.07)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.25} sx={{ px: { xs: 2.5, sm: 3 }, py: 2, bgcolor: 'success.light', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box>
              <Typography sx={{ fontFamily: fonts.playful, fontSize: 20, lineHeight: 1.2 }}>Pay {money(payment.deposit, payment.currency)} now</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: .25 }}>Card, PromptPay QR or mobile banking</Typography>
            </Box>
            {remaining !== null && <Chip role="timer" icon={<TimerOutlined />} size="small"
              label={`Rooms held ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`}
              sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 700, fontVariantNumeric: 'tabular-nums', bgcolor: remaining < 120 ? 'secondary.main' : 'background.paper', border: '1px solid', borderColor: 'divider' }} />}
          </Stack>
          <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              You’ll finish paying on 2C2P’s secure payment page, where your bank may ask you to confirm with a code. Afterwards you come straight back here to your confirmation.
            </Typography>
            <Button variant="contained" size="large" startIcon={<LockRounded />} onClick={() => window.location.assign(payment.webPaymentUrl)} sx={{ mt: 2.5 }}>
              Pay {money(payment.deposit, payment.currency)} securely
            </Button>
          </Box>
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
