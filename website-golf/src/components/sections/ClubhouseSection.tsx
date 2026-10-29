import { Box, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { cafeMoments } from '../../data/content';
import { photoAssets as p } from '../../data/photos';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { fonts } from '../../theme';
import { ClubPhoto } from '../common/ClubPhoto';
import { Reveal, ScrollTilt } from '../common/ScrollMotion';
import { Pineapple } from '../common/SectionSeam';
import { Polaroid, Sticker, SunDoodle } from '../common/VacationDecor';

// The clubhouse café: a big framed photo that follows whichever moment of the
// day is picked on the right, then the interior below.
export function ClubhouseSection() {
  const [active, setActive] = useState(0);
  const moment = cafeMoments[active];
  return <Box id="clubhouse" component="section" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl" sx={{ py: { xs: 7, md: 9 } }}>
      <Reveal><Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-end' }} justifyContent="space-between" gap={3} sx={{ mb: 6, position: 'relative', textAlign: { xs: 'center', md: 'left' } }}>
        <Pineapple sx={{ left: { xs: 'auto', md: 600 }, right: { xs: 6, md: 'auto' }, top: { xs: 2, md: 40 } }} />
        <Box>
          <Typography variant="overline" color="success.main">The clubhouse</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: 43, md: 64 }, lineHeight: 1.03, mt: 1.5 }}>The tenth hole.<br /><Box component="span" color="primary.main">Coffee with a view.</Box></Typography>
        </Box>
        <Typography sx={{ maxWidth: 360, color: 'text.secondary', lineHeight: 1.8 }}>Nine holes out there, and our favourite one in here. The clubhouse café looks straight down the fairways to Phanom Bencha mountain.</Typography>
      </Stack></Reveal>

      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.05fr 1fr' }, alignItems: 'center', gap: { xs: 5, md: 8 } }}>
        <Reveal sx={{ position: 'relative', pb: { xs: 2, md: 3 } }}>
          <ScrollTilt amount={3}><Box sx={{ aspectRatio: { xs: '4 / 3', md: '5 / 4' }, borderRadius: { xs: '24px 64px 24px 24px', md: '28px 100px 28px 28px' }, overflow: 'hidden', bgcolor: 'white', border: '7px solid white', transform: 'rotate(-2deg)', boxShadow: '0 18px 44px rgba(23,60,44,.12)' }}>
            <ClubPhoto image={moment.image} alt={`${moment.name}: ${moment.detail}`} sizes="(max-width: 900px) 92vw, 50vw" sx={{ objectPosition: moment.objectPosition ?? 'center' }} />
          </Box></ScrollTilt>
          <Sticker rotate={9} sx={{ position: 'absolute', right: { xs: 6, md: -8 }, bottom: { xs: -10, md: -6 }, width: { xs: 92, md: 106 }, height: { xs: 92, md: 106 }, fontSize: { xs: 17, md: 19 } }}>Fore!<br />(coffee)</Sticker>
        </Reveal>
        <Reveal delay={0.12} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          {cafeMoments.map((m, i) => <Box key={m.name} component="button" type="button" aria-pressed={i === active} onClick={() => setActive(i)} sx={{
            display: 'block', width: '100%', textAlign: 'inherit', font: 'inherit', color: 'inherit', bgcolor: 'transparent', cursor: 'pointer',
            border: 0, borderTop: i === 0 ? '1px solid' : 0, borderBottom: '1px solid', borderColor: 'divider', py: 3, px: { xs: 1, md: 0 },
            '&:hover .moment-name': { color: 'primary.main' },
          }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
              <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, bgcolor: i === active ? 'info.main' : 'divider', transition: 'background-color .25s ease' }} />
              <Typography className="moment-name" variant="h3" sx={{ fontSize: { xs: 26, md: 32 }, color: i === active ? 'primary.main' : 'text.primary', transition: 'color .25s ease' }}>{m.name}</Typography>
            </Stack>
            <Typography sx={{ color: 'text.secondary', mt: 1, lineHeight: 1.7, pl: { md: 3.25 } }}>{m.detail}</Typography>
          </Box>)}
        </Reveal>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.25fr 1fr' }, gap: { xs: 4, md: 5 }, mt: { xs: 6, md: 8 }, pt: { xs: 4, md: 5 }, borderTop: '1px solid', borderColor: 'divider', alignItems: 'end' }}>
        <Reveal><Box component="figure" sx={{ m: 0 }}>
          <Box sx={{ aspectRatio: { xs: '4 / 3', md: '3 / 2' }, borderRadius: '8px 72px 8px 8px', overflow: 'hidden', border: '6px solid #fffef8', boxShadow: '0 8px 24px rgba(23,60,44,.08)' }}>
            <ClubPhoto image={p.cafeInterior.src} alt="The clubhouse café with its green feature wall, hanging plants and wooden tables" sizes="(max-width: 900px) 90vw, 50vw" />
          </Box>
          <Box component="figcaption" sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: { xs: 'column', md: 'row' }, justifyContent: { xs: 'center', md: 'space-between' }, alignItems: { xs: 'center', md: 'baseline' }, columnGap: 2, rowGap: .5, pt: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>The clubhouse café</Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Cool, green and very comfy.</Typography>
          </Box>
        </Box></Reveal>
        <Reveal delay={0.12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 2, mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h3" sx={{ fontSize: { xs: 32, md: 42 }, lineHeight: 1.08, color: 'primary.main' }}>Play nine.<br />Stay for one more.</Typography>
            <SunDoodle size={64} color="#50830d" sx={{ ml: { xs: 0, md: 'auto' }, width: { xs: 48, md: 64 }, height: { xs: 48, md: 64 }, transform: 'rotate(12deg)' }} />
          </Box>
          <Box sx={{ height: { xs: 300, md: 340 }, maxWidth: 320, mx: { xs: 'auto', md: 0 } }}>
            <Polaroid image={p.cafeLounge.src} alt="Long cushioned lounge sofa beside the coffee counter" caption="Your seat is saved." rotate={3} sizes="320px" />
          </Box>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 3, lineHeight: 1.7, textAlign: { xs: 'center', md: 'left' }, fontFamily: fonts.sans }}>Open to everyone — no tee time needed. Driving range bays get food and drinks brought right to the sofa.</Typography>
        </Reveal>
      </Box>
    </Container>
  </Box>;
}
