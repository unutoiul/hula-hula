import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { openingHoursLines } from '../../booking/config';
import { useContact, useSite } from '../../context/SiteDataContext';
import { ClubMark } from '../common/ClubMark';
import { MotionToggleLink } from './MotionToggle';
import { TropicalBackdrop, tropicalSectionSx } from '../common/TropicalBackdrop';

export function Footer() {
  const CONTACT = useContact();
  const { club } = useSite();
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
        <Typography variant="h2" sx={{ fontSize: { xs: 31, md: 48 }, lineHeight: 1.1, maxWidth: { xs: 280, sm: 'none' } }}>See you on the first tee.</Typography>
        <ClubMark size="large" />
        <Typography variant="overline" sx={{ maxWidth: 380, lineHeight: 1.6 }}>Hula Hula Golf Club<br />{CONTACT.area}</Typography>
        <Typography variant="overline" sx={{ lineHeight: 1.8 }}>{openingHoursLines(club).map((line) => <Box component="span" key={line} sx={{ display: 'block' }}>{line}</Box>)}</Typography>
        <Typography variant="overline" sx={{ lineHeight: 1.8, '& a': { color: 'inherit' } }}>
          <a href={CONTACT.tel}>{CONTACT.phone}</a> · Line {CONTACT.lineId}<br /><Box component="a" href={`mailto:${CONTACT.email}`} sx={{ textTransform: 'none' }}>{CONTACT.email}</Box>
        </Typography>
        <Typography variant="overline" sx={{ '& a': { color: 'inherit' } }}>Staying over? <Link href={CONTACT.resort} target="_blank" rel="noopener">Hula Hula Resort, Ao Nang</Link></Typography>
        <Typography variant="overline">© {new Date().getFullYear()} Hula Hula Golf Club<MotionToggleLink /></Typography>
      </Stack>
    </Container>
  </Box>;
}
