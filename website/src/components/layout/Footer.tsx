import { Box, Container, Stack, Typography } from '@mui/material';
import { CONTACT } from '../../data/content';
import { ClubMark } from '../common/ClubMark';
import { TropicalBackdrop, tropicalSectionSx } from '../common/TropicalBackdrop';

export function Footer() {
  return <Box component="footer" sx={{
    ...tropicalSectionSx,
    py: { xs: 6, sm: 7 },
    // Its own sunny closing block; the SectionSeam above it (a sun rising
    // behind the wave) is what separates it from the contact section.
    bgcolor: 'secondary.main',
  }}>
    <TropicalBackdrop side="right" anchor="bottom" />
    <Container maxWidth="xl">
      <Stack alignItems="center" spacing={2.5} textAlign="center">
        <Typography variant="h2" sx={{ fontSize: { xs: 31, md: 48 }, lineHeight: 1.1, maxWidth: { xs: 280, sm: 'none' } }}>See you on the sunny side.</Typography>
        <ClubMark size="large" />
        <Typography variant="overline" sx={{ maxWidth: 380, lineHeight: 1.6 }}>{CONTACT.address}</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: .75, sm: 2 }} alignItems="center" divider={<Box sx={{ display: { xs: 'none', sm: 'block' }, width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.secondary' }} />}>
          <Typography variant="overline">Krabi, Thailand</Typography>
          <Typography variant="overline">© {new Date().getFullYear()} Hula Hula Resort</Typography>
        </Stack>
      </Stack>
    </Container>
  </Box>;
}
