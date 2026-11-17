import CallRounded from '@mui/icons-material/CallRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Container, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useContactForm } from '../context/ContactFormContext';
import { CONTACT, takantaEventTypes, takantaFacilities, takantaOutdoor, takantaSpaces, takantaWhy } from '../data/content';
import { photoAssets as p } from '../data/photos';
import { brand, fonts } from '../theme';
import { PostcardFrame } from '../components/common/PostcardFrame';
import { ResortPhoto } from '../components/common/ResortPhoto';
import { Reveal } from '../components/common/ScrollMotion';
import { CheckList } from './MeetingsPage';
import { PageIntro, PageShell } from './PageShell';

const whatsapp = (text: string) => `${CONTACT.events.whatsapp}?text=${encodeURIComponent(text)}`;
const cardSx = { p: { xs: 2.5, md: 3 }, borderRadius: '22px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' } as const;
const outdoorTagSx = { display: 'inline-block', ml: 1, px: 1, py: .25, borderRadius: 999, bgcolor: '#e8f4dc', color: '#3f6b1f', fontSize: 11, fontWeight: 700, verticalAlign: 'middle' } as const;

/** One of the two teams, with every way to reach them. */
function TeamCard({ title, line, phone, tel, email, subject }: { title: string; line: string; phone: string; tel: string; email: string; subject: string }) {
  return <Box sx={{ ...cardSx, height: '100%' }}>
    <Typography variant="h3" sx={{ fontSize: { xs: 24, md: 28 } }}>{title}</Typography>
    <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: 14.5, lineHeight: 1.7 }}>{line}</Typography>
    <Stack spacing={1} sx={{ mt: 2.5, alignItems: 'flex-start' }}>
      <Button href={tel} startIcon={<CallRounded />} color="inherit" sx={{ px: 1 }}>Call {phone}</Button>
      <Button href={whatsapp(`Hello Takanta! ${subject}`)} target="_blank" rel="noopener" startIcon={<WhatsApp />} color="inherit" sx={{ px: 1 }}>WhatsApp or LINE {CONTACT.events.phone}</Button>
      <Button href={`mailto:${email}?subject=${encodeURIComponent(subject)}`} startIcon={<MailOutlineRounded />} color="inherit" sx={{ px: 1, maxWidth: '100%' }}><Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>{email}</Box></Button>
    </Stack>
  </Box>;
}

