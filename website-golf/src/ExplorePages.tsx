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
import { RentalCard } from './components/activities/RentalCard';
import { thingsToDo } from './activities/things';
import { useSite } from './context/SiteDataContext';
import { useUpcomingEvents } from './events/api';
import { linkClick } from './router';
import { useEffect } from 'react';
import { SECTION_Y } from './layoutConstants';

const pages: Record<string, [string, string, string, string]> = {
  '/activities': ['Find your kind of fun.', 'A round of golf, a first swing, a game with friends. Discover the experiences that make a day at Hula Hula your own.', 'footgolfGroup', 'Activities'],
  '/events': ['What’s on at Hula Hula.', 'Upcoming events, special offers and good reasons to get together. Find your next day on the fairways.', 'fairwayBalcony', 'Events & offers'],
  '/offers': ['More reasons to play.', 'Club offers and special packages. A little extra value for your next day on the fairways.', 'footgolfKick', 'Offers'],
  '/prices': ['Your day, clearly priced.', 'Compare rounds, activities and rental equipment. Prices in Thai baht, with inclusions shown for every experience.', 'golfSwing', 'Prices & packages'],
  '/clubhouse': ['Stay for one more.', 'Coffee before your round. Lunch with a view. A comfortable seat after the last putt. Welcome to H Café & Restaurant.', 'cafeView', 'The clubhouse'],
  '/gallery': ['A day at Hula Hula.', 'Palms, fairways and good company. Explore the course, FootGolf and the clubhouse in pictures.', 'pondFairway', 'Gallery'],
  '/visit': ['See you on the first tee.', 'Find us near Krabi International Airport. Here’s everything you need for a relaxed day at the club.', 'clubhouse', 'Plan your visit'],
  '/contact': ['Let’s plan something good.', 'A booking, a group outing, or a question about the course. Our team is here to help.', 'fairwayBalcony', 'Contact the club'],
};

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
    {path === '/prices' && site.rentals.length > 0 && <Container maxWidth="xl" sx={{ py: SECTION_Y }}><SectionHeading eyebrow="Travel light" title="Rental club sets" description="Add equipment to your Golf or driving-range booking. Prices are per set." /><Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2,minmax(0,1fr))' }, gap: 3 }}>{site.rentals.map(r => <RentalCard key={r.id} rental={r} />)}</Box></Container>}
    {path === '/clubhouse' && <ClubhouseSection showIntro={false} />}
    {path === '/gallery' && <GallerySection showIntro={false} />}
    {path === '/visit' && <VisitSection />}
    {(path === '/visit' || path === '/contact') && <ContactSection />}
  </PublicPageLayout>;
}

