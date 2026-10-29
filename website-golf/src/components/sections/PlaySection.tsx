import East from '@mui/icons-material/East';
import { Box, Container } from '@mui/material';
import { useMemo } from 'react';
import { bookHref } from '../../booking/BookingFlowContext';
import { useSite } from '../../context/SiteDataContext';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { navigate } from '../../router';
import { CarouselCard } from '../common/CarouselCard';
import { DragCarousel } from '../common/DragCarousel';
import { SunDoodle } from '../common/VacationDecor';

// Everything there is to play, one card each (the card text and photos are
// set per activity in /admin), every card straight into its tee sheet.
export function PlaySection() {
  const { activities } = useSite();
  const cards = useMemo(() => activities.filter((a) => a.card.images.length).map((a) => ({
    id: a.id, kicker: a.card.kicker || a.name, title: a.card.title || a.name, detail: a.card.detail || a.tagline, images: a.card.images,
  })), [activities]);
  if (!cards.length) return null;
  return <Box id="play" component="section" sx={{ position: 'relative', bgcolor: 'primary.main', color: 'white', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl" sx={{ py: { xs: 6, md: 8 }, position: 'relative' }}>
      <SunDoodle size={100} color="#f9f70c" sx={{ position: 'absolute', right: 180, top: 28, display: { xs: 'none', md: 'block' }, transform: 'rotate(12deg)' }} />
      <DragCarousel sectionKicker={`${cards.length} ways to play. Zero dress rehearsal.`} heading={<>Swing a little.<br /><Box component="span" color="secondary.main">Laugh a lot.</Box></>} items={cards} itemLabel="activity"
        renderCard={(item, active, onClick) => <CarouselCard {...item} active={active} onClick={onClick} ctaLabel="Book this" onCta={() => navigate(bookHref({ activity: item.id }))} ctaIcon={<East sx={{ fontSize: 17 }} />} />} />
    </Container>
  </Box>;
}
