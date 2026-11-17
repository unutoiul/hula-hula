import East from '@mui/icons-material/East';
import { Box, Button } from '@mui/material';
import { brand, fonts } from '../../theme';
import { BookingSearchBar } from '../booking/BookingSearchBar';
import { KrabiNow } from './KrabiNow';
import { eyebrowSx, pageWrapSx, RULE, textLinkSx } from './landingStyles';
import { PostcardCollage } from './PostcardCollage';
import { RoyalHeadline } from './RoyalHeadline';

export function LandingHero() {
  return <Box component="section" aria-labelledby="royal-hero-title" sx={{
    position: 'relative', overflow: 'hidden', pt: { xs: '110px', md: '126px' },
    background: `radial-gradient(ellipse at 90% 35%, #fbe6ed 0, #fff9f200 55%), ${brand.cream}`,
  }}>
    <Box sx={pageWrapSx}>
      <Box sx={{
        display: 'grid', alignItems: 'center', gridTemplateColumns: { xs: '1fr', md: '.85fr 1.15fr', lg: '.82fr 1.18fr' },
        gap: { xs: '25px', sm: '30px', md: '25px', lg: '36px' }, pt: { xs: '30px', sm: '37px', md: '35px', lg: '42px' }, pb: { xs: '25px', sm: '35px' },
      }}>
        <Box sx={{ position: 'relative', zIndex: 2, minWidth: 0, pb: { xs: 0, md: '20px' }, textAlign: { xs: 'center', md: 'left' }, maxWidth: { xs: 540, md: 'none' }, m: { xs: 'auto', md: 0 } }}>
          <Box component="p" sx={{
            ...eyebrowSx, justifyContent: { xs: 'center', md: 'flex-start' }, gap: { xs: '8px', sm: '12px' }, mb: { xs: '19px', sm: '22px', md: '25px' },
            fontSize: { xs: 7, sm: 9 }, letterSpacing: { xs: '.14em', sm: '.17em' }, '& > span': { ...eyebrowSx['& > span'], width: { xs: 20, sm: 28 } },
          }}><span />Your happy little corner of Krabi</Box>
          <RoyalHeadline />
          <Box component="p" sx={{
            color: '#7d606f', fontSize: { xs: 13, sm: 15, md: 14, lg: 15 }, lineHeight: { xs: 1.85, sm: 1.9 },
            maxWidth: { xs: 335, sm: 420, md: 350, lg: 380 }, m: { xs: '20px auto 22px', sm: '24px auto', md: '25px 0 26px' },
          }}>Golden arches. Pink pool days. A balcony of your own. A little European romance, a warm Thai welcome, and all the good feeling of a Hula Hula holiday.</Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' }, gap: { xs: '17px', sm: '16px', lg: '22px' } }}>
            <Button href="#booking-search" variant="contained" endIcon={<East />} sx={{ minHeight: { xs: 48, sm: 50 }, px: { xs: '19px', sm: '20px', lg: '25px' }, fontSize: { xs: 11, lg: 12 } }}>Find your happy place</Button>
            <Box component="a" href="#rooms" sx={{ ...textLinkSx, fontSize: { xs: 10, sm: 12 } }}>Take a little look <span aria-hidden="true">↗</span></Box>
          </Box>
          <KrabiNow />
        </Box>
        <PostcardCollage />
      </Box>
      <Box id="booking-search" sx={{
        position: 'relative', zIndex: 3, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'stretch', lg: 'center' },
        gap: { xs: '20px', sm: '18px', lg: '32px' }, py: '23px', mt: { xs: 0, sm: '6px' }, borderTop: `1px solid ${RULE}`, scrollMarginTop: '112px',
      }}>
        <Box sx={{ flexShrink: 0, textAlign: { xs: 'center', lg: 'left' } }}>
          <Box component="p" sx={{ m: '0 0 8px', color: brand.royal, textTransform: 'uppercase', fontSize: { xs: 7, sm: 8 }, letterSpacing: '.14em' }}>A little getaway starts here</Box>
          <Box component="h2" sx={{ m: '0 0 4px', fontFamily: fonts.serif, fontWeight: 400, letterSpacing: '-.035em', color: brand.plum, fontSize: { xs: 24, sm: 25, md: 21, lg: 24 } }}>Good times start with a date.</Box>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}><BookingSearchBar wide /></Box>
      </Box>
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'space-between' }, gap: '20px', textAlign: { xs: 'center', sm: 'left' },
        borderTop: `1px solid ${RULE}`, py: { xs: '15px', sm: '18px' }, color: '#9b7b8b', fontSize: { xs: 8, sm: 9 }, letterSpacing: '.04em',
        '& > span': { display: { xs: 'none', sm: 'inline' } },
        '& > a': { color: '#735164', textDecoration: 'none' },
        '& > a > span': { color: brand.royal, pl: '13px' },
      }}>
        <span>European charm. Thai heart. Hula Hula spirit.</span>
        <a href="#welcome">Make yourself a little at home <span aria-hidden="true">↓</span></a>
      </Box>
    </Box>
  </Box>;
}
