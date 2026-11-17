import AcUnitRounded from '@mui/icons-material/AcUnitRounded';
import BalconyRounded from '@mui/icons-material/BalconyRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CoffeeRounded from '@mui/icons-material/CoffeeRounded';
import KingBedRounded from '@mui/icons-material/KingBedRounded';
import { Box, Container, Divider, Typography } from '@mui/material';
import { roomFeatures, rooms } from '../../data/content';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { DragCarousel } from '../common/DragCarousel';
import { Reveal } from '../common/ScrollMotion';
import { RoomCard } from '../rooms/RoomCard';

const essentials = [
  { title: 'Your own balcony', line: 'A little space to start slow.', Icon: BalconyRounded },
  { title: 'Cool & comfortable', line: 'Air conditioning and a private bathroom.', Icon: AcUnitRounded },
  { title: 'Tea, coffee & Wi-Fi', line: 'The little everyday essentials.', Icon: CoffeeRounded },
  { title: 'Room to unwind', line: 'A good night, your way.', Icon: KingBedRounded },
];

const list = { listStyle: 'none', m: 0, p: 0 } as const;

// Under the room cards: what every room comes with, in one card. The heading
// sits beside four icon tiles (2×2 on tablets, a list on phones), and the full
// in-room list is always on show as chips, so nobody has to open anything.
function RoomEssentials() {
  return <Box component="aside" aria-labelledby="room-essentials-title" sx={{
    mt: { xs: 5, md: 6 }, p: { xs: 2.5, sm: 3.5, md: 4.5 }, borderRadius: { xs: '22px', md: '28px' },
    bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 12px 32px rgba(90,36,72,.05)',
  }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 290px) minmax(0, 1fr)' }, gap: { xs: 3, md: 4, lg: 7 }, alignItems: 'center' }}>
      <Box>
        <Typography variant="overline" component="p" color="primary.main" sx={{ letterSpacing: '.18em' }}>The little things, included</Typography>
        <Typography id="room-essentials-title" variant="h3" component="h3" sx={{ mt: 1, color: 'primary.dark', fontSize: { xs: 28, md: 34 } }}>
          Settle in. <Box component="br" sx={{ display: { xs: 'none', lg: 'block' } }} />It’s all here.
        </Typography>
        <Typography sx={{ mt: 1.5, fontSize: 15, lineHeight: 1.7, color: 'text.secondary', maxWidth: 360 }}>Whichever room you choose, these come as standard.</Typography>
      </Box>
      <Box component="ul" sx={{ ...list, display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 2.25, sm: 3, md: 2.5 } }}>
        {essentials.map(({ title, line, Icon }) => <Box component="li" key={title} sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: { xs: 'center', md: 'flex-start' }, gap: { xs: 2, md: 1.75 } }}>
          <Box aria-hidden sx={{ width: 52, height: 52, flexShrink: 0, borderRadius: '16px', display: 'grid', placeItems: 'center', bgcolor: 'primary.light', color: 'primary.main', '& svg': { fontSize: 26 } }}><Icon /></Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, color: 'primary.dark' }}>{title}</Typography>
            <Typography sx={{ mt: .5, fontSize: 14, lineHeight: 1.6, color: 'text.secondary' }}>{line}</Typography>
          </Box>
        </Box>)}
      </Box>
    </Box>
    <Divider sx={{ my: { xs: 3, md: 3.5 } }} />
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: { xs: 1.5, md: 3 } }}>
      <Typography component="h4" sx={{ flexShrink: 0, fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'text.secondary' }}>In every room</Typography>
      <Box component="ul" sx={{ ...list, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {roomFeatures.map((feature) => <Box component="li" key={feature} sx={{
          display: 'inline-flex', alignItems: 'center', gap: .75, minHeight: 36, px: 1.5, borderRadius: 999,
          bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', fontSize: 13.5, color: 'text.primary',
          '& svg': { fontSize: 16, color: 'primary.main' },
        }}><CheckRounded aria-hidden />{feature}</Box>)}
      </Box>
    </Box>
  </Box>;
}

export function RoomsSection() {
  return <Box id="rooms" component="section" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET, pt: { xs: '35px', sm: '40px', md: '60px' }, pb: { xs: 7, md: 9 }, borderTop: '1px solid #e8ced7' }}>
    <Container maxWidth="xl">
      <Typography variant="overline" color="primary.main" sx={{ display: 'block', mb: 1, letterSpacing: '.18em' }}>72 rooms. Eight ways to feel at home.</Typography>
      <DragCarousel sectionKicker="72 rooms, eight ways to stay" onDark={false} items={rooms} itemLabel="room"
        heading={<>Find your kind of lovely.</>}
        renderCard={(room) => <RoomCard room={room} />} />
      <Reveal><RoomEssentials /></Reveal>
    </Container>
  </Box>;
}
