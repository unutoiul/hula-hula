import East from '@mui/icons-material/East';
import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { rooms } from '../../data/content';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { CarouselCard } from '../common/CarouselCard';
import { DragCarousel } from '../common/DragCarousel';
import { MetaLabel } from '../common/MetaLabel';

export function HotelSection() {
  return <>
    <Container id="hotel" maxWidth="xl" sx={{ py: SECTION_Y, display: 'grid', gridTemplateColumns: { md: '25% 1fr' }, gap: 4, scrollMarginTop: SECTION_SCROLL_OFFSET }}>
      <MetaLabel>01 / The hotel</MetaLabel>
      <Box>
        <Typography variant="h2" sx={{ maxWidth: 820, fontSize: { xs: 32, md: 54 }, lineHeight: .98 }}>A quiet stretch of Krabi coast, <Box component="em">between limestone hills and the Andaman Sea</Box>.</Typography>
        <Link href="#ways" color="inherit" underline="none" variant="button" sx={{ display: 'inline-flex', alignItems: 'center', gap: 2.5, mt: 5, borderBottom: '1px solid', pb: 1 }}>Meet your hideaway <East /></Link>
      </Box>
    </Container>

    <Container maxWidth="xl" sx={{ pb: { xs: 11, md: 18 } }}>
      <DragCarousel
        sectionKicker="Rooms & villas"
        heading={<>Five ways to<br /><Box component="em">stay a while.</Box></>}
        items={rooms}
        itemLabel="room"
        slotWidth={{ xs: 280, sm: 380, md: 460 }}
        onDark={false}
        renderCard={(item, active, onClick) => (
          <CarouselCard key={item.id} {...item} active={active} onClick={onClick} ctaLabel="Book now" ctaHref="#arrival" ctaIcon={<East sx={{ fontSize: 16 }} />} />
        )}
      />
    </Container>

    <Box sx={{ py: 2.4, bgcolor: 'primary.light' }}>
      <Container maxWidth="xl">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
          <MetaLabel>A softer kind of luxury</MetaLabel>
          <Typography variant="h3" sx={{ fontSize: 24, fontStyle: 'italic' }}>Here, Krabi does the talking.</Typography>
        </Stack>
      </Container>
    </Box>
  </>;
}
