import { Box, CircularProgress } from '@mui/material';
import { lazy, Suspense, useEffect, useMemo, useRef } from 'react';
import { eventFacts, meals, navItems } from './data/content';
import type { NavItem } from './types';
import { BookingSearchProvider } from './context/BookingSearchContext';
import { ContactFormProvider } from './context/ContactFormContext';
import { CookieConsent } from './components/layout/CookieConsent';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Hero } from './components/hero/Hero';
import { ActivitiesSection } from './components/sections/ActivitiesSection';
import { ArrivalSection } from './components/sections/ArrivalSection';
import { ContactSection } from './components/sections/ContactSection';
import { EventsSection } from './components/sections/EventsSection';
import { HotelSection } from './components/sections/HotelSection';
import { GallerySection } from './components/sections/GallerySection';
import { RestaurantSection } from './components/sections/RestaurantSection';
import { FloatingBreakfastSection } from './components/sections/FloatingBreakfastSection';
import { ResortPromotionsSection } from './components/sections/ResortPromotionsSection';
import { MotionPreferenceProvider } from './context/MotionPreferenceContext';
import { SiteContentProvider, useSiteContent } from './context/SiteContentContext';
import { useLocation } from './router';
import { BeachBall, Bubbles, Gulls, Longtail, PaperBoat, RisingSun, SEAM, SectionSeam, SwimRing } from './components/common/SectionSeam';

// "Offers" (or "What's on" when there are only events) joins the menu, before
// Celebrate, while the "Offers & what's on" section has something to show.
function ResortHeader() {
  const { offers, events } = useSiteContent();
  const label = offers.length ? 'Offers' : events.length ? 'What’s on' : null;
  const items = useMemo<NavItem[]>(() => {
    if (!label) return navItems;
    const at = navItems.findIndex(([, href]) => href === '#events');
    return [...navItems.slice(0, at), [label, '#offers'], ...navItems.slice(at)];
  }, [label]);
  return <Header navItems={items} />;
}

function ResortPage() {
  // Nothing tilted or bobbing near an edge may widen the page: clip sideways
  // overflow here (clip, unlike hidden, doesn't create a scroll container).
  return <Box component="main" id="top" sx={{ overflowX: 'hidden', '@supports (overflow: clip)': { overflowX: 'clip' } }}>
    <CookieConsent />
    <SiteContentProvider>
      <ResortHeader />
      <Hero />
      <HotelSection />
      {/* Every change of section colour gets the same wave; a few of them carry
          one bobbing sticker each, every sticker used once down the page. */}
      <SectionSeam from={SEAM.cream} to={SEAM.pool}><Bubbles /></SectionSeam>
      <FloatingBreakfastSection />
      <SectionSeam from={SEAM.pool} to={SEAM.lime} mirror><SwimRing left="80%" /></SectionSeam>
      <RestaurantSection meals={meals} />
      <SectionSeam from={SEAM.lime} to={SEAM.sea}><Longtail left="10%" /></SectionSeam>
      <ActivitiesSection />
      <SectionSeam from={SEAM.sea} to={SEAM.lime} mirror><BeachBall left="74%" /></SectionSeam>
      <ResortPromotionsSection />
      <SectionSeam from={SEAM.lime} to={SEAM.cream}><Gulls left="70%" /></SectionSeam>
      <GallerySection />
      <EventsSection eventFacts={eventFacts} />
      <SectionSeam from={SEAM.cream} to={SEAM.pool} mirror><PaperBoat left="82%" /></SectionSeam>
      <ArrivalSection />
      <SectionSeam from={SEAM.pool} to={SEAM.cream} />
      <ContactSection />
      <SectionSeam from={SEAM.cream} to={SEAM.sun} mirror behind={<RisingSun left="78%" />} />
      <Footer />
    </SiteContentProvider>
  </Box>;
}

// The booking pages and the CMS are separate bundles, fetched only when someone goes there.
const BookingApp = lazy(() => import('./booking/BookingApp'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

const loading = <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}><CircularProgress aria-label="Loading" /></Box>;

function Routes() {
  const { pathname } = useLocation();
  // Moving between pages (not the first load, where the browser restores the
  // scroll itself): start at the top, or at the section in the link (/#arrival).
  const firstLoad = useRef(true);
  useEffect(() => {
    if (firstLoad.current) { firstLoad.current = false; return; }
    const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
    if (target) target.scrollIntoView();
    else if (pathname === '/') window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  if (pathname.startsWith('/admin')) return <Suspense fallback={loading}><AdminApp /></Suspense>;
  // The search (dates, guests) and the contact popup carry across the homepage and /book.
  return <BookingSearchProvider><ContactFormProvider>
    {pathname.startsWith('/book') ? <Suspense fallback={loading}><BookingApp /></Suspense> : <ResortPage />}
  </ContactFormProvider></BookingSearchProvider>;
}

function App() { return <MotionPreferenceProvider><Routes /></MotionPreferenceProvider>; }

export default App;
