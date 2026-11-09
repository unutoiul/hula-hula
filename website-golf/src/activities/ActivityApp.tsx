import CheckRounded from '@mui/icons-material/CheckRounded';
import East from '@mui/icons-material/East';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, type ReactNode } from 'react';
import { bookHref } from '../booking/BookingFlowContext';
import { clubRules, findActivity, hasPrices, openingHoursLines, type Activity } from '../booking/config';
import { durationLabel, timeLabel } from '../booking/dates';
import { money } from '../booking/pricing';
import { ThingCard } from '../components/activities/ThingCard';
import { ClubPhoto } from '../components/common/ClubPhoto';
import { PageIntro } from '../components/layout/PageIntro';
import { PublicPageLayout } from '../components/layout/PublicPageLayout';
import { useContact, useSite, useSiteData } from '../context/SiteDataContext';
import { places, type Place } from '../data/content';
import { linkClick, navigate, useLocation } from '../router';
import { fonts } from '../theme';
import { thingsToDo, type ThingIconKey } from './things';
import { RentalCard } from '../components/activities/RentalCard';
import { CourseGuide } from './CourseGuide';
import { STICKY_TOP } from '../layoutConstants';
import { SEAM } from '../components/common/SectionSeam';

// /activities/<id> — one thing to do, on its own page: a big photo, the story,
// prices (or opening hours), the good-to-know, a way to book it, and the rest
// of the list underneath. Activities come from /admin; the café and the pool
// villa from data/content.ts. Loaded only when someone heads here.

interface Action { label: string; href: string; newTab?: boolean }

interface PageModel {
  kicker: string;
  name: string;
  lead: string;
  about: string;
  images: string[];
  icon: ThingIconKey;
  actions: Action[];
  /** The card beside the story: prices, or opening hours. */
  aside: ReactNode;
  goodToKnow: { title: string; text: string }[];
}

export default function ActivityApp() {
  const { pathname } = useLocation();
  const { ready } = useSiteData();
  const site = useSite();
  const id = pathname === '/course' ? 'golf' : pathname.replace(/^\/activities\/?/, '').split('/')[0];
  useEffect(() => { if (!id) navigate('/activities', { replace: true }); }, [id]);
  const activity = findActivity(site, id);
  const place = places.find((pl) => pl.id === id);
  const name = activity?.name ?? place?.name;
  useEffect(() => { if (name) document.title = `${name} — Hula Hula Golf Club`; }, [name]);

  // The "More to do" band under an activity or place is sea blue; the footer's wave flows out of it.
  return <PublicPageLayout footerFrom={activity || place ? SEAM.sea : undefined}>
    {activity ? <ActivityPage key={id} activity={activity} />
      : place ? <PlacePage key={id} place={place} />
        : !ready ? <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}><CircularProgress aria-label="Loading" /></Box>
          : id ? <NotFound /> : null}
    {(activity || place) && <MoreToDo exclude={id} />}
  </PublicPageLayout>;
}

const chat = (whatsapp: string, text: string) => `${whatsapp}?text=${encodeURIComponent(text)}`;

