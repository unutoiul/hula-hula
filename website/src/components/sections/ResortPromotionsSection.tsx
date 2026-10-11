import ArrowOutward from '@mui/icons-material/ArrowOutward';
import DirectionsBusRounded from '@mui/icons-material/DirectionsBusRounded';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { CONTACT } from '../../data/content';
import { photoAssets as p } from '../../data/photos';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { ResortPhoto } from '../common/ResortPhoto';
import { Sticker } from '../common/VacationDecor';

const destinations = ['Ao Nang Beach', 'Krabi Town', 'Golf & footgolf'];

export function ResortPromotionsSection() {
  const [destination, setDestination] = useState(destinations[0]);
  const shuttleInquiry = `${CONTACT.whatsapp}?text=${encodeURIComponent(`Hello Hula Hula! I’d like to ask about the shuttle to ${destination}. Could you share the current schedule and arrangements?`)}`;
  return <Box component="section" id="hula-happenings" sx={{ py: { xs: 8, md: 11 }, bgcolor: '#e7f4cc', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl">
      <Box data-sc-act="flow" sx={{ display: 'grid', gridTemplateColumns: { md: '1.15fr .85fr' }, gap: { xs: 4, md: 8 }, alignItems: 'center', mb: { xs: 9, md: 12 } }}>
        <Box sx={{ position: 'relative' }}>
          <Box data-sc-in className="photo-postcard" sx={{ border: '8px solid white', borderRadius: '24px 80px 24px 24px', overflow: 'hidden', transform: 'rotate(-2deg)', boxShadow: '0 18px 40px rgba(18,78,57,.1)' }}><ResortPhoto image={p.fruitCart.src} alt="Smiling Hula Hula host beside the resort’s bright green and yellow fruit cart" sizes="(max-width: 899px) 90vw, 48vw" sx={{ height: 'auto' }} /></Box>
          <Box data-sc-parallax="-.7" sx={{ position: 'absolute', right: -6, bottom: -32 }}><Sticker color="#f9f70c">Hello,<br />Hula!</Sticker></Box>
        </Box>
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: 42, md: 58 }, lineHeight: 1.08 }}>A little local charm.<br /><Box component="span" color="success.main">A whole lot of smiles.</Box></Typography>
          <Typography sx={{ mt: 3, fontSize: 16, lineHeight: 1.8, color: 'text.secondary', maxWidth: 420 }}>Our colourful fruit cart brings a little Hula Hula personality to your holiday. Green, yellow, and a warm welcome. Just like our happy little resort.</Typography>
          <Button href="#gallery" color="inherit" endIcon={<ArrowOutward />} sx={{ mt: 2 }}>Meet your happy place</Button>
        </Box>
      </Box>

      <Box data-sc-act="flow" sx={{ bgcolor: 'background.default', borderRadius: { xs: 4, md: '80px 28px 28px 28px' }, p: { xs: 3, md: 6 }, display: 'grid', gridTemplateColumns: { md: '1fr .7fr' }, gap: { xs: 4, md: 7 }, alignItems: 'center' }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: 40, md: 58 }, lineHeight: 1.07 }}>Hop on.<br /><Box component="span" color="primary.main">Head somewhere happy.</Box></Typography>
          <Typography sx={{ mt: 2.5, color: 'text.secondary', maxWidth: 480, lineHeight: 1.8 }}>Beach plans, a day in town, or a little time on the green. Ask our team about getting around with the Hula Hula shuttle.</Typography>
          <Box aria-hidden="true" sx={{ color: 'primary.main', my: 3, height: 62 }}>
            <svg viewBox="0 0 500 70" width="100%" height="100%" fill="none"><path className="shuttle-route-line" pathLength="1" d="M20 38 C100 5 120 68 195 35 S290 5 350 35 S430 65 480 25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><circle cx="20" cy="38" r="7" fill="#50830d" /><circle cx="480" cy="25" r="7" fill="#f9f70c" stroke="#50830d" strokeWidth="2" /></svg>
          </Box>
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} aria-label="Shuttle destination choices">
            {destinations.map(value => <Button key={value} variant={destination === value ? 'contained' : 'outlined'} onClick={() => setDestination(value)} aria-pressed={destination === value} size="small">{value}</Button>)}
          </Stack>
          <Typography aria-live="polite" sx={{ mt: 2.5, fontSize: 14, fontWeight: 600 }}>Your next stop: {destination}.</Typography>
          <Button href={shuttleInquiry} target="_blank" rel="noopener noreferrer" variant="contained" color="secondary" startIcon={<DirectionsBusRounded />} sx={{ mt: 2 }}>Ask about the shuttle</Button>
          <Typography sx={{ mt: 1.5, fontSize: 12, lineHeight: 1.6, color: 'text.secondary', maxWidth: 440 }}>Confirm current routes, departure times, and charges with our team.</Typography>
        </Box>
        <Box component="figure" sx={{ m: 0 }}>
          <Box className="photo-postcard" sx={{ border: '7px solid white', borderRadius: 3, overflow: 'hidden', transform: 'rotate(3deg)', boxShadow: '0 12px 34px rgba(18,78,57,.12)' }}><ResortPhoto image={p.shuttlePromotion.src} alt="Hula Hula shuttle truck promotion showing resort, Krabi Town, and Ao Nang Beach destinations" sizes="(max-width: 899px) 80vw, 30vw" sx={{ height: 'auto', objectFit: 'contain' }} /></Box>
          <Typography component="figcaption" sx={{ mt: 2, fontSize: 12, textAlign: 'center', color: 'text.secondary' }}>A familiar Hula Hula ride.</Typography>
        </Box>
      </Box>
    </Container>
  </Box>;
}
