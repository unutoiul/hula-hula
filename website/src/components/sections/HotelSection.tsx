import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { rooms } from '../../data/content';
import { photoAssets as p } from '../../data/photos';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { CarouselCard } from '../common/CarouselCard';
import { DragCarousel } from '../common/DragCarousel';
import { ResortPhoto } from '../common/ResortPhoto';
import { Sticker, SunDoodle } from '../common/VacationDecor';

export function HotelSection() {
  return <Box id="hotel" component="section" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET, pb: SECTION_Y }}>
    <Container maxWidth="xl">
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: { xs: 5, md: 9 }, alignItems: 'center', py: { xs: 5, md: 9 }, mb: { xs: 6, md: 8 } }}>
        <Box data-sc-in sx={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.3fr .8fr', gap: 2, alignItems: 'center' }}>
          <Box sx={{ height: { xs: 310, md: 420 }, borderRadius: '24px 24px 90px 24px', overflow: 'hidden' }}><ResortPhoto image={p.poolOverview.src} alt="Hula Hula's tropical swimming pool and swim-up bar" /></Box>
          <Box sx={{ height: { xs: 260, md: 330 }, overflow: 'hidden', border: '6px solid white', borderRadius: 3, transform: 'rotate(5deg)' }}><ResortPhoto image={p.garden.src} alt="Palm-lined garden path between Hula Hula villas" sizes="25vw" /></Box>
          <Sticker sx={{ position: 'absolute', bottom: -30, left: '45%' }}>Hello,<br />holiday!</Sticker>
        </Box>
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: 42, md: 59 }, lineHeight: 1.06, mt: 2 }}>Check in.<br />Chill out.<br /><Box component="span" color="primary.main">Hula a little.</Box></Typography>
          <Typography sx={{ mt: 3, color: 'text.secondary', fontSize: 16, lineHeight: 1.8, maxWidth: 440 }}>Tucked into the tropical greenery of Ao Nang, our little corner of Krabi is made for easy mornings, poolside afternoons, and the people you love being with.</Typography>
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 3 }}><Button href="#room-gallery" color="inherit" endIcon={<ArrowOutward />}>Come on in</Button><SunDoodle size={54} color="#50830d" /></Stack>
        </Box>
      </Box>
      <Box id="room-gallery" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}>
        <DragCarousel sectionKicker="Rooms, suites & villas" heading={<>Sweet dreams.<br /><Box component="span" color="primary.main">Even sweeter stays.</Box></>} items={rooms} itemLabel="room" onDark={false}
          renderCard={(item, active, onClick) => <CarouselCard {...item} active={active} onClick={onClick} ctaLabel="Make it your stay" ctaHref="#arrival" ctaIcon={<ArrowOutward sx={{ fontSize: 17 }} />} />} />
      </Box>
    </Container>
  </Box>;
}
