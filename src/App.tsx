import { Box } from '@mui/material';
import { eventFacts, experiences, meals, navItems } from './data/content';
import { CookieConsent } from './components/layout/CookieConsent';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Hero } from './components/hero/Hero';
import { ActivitiesSection } from './components/sections/ActivitiesSection';
import { ArrivalSection } from './components/sections/ArrivalSection';
import { ContactSection } from './components/sections/ContactSection';
import { EventsSection } from './components/sections/EventsSection';
import { HotelSection } from './components/sections/HotelSection';
import { RestaurantSection } from './components/sections/RestaurantSection';

function App() {
  return <Box component="main" id="top">
    <CookieConsent />
    <Header navItems={navItems} />
    <Hero />
    <HotelSection />
    <RestaurantSection meals={meals} />
    <ActivitiesSection experiences={experiences} />
    <EventsSection eventFacts={eventFacts} />
    <ArrivalSection />
    <ContactSection />
    <Footer />
  </Box>;
}

export default App;
