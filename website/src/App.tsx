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
import { MotionPreferenceProvider } from './context/MotionPreferenceContext';
import { BeachBall, Bubbles, Gulls, Longtail, PaperBoat, RisingSun, SEAM, SectionSeam, SwimRing } from './components/common/SectionSeam';

function ResortPage() {
  return <Box component="main" id="top">
    <CookieConsent />
    <Header navItems={navItems} />
    <BookingSearchProvider>
      <Hero />
      <HotelSection />
      {/* Every change of section colour gets the same wave; a few of them carry
          one bobbing sticker each, every sticker used once down the page. */}
      <SectionSeam from={SEAM.cream} to={SEAM.pool}><Bubbles /></SectionSeam>
      <FloatingBreakfastSection />
      <SectionSeam from={SEAM.pool} to={SEAM.lime} mirror><SwimRing left="80%" /></SectionSeam>
      <RestaurantSection meals={meals} />
      <SectionSeam from={SEAM.lime} to={SEAM.sea}><Longtail left="10%" /></SectionSeam>
      <ActivitiesSection experiences={experiences} />
      <SectionSeam from={SEAM.sea} to={SEAM.lime} mirror><BeachBall left="74%" /></SectionSeam>
      <ResortPromotionsSection />
      <SectionSeam from={SEAM.lime} to={SEAM.cream}><Gulls left="70%" /></SectionSeam>
      <GallerySection />
      <EventsSection eventFacts={eventFacts} />
      <SectionSeam from={SEAM.cream} to={SEAM.pool} mirror><PaperBoat left="82%" /></SectionSeam>
      <ArrivalSection />
    </BookingSearchProvider>
    <SectionSeam from={SEAM.pool} to={SEAM.cream} />
    <ContactSection />
    <SectionSeam from={SEAM.cream} to={SEAM.sun} mirror behind={<RisingSun left="78%" />} />
    <Footer />
  </Box>;
}

function App() { return <MotionPreferenceProvider><ResortPage /></MotionPreferenceProvider>; }

export default App;