function ActivityPage({ activity }: { activity: Activity }) {
  const contact = useContact();
  const { club, rentals } = useSite();
  const priced = hasPrices(activity);
  const ask = chat(contact.whatsapp, `Hi Hula Hula Golf Club! I'd like to book ${activity.name}: `);
  const book = bookHref({ activity: activity.id });
  const actions: Action[] = activity.bookOnline
    ? [{ label: `Book a ${activity.slotNoun}`, href: book }, { label: 'Ask us on WhatsApp', href: chat(contact.whatsapp, `Hi Hula Hula Golf Club! A question about ${activity.name}: `), newTab: true }]
    : [{ label: 'Message us to book', href: ask, newTab: true }, { label: 'Email us', href: `mailto:${contact.email}?subject=${encodeURIComponent(activity.name)}` }];
  const rentalPrices = rentals.map((r) => r.price).sort((a, b) => a - b);
  const players = activity.minPlayers === activity.maxPlayers ? `${activity.maxPlayers}` : `${activity.minPlayers}–${activity.maxPlayers}`;

  const goodToKnow = [
    { title: 'Group size', text: `${players} ${activity.peopleNoun === 'person' ? 'people' : 'players'} per booking.` },
    { title: 'What to wear', text: activity.wear },
    ...(activity.noSkillNeeded ? [{ title: 'No golf skill needed', text: 'First-timers are very welcome. We’ll show you how it works.' }] : []),
    ...(activity.caddie ? [{ title: 'Caddie tip', text: `Not included: ${money(club.booking.caddieTip)} per caddie is customary, in cash.` }] : []),
    ...(activity.rentals && rentalPrices.length ? [{ title: 'Rental clubs', text: `${rentalPrices.length > 1 ? `${money(rentalPrices[0])} – ${money(rentalPrices.at(-1)!)}` : money(rentalPrices[0])} a set, added when you book.` }] : []),
    ...(club.transfer.pickups.length ? [{ title: 'Free shuttle', text: `Pick-ups at ${club.transfer.pickups.map(timeLabel).join(' and ')}. Ask when you book.` }] : []),
    ...(activity.bookOnline ? [clubRules(activity.wear, club).find((r) => r.title === 'Payment')!] : []),
  ];

  const aside = <>
    <Typography variant="h3" sx={{ fontSize: 26 }}>Prices</Typography>
    {priced ? <Stack spacing={1.5} sx={{ mt: 2 }}>
      {activity.soloPrice && <PriceRow label="1 person on their own" detail="per person" amount={activity.soloPrice} />}
      {activity.options.map((o) => <PriceRow key={o.id} label={activity.soloPrice ? `${o.label} · 2 or more` : o.label} detail={`about ${durationLabel(o.minutes)} · per ${activity.peopleNoun}`} amount={o.price} />)}
    </Stack> : <Typography sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.7 }}>Message us and we’ll send you the prices and times, usually within the hour.</Typography>}
    {activity.includes.length > 0 && <>
      <Typography sx={{ fontWeight: 700, mt: 3 }}>Included</Typography>
      <Stack component="ul" spacing={.75} sx={{ listStyle: 'none', p: 0, m: 0, mt: 1 }}>
        {activity.includes.map((item) => <Stack component="li" key={item} direction="row" spacing={1} alignItems="center"><CheckRounded sx={{ fontSize: 18, color: 'success.main' }} /><Typography sx={{ fontSize: 14.5 }}>{item}</Typography></Stack>)}
      </Stack>
    </>}
    <ActionButton action={actions[0]} fullWidth sx={{ mt: 3 }} />
    {priced && <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 1.25, textAlign: 'center' }}>In Thai baht{activity.bookOnline ? ', paid online when you book' : ''}.</Typography>}
  </>;

  return <><Page model={{
    kicker: activity.id === 'golf' ? 'The course · 9 or 18 holes' : activity.card.kicker || activity.name, name: activity.id === 'golf' ? 'A round worth coming for.' : activity.name, lead: activity.id === 'golf' ? 'Tropical fairways, mountain views and a warm welcome. Play nine holes, or make a day of it with our 18-hole Golf package. Green fee, caddie and cart included.' : activity.card.detail || activity.tagline,
    about: activity.about || activity.card.detail, images: activity.card.images, icon: activity.icon, actions, aside, goodToKnow,
  }} />
    {activity.rentals && rentals.length > 0 && <Container maxWidth="xl" sx={{ mt: 6 }}>
      <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 42 }, mb: 1 }}>Your clubs, sorted.</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>Travel light. Choose a rental set and add it to your booking.</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0,1fr))' }, gap: 2 }}>{rentals.map((r) => <RentalCard key={r.id} rental={r} />)}</Box>
    </Container>}
    <CourseGuide id={activity.id} />
  </>;
}

function PlacePage({ place }: { place: Place }) {
  const contact = useContact();
  const { club } = useSite();
  const actions = place.actions.map((a): Action => a.href === 'whatsapp' ? { label: a.label, href: chat(contact.whatsapp, a.message ?? 'Hi Hula Hula Golf Club! '), newTab: true } : a);
  const aside = <>
    {place.showHours && <>
      <Typography variant="h3" sx={{ fontSize: 26 }}>Opening hours</Typography>
      <Stack spacing={.5} sx={{ mt: 1.5 }}>{openingHoursLines(club).map((line) => <Typography key={line} sx={{ fontFamily: fonts.playful, fontSize: 19, color: 'primary.dark' }}>{line}</Typography>)}</Stack>
      {club.hoursNote && <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 1 }}>{club.hoursNote}</Typography>}
    </>}
    <Typography variant="h3" sx={{ fontSize: place.showHours ? 20 : 26, mt: place.showHours ? 3 : 0 }}>{place.kind === 'villa' ? 'The villa' : 'Good to know'}</Typography>
    <Stack component="ul" spacing={.9} sx={{ listStyle: 'none', p: 0, m: 0, mt: 1.5 }}>
      {place.facts.map((fact) => <Stack component="li" key={fact} direction="row" spacing={1} alignItems="flex-start"><CheckRounded sx={{ fontSize: 18, color: 'success.main', mt: '2px' }} /><Typography sx={{ fontSize: 14.5 }}>{fact}</Typography></Stack>)}
    </Stack>
    <ActionButton action={actions[0]} fullWidth sx={{ mt: 3 }} />
  </>;
  return <Page model={{ kicker: place.kicker, name: place.name, lead: place.tagline, about: place.about, images: place.images, icon: place.kind, actions, aside, goodToKnow: [] }} />;
}

