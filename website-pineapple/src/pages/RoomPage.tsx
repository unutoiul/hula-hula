import CheckRounded from '@mui/icons-material/CheckRounded';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import CloseRounded from '@mui/icons-material/CloseRounded';
import OpenInFull from '@mui/icons-material/OpenInFull';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Container, Dialog, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useBookingSearch } from '../context/BookingSearchContext';
import { CONTACT, roomFeatures, rooms } from '../data/content';
import { navigate } from '../router';
import { CheckAvailabilityButton } from '../components/booking/CheckAvailabilityButton';
import { fonts } from '../theme';
import type { RoomContent } from '../types';
import { ResortPhoto } from '../components/common/ResortPhoto';
import { Reveal } from '../components/common/ScrollMotion';
import { PostcardFrame } from '../components/common/PostcardFrame';
import { RoomCard, RoomFacts } from '../components/rooms/RoomCard';
import { PageIntro, PageShell } from './PageShell';

// /rooms/<id> — one room: its photos (open them full screen), what makes it
// this room, the facts, everything in it, and booking — then the other rooms.
export function RoomPage({ id }: { id: string }) {
  const room = rooms.find((r) => r.id === id);
  useEffect(() => { if (room) document.title = `${room.title} — Royal Pineapple Hotel, Krabi Town`; }, [room]);
  useEffect(() => { if (!room) navigate('/#rooms', { replace: true }); }, [room]);
  if (!room) return null;
  return <PageShell>
    <PageIntro eyebrow={`${room.kicker} · ${room.sqm} m²`} title={room.title} description={room.about} image={room.images[0]} imageAlt={`${room.title} at Royal Pineapple Hotel`}
      crumbs={[{ label: 'Rooms', href: '/#rooms' }, { label: room.title }]}>
      <BookButtons room={room} />
    </PageIntro>
    <Container maxWidth="xl" sx={{ py: { xs: 6, md: 9 } }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.4fr) minmax(0,1fr)' }, gap: { xs: 5, md: 7 }, alignItems: 'start' }}>
        <RoomGallery room={room} />
        <Reveal sx={{ position: { md: 'sticky' }, top: { md: 110 } }}>
          <Box sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '28px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" color="primary.main">Best for {room.bestFor.toLowerCase()}</Typography>
            <Box sx={{ mt: 1.5 }}><RoomFacts room={room} /></Box>
            <Typography sx={{ mt: 1.5, fontSize: 14, color: 'text.secondary' }}>{room.view}{room.otaName !== room.title ? ` · listed on booking sites as ${room.otaName}` : ''}</Typography>
            <Typography sx={{ fontWeight: 700, mt: 3 }}>What makes it this room</Typography>
            <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0, mt: 1.25 }}>
              {room.highlights.map((h) => <Stack component="li" key={h} direction="row" spacing={1.25} alignItems="flex-start"><CheckRounded sx={{ color: 'primary.main', fontSize: 19, mt: '2px' }} /><Typography sx={{ fontSize: 15 }}>{h}</Typography></Stack>)}
            </Stack>
            <Typography sx={{ fontWeight: 700, mt: 3 }}>In the room</Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1.25, display: 'flex', flexWrap: 'wrap', gap: .75 }}>
              {roomFeatures.map((f) => <Box component="li" key={f} sx={{ px: 1.25, py: .5, borderRadius: 999, bgcolor: 'primary.light', fontSize: 13, fontWeight: 600 }}>{f}</Box>)}
            </Box>
            <Stack spacing={1.25} sx={{ mt: 3.5 }}><BookButtons room={room} stacked /></Stack>
          </Box>
        </Reveal>
      </Box>
      <Box sx={{ mt: { xs: 8, md: 11 } }}>
        <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 46 }, mb: { xs: 3, md: 4 } }}>The other rooms</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))', lg: 'repeat(4,minmax(0,1fr))' }, gap: { xs: 4, md: 3 } }}>
          {rooms.filter((r) => r.id !== room.id).slice(0, 4).map((r) => <RoomCard key={r.id} room={r} />)}
        </Box>
      </Box>
    </Container>
  </PageShell>;
}

const stayDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

/**
 * The same booking button as everywhere else (live rates, the booking engine
 * or an emailed booking request, whichever is set up), naming this room —
 * and WhatsApp for a quick question, the dates already written in.
 */
