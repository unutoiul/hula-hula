import Call from '@mui/icons-material/Call';
import { Box, Container } from '@mui/material';
import { CONTACT } from '../../data/content';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import type { CarouselCardData } from '../../types';
import { CarouselCard } from '../common/CarouselCard';
import { DragCarousel } from '../common/DragCarousel';

export function ActivitiesSection({ experiences }: { experiences: CarouselCardData[] }) {
  return <Box id="ways" component="section" sx={{ py: SECTION_Y, bgcolor: 'primary.dark', color: 'primary.contrastText', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl">
      <DragCarousel
        sectionKicker="03 / Activities"
        heading={<>More of Krabi,<br /><Box component="em">at your pace.</Box></>}
        items={experiences}
        itemLabel="activity"
        slotWidth={{ xs: 230, sm: 300, md: 340 }}
        renderCard={(item, active, onClick) => (
          <CarouselCard key={item.id} {...item} active={active} onClick={onClick}
            ctaLabel="Call us" ctaHref={CONTACT.tel} ctaIcon={<Call sx={{ fontSize: 16 }} />} ctaIconPosition="start"
          />
        )}
      />
    </Container>
  </Box>;
}
