import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Button, Container, Typography } from '@mui/material';
import { CONTACT } from '../../data/content';
import { photoAssets as p } from '../../data/photos';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal } from '../common/ScrollMotion';
import { Sticker, SunDoodle } from '../common/VacationDecor';

export function FloatingBreakfastSection() {
  return <Box component="section" id="floating-breakfast" className="breakfast-scene" aria-label="Floating breakfast experience" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET, py: { xs: 7, md: 9 }, overflow: 'hidden' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'grid', gridTemplateColumns: { md: '.8fr 1.2fr' }, gap: { xs: 5, md: 7 }, alignItems: 'center' }}>
          <Reveal sx={{ position: 'relative', zIndex: 3 }}>
            <SunDoodle color="#006d8a" size={64} sx={{ mb: 2 }} />
            <Typography variant="h2" sx={{ fontSize: { xs: 43, md: 66 }, lineHeight: 1.04, maxWidth: 480 }}>Breakfast,<br /><Box component="span" color="primary.main">with a splash.</Box></Typography>
            <Typography sx={{ mt: 3, fontSize: { xs: 16, md: 18 }, lineHeight: 1.7, color: 'text.secondary', maxWidth: 370 }}>Tropical fruit. A floating tray. Your favourite person. Now that’s our kind of morning.</Typography>
            <Button href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" variant="contained" endIcon={<ArrowOutward />} sx={{ mt: 3 }}>Ask about breakfast</Button>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1.5 }}>Our team can help with arrangements and availability.</Typography>
          </Reveal>
          <Reveal delay={0.15} sx={{ position: 'relative', pb: { xs: 9, md: 4 }, pt: 2 }}>
            <Box sx={{ height: { xs: 340, sm: 440, md: 470 }, borderRadius: '120px 28px 100px 28px', overflow: 'hidden', border: '7px solid white', boxShadow: '0 18px 45px rgba(18,78,57,.14)' }}>
              <ResortPhoto image={p.heroBreakfast.src} alt="Guest enjoying floating breakfast in Hula Hula’s infinity pool" sizes="(max-width: 899px) 90vw, 48vw" sx={{ objectPosition: 'center bottom' }} />
            </Box>
            <Box className="breakfast-postcard" sx={{ position: 'absolute', width: { xs: 164, md: 236 }, height: { xs: 192, md: 260 }, bottom: { xs: 5, md: -5 }, left: { xs: -4, md: -35 }, bgcolor: 'white', p: 1, pb: 4.5, borderRadius: 2, boxShadow: '0 16px 34px rgba(18,78,57,.19)', zIndex: 2 }}>
              <ResortPhoto image={p.breakfast.src} alt="Round floating breakfast tray with fruit, toast, eggs, and juice on pool water" sizes="250px" />
              <Typography sx={{ fontFamily: 'Fredoka', mt: 1, textAlign: 'center', fontSize: { xs: 14, md: 20 }, lineHeight: 1.2, whiteSpace: 'nowrap' }}>A very good morning.</Typography>
            </Box>
            <Box className="breakfast-note" sx={{ position: 'absolute', right: { xs: -2, md: -16 }, top: 2, zIndex: 2 }}><Sticker color="#f9f70c" rotate={8} sx={{ width: { xs: 94, md: 112 }, height: { xs: 94, md: 112 }, fontSize: { xs: 19, md: 22 } }}>Just add<br />sunshine.</Sticker></Box>
          </Reveal>
        </Box>
      </Container>
  </Box>;
}
