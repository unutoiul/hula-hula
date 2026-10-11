import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Container } from '@mui/material';
import { CONTACT } from '../../data/content';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import type { CarouselCardData } from '../../types';
import { CarouselCard } from '../common/CarouselCard';
import { DragCarousel } from '../common/DragCarousel';
import { SunDoodle, WaveEdge } from '../common/VacationDecor';

export function ActivitiesSection({ experiences }: { experiences: CarouselCardData[] }) {
  return <Box id="ways" component="section" sx={{ mt: { xs: 6, md: 10 }, bgcolor: 'primary.main', color: 'white', scrollMarginTop: SECTION_SCROLL_OFFSET, position: 'relative' }}>
    <WaveEdge flip />
    <Container maxWidth="xl" sx={{ py: { xs: 6, md: 8 }, position: 'relative' }}>
      <SunDoodle size={100} color="#f9f70c" sx={{ position: 'absolute', right: 180, top: 28, display: { xs: 'none', md: 'block' }, transform: 'rotate(12deg)' }} />
      <DragCarousel sectionKicker="Your holiday. Your kind of happy." heading={<>Do a little.<br /><Box component="span" color="secondary.main">Enjoy a lot.</Box></>} items={experiences} itemLabel="activity"
        renderCard={(item, active, onClick) => <CarouselCard {...item} active={active} onClick={onClick} ctaLabel="Help me plan this" ctaHref={CONTACT.whatsapp} ctaIcon={<ArrowOutward sx={{ fontSize: 17 }} />} />} />
    </Container>
    <WaveEdge />
  </Box>;
}
