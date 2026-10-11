import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { CONTACT } from '../../data/content';
import { photoAssets as p } from '../../data/photos';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import type { EventFact } from '../../types';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal, ScrollTilt } from '../common/ScrollMotion';
import { Sticker } from '../common/VacationDecor';

export function EventsSection({ eventFacts }: { eventFacts: EventFact[] }) {
  return <Box id="events" component="section" sx={{ py: SECTION_Y, scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl">
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1.1fr' }, gap: { xs: 5, md: 8 }, alignItems: 'center' }}>
        <Reveal><Typography variant="h2" sx={{ fontSize: { xs: 42, md: 60 }, mt: 2, lineHeight: 1.05 }}>Big smiles.<br /><Box component="span" color="primary.main">Happy occasions.</Box></Typography><Typography sx={{ mt: 3, lineHeight: 1.8, color: 'text.secondary', maxWidth: 420 }}>A celebration with your favourite people or a fresh setting for your next team gathering. Let’s make a little room for something memorable.</Typography>
          <Stack direction="row" spacing={4} sx={{ mt: 4 }}>{eventFacts.map(fact => <Box key={fact.label}><Typography variant="h3" sx={{ fontSize: 28, color: 'success.main' }}>{fact.value}</Typography><Typography sx={{ mt: .5, fontSize: 12, maxWidth: 165, color: 'text.secondary' }}>{fact.unit}</Typography></Box>)}</Stack>
          <Button href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" variant="outlined" endIcon={<ArrowOutward />} sx={{ mt: 4 }}>Let’s make a plan</Button>
        </Reveal>
        <Reveal delay={0.12} sx={{ position: 'relative', pb: 3 }}><Box sx={{ height: { xs: 310, md: 400 }, borderRadius: '100px 24px 24px 24px', overflow: 'hidden' }}><ResortPhoto image={p.banquet.src} alt="Banquet tables ready for a celebration at Hula Hula Resort" /></Box><ScrollTilt amount={-4} sx={{ width: '48%', mt: -10, ml: 'auto', mr: { xs: 0, md: -1 }, position: 'relative' }}><Box sx={{ height: { xs: 150, md: 190 }, overflow: 'hidden', border: '6px solid white', borderRadius: 3, transform: 'rotate(5deg)' }}><ResortPhoto image={p.meeting.src} alt="Hula Hula conference room with green tablecloths and a presentation stage" sizes="25vw" /></Box></ScrollTilt><Sticker color="#e7f4cc" sx={{ position: 'absolute', bottom: 28, left: 12 }}>Better<br />together.</Sticker></Reveal>
      </Box>
    </Container>
  </Box>;
}
