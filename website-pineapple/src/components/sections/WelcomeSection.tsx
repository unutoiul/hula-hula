import { Box, Container, Stack, Typography } from '@mui/material';
import { pillars, quickFacts } from '../../data/content';
import { photoAssets as p } from '../../data/photos';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { brand, fonts } from '../../theme';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal, ScrollTilt } from '../common/ScrollMotion';
import { StepFrame } from '../common/StepFrame';
import { Sticker } from '../common/VacationDecor';

// Five doors, after the hotel's arcade: each arch is one reason to stay and
// opens onto its part of the page. Colours from the hotel: its pink, pool,
// pineapple yellow, garden green and plum.
const DOORS = [
  { bg: brand.royal, ink: '#fff' },
  { bg: brand.pool, ink: '#fff' },
  { bg: brand.pineapple, ink: brand.ink },
  { bg: brand.leaf, ink: '#fff' },
  { bg: brand.plum, ink: '#fff' },
];

// Why "pineapple": the hotel's own welcome, a few facts, and the five doors.
export function WelcomeSection() {
  return <Box id="welcome" component="section" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET, pt: { xs: 7, md: 11 }, pb: { xs: 8, md: 11 } }}>
    <Container maxWidth="xl">
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: '1.05fr 1fr' }, gap: { xs: 6, md: 9 }, alignItems: 'center' }}>
        <Reveal sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="overline" color="primary.main">Welcome to Royal Pineapple</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: 40, md: 58 }, lineHeight: 1.05, mt: 1.5 }}>The pineapple means you’re welcome here.</Typography>
          <Typography sx={{ mt: 3, color: 'text.secondary', fontSize: 16.5, lineHeight: 1.8, maxWidth: 520, mx: { xs: 'auto', md: 0 } }}>
            In Krabi, farmers plant pineapples between the rubber trees, and all over the world the pineapple stands for welcome, friendship and good fortune. That’s the hotel we built: whether you’re here on holiday or for work, a home in Krabi Town.
          </Typography>
          <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: 16.5, lineHeight: 1.8, maxWidth: 520, mx: { xs: 'auto', md: 0 } }}>
            Local markets, temples and the river are minutes away; the beaches and islands are an easy day out. We’re part of the Hula Hula family, with Hula Hula Resort in Ao Nang and Hula Hula Golf Club by the airport.
          </Typography>
          <Box component="dl" sx={{ m: 0, mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 1 }, maxWidth: 620, mx: { xs: 'auto', md: 0 } }}>
            {/* The label comes first for screen readers, the number first on screen. */}
            {quickFacts.map((fact) => <Box key={fact.label} sx={{ display: 'flex', flexDirection: 'column', textAlign: { xs: 'center', md: 'left' } }}>
              <Typography component="dt" sx={{ order: 2, fontSize: 13, color: 'text.secondary', lineHeight: 1.45, mt: .5 }}>{fact.label}</Typography>
              <Typography component="dd" sx={{ m: 0, fontFamily: fonts.playful, fontSize: { xs: 30, md: 34 }, lineHeight: 1, color: 'primary.main', order: 1 }}>{fact.value}</Typography>
            </Box>)}
          </Box>
        </Reveal>
        <Reveal delay={0.12} sx={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr .8fr', gap: { xs: 1.5, md: 2.5 }, alignItems: 'end' }}>
          <ScrollTilt amount={1.5}>
            {/* An arch, like the ones along the hotel's front. */}
            <Box sx={{ height: { xs: 340, md: 500 }, borderRadius: '999px 999px 22px 22px', overflow: 'hidden', border: '7px solid #fffdf9', boxShadow: '0 16px 36px rgba(90,36,72,.14)' }}>
              <ResortPhoto image={p.lobby.src} alt="The lobby’s white arches, yellow walls and patterned Krabi tiles" sizes="(max-width: 900px) 55vw, 28vw" />
            </Box>
          </ScrollTilt>
          <ScrollTilt amount={-3}>
            <StepFrame step={18} sx={{ height: { xs: 230, md: 330 }, mb: { xs: 4, md: 7 } }}>
              <ResortPhoto image={p.reception.src} alt="The front desk with a pink chair and a painted hibiscus mural" sizes="(max-width: 900px) 40vw, 22vw" />
            </StepFrame>
          </ScrollTilt>
          <Sticker color={brand.blush} rotate={-10} sx={{ position: 'absolute', left: { xs: '38%', md: '42%' }, bottom: { xs: -28, md: -24 }, width: { xs: 96, md: 112 }, height: { xs: 96, md: 112 }, fontSize: { xs: 18, md: 20 } }}>Sawasdee!<br />Welcome.</Sticker>
        </Reveal>
      </Box>

      <Box component="nav" aria-label="What’s here" sx={{ mt: { xs: 9, md: 12 } }}>
        <Reveal><Typography variant="h3" sx={{ fontSize: { xs: 28, md: 36 }, textAlign: 'center' }}>More than a place to sleep</Typography></Reveal>
        <Stack component="ul" direction="row" sx={{
          listStyle: 'none', p: 0, m: 0, mt: { xs: 3, md: 4 }, gap: { xs: 1.25, md: 2 },
          overflowX: { xs: 'auto', md: 'visible' }, scrollSnapType: 'x mandatory', mx: { xs: -2, sm: -3, md: 0 }, px: { xs: 2, sm: 3, md: 0 }, pb: { xs: 1, md: 0 },
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        }}>
          {pillars.map((pillar, i) => <Box component="li" key={pillar.word} sx={{ flex: { xs: '0 0 44%', sm: '0 0 30%', md: 1 }, scrollSnapAlign: 'start' }}>
            <Box component="a" href={pillar.href} sx={{
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: { xs: 200, md: 250 }, p: { xs: 2, md: 2.5 }, pt: 4,
              borderRadius: '999px 999px 22px 22px', bgcolor: DOORS[i].bg, color: DOORS[i].ink, textDecoration: 'none', textAlign: 'center',
              transition: 'transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease', boxShadow: '0 10px 24px rgba(90,36,72,.12)',
              '&:hover, &:focus-visible': { transform: 'translateY(-6px)', boxShadow: '0 18px 34px rgba(90,36,72,.2)' },
            }}>
              <Typography sx={{ fontFamily: fonts.playful, fontSize: { xs: 26, md: 34 }, lineHeight: 1 }}>{pillar.word}</Typography>
              <Typography sx={{ fontSize: { xs: 12.5, md: 13.5 }, lineHeight: 1.45, mt: 1, opacity: .92 }}>{pillar.line}</Typography>
            </Box>
          </Box>)}
        </Stack>
      </Box>
    </Container>
  </Box>;
}
