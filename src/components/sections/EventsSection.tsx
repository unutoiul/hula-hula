import { Box, Container, Typography } from '@mui/material';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import type { EventFact } from '../../types';
import { MetaLabel } from '../common/MetaLabel';

export function EventsSection({ eventFacts }: { eventFacts: EventFact[] }) {
  return <Box id="events" component="section" sx={{ py: SECTION_Y, scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', gap: { xs: 6, md: 10 }, flexDirection: { xs: 'column', md: 'row' } }}>
      <Box sx={{ maxWidth: 560 }}>
        <MetaLabel>04 / Events & meetings</MetaLabel>
        <Typography variant="h2" sx={{ mt: 3, fontSize: { xs: 34, md: 58 }, lineHeight: .92 }}>Weddings, retreats,<br /><Box component="em">quiet celebrations.</Box></Typography>
        <Typography sx={{ mt: 3, maxWidth: 460, fontSize: 16, lineHeight: 1.6, color: 'text.secondary' }}>A garden lawn for vows at sunset, a private room for small meetings, and a team that handles the rest.</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: { xs: 4, md: 5 }, minWidth: { md: 340 }, pt: { md: 2 } }}>
        {eventFacts.map((fact) => <Box key={fact.label}>
          <Typography variant="h3" sx={{ fontSize: 36 }}>{fact.value}</Typography>
          <Typography variant="overline" sx={{ display: 'block', color: 'secondary.dark', mt: .6 }}>{fact.label}</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: .4 }}>{fact.unit}</Typography>
        </Box>)}
      </Box>
    </Container>
  </Box>;
}
