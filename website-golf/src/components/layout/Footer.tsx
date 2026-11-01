import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { openingHoursLines } from '../../booking/config';
import { useContact, useSite } from '../../context/SiteDataContext';
import { ClubMark } from '../common/ClubMark';
import { RisingSun, SEAM, SectionSeam } from '../common/SectionSeam';
import { MotionToggleLink } from './MotionToggle';
import { TropicalBackdrop, tropicalSectionSx } from '../common/TropicalBackdrop';

// The same sunny closing block on every page, wave and rising sun included.
// Just where we are, when we're open and the resort: phone, Line and email
// are already in the header's top strip and the contact section.
// `from` is the colour of the section above, so the wave flows out of it.
export function Footer({ from = SEAM.cream, mobileActionSpace = false }: { from?: string; mobileActionSpace?: boolean }) {
  const CONTACT = useContact();
  const { club } = useSite();
  return <>
    <SectionSeam from={from} to={SEAM.sun} mirror behind={<RisingSun left="78%" />} />
    <Box component="footer" sx={{
      ...tropicalSectionSx,
      bgcolor: 'secondary.main',
      pt: { xs: 6, sm: 7 },
      pb: {
        xs: mobileActionSpace ? 'calc(100px + env(safe-area-inset-bottom))' : 6,
        sm: mobileActionSpace ? 'calc(100px + env(safe-area-inset-bottom))' : 7,
        md: 7,
      },
    }}>
      <TropicalBackdrop side="right" anchor="bottom" />
      <Container maxWidth="xl">
        <Stack alignItems="center" spacing={2.5} textAlign="center">
          <Typography variant="h2" sx={{ fontSize: { xs: 31, md: 48 }, lineHeight: 1.1, maxWidth: { xs: 280, sm: 'none' } }}>See you on the first tee.</Typography>
          <ClubMark size="large" href="/" />
          <Typography variant="overline" sx={{ maxWidth: 380, lineHeight: 1.6 }}>
            Hula Hula Golf Club<br />
            <Link href={CONTACT.maps} target="_blank" rel="noopener noreferrer" color="inherit" underline="hover">{CONTACT.area}</Link>
          </Typography>
          <Typography variant="overline" sx={{ lineHeight: 1.8 }}>
            {openingHoursLines(club).map((line) => <Box component="span" key={line} sx={{ display: 'block' }}>{line}</Box>)}
          </Typography>
          <Typography variant="overline">Staying over? <Link href={CONTACT.resort} target="_blank" rel="noopener noreferrer" color="inherit">Hula Hula Resort, Ao Nang</Link></Typography>
          <Typography component="div" variant="overline" sx={{ '& button': { minHeight: 44 } }}>© {new Date().getFullYear()} Hula Hula Golf Club<MotionToggleLink /></Typography>
        </Stack>
      </Container>
    </Box>
  </>;
}
