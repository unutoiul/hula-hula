import West from '@mui/icons-material/West';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Container, Link, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useEffect, useLayoutEffect, useState } from 'react';
import { parseISODate, useBookingSearch } from '../context/BookingSearchContext';
import { CONTACT } from '../data/content';
import { linkClick, navigate, useLocation } from '../router';
import { BookingFlowProvider, storedSearch, useBookingFlow } from './BookingFlowContext';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { DetailsStep } from './steps/DetailsStep';
import { PaymentStep } from './steps/PaymentStep';
import { RoomsStep } from './steps/RoomsStep';

// /book, /book/details, /book/payment, /book/confirmation — the on-site
// booking flow, laid out like SiteMinder's own engine: pick rooms and rates,
// add the guest's details, pay through 2C2P without leaving the page, and get
// a confirmation. Loaded only when someone heads here (React.lazy in App).

const STEPS = [
  { path: '/book', label: 'Rooms' },
  { path: '/book/details', label: 'Your details' },
  { path: '/book/payment', label: 'Payment' },
  { path: '/book/confirmation', label: 'Confirmed' },
];

const toInt = (value: string | null) => (value && /^\d{1,2}$/.test(value) ? Number(value) : null);

export default function BookingApp() {
  const { query } = useLocation();
  const search = useBookingSearch();
  const [synced, setSynced] = useState(false);

  // Before anything renders, take the stay from the link (/book?checkIn=…),
  // or — on a page without one, like the confirmation after a bank redirect —
  // from the booking already in progress.
  useLayoutEffect(() => {
    const params = query.has('checkIn') ? query : storedSearch() ?? query;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const checkIn = parseISODate(params.get('checkIn'));
    const checkOut = parseISODate(params.get('checkOut'));
    if (checkIn && checkOut && checkIn >= today && checkOut > checkIn) search.setRange(checkIn, checkOut);
    const adults = toInt(params.get('adults'));
    if (adults && adults <= 12) search.setAdults(adults);
    const children = toInt(params.get('children'));
    if (children !== null && children <= 8) search.setChildren(children);
    if (params.has('promo')) search.setPromoCode((params.get('promo') ?? '').trim().slice(0, 40));
    setSynced(true);
    // Once, on arrival — afterwards the page drives the search, not the URL.
  }, []);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Book your stay — Hula Hula Resort';
    return () => { document.title = previous; };
  }, []);

  if (!synced) return null;
  return <BookingFlowProvider><BookingShell /></BookingFlowProvider>;
}

function BookingShell() {
  const { pathname } = useLocation();
  const { cart, payment } = useBookingFlow();
  const step = Math.max(0, STEPS.findIndex((s) => s.path === pathname));

  // Steps can't be skipped: no rooms → back to rooms; no payment yet → details.
  const blockedTo = pathname === '/book/details' && cart.length === 0 ? '/book'
    : pathname === '/book/payment' && !payment ? (cart.length ? '/book/details' : '/book')
    : null;
  useEffect(() => { if (blockedTo) navigate(blockedTo, { replace: true }); }, [blockedTo]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);

  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 14, md: 10 } }}>
    <BookingHeader />
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Stepper activeStep={step} alternativeLabel sx={{ my: { xs: 3, md: 4 }, '& .MuiStepLabel-label': { fontSize: { xs: 11, sm: 13 }, mt: '6px !important' } }}>
        {STEPS.map((s) => <Step key={s.path}><StepLabel>{s.label}</StepLabel></Step>)}
      </Stepper>
      {blockedTo ? null
        : pathname === '/book/details' ? <DetailsStep />
        : pathname === '/book/payment' ? <PaymentStep />
        : pathname === '/book/confirmation' ? <ConfirmationStep />
        : <RoomsStep />}
    </Container>
  </Box>;
}

function BookingHeader() {
  return <Box component="header" sx={{ bgcolor: 'rgba(255,253,243,.96)', borderBottom: '1px solid', borderColor: 'divider' }}>
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ minHeight: { xs: 72, md: 88 } }}>
        <Link href="/" onClick={linkClick('/')} aria-label="Hula Hula Resort home" sx={{ display: 'inline-flex', lineHeight: 0 }}>
          <Box component="img" src="/logo/hula-hula.svg" alt="Hula Hula Resort" sx={{ height: { xs: 52, md: 64 }, width: 'auto', aspectRatio: '159 / 137.25' }} />
        </Link>
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
          <Stack sx={{ display: { xs: 'none', sm: 'flex' }, textAlign: 'right' }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Questions about your booking?</Typography>
            <Link href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: .5, justifyContent: 'flex-end' }}><WhatsApp sx={{ fontSize: 16 }} />{CONTACT.phone}</Link>
          </Stack>
          <Button href="/#arrival" onClick={linkClick('/#arrival')} size="small" variant="outlined" startIcon={<West sx={{ fontSize: 16 }} />}>Resort</Button>
        </Stack>
      </Stack>
    </Container>
  </Box>;
}
