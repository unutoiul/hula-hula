import { Box, CircularProgress, Container } from '@mui/material';
import { lazy, Suspense, useEffect, useMemo, useRef } from 'react';
import { navItems } from './data/content';
import type { NavItem } from './types';
import { BookingSearchProvider } from './context/BookingSearchContext';
import { ContactFormProvider } from './context/ContactFormContext';
import { CookieConsent } from './components/layout/CookieConsent';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { LandingHero as Hero } from './components/landing/LandingHero';
import { ArrivalSection } from './components/sections/ArrivalSection';
import { ContactSection } from './components/sections/ContactSection';
import { DineSection } from './components/sections/DineSection';
import { ExploreSection } from './components/sections/ExploreSection';
import { FacilitiesSection } from './components/sections/FacilitiesSection';
import { GallerySection } from './components/sections/GallerySection';
import { HighlightsSection } from './components/sections/HighlightsSection';
import { MeetSection } from './components/sections/MeetSection';
import { ProgrammeSection } from './components/sections/ProgrammeSection';
import { RoomsSection } from './components/sections/RoomsSection';
import { TickTockSection } from './components/sections/TickTockSection';
import { LandingIntro as WelcomeSection } from './components/landing/LandingIntro';
import { WellnessSection } from './components/sections/WellnessSection';
import { MotionPreferenceProvider } from './context/MotionPreferenceContext';
import { SiteContentProvider, useSiteContent } from './context/SiteContentContext';
import { useLocation } from './router';
import { PageMetadata } from './PageMetadata';
import { brand, fonts } from './theme';

// "Offers" (or "What's on" when there are only events) joins the menu while
// the offers section has something to show.
function HotelHeader() {
  const { offers, events } = useSiteContent();
  const label = offers.length || !events.length ? 'Offers' : 'What’s on';
  const items = useMemo<NavItem[]>(() => {
    if (!label) return navItems;
    const at = navItems.findIndex(([, href]) => href === '#contact');
    return [...navItems.slice(0, at), [label, '#offers'], ...navItems.slice(at)];
  }, [label]);
  return <Header navItems={items} />;
}

function HotelPage() {
  // Nothing tilted or bobbing near an edge may widen the page: clip sideways
  // overflow here (clip, unlike hidden, doesn't create a scroll container).
  return <Box component="main" id="top" sx={{
    overflowX: 'hidden', '@supports (overflow: clip)': { overflowX: 'clip' }, bgcolor: brand.cream,
    '& .MuiTypography-h2, & .MuiTypography-h3': { fontFamily: fonts.serif, fontWeight: 400, letterSpacing: '-.035em' },
    '& :is(a, button):focus-visible': { outline: `2px solid ${brand.royal}`, outlineOffset: 5 },
    '& > section:not(#welcome)': { borderBottom: '1px solid #e8ced755' },
    '@media (prefers-reduced-motion: reduce)': { '& *': { scrollBehavior: 'auto !important' } },
  }}>
    <CookieConsent />
    <HotelHeader />
    <Hero />
    <WelcomeSection />
    <RoomsSection />
    <Container maxWidth="xl"><HighlightsSection /></Container>
    <TickTockSection />
    <DineSection />
    <WellnessSection />
    <ProgrammeSection />
    <FacilitiesSection />
    <MeetSection />
    <ExploreSection />
    <GallerySection />
    <ArrivalSection />
    <ContactSection />
    <Footer />
  </Box>;
}

// The booking pages, the room/meeting/experience pages and the CMS are separate bundles, fetched only when someone goes there.
const BookingApp = lazy(() => import('./booking/BookingApp'));
const InnerPages = lazy(() => import('./pages/InnerPages'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

const loading = <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}><CircularProgress aria-label="Loading" /></Box>;
const isInnerPage = (pathname: string) => pathname.startsWith('/rooms/') || pathname.startsWith('/meetings') || pathname.startsWith('/experiences');

function Routes() {
  const { pathname, hash } = useLocation();
  // Moving between pages (not the first load, where the browser restores the
  // scroll itself): start at the top, or at the section in the link (/#arrival).
  const firstLoad = useRef(true);
  useEffect(() => {
    const initial = firstLoad.current;
    firstLoad.current = false;
    if (pathname.startsWith('/admin') || pathname.startsWith('/book')) return;
    if (!hash) {
      if (!initial) window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    // On a direct link React (or a lazy page) may not have mounted the anchor
    // when the browser first tries to find it. Wait for that content to exist.
    const scrollToAnchor = () => {
      const target = document.getElementById(hash.slice(1));
      if (!target) return false;
      target.scrollIntoView({ behavior: 'instant' });
      return true;
    };
    if (scrollToAnchor()) return;
    const observer = new MutationObserver(() => { if (scrollToAnchor()) observer.disconnect(); });
    observer.observe(document.getElementById('root')!, { childList: true, subtree: true });
    const timeout = window.setTimeout(() => observer.disconnect(), 3000);
    return () => { observer.disconnect(); window.clearTimeout(timeout); };
  }, [pathname, hash]);

  if (pathname.startsWith('/admin')) return <Suspense fallback={loading}><AdminApp /></Suspense>;
  // The search (dates, guests), the CMS content and the contact popup carry across every page.
  return <BookingSearchProvider><ContactFormProvider><SiteContentProvider>
    {pathname.startsWith('/book') ? <Suspense fallback={loading}><BookingApp /></Suspense>
      : isInnerPage(pathname) ? <Suspense fallback={loading}><InnerPages /></Suspense>
        : <HotelPage />}
  </SiteContentProvider></ContactFormProvider></BookingSearchProvider>;
}

function App() { return <MotionPreferenceProvider><PageMetadata /><Routes /></MotionPreferenceProvider>; }

export default App;
