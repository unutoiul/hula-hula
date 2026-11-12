import LockRounded from '@mui/icons-material/LockRounded';
import West from '@mui/icons-material/West';
import { Alert, Autocomplete, Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormHelperText, Link, MenuItem, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { PaymentMethods } from '../../components/booking/PaymentMethods';
import { useBookingSearch } from '../../context/BookingSearchContext';
import { navigate } from '../../router';
import { useBookingFlow } from '../BookingFlowContext';
import { CartSummary, stickyCartSx } from '../components/CartSummary';
import { COUNTRIES } from '../countries';
import { money, testPaymentNote } from '../format';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\d\s.-]{6,30}$/;
const ARRIVALS = ['Not sure yet', 'Before 12:00 (early check-in on request)', '12:00 – 15:00', '15:00 – 18:00', '18:00 – 21:00', 'After 21:00'];

// Step 2: who's coming. Everything typed here goes only to the booking: it's
// sent to the resort with the reservation and kept with it for the
// reservations team (/admin → Bookings).
export function DetailsStep() {
  const { guest, updateGuest, startPayment, totals, availability, cart, plan } = useBookingFlow();
  const { siteMinderUrl } = useBookingSearch();
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [hp, setHp] = useState(''); // honeypot: people never see or fill it
  const startedAt = useRef(performance.now());
  useEffect(() => { startedAt.current = performance.now(); }, []);

  const errors = {
    firstName: !guest.firstName.trim() ? 'Please add a first name' : '',
    lastName: !guest.lastName.trim() ? 'Please add a last name' : '',
    email: !EMAIL.test(guest.email.trim()) ? 'Please add an email — your confirmation goes there' : '',
    emailConfirm: guest.emailConfirm.trim().toLowerCase() !== guest.email.trim().toLowerCase() ? 'The two emails don’t match' : '',
    phone: !PHONE.test(guest.phone.trim()) ? 'Please add a phone number (with country code)' : '',
    country: !guest.country ? 'Please choose a country' : '',
    acceptedPolicies: !guest.acceptedPolicies ? 'Please accept the booking conditions' : '',
  };
  const shown = (key: keyof typeof errors) => (triedSubmit ? errors[key] : '');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setTriedSubmit(true);
    setError(null);
    if (Object.values(errors).some(Boolean) || !plan) return;
    setSending(true);
    const result = await startPayment({ hp, elapsedMs: Math.round(performance.now() - startedAt.current) });
    if ('error' in result) { setSending(false); setError(result.error); return; }
    navigate('/book/payment');
  };

  const policies = availability.data?.policies;
  const cancellations = [...new Set(cart.map(({ rate }) => rate.cancellation.summary))];

  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' }, gap: { xs: 3, md: 4 }, alignItems: 'start' }}>
    <Box component="form" noValidate onSubmit={submit} sx={{ minWidth: 0 }}>
      <Button onClick={() => navigate('/book')} startIcon={<West />} size="small" sx={{ mb: 1, minHeight: 0 }}>Change rooms</Button>
      <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.1 }}>Who’s coming?</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>The name of the guest checking in. We’ll send the confirmation to this email.</Typography>

      <Box sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '24px', p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
          <TextField label="First name" required autoComplete="given-name" value={guest.firstName} onChange={(e) => updateGuest({ firstName: e.target.value.slice(0, 60) })} error={!!shown('firstName')} helperText={shown('firstName')} />
          <TextField label="Last name" required autoComplete="family-name" value={guest.lastName} onChange={(e) => updateGuest({ lastName: e.target.value.slice(0, 60) })} error={!!shown('lastName')} helperText={shown('lastName')} />
          <TextField label="Email" type="email" required autoComplete="email" value={guest.email} onChange={(e) => updateGuest({ email: e.target.value.slice(0, 120) })} error={!!shown('email')} helperText={shown('email')} />
          <TextField label="Confirm email" type="email" required autoComplete="email" value={guest.emailConfirm} onChange={(e) => updateGuest({ emailConfirm: e.target.value.slice(0, 120) })} error={!!shown('emailConfirm')} helperText={shown('emailConfirm')} />
          <TextField label="Phone / WhatsApp" type="tel" required autoComplete="tel" placeholder="+66 81 234 5678" value={guest.phone} onChange={(e) => updateGuest({ phone: e.target.value.slice(0, 30) })} error={!!shown('phone')} helperText={shown('phone')} />
          <Autocomplete options={COUNTRIES} value={COUNTRIES.find((c) => c.code === guest.country) ?? null} onChange={(_, value) => updateGuest({ country: value?.code ?? '' })}
            getOptionLabel={(option) => option.name} isOptionEqualToValue={(a, b) => a.code === b.code} autoHighlight
            renderInput={(params) => <TextField {...params} label="Country" required autoComplete="country-name" error={!!shown('country')} helperText={shown('country')} />} />
          <TextField select label="Estimated arrival" value={guest.arrivalTime || ARRIVALS[0]} onChange={(e) => updateGuest({ arrivalTime: e.target.value === ARRIVALS[0] ? '' : e.target.value })} helperText={policies?.checkInTime ? `Check-in from ${policies.checkInTime}` : undefined}>
            {ARRIVALS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
        </Box>
        <TextField label="Special requests (optional)" multiline minRows={3} fullWidth value={guest.specialRequests} onChange={(e) => updateGuest({ specialRequests: e.target.value.slice(0, 1000) })} helperText="Celebrating something, a bed preference, an airport pick-up? We’ll do our best — requests aren’t guaranteed." sx={{ mt: 2 }} />
        {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
        <Box aria-hidden="true" sx={{ position: 'absolute', left: -10000, width: 1, height: 1, overflow: 'hidden' }}>
          <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
        </Box>
      </Box>

      <Box sx={{ mt: 3, p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: shown('acceptedPolicies') ? 'error.main' : 'divider', borderRadius: '20px', bgcolor: 'background.paper' }}>
        {cancellations.map((text) => <Typography key={text} sx={{ fontSize: 14, color: 'text.secondary', mb: 1 }}><strong>Cancellation:</strong> {text}</Typography>)}
        <FormControlLabel sx={{ m: 0, alignItems: 'flex-start', gap: .25, '& .MuiCheckbox-root': { p: 1, mt: -.8, ml: -1 }, '& .MuiFormControlLabel-label': { minWidth: 0 } }}
          control={<Checkbox checked={guest.acceptedPolicies} onChange={(e) => updateGuest({ acceptedPolicies: e.target.checked })} slotProps={{ input: { 'aria-describedby': shown('acceptedPolicies') ? 'booking-policy-error' : undefined } }} />}
          label={<Typography sx={{ fontSize: 13.5, lineHeight: 1.7 }}>I accept the <Link component="button" type="button" onClick={(e) => { e.preventDefault(); setPolicyOpen(true); }} sx={{ fontSize: 'inherit', verticalAlign: 'baseline' }}>booking conditions</Link> and the cancellation terms above.</Typography>} />
        {shown('acceptedPolicies') && <FormHelperText id="booking-policy-error" error sx={{ ml: 4 }}>{errors.acceptedPolicies}</FormHelperText>}
      </Box>

      {availability.data?.testPayments && <Alert severity="info" sx={{ mt: 2 }}>{testPaymentNote()}</Alert>}
      {/* If our booking can't go ahead (e.g. the payment provider is down), the
          guest can still book the same dates on SiteMinder's own engine. */}
      {error && <Alert severity="error" sx={{ mt: 2 }}>
        {error} <Link href={siteMinderUrl} target="_blank" rel="noopener" sx={{ fontWeight: 700 }}>Or book the same dates on our partner booking page</Link>.
      </Alert>}
      <Box aria-busy={sending} sx={{ mt: 3, p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: '20px', bgcolor: 'background.paper', boxShadow: '0 8px 28px rgba(23,60,44,.04)' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Ready for your getaway?</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: .5, mb: 2.5, lineHeight: 1.65 }}>
          Continue to Stripe’s secure payment form to complete your booking.
        </Typography>
        <Button type="submit" variant="contained" size="large" fullWidth disabled={sending || !plan}
          startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <LockRounded sx={{ fontSize: 19 }} />}
          sx={{ minHeight: 56, borderRadius: '12px', px: { xs: 2, sm: 2.5 }, gap: 1, fontSize: 14, '& .MuiButton-startIcon': { mr: .25 }, ...(sending ? { '&.Mui-disabled': { bgcolor: 'primary.main', color: '#fff', opacity: .8 } } : {}) }}>
          <Box component="span" role="status" sx={{ flex: 1, whiteSpace: 'nowrap', textAlign: sending ? 'center' : 'left' }}>{sending ? 'Opening checkout…' : <>Continue<Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}> to payment</Box></>}</Box>
          {!sending && <Box component="span" sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontSize: 16 }}>{money(totals.dueNow, totals.currency)}</Box>}
        </Button>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.6, mt: 1.25, textAlign: 'center' }}>Your card details go directly to Stripe.</Typography>
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2.5, pt: 2.5 }}><PaymentMethods /></Box>
      </Box>
    </Box>

    <Box sx={stickyCartSx}>
      <CartSummary showFit={false} />
    </Box>

    <Dialog open={policyOpen} onClose={() => setPolicyOpen(false)} scroll="paper" maxWidth="sm" fullWidth>
      <DialogTitle>Booking conditions</DialogTitle>
      <DialogContent dividers>
        {policies?.checkInTime && <Typography sx={{ mb: 1 }}><strong>Check-in</strong> from {policies.checkInTime}{policies.checkOutTime ? <> · <strong>check-out</strong> by {policies.checkOutTime}</> : null}</Typography>}
        {cancellations.map((text) => <Typography key={text} sx={{ mb: 1 }}><strong>Cancellation:</strong> {text}</Typography>)}
        <Typography sx={{ mb: 2 }}><strong>Payment:</strong> {totals.balance > 0 ? `${money(totals.dueNow, totals.currency)} is charged now; the remaining ${money(totals.balance, totals.currency)} is paid at the hotel.` : 'The full amount is charged now.'}</Typography>
        <Typography sx={{ whiteSpace: 'pre-line', fontSize: 14, color: 'text.secondary' }}>{policies?.terms ?? 'The resort’s full terms are confirmed with your booking.'}</Typography>
      </DialogContent>
      <DialogActions><Button onClick={() => { updateGuest({ acceptedPolicies: true }); setPolicyOpen(false); }} variant="contained">I accept</Button></DialogActions>
    </Dialog>
  </Box>;
}
