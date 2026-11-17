import East from '@mui/icons-material/East';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useContactForm } from '../../context/ContactFormContext';
import { familyVenues, venues } from '../../data/content';
import { photoAssets as p } from '../../data/photos';
import { SECTION_HEADING, SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { linkClick } from '../../router';
import { brand, fonts } from '../../theme';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal } from '../common/ScrollMotion';
import { PostcardFrame } from '../common/PostcardFrame';
import { Sticker } from '../common/VacationDecor';

// Meetings, parties and weddings: the hotel's own rooms at a glance, then
// the whole Hula Hula family's, up to 2,000 guests at the golf club's hall.
export function MeetSection() {
  const openContact = useContactForm();
  return <Box id="meet" component="section" sx={{ bgcolor: '#fff6f6', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl" sx={{ py: SECTION_Y }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'repeat(2,minmax(0,1fr))' }, gap: { xs: 5, lg: 6 }, alignItems: 'center' }}>
        <Reveal sx={{ position: 'relative', minWidth: 0, width: '100%', maxWidth: { xs: 680, lg: 'none' }, mx: 'auto', pb: { xs: 3, lg: 0 } }}>
            <PostcardFrame sx={{ aspectRatio: '4 / 3' }}>
              <ResortPhoto image={p.meetingBanquet.src} alt="The Sunshine room set for a banquet, with green tablecloths and arched windows" sizes="(max-width: 900px) 92vw, 46vw" />
            </PostcardFrame>
          <Sticker color={brand.royal} rotate={-8} sx={{ position: 'absolute', left: { xs: 8, md: -20 }, bottom: { xs: -14, md: -30 }, color: '#fff', width: { xs: 104, md: 124 }, height: { xs: 104, md: 124 }, fontSize: { xs: 17, md: 20 } }}>10–200<br />lovely<br />people</Sticker>
        </Reveal>
        <Reveal delay={0.12} sx={{ minWidth: 0, textAlign: { xs: 'center', lg: 'left' } }}>
          <Typography variant="overline" color="primary.main">Meet & celebrate</Typography>
          <Typography variant="h2" sx={{ fontSize: SECTION_HEADING, lineHeight: 1.08, mt: 1.5 }}>Good things happen<br />together.</Typography>
          <Typography sx={{ mt: 2.5, color: 'text.secondary', lineHeight: 1.8, maxWidth: 500, mx: { xs: 'auto', lg: 0 } }}>
            Four meeting rooms and the pool terrace for 10 to 200 people, with rooms to stay in, food from our own kitchen and Krabi on the doorstep. Retreats, workshops, team days, parties and weddings.
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 3, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 1, maxWidth: 520, mx: { xs: 'auto', lg: 0 }, textAlign: 'left' }}>
            {venues.map((v) => <Box component="li" key={v.name} sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'background.paper' }}>
              <Typography sx={{ fontFamily: fonts.playful, fontSize: 19 }}>{v.name}</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{v.sqm} m² · up to {Math.max(...[v.theatre, v.cocktail, v.banquet, v.classroom].map((n) => Number(n) || 0))}</Typography>
            </Box>)}
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" useFlexGap spacing={1.5} sx={{ mt: 3.5, justifyContent: { xs: 'center', lg: 'flex-start' }, alignItems: 'center' }}>
            <Button href="/meetings" onClick={linkClick('/meetings')} variant="contained" endIcon={<East />}>Rooms, menus & weddings</Button>
            <Button onClick={() => openContact({ topic: 'Meetings & events', message: 'Hello Royal Pineapple! We’re planning an event for about … people on …', page: 'Meet & celebrate' })} color="inherit">Ask the events team</Button>
          </Stack>
        </Reveal>
      </Box>

      <Reveal>
        <Box component="details" sx={{ mt: { xs: 5, md: 6 }, p: { xs: 2.5, md: 3 }, borderRadius: '15px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Box component="summary" sx={{ cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'primary.dark' }}>Planning something bigger? Meet the Hula Hula family’s venues.</Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2,minmax(0,1fr))' }, gap: { xs: 3, md: 5 }, mt: 2.5 }}>
            {familyVenues.map((place) => <Box key={place.place}>
              <Box component="a" href={place.url} target="_blank" rel="noopener" sx={{ display: 'inline-flex', alignItems: 'center', gap: .75, fontWeight: 700, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{place.place}<East sx={{ fontSize: 16 }} /></Box>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1 }}>
                {place.rooms.map((room) => <Stack component="li" key={room.name} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={{ xs: .5, sm: 2 }} sx={{ py: 1.5, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: 15 }}>{room.name}{'sub' in room && room.sub ? <Box component="span" sx={{ color: 'text.secondary' }}> · {room.sub}</Box> : null}</Typography>
                  <Typography sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }}>{room.sqm} m² · {room.theatre} theatre</Typography>
                </Stack>)}
              </Box>
            </Box>)}
          </Box>
        </Box>
      </Reveal>
    </Container>
  </Box>;
}