function Page({ model }: { model: PageModel }) {
  const [cover, ...more] = model.images;
  const paragraphs = model.about.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
  return <>
    <PageIntro title={model.name} description={model.lead} image={cover || '/images/golf/sunnyFairway-1600.webp'} eyebrow={model.kicker} parent={{ label: 'Activities', href: '/activities' }}>
      <ActionButton action={model.actions[0]} />
      {model.actions[1] && <ActionButton action={model.actions[1]} variant="outlined" />}
    </PageIntro>

    <Container maxWidth="xl" sx={{ mt: { xs: 4, md: 7 } }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.5fr) minmax(0, 1fr)' }, gap: { xs: 4, md: 6 }, alignItems: 'start' }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 42 } }}>What it’s like</Typography>
          {paragraphs.map((text, i) => <Typography key={i} sx={{ mt: 2, fontSize: 16.5, lineHeight: 1.8, color: 'text.secondary' }}>{text}</Typography>)}
          {more.length > 0 && <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: { xs: 1.25, md: 2 }, mt: 4 }}>
            {more.map((image, i) => {
              // An odd one out at the end takes the full width, as a wide picture.
              const wide = more.length % 2 === 1 && i === more.length - 1;
              return <Box key={image} sx={{ aspectRatio: wide ? '16 / 9' : '4 / 3', borderRadius: i % 2 ? '18px 48px 18px 18px' : '18px', overflow: 'hidden', border: '5px solid #fffef8', boxShadow: '0 10px 24px rgba(23,60,44,.10)', gridColumn: wide ? '1 / -1' : 'auto' }}>
                <ClubPhoto image={image} alt="" sizes={wide ? '(max-width: 900px) 92vw, 60vw' : '(max-width: 900px) 46vw, 30vw'} />
              </Box>;
            })}
          </Box>}
          {model.goodToKnow.length > 0 && <Box sx={{ mt: 5, p: { xs: 2.5, md: 3.5 }, borderRadius: '24px', bgcolor: 'success.light' }}>
            <Typography variant="h3" sx={{ fontSize: 26 }}>Good to know</Typography>
            <Box component="dl" sx={{ m: 0, mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.25 }}>
              {model.goodToKnow.map((item) => <Box key={item.title}>
                <Typography component="dt" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                <Typography component="dd" sx={{ m: 0, mt: .25, fontSize: 14.5, color: 'text.secondary', lineHeight: 1.6 }}>{item.text}</Typography>
              </Box>)}
            </Box>
          </Box>}
        </Box>
        <Box component="aside" sx={{ position: { md: 'sticky' }, top: { md: STICKY_TOP }, p: { xs: 2.5, md: 3 }, borderRadius: '24px', border: '1px solid', borderColor: 'divider', borderTop: '5px solid #50830d', bgcolor: 'background.paper', boxShadow: '0 12px 30px rgba(23,60,44,.06)' }}>
          {model.aside}
        </Box>
      </Box>
    </Container>
  </>;
}

function PriceRow({ label, detail, amount }: { label: string; detail: string; amount: number }) {
  return <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2} sx={{ pb: 1.5, borderBottom: '1px dashed #d6e1ce' }}>
    <Box>
      <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{detail}</Typography>
    </Box>
    <Typography sx={{ fontFamily: fonts.playful, fontSize: 30, color: 'primary.main', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{amount > 0 ? money(amount) : 'Ask us'}</Typography>
  </Stack>;
}

function ActionButton({ action, variant = 'contained', color = 'primary', fullWidth, sx }: { action: Action; variant?: 'contained' | 'outlined'; color?: 'primary' | 'secondary'; fullWidth?: boolean; sx?: object }) {
  const internal = action.href.startsWith('/');
  const icon = action.href.startsWith('https://wa.me') ? <WhatsApp /> : undefined;
  return <Button href={action.href} onClick={internal ? linkClick(action.href) : undefined} target={action.newTab ? '_blank' : undefined} rel={action.newTab ? 'noopener noreferrer' : undefined}
    variant={variant} color={color} fullWidth={fullWidth} startIcon={icon} endIcon={icon ? undefined : <East sx={{ fontSize: 17 }} />} sx={sx}>{action.label}</Button>;
}

function MoreToDo({ exclude }: { exclude: string }) {
  const site = useSite();
  const things = useMemo(() => thingsToDo(site).filter((t) => t.id !== exclude), [site, exclude]);
  return <Box component="section" aria-labelledby="more-heading" sx={{ mt: { xs: 8, md: 11 }, py: { xs: 6, md: 8 }, bgcolor: 'primary.main', color: 'white' }}>
    <Container maxWidth="xl">
      <Typography id="more-heading" variant="h2" sx={{ fontSize: { xs: 34, md: 46 }, mb: { xs: 3, md: 4 } }}>More to do at Hula Hula</Typography>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 2, md: 2.5 } }}>
        {things.slice(0, 4).map((thing) => <Box component="li" key={thing.id}><ThingCard thing={thing} sizes="(max-width: 600px) 92vw, (max-width: 900px) 46vw, 260px" /></Box>)}
      </Box>
    </Container>
  </Box>;
}

function NotFound() {
  return <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
    <Typography variant="h1" sx={{ fontSize: 36 }}>We couldn’t find that</Typography>
    <Typography sx={{ color: 'text.secondary', mt: 1.5 }}>It may not be running at the moment, or the link has changed.</Typography>
    <Button href="/activities" onClick={linkClick('/activities')} variant="contained" sx={{ mt: 3 }}>See everything to do</Button>
  </Container>;
}
