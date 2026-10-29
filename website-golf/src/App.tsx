import { Box, CircularProgress } from '@mui/material';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { navItems } from './data/content';
import { CookieConsent } from './components/layout/CookieConsent';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Hero } from './components/hero/Hero';
import { ClubhouseSection } from './components/sections/ClubhouseSection';
import { ContactSection } from './components/sections/ContactSection';
import { CourseSection } from './components/sections/CourseSection';
import { GallerySection } from './components/sections/GallerySection';
import { PlaySection } from './components/sections/PlaySection';
import { PricesSection } from './components/sections/PricesSection';
import { VisitSection } from './components/sections/VisitSection';
import { MotionPreferenceProvider } from './context/MotionPreferenceContext';
import { useLocation } from './router';
import { FootBall, GolfBalls, Gulls, PinFlag, RisingSun, SEAM, SectionSeam } from './components/common/SectionSeam';

function ClubPage() {
  // Nothing tilted or bobbing near an edge may widen the page: clip sideways
  // overflow here (clip, unlike hidden, doesn't create a scroll container).
  return <Box component="main" id="top" sx={{ overflowX: 'hidden', '@supports (overflow: clip)': { overflowX: 'clip' } }}>
    <CookieConsent />
    <Header navItems={navItems} />
    <Hero />
    <CourseSection />
    {/* Every change of section colour gets the same wave; a few of them carry
        one bobbing sticker each, every sticker used once down the page. */}
    <SectionSeam from={SEAM.cream} to={SEAM.sea}><PinFlag left="78%" /></SectionSeam>
    <PlaySection />
    <SectionSeam from={SEAM.sea} to={SEAM.lime} mirror><FootBall left="14%" /></SectionSeam>
    <PricesSection />
    <SectionSeam from={SEAM.lime} to={SEAM.cream}><GolfBalls /></SectionSeam>
    <ClubhouseSection />
    <GallerySection />
    <SectionSeam from={SEAM.cream} to={SEAM.pool} mirror><Gulls left="72%" /></SectionSeam>
    <VisitSection />
    <SectionSeam from={SEAM.pool} to={SEAM.cream} />
    <ContactSection />
    <SectionSeam from={SEAM.cream} to={SEAM.sun} mirror behind={<RisingSun left="78%" />} />
    <Footer />
  </Box>;
}

// The booking pages and the staff app are separate bundles, fetched only when someone goes there.
const BookingApp = lazy(() => import('./booking/BookingApp'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

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
    else if (pathname === '/') window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  if (pathname.startsWith('/admin')) return <Suspense fallback={loading}><AdminApp /></Suspense>;
  return pathname.startsWith('/book') ? <Suspense fallback={loading}><BookingApp /></Suspense> : <ClubPage />;
}

function App() { return <MotionPreferenceProvider><Routes /></MotionPreferenceProvider>; }

export default App;
