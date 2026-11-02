import CheckRounded from '@mui/icons-material/CheckRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import SendRounded from '@mui/icons-material/SendRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Alert, Box, Button, Checkbox, Dialog, FormControlLabel, IconButton, MenuItem, Slide, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { forwardRef, useEffect, useRef, useState, type FormEvent, type ReactElement, type Ref } from 'react';
import { useBookingSearch } from '../../context/BookingSearchContext';
import type { ContactRequest } from '../../context/ContactFormContext';
import { CONTACT } from '../../data/content';
import { fonts } from '../../theme';
import { MotionBox } from '../common/motionPrimitives';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dayFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const dayYearFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// The Subject dropdown. It opens on the topic of whichever button opened the
// form; a more specific topic (e.g. "Shuttle to Krabi Town", an activity's
// name) is added at the top so it can stay selected. "Something else…" lets
// the guest write their own.
const SUBJECTS = ['Room booking & availability', 'Rooms & villas', 'Floating breakfast', 'Dining', 'Activities & tours', 'Airport transfer & shuttle', 'Events & celebrations', 'Spa & wellness', 'General question'];
const OTHER = 'Something else…';

// Phones get a sheet that slides up from the bottom; larger screens a centred card.
const SlideUp = forwardRef(function SlideUp(props: TransitionProps & { children: ReactElement }, ref: Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Status = 'idle' | 'sending' | 'sent' | 'error';

// The contact popup: name, email, optional phone/WhatsApp number, a message
// pre-started for the topic, and (optionally) the stay dates picked in the
// booking search. Sends to /api/contact, which emails the resort. WhatsApp
// stays one tap away, and is the fallback if sending fails.
export function ContactDialog({ open, request, onClose }: { open: boolean; request: ContactRequest; onClose: () => void }) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const { checkIn, checkOut, adults, children } = useBookingSearch();
  const stay = `${dayFmt.format(checkIn)} – ${dayYearFmt.format(checkOut)} · ${plural(adults, 'adult', 'adults')}${children ? ` · ${plural(children, 'child', 'children')}` : ''}`;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [subject, setSubject] = useState('General question');
  const [customSubject, setCustomSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includeStay, setIncludeStay] = useState(false);
  const [hpRef, setHpRef] = useState(''); // honeypot: people never see or fill it
  const [status, setStatus] = useState<Status>('idle');
  const [triedSubmit, setTriedSubmit] = useState(false);
  const startedAt = useRef(0);

  // Each time it opens: a fresh message for the new topic (name, email and
  // phone are kept, in case the guest asks about something else too).
  useEffect(() => {
    if (!open) return;
    setSubject(request.topic);
    setCustomSubject('');
    setMessage(request.message ?? '');
    setStatus('idle');
    setTriedSubmit(false);
    startedAt.current = performance.now();
  }, [open, request]);

  const subjects = SUBJECTS.includes(request.topic) ? SUBJECTS : [request.topic, ...SUBJECTS];
  const topic = subject === OTHER ? customSubject.trim() : subject;
  const errors = {
    subject: subject === OTHER && !customSubject.trim() ? 'Please add a subject' : '',
    name: !name.trim() ? 'Please tell us your name' : '',
    email: !EMAIL.test(email.trim()) ? 'Please add an email we can reply to' : '',
    message: message.trim().length < 2 ? 'Please write a short message' : '',
  };
  const shown = (key: keyof typeof errors) => (triedSubmit ? errors[key] : '');
  const whatsapp = `${CONTACT.whatsapp}?text=${encodeURIComponent(message.trim() || `Hello Hula Hula! I have a question about ${topic || 'my stay'}.`)}`;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setTriedSubmit(true);
    if (Object.values(errors).some(Boolean)) return;
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phoneNumber, message, topic, page: request.page, stay: includeStay ? stay : undefined, hp_ref: hpRef, elapsedMs: performance.now() - startedAt.current }),
      });
      const result: { ok?: boolean } = await response.json();
      setStatus(response.ok && result.ok === true ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="contact-title"
    slots={phone ? { transition: SlideUp } : undefined}
    slotProps={{
      container: { sx: { alignItems: { xs: 'flex-end', sm: 'center' } } },
      paper: { sx: { m: { xs: 0, sm: 4 }, width: { xs: '100%', sm: 'calc(100% - 64px)' }, maxWidth: { xs: '100%', sm: 560 }, maxHeight: { xs: '92dvh', sm: 'calc(100% - 64px)' }, borderRadius: { xs: '24px 24px 0 0', sm: '24px' }, borderTop: '5px solid #50830d', bgcolor: 'background.default', backgroundImage: 'none' } },
    }}>
    {/* On phones the sheet ends at the screen's bottom edge: keep its buttons clear of the iPhone home-indicator area. */}
    <Box sx={{ position: 'relative', px: { xs: 2.5, sm: 4 }, pt: { xs: 1.5, sm: 3.5 }, pb: { xs: 'calc(24px + env(safe-area-inset-bottom))', sm: 4 } }}>
      {/* A grab-handle look on phones, so the sheet reads as a popup. */}
      <Box aria-hidden sx={{ display: { xs: 'block', sm: 'none' }, width: 44, height: 5, borderRadius: 3, bgcolor: 'divider', mx: 'auto', mb: 2 }} />
      <IconButton onClick={onClose} aria-label="Close" sx={{ position: 'absolute', top: { xs: 14, sm: 20 }, right: { xs: 12, sm: 20 }, width: 44, height: 44, border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}><CloseRounded /></IconButton>

      {status === 'sent' ? <Box role="status" sx={{ textAlign: 'center', py: { xs: 4, sm: 3 } }}>
        <MotionBox initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 16 }}
          sx={{ width: 76, height: 76, mx: 'auto', borderRadius: '50%', bgcolor: 'secondary.main', display: 'grid', placeItems: 'center', boxShadow: '0 8px 0 rgba(23,60,44,.08)' }}>
          <CheckRounded sx={{ fontSize: 40, color: 'text.primary' }} />
        </MotionBox>
        <Typography variant="h3" sx={{ mt: 2.5, fontSize: { xs: 28, sm: 32 } }}>Message sent!</Typography>
        <Typography sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.7 }}>Thanks, {name.trim().split(' ')[0]}. We’ll reply to {email.trim()} soon.</Typography>
        <Button onClick={onClose} variant="contained" sx={{ mt: 3.5, width: { xs: '100%', sm: 'auto' } }}>Back to the sunshine</Button>
      </Box> : <Box component="form" noValidate onSubmit={submit}>
        <Box sx={{ pr: 7 }}>
          <Box component="span" sx={{ display: 'inline-block', px: 1.5, py: .75, borderRadius: 999, bgcolor: '#e7f4cc', color: 'success.main', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>{topic || 'Your subject'}</Box>
          <Typography id="contact-title" variant="h3" sx={{ mt: 1.5, fontSize: { xs: 28, sm: 34 }, lineHeight: 1.1 }}>Let’s chat!</Typography>
          <Typography sx={{ mt: 1, fontSize: 15, lineHeight: 1.6, color: 'text.secondary' }}>Send us a note and we’ll reply by email, usually within a day.</Typography>
        </Box>

        <Stack spacing={2} sx={{ mt: 3 }}>
          {/* Phones get their own native picker; larger screens a styled menu. */}
          <TextField select label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} slotProps={{ select: { native: phone } }}>
            {[...subjects, OTHER].map((option) => phone
              ? <option key={option} value={option}>{option}</option>
              : <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
          {subject === OTHER && <TextField label="Your subject" value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} required autoFocus
            slotProps={{ htmlInput: { maxLength: 80 } }} error={!!shown('subject')} helperText={shown('subject')} />}
          <TextField label="Your name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" error={!!shown('name')} helperText={shown('name')} />
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" inputMode="email" error={!!shown('email')} helperText={shown('email')} />
          <TextField label="Phone or WhatsApp (optional)" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} autoComplete="tel" />
          <TextField label="Message" value={message} onChange={(e) => setMessage(e.target.value)} required multiline minRows={4} maxRows={10} error={!!shown('message')} helperText={shown('message')} />
          <FormControlLabel control={<Checkbox checked={includeStay} onChange={(e) => setIncludeStay(e.target.checked)} />}
            label={<Typography sx={{ fontSize: 14, lineHeight: 1.4 }}>Add my stay: <Box component="span" sx={{ fontWeight: 700 }}>{stay}</Box></Typography>} sx={{ alignItems: 'center', mr: 0 }} />
          {/* Honeypot for bots — hidden from people and screen readers. */}
          <Box component="input" name="hp_ref" tabIndex={-1} autoComplete="off" aria-hidden value={hpRef} onChange={(e) => setHpRef(e.target.value)}
            sx={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />
        </Stack>

        {status === 'error' && <Alert severity="error" role="alert" sx={{ mt: 2.5, borderRadius: '14px' }}>
          We couldn’t send your message just now. Please try again, or message us on WhatsApp below.
        </Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={1.5} sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={status === 'sending'} endIcon={<SendRounded />} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </Button>
          <Button href={whatsapp} target="_blank" rel="noopener noreferrer" color="inherit" startIcon={<WhatsApp sx={{ color: '#25a366' }} />} sx={{ alignSelf: { xs: 'center', sm: 'auto' }, fontFamily: fonts.sans }}>
            Prefer WhatsApp?
          </Button>
        </Stack>
      </Box>}
    </Box>
  </Dialog>;
}
