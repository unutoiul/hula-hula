import { Container } from '@mui/material';
import { Footer } from '../components/layout/Footer';
import { LandingIntro as WelcomeSection } from '../components/landing/LandingIntro';
import { ArrivalSection } from '../components/sections/ArrivalSection';
import { ContactSection } from '../components/sections/ContactSection';
import { DineSection } from '../components/sections/DineSection';
import { ExploreSection } from '../components/sections/ExploreSection';
import { FacilitiesSection } from '../components/sections/FacilitiesSection';
import { GallerySection } from '../components/sections/GallerySection';
import { HighlightsSection } from '../components/sections/HighlightsSection';
import { MeetSection } from '../components/sections/MeetSection';
import { ProgrammeSection } from '../components/sections/ProgrammeSection';
import { RoomsSection } from '../components/sections/RoomsSection';
import { TickTockSection } from '../components/sections/TickTockSection';
import { WellnessSection } from '../components/sections/WellnessSection';

/**
 * Everything on the homepage below the hero. It is its own bundle (see
 * App.tsx), so the hero renders without waiting for this code to download
 * and run. A fragment keeps the sections direct children of <main>, which
 * HotelPage's `& > section` styles rely on.
 */
export default function HomeSections() {
  return <>
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
  </>;
}
