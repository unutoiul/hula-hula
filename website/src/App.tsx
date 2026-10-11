import { Box } from '@mui/material';
import { eventFacts, experiences, meals, navItems } from './data/content';
import { BookingSearchProvider } from './context/BookingSearchContext';
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
import { ScrollCraftRuntime } from './components/common/ScrollCraftRuntime';
import { MotionPreferenceProvider, useMotionPreference } from './context/MotionPreferenceContext';

function ResortPage() {
  const { reduced } = useMotionPreference();
  return <Box component="main" id="top" data-motion={reduced ? 'off' : 'on'}>
    <ScrollCraftRuntime />
    <CookieConsent />
    <Header navItems={navItems} />
    <BookingSearchProvider>
      <Hero />
      <HotelSection />
      <FloatingBreakfastSection />
      <RestaurantSection meals={meals} />
      <ActivitiesSection experiences={experiences} />
      <ResortPromotionsSection />
      <GallerySection />
      <EventsSection eventFacts={eventFacts} />
      <ArrivalSection />
    </BookingSearchProvider>
    <ContactSection />
    <Footer />
  </Box>;
}

function App() { return <MotionPreferenceProvider><ResortPage /></MotionPreferenceProvider>; }

export default App;
