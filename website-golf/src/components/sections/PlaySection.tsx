import East from '@mui/icons-material/East';
import { Box, Container } from '@mui/material';
import { bookHref } from '../../booking/BookingFlowContext';
import { playCards } from '../../data/content';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { navigate } from '../../router';
import { CarouselCard } from '../common/CarouselCard';
import { DragCarousel } from '../common/DragCarousel';
import { SunDoodle } from '../common/VacationDecor';

// Everything there is to play, one card each, every card straight into its tee sheet.
export function PlaySection() {
  return <Box id="play" component="section" sx={{ position: 'relative', bgcolor: 'primary.main', color: 'white', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl" sx={{ py: { xs: 6, md: 8 }, position: 'relative' }}>
      <SunDoodle size={100} color="#f9f70c" sx={{ position: 'absolute', right: 180, top: 28, display: { xs: 'none', md: 'block' }, transform: 'rotate(12deg)' }} />
      <DragCarousel sectionKicker="Five ways to play. Zero dress rehearsal." heading={<>Swing a little.<br /><Box component="span" color="secondary.main">Laugh a lot.</Box></>} items={playCards} itemLabel="activity"
        renderCard={(item, active, onClick) => <CarouselCard {...item} active={active} onClick={onClick} ctaLabel="Book this" onCta={() => navigate(bookHref({ activity: item.activity }))} ctaIcon={<East sx={{ fontSize: 17 }} />} />} />
    </Container>
  </Box>;
}
