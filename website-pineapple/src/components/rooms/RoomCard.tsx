import BedRounded from '@mui/icons-material/BedRounded';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import East from '@mui/icons-material/East';
import PeopleRounded from '@mui/icons-material/PeopleRounded';
import SquareFootRounded from '@mui/icons-material/SquareFootRounded';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { linkClick } from '../../router';
import type { RoomContent } from '../../types';
import { ResortPhoto } from '../common/ResortPhoto';

export const roomHref = (room: Pick<RoomContent, 'id'>) => `/rooms/${room.id}`;

/** Size, beds and how many — the three things people compare rooms by. */
export function RoomFacts({ room, light = false }: { room: RoomContent; light?: boolean }) {
  return <Stack direction="row" flexWrap="wrap" useFlexGap gap={{ xs: 1.25, md: 2 }} sx={{ color: light ? 'rgba(255,255,255,.9)' : 'text.secondary', '& svg': { fontSize: 17, color: light ? 'inherit' : 'primary.main' } }}>
    {[[SquareFootRounded, `${room.sqm} m²`], [BedRounded, room.beds], [PeopleRounded, `Sleeps ${room.sleeps}`]].map(([Icon, text]) => {
      const I = Icon as typeof BedRounded;
      return <Stack key={text as string} direction="row" spacing={.6} alignItems="center"><I /><Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{text as string}</Typography></Stack>;
    })}
  </Stack>;
}

// One room in the homepage's row: its photos in a simple postcard frame
// (flip through them with the arrows), who it's for, the facts, and the way
// into its own page.
export function RoomCard({ room }: { room: RoomContent }) {
  const [index, setIndex] = useState(0);
  const href = roomHref(room);
  const count = room.images.length;
  return <Box component="article" className="royal-room-card" sx={{ position: 'relative', width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', color: 'text.primary', bgcolor: '#fffaf4', border: '1px solid #d7a2b7', borderRadius: '16px', p: '10px 10px 24px', '&::before': { content: '""', position: 'absolute', inset: 4, border: '1px solid #efd4df', borderRadius: '12px', pointerEvents: 'none' } }}>
    <Box sx={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: '10px', bgcolor: 'primary.light' }}>
      <ResortPhoto image={room.images[index]} alt={`${room.title}, photo ${index + 1} of ${count}`} sizes="(max-width: 600px) 80vw, (max-width: 1200px) 45vw, 25vw" />
      <Box sx={{ position: 'absolute', left: 18, top: 18, px: 1.2, py: .45, borderRadius: 999, bgcolor: 'rgba(255,253,249,.94)', fontSize: 12, fontWeight: 700, color: 'primary.dark' }}>{room.bestFor}</Box>
      {count > 1 && <>
        <IconButton aria-label={`Previous photo of ${room.title}`} onClick={() => setIndex((i) => (i - 1 + count) % count)} sx={{ position: 'absolute', left: 10, top: 'calc(50% - 20px)', bgcolor: '#fffaf6', color: 'text.primary', width: 40, height: 40, '&:hover': { bgcolor: 'secondary.main' } }}><ChevronLeft fontSize="small" /></IconButton>
        <IconButton aria-label={`Next photo of ${room.title}`} onClick={() => setIndex((i) => (i + 1) % count)} sx={{ position: 'absolute', right: 10, top: 'calc(50% - 20px)', bgcolor: '#fffaf6', color: 'text.primary', width: 40, height: 40, '&:hover': { bgcolor: 'secondary.main' } }}><ChevronRight fontSize="small" /></IconButton>
      </>}
    </Box>
    <Box sx={{ pt: 2.25, px: 1.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Typography variant="overline" sx={{ color: 'primary.main', fontSize: 11 }}>{room.kicker}</Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 25, md: 27 }, lineHeight: 1.1, mt: .5 }}>{room.title}</Typography>
      <Box sx={{ mt: 1.25 }}><RoomFacts room={room} /></Box>
      <Typography sx={{ fontSize: 14.5, lineHeight: 1.7, color: 'text.secondary', mt: 1.5, mb: 2 }}>{room.detail}</Typography>
      <Box component="a" href={href} onClick={linkClick(href)} sx={{
        mt: 'auto', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 1, fontWeight: 700, fontSize: 14.5, color: 'primary.main', textDecoration: 'none',
        minHeight: 44, borderBottom: '2px solid', borderColor: 'secondary.main', pb: .25, '&:hover': { borderColor: 'primary.main' }, '&:hover svg': { transform: 'translateX(3px)' }, '& svg': { fontSize: 17, flexShrink: 0, transition: 'transform .2s ease' },
      }}>See the {room.title}<East /></Box>
    </Box>
  </Box>;
}
