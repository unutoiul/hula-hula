import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Box, Button, Container, Typography } from '@mui/material';
import { photoAssets as p } from '../../data/photos';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal, ScrollTilt } from '../common/ScrollMotion';
import { Polaroid, Sticker, SunDoodle } from '../common/VacationDecor';
import { useContactForm } from '../../context/ContactFormContext';

export function FloatingBreakfastSection() {
  const openContact = useContactForm();
  return <Box component="section" id="floating-breakfast" className="breakfast-scene" aria-label="Floating breakfast experience" sx={{ bgcolor: 'primary.light', scrollMarginTop: SECTION_SCROLL_OFFSET, py: { xs: 7, md: 9 }, overflow: 'hidden' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'grid', gridTemplateColumns: { md: '.8fr 1.2fr' }, gap: { xs: 5, md: 7 }, alignItems: 'center' }}>
          <Reveal sx={{ position: 'relative', zIndex: 3, textAlign: { xs: 'center', md: 'left' } }}>
            <SunDoodle color="#006d8a" size={64} sx={{ mb: 2, mx: { xs: 'auto', md: 0 } }} />
            <Typography variant="h2" sx={{ fontSize: { xs: 43, md: 66 }, lineHeight: 1.04, maxWidth: 480, mx: { xs: 'auto', md: 0 } }}>Breakfast,<br /><Box component="span" color="primary.main">with a splash.</Box></Typography>
            <Typography sx={{ mt: 3, fontSize: { xs: 16, md: 18 }, lineHeight: 1.7, color: 'text.secondary', maxWidth: 370, mx: { xs: 'auto', md: 0 } }}>Tropical fruit. A floating tray. Your favourite person. Now that’s our kind of morning.</Typography>
            <Button onClick={() => openContact({ topic: 'Floating breakfast', message: 'Hi Hula Hula! I’d love to arrange a floating breakfast during our stay.', page: 'Breakfast, with a splash' })} variant="contained" endIcon={<ChatBubbleOutlineRounded />} sx={{ mt: 3 }}>Ask about breakfast</Button>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1.5 }}>Our team can help with arrangements and availability.</Typography>
          </Reveal>
          <Reveal delay={0.15} sx={{ position: 'relative', pb: { xs: 9, md: 4 }, pt: 2 }}>
            <ScrollTilt amount={-1.5}><Box sx={{ height: { xs: 340, sm: 440, md: 470 }, borderRadius: '120px 28px 100px 28px', overflow: 'hidden', border: '7px solid white', boxShadow: '0 18px 45px rgba(18,78,57,.14)' }}>
              <ResortPhoto image={p.heroBreakfast.src} alt="Guest enjoying floating breakfast in Hula Hula’s infinity pool" sizes="(max-width: 899px) 90vw, 48vw" sx={{ objectPosition: 'center bottom' }} />
            </Box></ScrollTilt>
            <ScrollTilt amount={4} sx={{ position: 'absolute', width: { xs: 164, md: 236 }, height: { xs: 192, md: 260 }, bottom: { xs: 5, md: -5 }, left: { xs: -4, md: -35 }, zIndex: 2 }}>
              <Polaroid image={p.breakfast.src} alt="Round floating breakfast tray with fruit, toast, eggs, and juice on pool water" caption="A very good morning." rotate={-5} sizes="250px" />
            </ScrollTilt>
            <Box className="breakfast-note" sx={{ position: 'absolute', right: { xs: -2, md: -16 }, top: 2, zIndex: 2 }}><Sticker color="#f9f70c" rotate={8} sx={{ width: { xs: 94, md: 112 }, height: { xs: 94, md: 112 }, fontSize: { xs: 19, md: 22 } }}>Just add<br />sunshine.</Sticker></Box>
          </Reveal>
        </Box>
      </Container>
  </Box>;
}
