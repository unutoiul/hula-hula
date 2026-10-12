import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { photoAssets as p } from '../../data/photos';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import type { Meal } from '../../types';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal, ScrollTilt } from '../common/ScrollMotion';
import { Sticker, SunDoodle } from '../common/VacationDecor';
import { MealRow } from './MealRow';
import { Pineapple } from '../common/SectionSeam';
import { useContactForm } from '../../context/ContactFormContext';

export function RestaurantSection({ meals }: { meals: Meal[] }) {
  const openContact = useContactForm();
  const [active, setActive] = useState(0);
  return <Box id="dine" component="section" sx={{ bgcolor: '#e7f4cc', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl" sx={{ py: { xs: 7, md: 9 } }}>
      <Reveal><Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-end' }} justifyContent="space-between" gap={3} sx={{ mb: 6, position: 'relative', textAlign: { xs: 'center', md: 'left' } }}>
        <Pineapple sx={{ left: { xs: 'auto', md: 330 }, right: { xs: 6, md: 'auto' }, top: { xs: 2, md: 0 } }} />
        <Box><Typography variant="h2" sx={{ fontSize: { xs: 43, md: 64 }, lineHeight: 1.03, mt: 1.5 }}>A little yum.<br /><Box component="span" color="primary.main">A whole lot of mmm.</Box></Typography></Box>
        <Typography sx={{ maxWidth: 350, color: 'text.secondary', lineHeight: 1.8 }}>From floating breakfasts to pineapple rice and colourful cocktails. Come hungry. Leave happy.</Typography>
      </Stack></Reveal>
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.05fr 1fr' }, alignItems: 'center', gap: { xs: 5, md: 8 } }}>
        {/* Every meal photo fills the frame (cover) — the studio shots used to be
            letterboxed (contain), leaving their grey backdrop floating crooked
            inside white bands. The frame's 4:3 / 5:4 shape is close to the 3:2
            photos, so little is cropped; the shadow keeps the white-backed shots
            from melting into the white border. The sticker stays inside the
            frame's corner so it's never cut off at the screen edge. */}
        <Reveal sx={{ position: 'relative', pb: { xs: 2, md: 3 } }}>
          <ScrollTilt amount={3}><Box sx={{ aspectRatio: { xs: '4 / 3', md: '5 / 4' }, borderRadius: { xs: '24px 64px 24px 24px', md: '28px 100px 28px 28px' }, overflow: 'hidden', bgcolor: 'white', border: '7px solid white', transform: 'rotate(-2deg)', boxShadow: '0 18px 44px rgba(23,60,44,.12)' }}>
            <ResortPhoto image={meals[active].image} alt={meals[active].name} sizes="(max-width: 900px) 92vw, 50vw" sx={{ objectPosition: active === 1 ? 'center bottom' : 'center' }} />
          </Box></ScrollTilt>
          <Sticker rotate={9} sx={{ position: 'absolute', right: { xs: 6, md: -8 }, bottom: { xs: -10, md: -6 }, width: { xs: 92, md: 106 }, height: { xs: 92, md: 106 }, fontSize: { xs: 18, md: 21 } }}>Made for<br />happy bellies.</Sticker>
        </Reveal>
        <Reveal delay={0.12} sx={{ textAlign: { xs: 'center', md: 'left' } }}>{meals.map((meal, i) => <MealRow key={meal.name} meal={meal} active={i === active} first={i === 0} onClick={() => setActive(i)} />)}<Button onClick={() => openContact({ topic: 'Dining', message: 'Hi Hula Hula! I have a question about dining at the resort.', page: 'A little yum.' })} color="inherit" endIcon={<ChatBubbleOutlineRounded />} sx={{ mt: 3 }}>Let’s talk food</Button></Reveal>
      </Box>
      <Box aria-labelledby="dining-table-heading" sx={{ display: 'grid', gridTemplateColumns: { md: '1.25fr 1fr' }, gap: { xs: 4, md: 5 }, mt: { xs: 6, md: 8 }, pt: { xs: 4, md: 5 }, borderTop: '1px solid', borderColor: 'divider', alignItems: 'end' }}>
        <Reveal sx={{ m: 0 }}><Box component="figure" sx={{ m: 0 }}>
          <Box sx={{ position: 'relative', aspectRatio: { xs: '4 / 3', md: '3 / 2' }, borderRadius: '8px 72px 8px 8px', overflow: 'hidden' }}>
            <ResortPhoto image={p.restaurant.src} alt="Open-air tables and lounge seating at Chang Restaurant" sizes="(max-width: 900px) 90vw, 50vw" />
          </Box>
          <Box component="figcaption" sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: { xs: 'column', md: 'row' }, justifyContent: { xs: 'center', md: 'space-between' }, alignItems: { xs: 'center', md: 'baseline' }, columnGap: 2, rowGap: .5, pt: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Chang Restaurant</Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Your table in the tropics.</Typography>
          </Box>
        </Box></Reveal>
        <Reveal delay={0.12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 2, mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography id="dining-table-heading" variant="h3" sx={{ fontSize: { xs: 32, md: 42 }, lineHeight: 1.08, color: 'primary.main' }}>Good food.<br />Even better company.</Typography>
            <SunDoodle size={64} color="#50830d" sx={{ ml: { xs: 0, md: 'auto' }, width: { xs: 48, md: 64 }, height: { xs: 48, md: 64 }, transform: 'rotate(12deg)' }} />
          </Box>
          <Box component="figure" sx={{ m: 0 }}>
            <Box sx={{ aspectRatio: '16 / 9', borderRadius: '8px 8px 48px 8px', overflow: 'hidden' }}>
              <ResortPhoto image={p.thaiFood.src} alt="Thai sharing dishes served beside the tropical garden" sizes="(max-width: 900px) 90vw, 40vw" sx={{ objectPosition: 'center bottom' }} />
            </Box>
            <Box component="figcaption" sx={{ pt: 2, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{ fontWeight: 700 }}>A little of this. A taste of that.</Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: .5, lineHeight: 1.6 }}>Pull up a chair, pass the plates, and share a taste of Thailand.</Typography>
            </Box>
          </Box>
        </Reveal>
      </Box>
    </Container>
  </Box>;
}
