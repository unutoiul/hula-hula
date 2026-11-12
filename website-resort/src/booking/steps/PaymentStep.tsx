import LockRounded from '@mui/icons-material/LockRounded';
import TimerOutlined from '@mui/icons-material/TimerOutlined';
import West from '@mui/icons-material/West';
import { Alert, Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { PaymentMethods } from '../../components/booking/PaymentMethods';
import { navigate } from '../../router';
import { useBookingFlow } from '../BookingFlowContext';
import { StripeEmbeddedCheckout } from '../components/StripeEmbeddedCheckout';
import { money, providerName, testPaymentNote } from '../format';

// Step 3: pay, with the amount (worked out by the server) and the hold timer.
// With Stripe, its own embedded form is right here and Stripe moves the guest
// on to /book/confirmation once paid. With 2C2P the guest pays on 2C2P's own
// page — its bank 3-D Secure check fails when 2C2P's form is embedded in
// another site — so "Continue to secure payment" goes straight there, and this
// page is only where a guest lands if they come back before paying.
export function PaymentStep() {
  const { payment, totals } = useBookingFlow();
  const remaining = useCountdown(payment?.expiresAt);
  if (!payment) return null;
  const provider = payment.provider ?? '2c2p';
  const name = providerName(provider);
  const expired = remaining !== null && remaining <= 0;
  const priceMoved = Math.abs(payment.total - totals.total) > 1 && totals.total > 0;

  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' }, gap: { xs: 3, md: 4 }, alignItems: 'start' }}>
    <Box sx={{ minWidth: 0 }}>
      <Button onClick={() => navigate('/book/details')} startIcon={<West />} size="small" sx={{ mb: 1, minHeight: 0 }}>Edit details</Button>
      <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.1 }}>Secure payment</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LockRounded sx={{ fontSize: 18, flexShrink: 0 }} /> Secure checkout with {name}. Your card details stay protected.
      </Typography>

      {payment.testPayment && <Alert severity="info" sx={{ mb: 2 }}>{testPaymentNote(provider)} A real card won’t work here.</Alert>}
      {priceMoved && <Alert severity="info" sx={{ mb: 2 }}>Prices were updated when we confirmed your rooms — the amounts on this page are the ones you’ll pay.</Alert>}
      {expired
        ? <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => navigate('/book')}>Start again</Button>}>The hold on your rooms has run out. Please check prices again.</Alert>
        : <Box sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 16px 36px rgba(23,60,44,.07)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.25} sx={{ px: { xs: 2.5, sm: 3 }, py: 2, bgcolor: 'success.light', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, fontVariantNumeric: 'tabular-nums' }}>Pay {money(payment.deposit, payment.currency)} now</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: .5 }}>Choose an available payment method below</Typography>
            </Box>
            {remaining !== null && <Chip role="timer" icon={<TimerOutlined />} size="small"
              label={`Rooms held ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`}
              sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 700, fontVariantNumeric: 'tabular-nums', bgcolor: remaining < 120 ? 'secondary.main' : 'background.paper', border: '1px solid', borderColor: 'divider' }} />}
          </Stack>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {payment.stripe
              ? <StripeEmbeddedCheckout checkout={payment.stripe} />
              : <>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  You’ll finish paying on {name}’s secure payment page, where your bank may ask you to confirm with a code. Afterwards you come straight back here to your confirmation.
                </Typography>
                {payment.webPaymentUrl && <Button variant="contained" size="large" startIcon={<LockRounded />} onClick={() => window.location.assign(payment.webPaymentUrl!)} sx={{ mt: 2.5 }}>
                  Pay {money(payment.deposit, payment.currency)} securely
                </Button>}
              </>}
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
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}><Typography sx={{ fontWeight: 700 }}>Due now</Typography><Typography sx={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', letterSpacing: '-.8px' }}>{money(payment.deposit, payment.currency)}</Typography></Stack>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1, lineHeight: 1.6, overflowWrap: 'anywhere' }}>Confirmation goes to {payment.email}.</Typography>
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2.5, pt: 2.5 }}><PaymentMethods provider={provider} compact /></Box>
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
