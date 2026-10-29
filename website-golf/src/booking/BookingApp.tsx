import { Box, CircularProgress, Container, Step, StepLabel, Stepper } from '@mui/material';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { useSiteData } from '../context/SiteDataContext';
import { navigate, useLocation } from '../router';
import { BookingFlowProvider, searchFromQuery, useBookingFlow } from './BookingFlowContext';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { DetailsStep } from './steps/DetailsStep';
import { ExtrasStep } from './steps/ExtrasStep';
import { TeeTimeStep } from './steps/TeeTimeStep';

// /book, /book/extras, /book/details, /book/confirmation — the tee time
// booking flow, laid out the way golf booking engines usually are: pick the
// activity, day and group, choose a start from the tee sheet (held for a few
// minutes), add extras, give the lead player's details, and get a
// confirmation with a reference and a calendar entry. Loaded only when
// someone heads here (React.lazy in App).

const STEPS = [
  { path: '/book', label: 'Tee time' },
  { path: '/book/extras', label: 'Extras' },
  { path: '/book/details', label: 'Your details' },
  { path: '/book/confirmation', label: 'Booked' },
];

export default function BookingApp() {
  const { query } = useLocation();
  // Once, on arrival — afterwards the page drives the search, not the URL.
  const [initial] = useState(() => searchFromQuery(query));

  useEffect(() => {
    const previous = document.title;
    document.title = 'Book a tee time — Hula Hula Golf Club';
    return () => { document.title = previous; };
  }, []);

  // Prices and times must be the live ones before anything can be held or priced.
  const { ready } = useSiteData();
  if (!ready) return <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}><CircularProgress aria-label="Loading" /></Box>;
  return <BookingFlowProvider initial={initial}><BookingShell /></BookingFlowProvider>;
}

function BookingShell() {
  const { pathname } = useLocation();
  const { time, reservation } = useBookingFlow();
  const step = Math.max(0, STEPS.findIndex((s) => s.path === pathname));

  // Steps can't be skipped: no time held → back to the tee sheet; nothing booked → no confirmation.
  const blockedTo = (pathname === '/book/extras' || pathname === '/book/details') && !time ? '/book'
    : pathname === '/book/confirmation' && !reservation ? '/book'
    : null;
  useEffect(() => { if (blockedTo) navigate(blockedTo, { replace: true }); }, [blockedTo]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);

  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 14, md: 10 } }}>
    <PageHeader />
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Stepper activeStep={pathname === '/book/confirmation' ? STEPS.length : step} alternativeLabel sx={{ my: { xs: 3, md: 4 }, '& .MuiStepLabel-label': { fontSize: { xs: 11, sm: 13 }, mt: '6px !important' } }}>
        {STEPS.map((s) => <Step key={s.path}><StepLabel>{s.label}</StepLabel></Step>)}
      </Stepper>
      {blockedTo ? null
        : pathname === '/book/extras' ? <ExtrasStep />
        : pathname === '/book/details' ? <DetailsStep />
        : pathname === '/book/confirmation' ? <ConfirmationStep />
        : <TeeTimeStep />}
    </Container>
  </Box>;
}
