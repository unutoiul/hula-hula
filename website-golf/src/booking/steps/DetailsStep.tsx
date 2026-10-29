import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import West from '@mui/icons-material/West';
import { Alert, Autocomplete, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormHelperText, Link, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { navigate } from '../../router';
import { useBookingFlow } from '../BookingFlowContext';
import { BookingSummary } from '../components/BookingSummary';
import { clubRules } from '../config';
import { useSite } from '../../context/SiteDataContext';
import { COUNTRIES, guessCountry } from '../countries';
import { money } from '../pricing';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\d\s.-]{6,30}$/;

// Step 3: who's coming, the club's conditions, and confirm. The booking is
// made in the lead player's name; the confirmation goes to their email.
export function DetailsStep() {
  const { activity, guest, updateGuest, confirm, total, time } = useBookingFlow();
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taken, setTaken] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [hp, setHp] = useState(''); // honeypot: people never see or fill it
  const startedAt = useRef(performance.now());

  useEffect(() => { if (!guest.country) updateGuest({ country: guessCountry() }); }, []);

  const errors = {
    firstName: !guest.firstName.trim() ? 'Please add a first name' : '',
    lastName: !guest.lastName.trim() ? 'Please add a last name' : '',
    email: !EMAIL.test(guest.email.trim()) ? 'Please add an email — your confirmation goes there' : '',
    phone: !PHONE.test(guest.phone.trim()) ? 'Please add a phone number with country code' : '',
    country: !guest.country ? 'Please choose a country' : '',
    acceptedPolicies: !guest.acceptedPolicies ? 'Please accept the booking conditions' : '',
  };
  const shown = (key: keyof typeof errors) => (tried ? errors[key] : '');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setTried(true);
    setError(null);
    if (Object.values(errors).some(Boolean) || !time) return;
    setSending(true);
    const result = await confirm({ hp, elapsedMs: Math.round(performance.now() - startedAt.current) });
    setSending(false);
    if ('error' in result) { setError(result.error); setTaken(!!result.taken); return; }
    navigate('/book/confirmation');
  };

  const { club } = useSite();
  const rules = clubRules(activity.wear, club);

  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' }, gap: { xs: 3, md: 4 }, alignItems: 'start' }}>
    <Box component="form" noValidate onSubmit={submit} sx={{ minWidth: 0 }}>
      <Button onClick={() => navigate('/book/extras')} startIcon={<West />} size="small" sx={{ mb: 1, minHeight: 0 }}>Back to extras</Button>
      <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.1 }}>Who’s booking?</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>The lead {activity.peopleNoun === 'person' ? 'guest' : 'player'} — we’ll send the confirmation here and WhatsApp you if anything changes.</Typography>

      <Box sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '24px', p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
          <TextField label="First name" required autoComplete="given-name" value={guest.firstName} onChange={(e) => updateGuest({ firstName: e.target.value.slice(0, 60) })} error={!!shown('firstName')} helperText={shown('firstName')} />
          <TextField label="Last name" required autoComplete="family-name" value={guest.lastName} onChange={(e) => updateGuest({ lastName: e.target.value.slice(0, 60) })} error={!!shown('lastName')} helperText={shown('lastName')} />
          <TextField label="Email" type="email" required autoComplete="email" value={guest.email} onChange={(e) => updateGuest({ email: e.target.value.slice(0, 120) })} error={!!shown('email')} helperText={shown('email')} />
          <TextField label="Phone / WhatsApp" type="tel" required autoComplete="tel" placeholder="+66 81 234 5678" value={guest.phone} onChange={(e) => updateGuest({ phone: e.target.value.slice(0, 30) })} error={!!shown('phone')} helperText={shown('phone')} />
          <Autocomplete options={COUNTRIES} value={COUNTRIES.find((c) => c.code === guest.country) ?? null} onChange={(_, value) => updateGuest({ country: value?.code ?? '' })}
            getOptionLabel={(option) => option.name} isOptionEqualToValue={(a, b) => a.code === b.code} autoHighlight
            renderInput={(params) => <TextField {...params} label="Country" required autoComplete="country-name" error={!!shown('country')} helperText={shown('country')} />} />
          {activity.askHandicap && <TextField label="Handicap (optional)" slotProps={{ htmlInput: { inputMode: 'decimal' } }} value={guest.handicap} onChange={(e) => updateGuest({ handicap: e.target.value.replace(/[^\d.+-]/g, '').slice(0, 5) })} helperText="Helps us pair you with the right caddie" />}
        </Box>
        <TextField label="Anything we should know? (optional)" multiline minRows={3} fullWidth value={guest.notes} onChange={(e) => updateGuest({ notes: e.target.value.slice(0, 1000) })}
          helperText="Left-handed clubs, a birthday round, kids in the group… We’ll do our best." sx={{ mt: 2 }} />
        {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
        <Box aria-hidden="true" sx={{ position: 'absolute', left: -10000, width: 1, height: 1, overflow: 'hidden' }}>
          <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
        </Box>
      </Box>

      <Box component="section" aria-label="Good to know" sx={{ mt: 3, p: { xs: 2.5, md: 3 }, borderRadius: '24px', bgcolor: 'success.light' }}>
        <Typography variant="h3" sx={{ fontSize: 22, mb: 1.5 }}>Good to know</Typography>
        <Stack spacing={1.25}>
          {rules.map((rule) => <Stack key={rule.title} direction="row" spacing={1.25} alignItems="flex-start">
            <CheckCircleRounded sx={{ fontSize: 18, color: 'success.main', mt: '2px' }} />
            <Typography sx={{ fontSize: 14 }}><strong>{rule.title}.</strong> {rule.text}</Typography>
          </Stack>)}
        </Stack>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <FormControlLabel control={<Checkbox checked={guest.acceptedPolicies} onChange={(e) => updateGuest({ acceptedPolicies: e.target.checked })} />}
          label={<Typography sx={{ fontSize: 14 }}>I accept the <Link component="button" type="button" onClick={(e) => { e.preventDefault(); setRulesOpen(true); }}>booking conditions</Link>.</Typography>} />
        {shown('acceptedPolicies') && <FormHelperText error>{errors.acceptedPolicies}</FormHelperText>}
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }} action={taken ? <Button color="inherit" size="small" onClick={() => navigate('/book')}>Pick a time</Button> : undefined}>{error}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2} sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" size="large" disabled={sending || !time}>
          {sending ? 'Booking your time…' : `Confirm booking · ${money(total)} at the club`}
        </Button>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>No payment now — you pay at the clubhouse on the day.</Typography>
      </Stack>
    </Box>

    <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
      <BookingSummary />
    </Box>

    <Dialog open={rulesOpen} onClose={() => setRulesOpen(false)} scroll="paper" maxWidth="sm" fullWidth>
      <DialogTitle>Booking conditions</DialogTitle>
      <DialogContent dividers>
        {rules.map((rule) => <Typography key={rule.title} sx={{ mb: 1.5 }}><strong>{rule.title}.</strong> {rule.text}</Typography>)}
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Players must follow the caddie’s and the club’s instructions on the course. Children are welcome with an adult. The club may move a start time by a few minutes to keep the course flowing, and will tell you if it does.</Typography>
      </DialogContent>
      <DialogActions><Button onClick={() => { updateGuest({ acceptedPolicies: true }); setRulesOpen(false); }} variant="contained">I accept</Button></DialogActions>
    </Dialog>
  </Box>;
}
