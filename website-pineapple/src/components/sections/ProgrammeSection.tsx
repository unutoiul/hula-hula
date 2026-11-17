import East from '@mui/icons-material/East';
import { Box, Button, Container, Typography } from '@mui/material';
import { SECTION_HEADING, SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { linkClick } from '../../router';
import { brand } from '../../theme';
import { ProgrammeTabs } from '../programme/ProgrammeTabs';
import { Reveal } from '../common/ScrollMotion';
import { artwork } from '../landing/artwork';

// The hotel's best idea, on its darkest colour: a different Krabi trip every
// day of the week, opening on today.
export function ProgrammeSection() {
  return <Box id="programme" component="section" sx={{ bgcolor: 'primary.dark', color: 'common.white', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl" sx={{ py: SECTION_Y, position: 'relative' }}>
      <Box component="img" src={artwork.mascot} alt="" aria-hidden="true" width={480} height={480} loading="lazy" sx={{ position: 'absolute', right: -15, bottom: 15, width: 140, height: 160, objectFit: 'contain', opacity: .14, pointerEvents: 'none' }} />
      <Reveal><Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.1fr) minmax(0,1fr)' }, gap: { xs: 2.5, md: 6 }, alignItems: 'end', mb: { xs: 4, md: 5 }, textAlign: { xs: 'center', md: 'left' } }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" sx={{ color: brand.pineapple }}>The 7-day Krabi programme</Typography>
          <Typography variant="h2" sx={{ fontSize: SECTION_HEADING, lineHeight: 1.08, mt: 1.5, maxWidth: 680 }}>One stay. Seven ways to see Krabi.</Typography>
        </Box>
        <Box sx={{ minWidth: 0, maxWidth: 440, mx: { xs: 'auto', md: 0 } }}>
          <Typography sx={{ color: 'rgba(255,255,255,.85)', lineHeight: 1.8 }}>Market mornings. Temple days. Beach afternoons. Find a little adventure for every day of your stay.</Typography>
          <Button href="/experiences" onClick={linkClick('/experiences')} endIcon={<East />} sx={{ mt: 1.5, color: 'common.white', textDecorationColor: brand.pineapple }} variant="text">The whole week, and the island tours</Button>
        </Box>
      </Box></Reveal>
      <ProgrammeTabs />
    </Container>
  </Box>;
}