// /meetings/takanta — TK Hall, the Hula Hula family's event venue at Hula Hula
// Golf Club: the halls and lawns with their sizes, what's included, the
// event perks and both teams' contacts, all from the hall's own fact sheet.
export function TakantaPage() {
  const openContact = useContactForm();
  useEffect(() => { document.title = 'Takanta Event Hall (TK Hall) — event venue near Krabi Airport'; }, []);
  return <PageShell>
    <PageIntro eyebrow="Takanta Event Hall · TK Hall" title="Your complete event destination in Krabi." image={p.takantaBanquet.src}
      imageAlt="A Takanta hall set for a banquet, with round tables, gold sashes and two big LED walls"
      description="Halls, terraces and lawns for 30 to 2,000 guests at Hula Hula Golf Club, near Krabi International Airport. Meetings, seminars, weddings, banquets, company events and parties, with food, kit and a team that thinks of everything."
      crumbs={[{ label: 'Meet & celebrate', href: '/#meet' }, { label: 'Meetings & events', href: '/meetings' }, { label: 'Takanta Event Hall' }]}>
      <Button href={whatsapp('Hello Takanta! We’re planning an event for about … guests on … (date).')} target="_blank" rel="noopener" variant="contained" startIcon={<WhatsApp />}>Plan your event</Button>
      <Button href={`mailto:${CONTACT.events.email}?subject=${encodeURIComponent('Event at Takanta Event Hall')}`} variant="outlined" startIcon={<MailOutlineRounded />} sx={{ maxWidth: '100%' }}><Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>{CONTACT.events.email}</Box></Button>
    </PageIntro>

    <Container maxWidth="xl" sx={{ py: { xs: 6, md: 9 } }}>
      {/* What it is, and the two things that make it easy. */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.05fr) minmax(0,1fr)' }, gap: { xs: 4, md: 7 }, alignItems: 'center' }}>
        <Reveal sx={{ minWidth: 0 }}>
          <Typography variant="overline" color="primary.main">Meetings · Seminars · Weddings · Banquets · Events · Parties</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 48 }, lineHeight: 1.06, mt: 1 }}>One venue.<br />Endless possibilities.</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 2.5, lineHeight: 1.8, maxWidth: 560 }}>TK Hall is a modern, minimal event and convention venue with indoor halls and open-air spaces that change to suit any theme. A conference with a stage and screens, a garden reception, a 600-seat banquet: tell us the idea, and our team brings the space, the food and the know-how.</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1.5, lineHeight: 1.8, maxWidth: 560 }}>It’s near Krabi International Airport, easy to find, with room for everyone’s car.</Typography>
        </Reveal>
        <Reveal delay={.1} sx={{ minWidth: 0 }}>
          <Box sx={{ position: 'relative', borderRadius: '26px', overflow: 'hidden', bgcolor: 'primary.dark', color: 'common.white' }}>
            <Box sx={{ aspectRatio: '16 / 9' }}><ResortPhoto image={p.takantaLedWedding.src} alt="A wedding party at Takanta, with a giant LED wall glowing behind the stage" sizes="(max-width: 900px) 92vw, 46vw" /></Box>
            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box component="span" sx={{ display: 'inline-block', px: 1.25, py: .25, borderRadius: 999, bgcolor: 'secondary.main', color: 'text.primary', fontSize: 11, fontWeight: 800, letterSpacing: '.12em' }}>NEW</Box>
              <Typography variant="h3" sx={{ fontSize: { xs: 26, md: 30 }, mt: 1.25, color: 'common.white' }}>Two 15-metre LED walls</Typography>
              <Typography sx={{ mt: 1, opacity: .88, lineHeight: 1.75 }}>Big, bright and ready for conferences, presentations, weddings, concerts and exhibitions.</Typography>
            </Box>
          </Box>
          <Box sx={{ ...cardSx, mt: 2 }}>
            <Typography variant="h3" sx={{ fontSize: { xs: 24, md: 28 } }}>A one-stop event service</Typography>
            <Typography sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.75 }}>Planning, setting up the room, catering and support on the day, so your event runs smoothly and you get to enjoy it too.</Typography>
          </Box>
        </Reveal>
      </Box>

      {/* Why Takanta, at a glance. */}
      <Box component="ul" aria-label="Why choose Takanta" sx={{ listStyle: 'none', p: 0, m: 0, mt: { xs: 5, md: 7 }, display: 'grid', gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', md: 'repeat(3,minmax(0,1fr))', lg: 'repeat(6,minmax(0,1fr))' }, gap: { xs: 1.5, md: 2 } }}>
        {takantaWhy.map((item) => <Box component="li" key={item.title} sx={{ p: 2, borderRadius: '18px', bgcolor: 'primary.light' }}>
          <Typography sx={{ fontFamily: fonts.playful, fontSize: 19, lineHeight: 1.2, color: 'primary.dark' }}>{item.title}</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: .75, lineHeight: 1.55 }}>{item.detail}</Typography>
        </Box>)}
      </Box>

      {/* The spaces, with their sizes. */}
      <Box sx={{ mt: { xs: 7, md: 10 } }}>
        <Reveal>
          <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 } }}>Venues & capacity</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1.5, maxWidth: 640, lineHeight: 1.8 }}>Three halls, three open-air spaces, a lawn, a kitchen and a very big car park.</Typography>
        </Reveal>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(3,minmax(0,1fr))' }, gap: { xs: 1.5, md: 2 }, mt: 4 }}>
          {[
            { image: p.takantaStage.src, alt: 'A Takanta hall dressed for a wedding, with a flower-covered stage under a chandelier' },
            { image: p.takantaReception.src, alt: 'White round tables either side of a flower-lined aisle, set for a wedding reception' },
            { image: p.takantaExterior.src, alt: 'The Takanta Event Hall building and its car park under a blue sky' },
          ].map((photo) => <PostcardFrame key={photo.image} sx={{ aspectRatio: '4 / 3' }}><ResortPhoto image={photo.image} alt={photo.alt} sizes="(max-width: 600px) 92vw, 31vw" /></PostcardFrame>)}
        </Box>
        <Reveal>
          {/* Phones get one line per space; the table needs the width. */}
          <Box component="ul" aria-label="Takanta venues and capacities" sx={{ display: { xs: 'block', sm: 'none' }, listStyle: 'none', p: 0, m: 0, mt: 3, borderTop: '1px dashed', borderColor: 'divider' }}>
            {takantaSpaces.map((space) => <Box component="li" key={space.name} sx={{ py: 1.5, borderBottom: '1px dashed', borderColor: 'divider' }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{space.name}{space.outdoor && <Box component="span" sx={outdoorTagSx}>Outdoor</Box>}</Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: .25 }}>{[space.area, space.size, space.roundTables && `up to ${space.roundTables} at round tables`].filter(Boolean).join(' · ')}</Typography>
            </Box>)}
          </Box>
          <TableContainer sx={{ display: { xs: 'none', sm: 'block' }, mt: 4, maxWidth: '100%', borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Table size="small" aria-label="Takanta venues and capacities">
              <TableHead><TableRow sx={{ '& th': { fontWeight: 800, bgcolor: 'primary.light', whiteSpace: 'nowrap' } }}>
                <TableCell>Venue</TableCell><TableCell align="right">Area</TableCell><TableCell align="right">Dimensions</TableCell><TableCell align="right">Round tables</TableCell>
              </TableRow></TableHead>
              <TableBody>{takantaSpaces.map((space) => <TableRow key={space.name} sx={{ '& td': { whiteSpace: 'nowrap', py: 1.25 } }}>
                <TableCell sx={{ fontWeight: 700 }}>{space.name}{space.outdoor && <Box component="span" sx={outdoorTagSx}>Outdoor</Box>}</TableCell>
                <TableCell align="right">{space.area}</TableCell>
                <TableCell align="right">{space.size ?? '–'}</TableCell>
                <TableCell align="right">{space.roundTables ? `Up to ${space.roundTables} guests` : '–'}</TableCell>
              </TableRow>)}</TableBody>
            </Table>
          </TableContainer>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 1.5, lineHeight: 1.7 }}>Seating depends on your setup: the stage, dance floor, buffet and everything else you’d like in the room.</Typography>
        </Reveal>
      </Box>

      {/* The open-air spaces. */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2,minmax(0,1fr))' }, gap: { xs: 4, md: 6 }, alignItems: 'center', mt: { xs: 7, md: 10 } }}>
        <PostcardFrame sx={{ aspectRatio: '4 / 3' }}><ResortPhoto image={p.takantaLawn.src} alt="The San Fah Prathan lawn at Takanta, with palms and the covered car park behind" sizes="(max-width: 900px) 92vw, 46vw" /></PostcardFrame>
        <Box>
          <Typography variant="overline" color="primary.main">Outdoor event spaces</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, lineHeight: 1.08, mt: 1 }}>Take it outside.</Typography>
          <Stack spacing={2} sx={{ mt: 2.5 }}>
            {takantaOutdoor.map((space) => <Box key={space.name} sx={{ pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
              <Typography sx={{ fontFamily: fonts.playful, fontSize: 21 }}>{space.name}</Typography>
              <Typography sx={{ color: 'text.secondary', mt: .5, lineHeight: 1.7 }}>{space.detail}</Typography>
            </Box>)}
          </Stack>
        </Box>
      </Box>

      {/* What kind of event, and what's included. */}
      <Box sx={{ mt: { xs: 7, md: 10 } }}>
        <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 } }}>Whatever you’re celebrating</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2,minmax(0,1fr))', lg: 'repeat(3,minmax(0,1fr))' }, gap: 2, mt: 3 }}>
          {takantaEventTypes.map((type) => <Box key={type.title} sx={cardSx}>
            <Typography sx={{ fontFamily: fonts.playful, fontSize: 22, color: 'primary.main' }}>{type.title}</Typography>
            <Typography sx={{ color: 'text.secondary', mt: .75, fontSize: 14.5, lineHeight: 1.7 }}>{type.detail}</Typography>
          </Box>)}
        </Box>
        <Box sx={{ mt: 2 }}><CheckList title="Facilities & services" items={takantaFacilities} columns /></Box>
      </Box>

      {/* The perks. */}
      <Box sx={{ mt: { xs: 7, md: 10 }, p: { xs: 3, md: 5 }, borderRadius: '32px', bgcolor: 'primary.dark', color: 'common.white', display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,.9fr) minmax(0,1.1fr)' }, gap: { xs: 3, md: 6 }, alignItems: 'center' }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'secondary.main' }}>A little extra for event guests</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, lineHeight: 1.08, mt: 1 }}>Party there. Sleep here.</Typography>
          <Button onClick={() => openContact({ topic: 'Rooms for a Takanta event', message: 'Hello Royal Pineapple! We’re holding an event at Takanta Event Hall on … and need rooms for about … guests.', page: 'Takanta Event Hall' })} variant="contained" color="secondary" startIcon={<ChatBubbleOutlineRounded />} sx={{ mt: 3 }}>Ask about event rates</Button>
        </Box>
        <Stack spacing={2.5}>
          {[
            { title: 'Special room rates', detail: 'Event guests stay for less at selected partner hotels, Royal Pineapple and Hula Hula Resort among them.' },
            { title: 'Pre-wedding photos', detail: 'Shoot your pre-wedding pictures at selected spots at the hotel or around Hula Hula Golf Club, subject to availability and conditions.' },
          ].map((perk) => <Stack key={perk.title} direction="row" spacing={1.5} alignItems="flex-start">
            <CheckRounded sx={{ color: 'secondary.main', mt: '3px' }} />
            <Box><Typography sx={{ fontWeight: 700, fontSize: 17 }}>{perk.title}</Typography><Typography sx={{ opacity: .88, mt: .5, lineHeight: 1.75 }}>{perk.detail}</Typography></Box>
          </Stack>)}
        </Stack>
      </Box>

      {/* Who to talk to. */}
      <Box sx={{ mt: { xs: 7, md: 10 } }}>
        <Reveal sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 } }}>Let us create your perfect event.</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1.5, maxWidth: 640, mx: 'auto', lineHeight: 1.8 }}>An intimate get-together or a celebration for 2,000: tell us your idea and we’ll turn it into a day to remember.</Typography>
        </Reveal>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2,minmax(0,1fr))' }, gap: 2, mt: 4, maxWidth: 980, mx: 'auto' }}>
          <TeamCard title="Meetings & events team" line="Meetings, seminars, company events, banquets, parties and everything in between."
            phone={CONTACT.events.phone} tel={CONTACT.events.tel} email={CONTACT.events.email} subject="Event at Takanta Event Hall" />
          <TeamCard title="Wedding team" line="Wedding packages, the venue, receptions and pre-wedding photos."
            phone={CONTACT.weddings.phone} tel={CONTACT.weddings.tel} email={CONTACT.weddings.email} subject="Wedding at Takanta Event Hall" />
        </Box>
        <Typography sx={{ textAlign: 'center', mt: 3, fontFamily: fonts.serif, fontStyle: 'italic', fontSize: { xs: 20, md: 24 }, color: brand.royal }}>Takanta Event Hall, Krabi, Thailand</Typography>
      </Box>
    </Container>
  </PageShell>;
}
