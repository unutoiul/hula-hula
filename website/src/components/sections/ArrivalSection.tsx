import { Box, Container, Stack, Typography } from '@mui/material';
import { BookingPanel } from '../booking/BookingPanel';
import { MetaLabel } from '../common/MetaLabel';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';

export function ArrivalSection() {
  return <Box id="arrival" component="section" sx={{ py: SECTION_Y, bgcolor: 'background.paper', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl">
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 5, lg: 6 }} alignItems={{ lg: 'flex-start' }}>
        <Box sx={{ maxWidth: { lg: 340 }, flexShrink: 0 }}>
          <MetaLabel>Book your stay</MetaLabel>
          <Typography variant="h2" sx={{ mt: 2.5, fontSize: { xs: 32, md: 38 }, lineHeight: 1.12 }}>Pick your dates.</Typography>
          <Typography sx={{ mt: 2.5, fontSize: 15, lineHeight: 1.6, color: 'text.secondary' }}>Twenty minutes from Krabi International Airport. We'll handle the rest.</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BookingPanel />
        </Box>
      </Stack>
    </Container>
  </Box>;
}
