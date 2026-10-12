import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Box, Container } from '@mui/material';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import type { CarouselCardData } from '../../types';
import { CarouselCard } from '../common/CarouselCard';
import { DragCarousel } from '../common/DragCarousel';
import { SunDoodle } from '../common/VacationDecor';
import { useContactForm } from '../../context/ContactFormContext';

export function ActivitiesSection({ experiences }: { experiences: CarouselCardData[] }) {
  const openContact = useContactForm();
  return <Box id="ways" component="section" sx={{ bgcolor: 'primary.main', color: 'white', scrollMarginTop: SECTION_SCROLL_OFFSET, position: 'relative' }}>
    <Container maxWidth="xl" sx={{ py: { xs: 6, md: 8 }, position: 'relative' }}>
      <SunDoodle size={100} color="#f9f70c" sx={{ position: 'absolute', right: 180, top: 28, display: { xs: 'none', md: 'block' }, transform: 'rotate(12deg)' }} />
      <DragCarousel sectionKicker="Your holiday. Your kind of happy." heading={<>Do a little.<br /><Box component="span" color="secondary.main">Enjoy a lot.</Box></>} items={experiences} itemLabel="activity"
        renderCard={(item, active, onClick) => <CarouselCard {...item} active={active} onClick={onClick} ctaLabel="Help me plan this" onCta={() => openContact({ topic: item.title, message: `Hi Hula Hula! Could you help us plan “${item.title}” during our stay?`, page: 'Do a little. Enjoy a lot.' })} ctaIcon={<ChatBubbleOutlineRounded sx={{ fontSize: 17 }} />} />} />
    </Container>
  </Box>;
}
