import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { CONTACT } from '../../data/content';
import { photoAssets as p } from '../../data/photos';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import type { Meal } from '../../types';
import { ResortPhoto } from '../common/ResortPhoto';
import { Sticker, WaveEdge } from '../common/VacationDecor';
import { MealRow } from './MealRow';

export function RestaurantSection({ meals }: { meals: Meal[] }) {
  const [active, setActive] = useState(0);
  return <Box id="dine" component="section" sx={{ bgcolor: '#e7f4cc', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <WaveEdge flip />
    <Container maxWidth="xl" sx={{ py: { xs: 7, md: 9 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'flex-end' }} justifyContent="space-between" gap={3} sx={{ mb: 6 }}>
        <Box><Typography variant="h2" sx={{ fontSize: { xs: 43, md: 64 }, lineHeight: 1.03, mt: 1.5 }}>A little yum.<br /><Box component="span" color="primary.main">A whole lot of mmm.</Box></Typography></Box>
        <Typography sx={{ maxWidth: 350, color: 'text.secondary', lineHeight: 1.8 }}>From floating breakfasts to pineapple rice and colourful cocktails. Come hungry. Leave happy.</Typography>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.05fr 1fr' }, alignItems: 'center', gap: { xs: 5, md: 8 } }}>
        <Box sx={{ position: 'relative', pb: 3 }}>
          <Box sx={{ height: { xs: 370, md: 480 }, borderRadius: '28px 100px 28px 28px', overflow: 'hidden', bgcolor: 'white', border: '7px solid white', transform: 'rotate(-2deg)' }}><ResortPhoto image={meals[active].image} alt={meals[active].name} sx={{ objectFit: active > 1 ? 'contain' : 'cover', objectPosition: active === 1 ? 'center bottom' : 'center' }} /></Box>
          <Sticker rotate={9} sx={{ position: 'absolute', right: -10, bottom: 0, width: 106, height: 106 }}>Made for<br />happy bellies.</Sticker>
        </Box>
        <Box>{meals.map((meal, i) => <MealRow key={meal.name} meal={meal} active={i === active} first={i === 0} onClick={() => setActive(i)} />)}<Button href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" color="inherit" endIcon={<ArrowOutward />} sx={{ mt: 3, px: 0 }}>Let’s talk food</Button></Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1.4fr 1fr 1fr' }, gap: 2, mt: { xs: 6, md: 8 } }}>
        {[{ image: p.restaurant.src, title: 'Garden-side dining', alt: 'Chang Restaurant dining tables and lounge sofas' }, { image: p.watermelon.src, title: 'Sip something sunny', alt: 'Pom Pom watermelon shake' }, { image: p.thaiFood.src, title: 'Share a taste of Thailand', alt: 'A spread of Thai dishes at Chang Restaurant' }].map((photo, i) => <Box component="figure" key={photo.image} sx={{ m: 0, position: 'relative', borderRadius: 3, overflow: 'hidden', height: { xs: 210, md: 245 }, display: i === 2 ? { xs: 'none', md: 'block' } : 'block' }}><ResortPhoto image={photo.image} alt={photo.alt} sizes="(max-width: 600px) 45vw, 30vw" /><Box component="figcaption" sx={{ position: 'absolute', left: 12, bottom: 12, bgcolor: 'background.default', borderRadius: 99, px: 1.7, py: .7, fontSize: 12, fontWeight: 700 }}>{photo.title}</Box></Box>)}
      </Box>
    </Container>
    <WaveEdge />
  </Box>;
}
