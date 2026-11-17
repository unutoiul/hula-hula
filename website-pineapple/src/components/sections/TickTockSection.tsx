import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useContactForm } from '../../context/ContactFormContext';
import { photoAssets as p } from '../../data/photos';
import { useKrabiClock } from '../../hooks/useKrabiClock';
import { SECTION_HEADING, SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { brand, fonts } from '../../theme';
import { PostcardFrame } from '../common/PostcardFrame';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal } from '../common/ScrollMotion';
import { artwork } from '../landing/artwork';

const krabiParts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false });
const krabiTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: 'numeric', minute: '2-digit', hour12: true });

/**
 * A clock face showing the time in Krabi now — Tick Tock never closes,
 * whatever it says. It owns the ticking clock, so only this re-renders each second.
 */
function KrabiClock() {
  const now = useKrabiClock();
  const parts = Object.fromEntries(krabiParts.formatToParts(now).map((part) => [part.type, Number(part.value)]));
  const h = (parts.hour % 12) * 30 + parts.minute * .5, m = parts.minute * 6, s = parts.second * 6;
  return <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 3, p: { xs: 1.75, sm: 2 }, width: 'fit-content', maxWidth: '100%', mx: { xs: 'auto', md: 0 }, border: '1px solid #ead4df', borderRadius: '18px', bgcolor: 'rgba(255,253,249,.76)' }}>
  <Box sx={{ position: 'relative', width: { xs: 56, sm: 80 }, aspectRatio: '1', flexShrink: 0 }}>
    <Box component="svg" viewBox="0 0 200 200" role="img" aria-label={`It’s ${krabiTime.format(now)} in Krabi, and Tick Tock is open`} sx={{ display: 'block', width: '100%', height: '100%' }}>
      <circle cx="100" cy="100" r="94" fill="#fff" stroke={brand.royal} strokeWidth="8" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x="97" y="16" width="6" height={i % 3 ? 10 : 18} rx="3" fill={i % 3 ? brand.pink : brand.plum} transform={`rotate(${i * 30} 100 100)`} />)}
      <text x="100" y="72" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontSize="17" fill={brand.plum}>24/7</text>
      <line x1="100" y1="100" x2="100" y2="58" stroke={brand.plum} strokeWidth="8" strokeLinecap="round" transform={`rotate(${h} 100 100)`} />
      <line x1="100" y1="100" x2="100" y2="38" stroke={brand.royal} strokeWidth="5" strokeLinecap="round" transform={`rotate(${m} 100 100)`} />
      <line x1="100" y1="112" x2="100" y2="32" stroke={brand.pineapple} strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${s} 100 100)`} />
      <circle cx="100" cy="100" r="8" fill={brand.pineapple} stroke="#fff" strokeWidth="3" />
    </Box>
  </Box>
  <Box sx={{ minWidth: 0, textAlign: 'left' }}>
    <Typography aria-hidden sx={{ fontSize: 11, lineHeight: 1.6, color: 'text.secondary' }}>It’s {krabiTime.format(now)} in Krabi.</Typography>
    <Typography sx={{ fontFamily: fonts.serif, fontSize: { xs: 21, sm: 26 }, lineHeight: 1.15, color: 'primary.main', mt: .25 }}>Tick Tock is open.</Typography>
    <Typography sx={{ fontSize: 12, lineHeight: 1.6, color: 'text.secondary', mt: .75, maxWidth: 280 }}>The pool, the café and the co-working tables, whenever you’re awake.</Typography>
  </Box>
  </Stack>;
}

// Tick Tock 24/7, the poolside social hub, and the pool it looks over — with
// the floating breakfast as the treat to add.
export function TickTockSection() {
  const openContact = useContactForm();
  return <Box id="tick-tock" component="section" aria-labelledby="tick-tock-heading" sx={{ bgcolor: brand.cream, scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl" sx={{ py: SECTION_Y }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.05fr) minmax(0,.95fr)' }, gap: { xs: 3, md: 6 }, alignItems: 'center' }}>
        <Reveal sx={{ minWidth: 0, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="overline" sx={{ color: 'info.dark' }}>Tick Tock 24/7 · the poolside social hub</Typography>
          <Typography id="tick-tock-heading" variant="h2" sx={{ fontSize: SECTION_HEADING, lineHeight: 1.08, mt: 1.5 }}>Refreshments.<br />Conversations.<br />Anytime.</Typography>
          <Typography sx={{ mt: 2.5, color: 'text.secondary', fontSize: 15, lineHeight: 1.85, maxWidth: 500, mx: { xs: 'auto', md: 0 } }}>
            From sunrise coffee to late-night cravings, Tick Tock is the social heartbeat of the hotel. Travellers, remote workers, locals and friends meet here by the pool over fresh juices, light bites and cocktails, or settle in to work. Pull up a chair whenever the mood strikes.
          </Typography>
          <KrabiClock />
        </Reveal>
        <Reveal delay={0.12} sx={{ width: '100%', maxWidth: { xs: 340, md: 460 }, minWidth: 0, justifySelf: 'center' }}><Box component="img" src={artwork.swan} alt="A playful pink pineapple relaxing in a swan float under a pink parasol" width={850} height={567} loading="lazy" sx={{ display: 'block', width: '100%', height: 'auto', objectFit: 'contain' }} /></Reveal>
      </Box>

      <Reveal>
        <Box sx={{ mt: { xs: 5, md: 7 }, pt: { xs: 4, md: 5 }, borderTop: '1px solid #ead4df', display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) minmax(0,1fr)' }, gap: { xs: 3.5, md: 6 }, alignItems: 'center' }}>
          <PostcardFrame sx={{ aspectRatio: '4 / 3', width: '100%', maxWidth: { xs: 680, md: 'none' }, mx: 'auto', boxShadow: '0 12px 26px rgba(90,36,72,.07)' }}>
            <ResortPhoto image={p.floatingBreakfastTray.src} alt="A real floating breakfast tray with toast, eggs and fresh fruit in the hotel pool" sizes="(max-width: 900px) 90vw, 40vw" />
          </PostcardFrame>
          <Box sx={{ minWidth: 0, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="overline" color="primary.main">A little extra, just for you</Typography>
            <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 38 }, lineHeight: 1.12, mt: 1.25 }}>A floating breakfast,<br />for two.</Typography>
            <Typography sx={{ mt: 2, fontSize: 15, color: 'text.secondary', lineHeight: 1.85, maxWidth: 480, mx: { xs: 'auto', md: 0 } }}>A breakfast basket set out on the pool, for birthdays, honeymoons or just because. Ask the front desk the day before, and bring the camera.</Typography>
            <Button onClick={() => openContact({ topic: 'Floating breakfast & celebrations', message: 'Hello Royal Pineapple! We’d love a floating breakfast during our stay.', page: 'Tick Tock 24/7' })} variant="contained" startIcon={<ChatBubbleOutlineRounded />} sx={{ mt: 2.5 }}>Ask for a floating breakfast</Button>
          </Box>
        </Box>
      </Reveal>
    </Container>
  </Box>;
}
