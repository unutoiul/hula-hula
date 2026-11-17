import { Box, Button, Container } from '@mui/material';
import { ThingCard } from './components/activities/ThingCard';
import { PublicPageLayout } from './components/layout/PublicPageLayout';
import { PricesSection } from './components/sections/PricesSection';
import { ClubhouseSection } from './components/sections/ClubhouseSection';
import { GallerySection } from './components/sections/GallerySection';
import { VisitSection } from './components/sections/VisitSection';
import { ContactSection } from './components/sections/ContactSection';
import { EventsSection } from './components/sections/EventsSection';
import { OffersSection } from './components/sections/OffersSection';
import { PageIntro } from './components/layout/PageIntro';
import { SectionHeading } from './components/common/SectionHeading';
import { SEAM } from './components/common/SectionSeam';
import { RentalSets } from './components/activities/RentalCard';
import { thingsToDo } from './activities/things';
import { useSite } from './context/SiteDataContext';
import { useUpcomingEvents } from './events/api';
import { linkClick } from './router';
import { useEffect } from 'react';
import { explorePages as pages } from './data/exploreCopy';
import { SECTION_Y } from './layoutConstants';


export default function ExplorePages({ path }: { path: string }) {
  const site = useSite();
  const { events, loaded } = useUpcomingEvents(path === '/events');
  const [title, description, image, eyebrow] = pages[path] ?? pages['/activities'];
  useEffect(() => { document.title = `${eyebrow} — Hula Hula Golf Club`; }, [eyebrow]);
  // Events & offers, Offers and (without rental sets) Prices end on a lime band.
  const endsLime = path === '/events' || path === '/offers' || (path === '/prices' && site.rentals.length === 0);
  return <PublicPageLayout footerFrom={endsLime ? SEAM.lime : undefined}>
    <PageIntro title={title} description={description} image={`/images/golf/${image}-1600.webp`} eyebrow={eyebrow}><Button href="/book" onClick={linkClick('/book')} variant="contained">Book your day</Button>{path !== '/offers' && <Button href="/offers" onClick={linkClick('/offers')}>Explore offers →</Button>}</PageIntro>
    {path === '/activities' && <Container maxWidth="xl" sx={{ py: SECTION_Y }}><SectionHeading eyebrow="Make it your day" title="A little something for everyone." description="Choose an experience for its details, prices and booking options." /><Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2,minmax(0,1fr))', md: 'repeat(3,minmax(0,1fr))' }, gap: 3 }}>{thingsToDo(site).map(thing => <ThingCard key={thing.id} thing={thing} sizes="(max-width: 600px) 92vw, (max-width: 900px) 45vw, 30vw" />)}</Box></Container>}
    {path === '/events' && <><EventsSection events={events} loaded={loaded} /><OffersSection /></>}
    {path === '/prices' && <PricesSection showIntro={false} />}
    {path === '/offers' && <OffersSection />}
    {path === '/prices' && site.rentals.length > 0 && <Container maxWidth="xl" sx={{ py: SECTION_Y }}><SectionHeading eyebrow="Travel light" title="Rentals" description="Add equipment when you book. Prices are per set." /><RentalSets rentals={site.rentals} /></Container>}
    {path === '/clubhouse' && <ClubhouseSection showIntro={false} />}
    {path === '/gallery' && <GallerySection showIntro={false} />}
    {path === '/visit' && <VisitSection />}
    {(path === '/visit' || path === '/contact') && <ContactSection />}
  </PublicPageLayout>;
}

