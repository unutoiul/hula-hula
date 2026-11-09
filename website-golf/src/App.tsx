import { Box, CircularProgress } from '@mui/material';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { CookieConsent } from './components/layout/CookieConsent';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Hero } from './components/hero/Hero';
import { CourseSection } from './components/sections/CourseSection';
import { ActivitiesSection } from './components/sections/ActivitiesSection';
import { EventsSection } from './components/sections/EventsSection';
import { OffersSection } from './components/sections/OffersSection';
import { activeOffers } from './booking/offers';
import { ClubhouseSection } from './components/sections/ClubhouseSection';
import { GallerySection } from './components/sections/GallerySection';
import { PricesSection } from './components/sections/PricesSection';
import { PostcardsSection } from './components/sections/PostcardsSection';
import { VisitSection } from './components/sections/VisitSection';
import { ContactSection } from './components/sections/ContactSection';
import { FootBall, GolfBalls, Gulls, PinFlag, SEAM, SectionSeam } from './components/common/SectionSeam';
import { MotionPreferenceProvider } from './context/MotionPreferenceContext';
import { SiteDataProvider, useSite } from './context/SiteDataContext';
import { useUpcomingEvents } from './events/api';
import { useLocation } from './router';

function ClubPage() {
  // Published events get priority; no empty event band on the homepage.
  const { events, loaded } = useUpcomingEvents();
  const { club } = useSite();
  const hasOffers = activeOffers(club.offers).length > 0;
  useEffect(() => { document.title = 'Hula Hula Golf Club | Tropical Golf & FootGolf near Krabi Airport'; }, []);
  // Nothing tilted or bobbing near an edge may widen the page: clip sideways
  // overflow here (clip, unlike hidden, doesn't create a scroll container).
  return <Box id="top" sx={{ overflowX: 'hidden', '@supports (overflow: clip)': { overflowX: 'clip' } }}>
    <CookieConsent />
    <Header />
    <Box component="main" id="main-content" tabIndex={-1}>
    <Hero nextEvent={events[0]} />
    {events.length > 0 && <><SectionSeam from={SEAM.cream} to={SEAM.forest} /><EventsSection events={events} loaded={loaded} home /><SectionSeam from={SEAM.forest} to={hasOffers ? SEAM.lime : SEAM.cream} mirror /></>}
    {hasOffers && <>{events.length === 0 && <SectionSeam from={SEAM.cream} to={SEAM.lime} />}<OffersSection preview /><SectionSeam from={SEAM.lime} to={SEAM.cream} mirror /></>}
    <CourseSection />
    <SectionSeam from={SEAM.cream} to={SEAM.sea}><PinFlag left="78%" /></SectionSeam>
    <ActivitiesSection />
    <SectionSeam from={SEAM.sea} to={SEAM.lime} mirror><FootBall left="14%" /></SectionSeam>
    <PricesSection preview />
    <SectionSeam from={SEAM.lime} to={SEAM.cream}><GolfBalls /></SectionSeam>
    <PostcardsSection />
    <ClubhouseSection />
    <GallerySection preview />
    <SectionSeam from={SEAM.cream} to={SEAM.pool} mirror><Gulls left="72%" /></SectionSeam>
    <VisitSection />
    <SectionSeam from={SEAM.pool} to={SEAM.cream} />
    <ContactSection />
    </Box>
    <Footer />
  </Box>;
}


// The booking pages, event pages and the staff app are separate bundles, fetched only when someone goes there.
const BookingApp = lazy(() => import('./booking/BookingApp'));
const EventsApp = lazy(() => import('./events/EventsApp'));
const ActivityApp = lazy(() => import('./activities/ActivityApp'));
const AdminApp = lazy(() => import('./admin/AdminApp'));
const ExplorePages = lazy(() => import('./ExplorePages'));

const loading = <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}><CircularProgress aria-label="Loading" /></Box>;

function Routes() {
  const { pathname } = useLocation();
  // Moving between pages (not the first load, where the browser restores the
  // scroll itself): start at the top, or at the section in the link (/#prices).
  const firstLoad = useRef(true);
  useEffect(() => {
    if (firstLoad.current) { firstLoad.current = false; return; }
    const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  if (['/activities', '/events', '/offers', '/prices', '/clubhouse', '/gallery', '/visit', '/contact'].includes(pathname)) return <Suspense fallback={loading}><ExplorePages path={pathname} /></Suspense>;
  if (pathname.startsWith('/admin')) return <Suspense fallback={loading}><AdminApp /></Suspense>;
  if (pathname.startsWith('/events')) return <Suspense fallback={loading}><EventsApp /></Suspense>;
  if (pathname === '/course' || pathname.startsWith('/activities')) return <Suspense fallback={loading}><ActivityApp /></Suspense>;
  return pathname.startsWith('/book') ? <Suspense fallback={loading}><BookingApp /></Suspense> : <ClubPage />;
}

function App() { return <MotionPreferenceProvider><SiteDataProvider><Routes /></SiteDataProvider></MotionPreferenceProvider>; }

export default App;
