import CheckRounded from '@mui/icons-material/CheckRounded';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Container, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useContactForm } from '../context/ContactFormContext';
import { CONTACT, coffeeBreak, eventEquipment, eventFood, familyVenues, poolsideEvents, venues, weddingServices } from '../data/content';
import { photoAssets as p } from '../data/photos';
import { fonts } from '../theme';
import { ResortPhoto } from '../components/common/ResortPhoto';
import { Reveal } from '../components/common/ScrollMotion';
import { PostcardFrame } from '../components/common/PostcardFrame';
import { PageIntro, PageShell } from './PageShell';

function List({ title, items }: { title: string; items: string[] }) {
  return <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '22px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: '100%' }}>
    <Typography variant="h3" sx={{ fontSize: 24 }}>{title}</Typography>
    <Stack component="ul" spacing={.9} sx={{ listStyle: 'none', p: 0, m: 0, mt: 2 }}>
      {items.map((item) => <Stack component="li" key={item} direction="row" spacing={1} alignItems="flex-start"><CheckRounded sx={{ fontSize: 18, color: 'primary.main', mt: '2px' }} /><Typography sx={{ fontSize: 14.5 }}>{item}</Typography></Stack>)}
    </Stack>
  </Box>;
}

// /meetings — the five spaces with their capacities by layout, what comes
// with them, poolside parties and weddings, and the rest of the family's halls.
export function MeetingsPage() {
  const openContact = useContactForm();
  useEffect(() => { document.title = 'Meetings, events & weddings — Royal Pineapple Hotel, Krabi'; }, []);
  const enquire = (topic: string) => openContact({ topic, message: 'Hello Royal Pineapple! We’re planning an event for about … guests on … (date).', page: 'Meetings & events' });
  return <PageShell>
    <PageIntro eyebrow="Meetings, events & weddings" title="Transform meetings into memorable experiences." image={p.meetingClassroom.src} imageAlt="The Summer room set up classroom-style with a projector screen"
      description="Four meeting rooms and the pool terrace for 10 to 200 people, rooms to stay in upstairs, food from our own kitchen and Krabi on the doorstep — for company retreats, workshops, team days, parties and weddings."
      crumbs={[{ label: 'Meet & celebrate', href: '/#meet' }, { label: 'Meetings & events' }]}>
      <Button onClick={() => enquire('Meetings & events')} variant="contained" startIcon={<ChatBubbleOutlineRounded />}>Plan your event with us</Button>
      <Button href={`${CONTACT.events.whatsapp}?text=${encodeURIComponent('Hello Royal Pineapple events team!')}`} target="_blank" rel="noopener" variant="outlined" startIcon={<WhatsApp />}>{CONTACT.events.phone}</Button>
    </PageIntro>

    <Container maxWidth="xl" sx={{ py: { xs: 6, md: 9 } }}>
      <Reveal>
        <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 48 } }}>Five spaces at Royal Pineapple</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1.5, maxWidth: 620, lineHeight: 1.8 }}>Guests per layout. Every room can be set for a cocktail party, theatre, classroom, banquet or U-shape.</Typography>
      </Reveal>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', md: 'repeat(5,minmax(0,1fr))' }, gap: { xs: 1.5, md: 2 }, mt: 4 }}>
        {venues.map((v) => <Box key={v.name}>
          <PostcardFrame sx={{ aspectRatio: '4 / 3' }}><ResortPhoto image={v.image ?? p.meetingBanquet.src} alt={`The ${v.name} room`} sizes="(max-width: 900px) 46vw, 18vw" /></PostcardFrame>
          <Typography sx={{ fontFamily: fonts.playful, fontSize: 22, mt: 1.25 }}>{v.name}</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{v.floor} · {v.sqm} m²</Typography>
        </Box>)}
      </Box>
      <Reveal>
        <TableContainer tabIndex={0} role="region" aria-label="Meeting room capacities, scroll horizontally for all layouts" sx={{ mt: 4, maxWidth: '100%', borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Table size="small" aria-label="Meeting room capacities">
            <TableHead><TableRow sx={{ '& th': { fontWeight: 800, bgcolor: 'primary.light', whiteSpace: 'nowrap' } }}>
              <TableCell>Room</TableCell><TableCell align="right">Area</TableCell><TableCell align="right">Ceiling</TableCell><TableCell align="right">Cocktail</TableCell><TableCell align="right">Theatre</TableCell><TableCell align="right">Classroom</TableCell><TableCell align="right">Banquet</TableCell><TableCell align="right">U-shape</TableCell>
            </TableRow></TableHead>
            <TableBody>{venues.map((v) => <TableRow key={v.name} sx={{ '& td': { whiteSpace: 'nowrap', py: 1.25 } }}>
              <TableCell sx={{ fontWeight: 700 }}>{v.name}</TableCell><TableCell align="right">{v.sqm} m²</TableCell><TableCell align="right">{v.ceiling ?? '–'}</TableCell>
              <TableCell align="right">{v.cocktail ?? '–'}</TableCell><TableCell align="right">{v.theatre ?? '–'}</TableCell><TableCell align="right">{v.classroom ?? '–'}</TableCell><TableCell align="right">{v.banquet ?? '–'}</TableCell><TableCell align="right">{v.uShape ?? '–'}</TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </TableContainer>
      </Reveal>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))', lg: 'repeat(3,minmax(0,1fr))' }, gap: 2, mt: { xs: 6, md: 8 } }}>
        <List title="Equipment" items={eventEquipment} />
        <List title="Food & drink" items={eventFood} />
        <List title="Coffee breaks" items={coffeeBreak} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2,minmax(0,1fr))' }, gap: { xs: 4, md: 6 }, alignItems: 'center', mt: { xs: 7, md: 10 } }}>
        <PostcardFrame sx={{ aspectRatio: '4 / 3' }}><ResortPhoto image={p.poolLoungers.src} alt="The pool terrace with pink loungers in front of the hotel’s arches" sizes="(max-width: 900px) 92vw, 46vw" /></PostcardFrame>
        <Box>
          <Typography variant="overline" color="primary.main">Poolside events</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, lineHeight: 1.08, mt: 1 }}>Party by the pool.</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 2, lineHeight: 1.8 }}>The pool terrace takes up to 150 for cocktails or 120 at tables, under the palms and the yellow arches.</Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 2.5 }}>{poolsideEvents.map((e) => <Box key={e} sx={{ px: 1.5, py: .6, borderRadius: 999, bgcolor: 'primary.light', fontSize: 13.5, fontWeight: 600 }}>{e}</Box>)}</Stack>
        </Box>
      </Box>

      <Box id="weddings" sx={{ mt: { xs: 7, md: 10 }, p: { xs: 3, md: 5 }, borderRadius: '32px', bgcolor: 'primary.dark', color: 'common.white', display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2,minmax(0,1fr))' }, gap: { xs: 3, md: 6 } }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'secondary.main' }}>Weddings & celebrations</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 48 }, lineHeight: 1.06, mt: 1 }}>Your special day, our special care.</Typography>
          <Typography sx={{ mt: 2, opacity: .9, lineHeight: 1.8 }}>From an intimate dinner to a big reception, our team arranges the venue, food and drink, flowers, seating, sound and the cake.</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" useFlexGap spacing={1.5} sx={{ mt: 3 }}>
            <Button onClick={() => enquire('Weddings')} variant="contained" color="secondary">Ask about weddings</Button>
            <Button href={`mailto:${CONTACT.weddings.email}`} startIcon={<MailOutlineRounded />} sx={{ color: 'common.white', maxWidth: '100%', px: 1 }}><Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>{CONTACT.weddings.email}</Box></Button>
          </Stack>
        </Box>
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 1, alignContent: 'start' }}>
          {weddingServices.map((s) => <Stack component="li" key={s} direction="row" spacing={1} alignItems="flex-start"><CheckRounded sx={{ fontSize: 18, color: 'secondary.main', mt: '2px' }} /><Typography sx={{ fontSize: 14.5 }}>{s}</Typography></Stack>)}
        </Box>
      </Box>

      <Box sx={{ mt: { xs: 7, md: 10 } }}>
        <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 } }}>Up to 2,000 guests across the Hula Hula family</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1.5, maxWidth: 640, lineHeight: 1.8 }}>For conferences and big celebrations, our sister venues include Takanta Event Hall at Hula Hula Golf Club, the largest event space in Krabi.</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2,minmax(0,1fr))' }, gap: 2, mt: 3 }}>
          {familyVenues.map((place) => <Box key={place.place} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '22px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Box component="a" href={place.url} target="_blank" rel="noopener" sx={{ fontFamily: fonts.playful, fontSize: 22, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{place.place}</Box>
            {place.rooms.map((room) => <Stack key={room.name} direction="row" justifyContent="space-between" spacing={2} sx={{ py: 1.1, borderBottom: '1px dashed', borderColor: 'divider' }}>
              <Typography sx={{ fontSize: 15 }}>{room.name}{'sub' in room && room.sub ? <Box component="span" sx={{ color: 'text.secondary' }}> · {room.sub}</Box> : null}</Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary', textAlign: 'right' }}>{room.sqm} m² · {room.banquet} banquet · {room.theatre} theatre{'outdoor' in room && room.outdoor ? ` · ${room.outdoor}` : ''}</Typography>
            </Stack>)}
          </Box>)}
        </Box>
      </Box>
    </Container>
  </PageShell>;
}
