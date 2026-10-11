import { Box, Container, Stack, Typography } from '@mui/material';
import { SunDoodle } from '../common/VacationDecor';
import { BookingPanel } from '../booking/BookingPanel';
import { MetaLabel } from '../common/MetaLabel';
import { Reveal } from '../common/ScrollMotion';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';

export function ArrivalSection() {
  return <Box id="arrival" component="section" sx={{ py: SECTION_Y, bgcolor: 'primary.light', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl">
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 5, lg: 6 }} alignItems={{ lg: 'flex-start' }}>
        <Reveal sx={{ maxWidth: { lg: 340 }, flexShrink: 0, position: 'relative' }}>
          <SunDoodle size={78} color="#006d8a" sx={{ mb: 2 }} />
          <MetaLabel>Your next happy chapter</MetaLabel>
          <Typography variant="h2" sx={{ mt: 2.5, fontSize: { xs: 42, md: 52 }, lineHeight: 1.05 }}>Put a little<br />Hula in<br />your calendar.</Typography>
          <Typography sx={{ mt: 2.5, fontSize: 15, lineHeight: 1.8, color: 'text.secondary' }}>Pick your dates, bring your favourite people, and start looking forward to your Krabi escape.</Typography>
        </Reveal>
        <Reveal delay={0.12} sx={{ flex: 1, minWidth: 0 }}>
          <BookingPanel />
        </Reveal>
      </Stack>
    </Container>
  </Box>;
}
