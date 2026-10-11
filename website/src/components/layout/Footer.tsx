import { Box, Container, Stack, Typography } from '@mui/material';
import { CONTACT } from '../../data/content';
import { ClubMark } from '../common/ClubMark';

export function Footer() {
  return <Box component="footer" sx={{
    py: { xs: 6, sm: 7 },
    // A visible top border + a paper background, not just more copy on the
    // same page background as the section above it — reads as its own
    // closing block instead of the logo/address floating loose at the end.
    borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
  }}>
    <Container maxWidth="xl">
      <Stack alignItems="center" spacing={2.5} textAlign="center">
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
