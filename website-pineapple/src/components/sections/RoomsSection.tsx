import CheckRounded from '@mui/icons-material/CheckRounded';
import { Box, Container, Typography } from '@mui/material';
import { roomFeatures, rooms } from '../../data/content';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { DragCarousel } from '../common/DragCarousel';
import { Reveal } from '../common/ScrollMotion';
import { RoomCard } from '../rooms/RoomCard';

const essentials = [
  { title: 'Your own balcony', line: 'A little space to start slow.' },
  { title: 'Cool & comfortable', line: 'Air conditioning and a private bathroom.' },
  { title: 'Tea, coffee & Wi-Fi', line: 'The little everyday essentials.' },
  { title: 'Room to unwind', line: 'A good night, your way.' },
];

export function RoomsSection() {
  return <Box id="rooms" component="section" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET, pb: { xs: 7, md: 9 } }}>
    <Container maxWidth="xl">
      <Typography variant="overline" color="primary.main" sx={{ display: 'block', mb: 1, letterSpacing: '.18em' }}>72 rooms. Eight ways to feel at home.</Typography>
      <DragCarousel sectionKicker="72 rooms, eight ways to stay" onDark={false} items={rooms} itemLabel="room"
        heading={<>Find your kind of lovely.</>}
        renderCard={(room) => <RoomCard room={room} />} />
      <Reveal><div className="royal-room-essentials">
        <div className="essentials-heading"><p className="royal-eyebrow">The little things, included</p><h3>Settle in. It’s all here.</h3></div>
        <div className="essentials-grid">{essentials.map(item => <div key={item.title}><CheckRounded aria-hidden="true" /><strong>{item.title}</strong><p>{item.line}</p></div>)}</div>
        <details className="essentials-details"><summary>See everything in your room</summary><ul>{roomFeatures.map(feature => <li key={feature}><CheckRounded aria-hidden="true" />{feature}</li>)}</ul></details>
      </div></Reveal>
    </Container>
  </Box>;
}
