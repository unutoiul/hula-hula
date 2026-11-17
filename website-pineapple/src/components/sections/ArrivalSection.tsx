import { Box, Container, Stack, Typography } from '@mui/material';
import { BookingPanel } from '../booking/BookingPanel';
import { MetaLabel } from '../common/MetaLabel';
import { Reveal } from '../common/ScrollMotion';
import { artwork } from '../landing/artwork';
import { SECTION_HEADING, SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';

export function ArrivalSection() {
  return <Box id="arrival" component="section" sx={{ py: SECTION_Y, bgcolor: '#fae7ed', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl">
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 5, lg: 6 }} alignItems={{ lg: 'flex-start' }}>
        <Reveal sx={{ maxWidth: { lg: 340 }, flexShrink: 0, position: 'relative', textAlign: { xs: 'center', lg: 'left' } }}>
          <Box component="img" src={artwork.swanMascot} alt="" aria-hidden="true" width={650} height={433} loading="lazy" sx={{ display: 'block', width: 165, height: 125, objectFit: 'contain', mb: 2, mx: { xs: 'auto', lg: 0 } }} />
          <MetaLabel>Book direct with the hotel</MetaLabel>
          <Typography variant="h2" sx={{ mt: 2, fontSize: SECTION_HEADING, lineHeight: 1.08 }}>Let’s make it<br />a date.</Typography>
          <Typography sx={{ mt: 2.5, fontSize: 15, lineHeight: 1.8, color: 'text.secondary' }}>Pick your dates and who’s coming. A balcony of your own and a little pink personality are waiting.</Typography>
        </Reveal>
        <Reveal delay={0.12} sx={{ flex: 1, minWidth: 0 }}>
          <BookingPanel />
        </Reveal>
      </Stack>
    </Container>
  </Box>;
}
