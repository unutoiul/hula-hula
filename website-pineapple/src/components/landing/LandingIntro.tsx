import East from '@mui/icons-material/East';
import { Box, Button, Container } from '@mui/material';
import { pillars } from '../../data/content';
import { SECTION_HEADING } from '../../layoutConstants';
import { brand, fonts } from '../../theme';
import { Reveal } from '../common/ScrollMotion';
import { artwork } from './artwork';
import { eyebrowSx, RULE, serifHeadingSx } from './landingStyles';

const storySx = { fontSize: 14, lineHeight: 1.9, color: '#775f6c', m: '0 0 17px', maxWidth: 440 } as const;
const centredOnSmallScreens = { maxWidth: { md: 'none' }, mx: { xs: 'auto', md: 0 } } as const;

export function LandingIntro() {
  return <Box component="section" id="welcome" aria-labelledby="royal-welcome-title" sx={{ pt: { xs: '53px', sm: '65px', md: '88px' }, pb: { xs: '50px', md: '80px' }, scrollMarginTop: '100px' }}>
    <Container maxWidth="xl">
      <Reveal><Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto', mb: { xs: '42px', md: '55px' } }}>
        <Box component="p" sx={{ ...eyebrowSx, justifyContent: 'center', mb: '17px', fontSize: { xs: 8, sm: 10 } }}>A warm welcome, with a twist</Box>
        <Box component="h2" id="royal-welcome-title" sx={{ ...serifHeadingSx, fontSize: SECTION_HEADING, lineHeight: 1.1, letterSpacing: '-.045em', m: '0 0 17px' }}>A little grand.<br /><em>A lot of good feeling.</em></Box>
      </Box></Reveal>

      <Box sx={{
        display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, alignItems: 'center',
        gap: { xs: '40px', sm: '55px', md: '50px', lg: '90px' }, ...centredOnSmallScreens, maxWidth: { xs: 610, md: 'none' },
      }}>
        <Reveal><Box sx={{
          position: 'relative', p: { xs: '0 0 15px', sm: '25px 0 45px' }, textAlign: 'center',
          background: 'radial-gradient(ellipse, #f9dfe7aa, transparent 70%)', ...centredOnSmallScreens, maxWidth: { xs: 540, md: 'none' },
        }}>
          <Box component="img" src={artwork.luggage} alt="Royal Pineapple’s colonial-inspired hotel, palms and pink pineapple on a vintage travel sticker" width={1100} height={902} loading="lazy" decoding="async"
            sx={{ display: 'block', width: '100%', height: 'auto', maxHeight: 510, objectFit: 'contain', transform: 'rotate(-4deg)', filter: 'drop-shadow(0 13px 15px #5a244811)' }} />
          <Box component="span" sx={{
            display: 'block', m: { xs: '24px 0 0 25px', sm: '24px 0 0 70px' }, transform: 'rotate(-4deg)',
            fontFamily: fonts.serif, fontSize: { xs: 21, sm: 22 }, fontStyle: 'italic', lineHeight: 1.25, color: brand.royal,
          }}>Your home away from home<br />in the heart of Krabi.</Box>
        </Box></Reveal>
        <Reveal delay={.1}><Box sx={{ ...centredOnSmallScreens, maxWidth: { xs: 530, md: 'none' } }}>
          <Box component="p" sx={{ ...eyebrowSx, mb: '17px' }}>The Royal Pineapple story</Box>
          <Box component="h3" sx={{ ...serifHeadingSx, fontSize: { xs: 35, sm: 38, md: 40 }, lineHeight: 1.13, letterSpacing: '-.035em', m: '0 0 22px' }}>Colonial-inspired.<br /><em>Thai at heart.</em></Box>
          <Box component="p" sx={storySx}>Why a pineapple? Krabi’s farmers grow them between the rubber trees, and all over the world a pineapple means welcome, friendship and good fortune. Consider this yours.</Box>
          <Box component="p" sx={storySx}>Behind the golden arches: contemporary colonial-inspired style, carved wood, a turquoise pool with pink loungers and a balcony for every room. Explore Krabi all day, then come home to good food and friendly faces.</Box>
          <Button href="#rooms" color="inherit" endIcon={<East />} sx={{ fontSize: 12, px: 0 }}>Find your little corner</Button>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: '17px', mt: '20px',
            '& > img': { width: 83, height: 100, objectFit: 'contain', transform: 'rotate(-6deg)' },
            '& > span': { fontFamily: fonts.serif, fontSize: 20, fontStyle: 'italic', lineHeight: 1.25, color: brand.plum },
            '& strong': { fontWeight: 400, color: brand.royal },
          }}><img src={artwork.mascot} alt="" aria-hidden="true" width={480} height={480} loading="lazy" /><span>A pineapple welcome.<br /><strong>Every single time.</strong></span></Box>
        </Box></Reveal>
      </Box>

      <Box aria-label="A little about the hotel" sx={{
        display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, rowGap: { xs: '28px', sm: 0 },
        mt: { xs: '45px', md: '50px' }, mb: { xs: '18px', sm: '35px' }, py: { xs: '27px', sm: '30px' }, borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`,
        '& > div': { display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center', borderRight: `1px solid ${RULE}` },
        '& > div:nth-of-type(2)': { borderRight: { xs: 0, sm: `1px solid ${RULE}` } },
        '& > div:last-of-type': { borderRight: 0 },
        '& strong': { fontFamily: fonts.serif, fontWeight: 400, fontSize: { xs: 30, sm: 27, md: 32 }, color: brand.royal },
        '& span': { fontSize: { xs: 10, md: 11 }, color: '#826574', px: { xs: '6px', md: 0 } },
      }}>
        <div><strong>72</strong><span>rooms with a balcony</span></div><div><strong>24/7</strong><span>poolside café & social hub</span></div><div><strong>Krabi Town</strong><span>the social heart of Krabi</span></div><div><strong>One big</strong><span>Thai welcome</span></div>
      </Box>

      {/* On tablets and phones the five pillars scroll sideways, snapping to each one. */}
      <Box component="nav" aria-label="Explore your stay" sx={{
        display: 'grid', gridTemplateColumns: { xs: 'repeat(5, 155px)', sm: 'repeat(5, minmax(145px, 1fr))', md: 'repeat(5, 1fr)' }, gap: { xs: '15px', md: '18px' },
        overflowX: { xs: 'auto', md: 'visible' }, pb: { xs: '5px', md: 0 }, scrollSnapType: { xs: 'x mandatory', md: 'none' },
        '& > a': {
          position: 'relative', display: 'flex', flexDirection: 'column', p: '22px 8px', color: brand.plum, textDecoration: 'none', borderBottom: '1px solid #d7aebf',
          scrollSnapAlign: { xs: 'start', md: 'none' }, transition: 'background .2s ease, padding .2s ease',
          '&:hover': { bgcolor: '#fde6ee66', px: '15px' }, '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        },
        '& strong': { fontFamily: fonts.serif, fontWeight: 400, fontSize: 27, mb: '8px' },
        '& .number': { fontSize: 9, letterSpacing: '.12em', color: brand.royal, mb: '10px' },
        '& .line': { fontSize: 11, lineHeight: 1.6, color: '#826574', maxWidth: 150 },
        '& svg': { position: 'absolute', right: 6, top: 25, fontSize: 15, color: brand.royal },
      }}>
        {pillars.map((pillar, i) => <a key={pillar.word} href={pillar.href}><span className="number">0{i + 1}</span><strong>{pillar.word}</strong><span className="line">{pillar.line}</span><East aria-hidden="true" /></a>)}
      </Box>
    </Container>
  </Box>;
}
