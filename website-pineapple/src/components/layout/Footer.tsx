import { Box, Container, Stack, Typography } from '@mui/material';
import { Fragment } from 'react';
import { CONTACT } from '../../data/content';
import { brand } from '../../theme';
import { PaymentMethods } from '../booking/PaymentMethods';
import { ClubMark } from '../common/ClubMark';
import { artwork } from '../landing/artwork';
import { DesignCredit } from './DesignCredit';
import { MotionToggleLink } from './MotionToggle';
import { SITES } from './SiteSwitcher';

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;
const SOFT = 'rgba(255,249,242,.85)';

// The plum closing block on every page, laid out like the resort's and the
// golf club's footers: one centred column with the same details in the same
// order — a closing line, the logo, where we are, how to reach us, the rest
// of the Hula Hula family, how guests can pay and the small print.
export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        py: { xs: '48px', sm: '56px' },
        bgcolor: brand.plum,
        color: brand.cream,
        '& a': {
          color: 'inherit',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          textDecorationColor: 'rgba(255,249,242,.45)',
          '&:hover': { textDecorationColor: 'currentColor' },
        },
        '& :is(a, button):focus-visible': { outline: '2px solid #f9b8cf', outlineOffset: 4, borderRadius: '4px' },
      }}
    >
      <Box
        component="img"
        src={artwork.flowers}
        alt=""
        aria-hidden="true"
        width={900}
        height={459}
        loading="lazy"
        sx={{
          position: 'absolute',
          right: { xs: -120, sm: -110 },
          bottom: 10,
          display: 'block',
          width: { xs: 240, sm: 365 },
          height: 'auto',
          opacity: { xs: 0.12, sm: 0.16 },
          pointerEvents: 'none',
        }}
      />
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack alignItems="center" spacing={2.5} textAlign="center">
          <Typography
            variant="h2"
            sx={{ color: '#fff9f2', fontSize: { xs: 31, md: 48 }, lineHeight: 1.1, maxWidth: { xs: 280, sm: 'none' }, textWrap: 'balance' }}
          >
            See you in Krabi Town.
          </Typography>
          <ClubMark white size="large" />
          <Typography variant="overline" sx={{ color: SOFT, maxWidth: 380, lineHeight: 1.6 }}>
            Royal Pineapple Hotel, Krabi Town
            <br />
            <a href={CONTACT.maps} {...external}>
              {CONTACT.address}
            </a>
          </Typography>
          <Typography variant="overline" sx={{ color: SOFT, lineHeight: 1.8 }}>
            <a href={CONTACT.tel}>{CONTACT.phone}</a> · <a href={CONTACT.landlineTel}>{CONTACT.landline}</a>
            <br />
            <Box component="a" href={`mailto:${CONTACT.email}`} sx={{ textTransform: 'none' }}>
              {CONTACT.email}
            </Box>
          </Typography>
          <Typography variant="overline" sx={{ color: SOFT, lineHeight: 1.8 }}>
            Part of the Hula Hula family
            <br />
            {SITES.filter((site) => site.id !== 'pineapple').map((site, i) => (
              <Fragment key={site.id}>
                {i > 0 && ' · '}
                <a href={site.url} {...external}>
                  {site.name}
                </a>
              </Fragment>
            ))}
          </Typography>
          <Box
            sx={{
              pt: 2.5,
              pb: 0.5,
              borderTop: '1px solid rgba(255,249,242,.2)',
              width: '100%',
              maxWidth: 380,
              '&:empty': { display: 'none' },
            }}
          >
            <PaymentMethods centered light />
          </Box>
          <Typography variant="overline" sx={{ color: SOFT }}>
            © {new Date().getFullYear()} Royal Pineapple Hotel
            <MotionToggleLink />
          </Typography>
          <DesignCredit light />
        </Stack>
      </Container>
    </Box>
  );
}