function BookButtons({ room, stacked = false }: { room: RoomContent; stacked?: boolean }) {
  const { checkIn, checkOut, adults, children } = useBookingSearch();
  const text = `Hello Royal Pineapple! Is the ${room.title} free from ${stayDate.format(checkIn)} to ${stayDate.format(checkOut)}, for ${adults} adult${adults === 1 ? '' : 's'}${children ? ` and ${children} child${children === 1 ? '' : 'ren'}` : ''}?`;
  return <>
    <Box sx={{ minWidth: { sm: stacked ? 0 : 230 } }}><CheckAvailabilityButton room={room.title} fullWidth={stacked} /></Box>
    <Button href={`${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener" variant="outlined" startIcon={<WhatsApp />} fullWidth={stacked}>Ask on WhatsApp</Button>
  </>;
}

function RoomGallery({ room }: { room: RoomContent }) {
  const [open, setOpen] = useState<number | null>(null);
  const count = room.images.length;
  return <Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: { xs: 1.25, md: 2 } }}>
      {room.images.map((image, i) => <Box key={image} component="button" type="button" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1} of the ${room.title}`} sx={{
        position: 'relative', p: 0, border: 0, cursor: 'zoom-in', gridColumn: i === 0 ? '1 / -1' : 'auto', aspectRatio: i === 0 ? '16 / 10' : '4 / 3',
        minWidth: 0, borderRadius: '16px', bgcolor: 'transparent', '& img': { transition: 'transform .5s ease' }, '&:hover img': { transform: 'scale(1.04)' },
      }}>
        <PostcardFrame sx={{ aspectRatio: 'inherit', width: '100%', height: '100%', p: { xs: '6px', sm: '9px' }, boxShadow: 'none', borderRadius: '16px' }}>
        <ResortPhoto image={image} alt={`${room.title}, photo ${i + 1}`} sizes={i === 0 ? '(max-width: 900px) 92vw, 55vw' : '(max-width: 900px) 46vw, 27vw'} />
        <Box sx={{ position: 'absolute', right: 14, bottom: 14, width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'rgba(58,24,48,.6)', color: '#fff' }}><OpenInFull sx={{ fontSize: 15 }} /></Box>
        </PostcardFrame>
      </Box>)}
    </Box>
    <Dialog open={open !== null} onClose={() => setOpen(null)} fullScreen slotProps={{ paper: { sx: { bgcolor: 'rgba(30,12,26,.96)' } } }} aria-label={`${room.title} photos`}>
      {open !== null && <Box sx={{ position: 'relative', height: '100%', minHeight: 0, display: 'grid', placeItems: 'center', px: { xs: 2, md: 6 }, pt: { xs: 10, md: 9 }, pb: { xs: 4, md: 6 } }}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') setOpen((open + 1) % count); if (e.key === 'ArrowLeft') setOpen((open - 1 + count) % count); }}>
        <Box sx={{ width: '100%', height: '100%', maxWidth: 1400, display: 'grid', placeItems: 'center', '& img': { objectFit: 'contain !important' } }}>
          <ResortPhoto image={room.images[open]} alt={`${room.title}, photo ${open + 1} of ${count}`} sizes="100vw" />
        </Box>
        <Typography sx={{ position: 'absolute', top: 22, left: 24, maxWidth: 'calc(100% - 100px)', lineHeight: 1.35, color: '#fff', fontFamily: fonts.sans, fontSize: { xs: 15, md: 20 } }}>{room.title} · {open + 1} / {count}</Typography>
        <IconButton aria-label="Close photos" onClick={() => setOpen(null)} sx={{ position: 'absolute', top: 14, right: 14, bgcolor: '#fffaf6', '&:hover': { bgcolor: 'secondary.main' } }}><CloseRounded /></IconButton>
        <IconButton aria-label="Previous photo" onClick={() => setOpen((open - 1 + count) % count)} sx={{ position: 'absolute', left: { xs: 8, md: 24 }, top: '50%', bgcolor: '#fffaf6', '&:hover': { bgcolor: 'secondary.main' } }}><ChevronLeft /></IconButton>
        <IconButton aria-label="Next photo" onClick={() => setOpen((open + 1) % count)} sx={{ position: 'absolute', right: { xs: 8, md: 24 }, top: '50%', bgcolor: '#fffaf6', '&:hover': { bgcolor: 'secondary.main' } }}><ChevronRight /></IconButton>
      </Box>}
    </Dialog>
  </Box>;
}
