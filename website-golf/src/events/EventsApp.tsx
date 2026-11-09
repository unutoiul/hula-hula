import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import EventRounded from '@mui/icons-material/EventRounded';
import LockRounded from '@mui/icons-material/LockRounded';
import PlaceRounded from '@mui/icons-material/PlaceRounded';
import { Alert, Autocomplete, Box, Button, Chip, CircularProgress, Container, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { downloadIcs, googleCalendarUrl } from '../booking/calendar';
import type { EventOrderView, PublicEvent, PublicPackage } from '../booking/contract';
import { COUNTRIES, guessCountry } from '../booking/countries';
import { toMinutes } from '../booking/dates';
import { money, plural } from '../booking/pricing';
import { GuestStepper } from '../components/booking/GuestStepper';
import { PaymentLogos } from '../components/common/PaymentMethods';
import { CARD_PEEK, PineappleGolfer } from '../components/common/PineappleGolfer';
import { PageIntro } from '../components/layout/PageIntro';
import { PublicPageLayout } from '../components/layout/PublicPageLayout';
import { useContact } from '../context/SiteDataContext';
import { photoAssets as p } from '../data/photos';
import { watchContent } from '../data/contentSync';
import { linkClick, navigate, useLocation } from '../router';
import { fonts } from '../theme';
import { EventApiError, eventWhen, fetchEvent, fetchOrder, startOrder } from './api';
import { SECTION_SCROLL_OFFSET, STICKY_TOP } from '../layoutConstants';

// /events/<slug> — an event's own page: the poster, the story, the schedule
// and its packages, each bought through Payso's secure payment page.
// /events/order?ref&key — where the guest lands after paying. Loaded only
// when someone heads here (React.lazy in App).

export default function EventsApp() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/events\/?/, '').split('/')[0];
  useEffect(() => { if (!slug) navigate('/events', { replace: true }); }, [slug]);
  return <PublicPageLayout>
    <Box sx={{ pb: { xs: 6, md: 8 } }}>
      {slug === 'order' ? <OrderPage /> : slug ? <EventPage slug={slug} /> : null}
    </Box>
  </PublicPageLayout>;
}

// ── The event ──────────────────────────────────────────────────────────────

function EventPage({ slug }: { slug: string }) {
  const contact = useContact();
  const [event, setEvent] = useState<PublicEvent | null | undefined>(undefined);
  const [testPayments, setTestPayments] = useState(false);
  const [buying, setBuying] = useState<{ pack: PublicPackage; quantity: number } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setEvent(undefined);
    setBuying(null);
    setLoadError(null);
    const stop = watchContent('events', async () => {
      try {
        const { event: fresh, testPayments: test } = await fetchEvent(slug);
        if (!alive) return;
        setEvent(fresh ?? null);
        setTestPayments(test);
        setLoadError(null);
        setBuying(current => {
          if (!current) return null;
          const pack = fresh?.packages.find(item => item.id === current.pack.id);
          // Do not leave an old price or a withdrawn package in an open checkout.
          return fresh?.salesOpen && pack && pack.price === current.pack.price && pack.left >= current.quantity && pack.maxPerOrder >= current.quantity ? { ...current, pack } : null;
        });
      } catch (error) {
        if (!alive) return;
        if (error instanceof EventApiError && error.status === 404) { setEvent(null); setBuying(null); }
        else setLoadError('We couldn’t refresh this event. Please check your connection and try again.');
      }
    });
    return () => { alive = false; stop(); };
  }, [slug]);
  useEffect(() => { if (event) document.title = `${event.title} — Hula Hula Golf Club`; }, [event]);

  if (event === undefined) return <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh', p: 3 }}>{loadError ? <Alert severity="warning" action={<Button onClick={() => window.location.reload()}>Retry</Button>}>{loadError}</Alert> : <CircularProgress aria-label="Loading" />}</Box>;
  if (event === null) return <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
    <Typography variant="h1" sx={{ fontSize: 36 }}>We couldn’t find that event</Typography>
    <Typography sx={{ color: 'text.secondary', mt: 1.5 }}>It may have finished, or the link has changed.</Typography>
    <Button href="/events" onClick={linkClick('/events')} variant="contained" sx={{ mt: 3 }}>See what’s on</Button>
  </Container>;

  const paragraphs = event.description.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
  const soldOut = event.packages.every((pk) => pk.left === 0);

  return <>
    <PageIntro title={event.title} description={event.tagline} image={event.coverImage || p.fairwayBalcony.src} eyebrow="Club events" parent={{ label: 'Events & offers', href: '/events' }} breadcrumbLabel={event.title}>
      <Stack gap={2.5} alignItems={{ xs: 'stretch', sm: 'flex-start' }} sx={{ minWidth: 0 }}>
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ '& .MuiChip-root': { maxWidth: '100%', height: 'auto', minHeight: 32 }, '& .MuiChip-label': { whiteSpace: 'normal', py: .75 } }}>
          <Chip icon={<EventRounded sx={{ color: 'inherit !important' }} />} label={eventWhen(event)} sx={{ bgcolor: 'secondary.main', color: 'text.primary', fontWeight: 700 }} />
          <Chip icon={<PlaceRounded sx={{ color: 'inherit !important' }} />} label="Hula Hula Golf Club" sx={{ bgcolor: 'success.light', color: 'primary.dark', fontWeight: 700 }} />
        </Stack>
        {event.packages.length > 0 && <Button href="#packages" variant="contained">{soldOut ? 'Sold out — see packages' : event.salesOpen ? 'Choose your package' : 'See the packages'}</Button>}
      </Stack>
    </PageIntro>

    <Container maxWidth="xl" sx={{ mt: { xs: 4, md: 7 } }}>
      {loadError && <Alert severity="warning" sx={{ mb: 3 }}>{loadError}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.5fr) minmax(0, 1fr)' }, gap: { xs: 4, md: 6 }, alignItems: 'start' }}>
        <Box>
          {paragraphs.length > 0 && <>
            <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 42 } }}>About the day</Typography>
            {paragraphs.map((text, i) => <Typography key={i} sx={{ mt: 2, fontSize: 16.5, lineHeight: 1.8, color: 'text.secondary', whiteSpace: 'pre-line' }}>{text}</Typography>)}
          </>}
          {event.highlights.length > 0 && <Box sx={{ mt: 4, p: { xs: 2.5, md: 3 }, borderRadius: '24px', bgcolor: 'success.light' }}>
            <Typography variant="h3" sx={{ fontSize: 24 }}>Highlights</Typography>
            <Stack spacing={1.25} sx={{ mt: 1.5 }}>
              {event.highlights.map((h) => <Stack key={h} direction="row" spacing={1.25} alignItems="flex-start"><CheckCircleRounded sx={{ color: 'success.main', fontSize: 20, mt: '2px' }} /><Typography>{h}</Typography></Stack>)}
            </Stack>
          </Box>}
        </Box>
        {event.schedule.length > 0 && <Box sx={{ position: { md: 'sticky' }, top: { md: STICKY_TOP }, p: { xs: 2.5, md: 3 }, borderRadius: '24px', border: '1px solid', borderColor: 'divider', borderTop: '5px solid #50830d', bgcolor: 'background.paper' }}>
          <Typography variant="h3" sx={{ fontSize: 24, mb: 2 }}>The schedule</Typography>
          <Stack spacing={0}>
            {event.schedule.map((item, i) => <Stack key={i} direction="row" spacing={2} sx={{ pb: 1.75, position: 'relative' }}>
              <Typography sx={{ fontFamily: fonts.playful, color: 'primary.main', minWidth: 58, fontVariantNumeric: 'tabular-nums' }}>{item.time}</Typography>
              <Typography sx={{ fontSize: 15 }}>{item.text}</Typography>
            </Stack>)}
          </Stack>
        </Box>}
      </Box>

      <Box id="packages" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET, mt: { xs: 6, md: 9 } }}>
        <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 48 }, textAlign: { xs: 'center', md: 'left' } }}>Choose your package</Typography>
        {event.salesOpen && event.packages.length > 0 && <PaymentLogos sx={{ mt: 1.5, justifyContent: { xs: 'center', md: 'flex-start' } }} />}
        {!event.salesOpen && <Alert severity="info" sx={{ mt: 2 }}>Online sales for this event are closed. WhatsApp us on {contact.phone} and we’ll see what we can do.</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: `repeat(${Math.min(3, Math.max(1, event.packages.length))}, 1fr)` }, gap: 2.5, mt: 3 }}>
          {event.packages.map((pack) => <PackageCard key={pack.id} pack={pack} open={event.salesOpen} onBuy={(quantity) => setBuying({ pack, quantity })} />)}
        </Box>
        {event.packages.length === 0 && <Typography sx={{ color: 'text.secondary', mt: 2 }}>Packages are coming soon — WhatsApp us to save a place.</Typography>}
      </Box>
    </Container>

    {buying && <CheckoutDialog event={event} pack={buying.pack} quantity={buying.quantity} testPayments={testPayments} onClose={() => setBuying(null)} />}
  </>;
}

function PackageCard({ pack, open, onBuy }: { pack: PublicPackage; open: boolean; onBuy: (quantity: number) => void }) {
  const max = Math.min(pack.maxPerOrder, pack.left);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => { setQuantity(value => Math.max(1, Math.min(value, max))); }, [max]);
  const soldOut = pack.left === 0;
  return <Box component="article" sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2.5, md: 3 }, borderRadius: '24px', bgcolor: 'background.paper', border: '1px solid rgba(23,60,44,.10)', borderTop: '5px solid', borderTopColor: soldOut ? 'divider' : 'secondary.main', boxShadow: '0 10px 26px rgba(23,60,44,.07)', opacity: soldOut ? .7 : 1 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
      <Typography variant="h3" sx={{ fontSize: 26, lineHeight: 1.15 }}>{pack.name}</Typography>
      <Chip size="small" label={soldOut ? 'Sold out' : pack.left <= 10 ? `${pack.left} left` : 'Available'} color={soldOut ? 'default' : pack.left <= 10 ? 'warning' : 'success'} sx={{ fontWeight: 700, flexShrink: 0 }} />
    </Stack>
    <Typography sx={{ fontFamily: fonts.playful, fontSize: 38, color: 'primary.main', lineHeight: 1.1, mt: 1 }}>{money(pack.price)}<Box component="span" sx={{ fontSize: 15, color: 'text.secondary', fontFamily: fonts.sans }}> per person</Box></Typography>
    {pack.description && <Typography sx={{ color: 'text.secondary', mt: 1.5, lineHeight: 1.7 }}>{pack.description}</Typography>}
    {pack.includes.length > 0 && <Stack component="ul" spacing={.75} sx={{ listStyle: 'none', p: 0, m: 0, mt: 2 }}>
      {pack.includes.map((item) => <Stack component="li" key={item} direction="row" spacing={1} alignItems="flex-start"><CheckRounded sx={{ fontSize: 18, color: 'success.main', mt: '2px' }} /><Typography sx={{ fontSize: 14.5 }}>{item}</Typography></Stack>)}
    </Stack>}
    <Box sx={{ mt: 'auto', pt: 2.5 }}>
      {open && !soldOut && <>
        {max > 1 && <GuestStepper label="How many" value={quantity} min={1} max={max} onChange={setQuantity} />}
        <Button fullWidth variant="contained" onClick={() => onBuy(quantity)} sx={{ mt: 1.5 }}>Book {quantity > 1 ? `${quantity} · ${money(pack.price * quantity)}` : `· ${money(pack.price)}`}</Button>
      </>}
    </Box>
  </Box>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\d\s.-]{6,30}$/;

function CheckoutDialog({ event, pack, quantity, testPayments, onClose }: { event: PublicEvent; pack: PublicPackage; quantity: number; testPayments: boolean; onClose: () => void }) {
  const theme = useTheme();
  const phoneScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [guest, setGuest] = useState({ firstName: '', lastName: '', email: '', phone: '', country: guessCountry(), notes: '' });
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hp, setHp] = useState('');
  const startedAt = useRef(performance.now());
  const set = (change: Partial<typeof guest>) => setGuest((g) => ({ ...g, ...change }));
  const errors = {
    firstName: !guest.firstName.trim() ? 'Please add a first name' : '',
    lastName: !guest.lastName.trim() ? 'Please add a last name' : '',
    email: !EMAIL.test(guest.email.trim()) ? 'Please add an email — your confirmation goes there' : '',
    phone: !PHONE.test(guest.phone.trim()) ? 'Please add a phone number with country code' : '',
    country: !guest.country ? 'Please choose a country' : '',
  };
  const shown = (key: keyof typeof errors) => (tried ? errors[key] : '');
  const total = pack.price * quantity;

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    setBusy(true); setError(null);
    try {
      const { webPaymentUrl } = await startOrder({ slug: event.slug, packageId: pack.id, quantity, guest, hp, elapsedMs: Math.round(performance.now() - startedAt.current) });
      // On to Payso's own secure page; it sends the guest back to /events/order.
      window.location.assign(webPaymentUrl);
    } catch (err) {
      setBusy(false);
      setError(err instanceof EventApiError ? err.message : 'We couldn’t start your payment. Please try again.');
    }
  };

  return <Dialog open onClose={busy ? undefined : onClose} fullScreen={phoneScreen} fullWidth maxWidth="sm" scroll="paper">
    <DialogTitle sx={{ pr: 7 }}>
      {pack.name} × {quantity}
      <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{event.title} · {eventWhen(event)}</Typography>
      <IconButton aria-label="Close" onClick={onClose} disabled={busy} sx={{ position: 'absolute', right: 12, top: 12 }}><CloseRounded /></IconButton>
    </DialogTitle>
    <DialogContent dividers>
      <Box component="form" id="event-checkout" noValidate onSubmit={pay}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
          <TextField label="First name" required autoComplete="given-name" value={guest.firstName} onChange={(e) => set({ firstName: e.target.value.slice(0, 60) })} error={!!shown('firstName')} helperText={shown('firstName')} />
          <TextField label="Last name" required autoComplete="family-name" value={guest.lastName} onChange={(e) => set({ lastName: e.target.value.slice(0, 60) })} error={!!shown('lastName')} helperText={shown('lastName')} />
          <TextField label="Email" type="email" required autoComplete="email" value={guest.email} onChange={(e) => set({ email: e.target.value.slice(0, 120) })} error={!!shown('email')} helperText={shown('email')} />
          <TextField label="Phone / WhatsApp" type="tel" required autoComplete="tel" placeholder="+66 81 234 5678" value={guest.phone} onChange={(e) => set({ phone: e.target.value.slice(0, 30) })} error={!!shown('phone')} helperText={shown('phone')} />
          <Autocomplete options={COUNTRIES} value={COUNTRIES.find((c) => c.code === guest.country) ?? null} onChange={(_, value) => set({ country: value?.code ?? '' })} sx={{ gridColumn: { sm: '1 / -1' } }}
            getOptionLabel={(option) => option.name} isOptionEqualToValue={(a, b) => a.code === b.code} autoHighlight
            renderInput={(params) => <TextField {...params} label="Country" required autoComplete="country-name" error={!!shown('country')} helperText={shown('country')} />} />
        </Box>
        <TextField label={quantity > 1 ? 'Names of everyone coming, and anything we should know (optional)' : 'Anything we should know? (optional)'} multiline minRows={2} fullWidth value={guest.notes} onChange={(e) => set({ notes: e.target.value.slice(0, 1000) })} sx={{ mt: 2 }} />
        {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
        <Box aria-hidden="true" sx={{ position: 'absolute', left: -10000, width: 1, height: 1, overflow: 'hidden' }}>
          <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
        </Box>
        <Divider sx={{ my: 2.5 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography>{plural(quantity, 'place')} × {money(pack.price)}</Typography>
          <Typography sx={{ fontFamily: fonts.playful, fontSize: 26 }}>{money(total)}</Typography>
        </Stack>
        {testPayments && <Alert severity="info" sx={{ mt: 2 }}>Test mode: this is a Payso demo account, so nothing is charged. To try it, use card 4311 1510 0999 9993, expiry 12/30, CVV 180.</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button type="submit" fullWidth variant="contained" size="large" disabled={busy} startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <LockRounded />} sx={{ mt: 2.5 }}>
          {busy ? 'Taking you to secure payment…' : `Pay ${money(total)} securely`}
        </Button>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', mt: 1.25 }}>You’ll pay on Payso’s secure page and come straight back here. Your places are held for 20 minutes.</Typography>
        <PaymentLogos size={26} sx={{ mt: 1.25, justifyContent: 'center' }} />
      </Box>
    </DialogContent>
  </Dialog>;
}

// ── After paying ───────────────────────────────────────────────────────────

const POLL_FOR_MS = 2 * 60_000;

function OrderPage() {
  const contact = useContact();
  const { query } = useLocation();
  const ref = query.get('ref') ?? '';
  const key = query.get('key') ?? '';
  const [order, setOrder] = useState<EventOrderView | null>(null);
  const [problem, setProblem] = useState<'missing' | 'slow' | null>(null);

  useEffect(() => {
    if (!ref || !key) { setProblem('missing'); return; }
    let cancelled = false, timer = 0;
    const started = Date.now();
    const poll = async (delay: number) => {
      try {
        const next = await fetchOrder(ref, key);
        if (cancelled) return;
        setOrder(next);
        if (next.status !== 'pending') return;
      } catch {
        if (cancelled) return;
        if (!order) { setProblem('missing'); return; }
      }
      if (Date.now() - started > POLL_FOR_MS) { setProblem('slow'); return; }
      timer = window.setTimeout(() => void poll(Math.min(delay * 1.5, 5000)), delay);
    };
    void poll(1500);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [ref, key]);

  const card = (children: ReactNode) => <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 5, md: 8 } }}>
    <Box sx={{ position: 'relative', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '28px', p: { xs: 3, md: 4.5 }, boxShadow: '0 18px 55px rgba(23,60,44,.07)' }}>{children}</Box>
  </Container>;

  if (problem === 'missing') return card(<>
    <Typography variant="h1" sx={{ fontSize: 32 }}>Check your email</Typography>
    <Typography sx={{ color: 'text.secondary', mt: 1.5 }}>We can’t show this order here. If you paid, your confirmation is on its way by email{ref ? ` (order ${ref})` : ''}. Questions? WhatsApp us on {contact.phone}.</Typography>
    <Button href="/" onClick={linkClick('/')} variant="outlined" sx={{ mt: 3 }}>Back to the club</Button>
  </>);

  if (!order || order.status === 'pending') return card(<Box sx={{ textAlign: 'center' }} aria-live="polite">
    {problem === 'slow'
      ? <>
        <Typography variant="h1" sx={{ fontSize: 30 }}>Still waiting for the payment</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1.5 }}>The bank hasn’t confirmed it yet. If you completed the payment, your confirmation will arrive by email shortly — there’s no need to pay again. If you cancelled, nothing was charged and your places are released within 20 minutes. Order {ref}.</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mt: 3 }}>
          <Button variant="contained" onClick={() => window.location.reload()}>Check again</Button>
          <Button variant="outlined" href={contact.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp us</Button>
        </Stack>
      </>
      : <>
        <CircularProgress />
        <Typography variant="h1" sx={{ fontSize: 30, mt: 2 }}>Confirming your payment…</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1 }}>This usually takes a few seconds. Please keep this page open.</Typography>
      </>}
  </Box>);

  const eventHref = order.eventSlug ? `/events/${order.eventSlug}` : '/';
  if (order.status !== 'paid') return card(<>
    <Typography variant="h1" sx={{ fontSize: 30 }}>{order.status === 'failed' ? 'Your payment didn’t go through' : order.status === 'expired' ? 'This order ran out of time' : 'This order was cancelled'}</Typography>
    <Alert severity="warning" sx={{ mt: 2 }}>{order.status === 'expired' ? 'The payment window closed before the payment finished.' : 'No payment was taken for this order.'} Nothing was charged.</Alert>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
      <Button variant="contained" href={eventHref} onClick={linkClick(eventHref)}>Try again</Button>
      <Button variant="outlined" href={contact.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp us</Button>
    </Stack>
  </>);

  // Into a calendar only with a start time; three hours when there's no end time.
  const minutes = order.startTime && order.endTime && order.endTime > order.startTime ? toMinutes(order.endTime) - toMinutes(order.startTime) : 180;
  const calendarItem = order.startTime ? { uid: order.ref, title: order.eventTitle, date: order.startsOn, time: order.startTime, minutes, note: `Order ${order.ref} · ${order.packageName} × ${order.quantity}.` } : null;
  return card(<>
    <PineappleGolfer sizes="110px" sx={CARD_PEEK} />
    <Stack direction="row" spacing={1.5} alignItems="center"><CheckCircleRounded sx={{ color: 'success.main', fontSize: 40 }} /><Typography variant="overline" sx={{ color: 'success.dark' }}>Confirmed · {order.ref}</Typography></Stack>
    <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 42 }, mt: 1, lineHeight: 1.08 }}>You’re in!</Typography>
    <Typography sx={{ color: 'text.secondary', mt: 1.25 }}>We’ve emailed your confirmation to <strong>{order.email}</strong>. Quote <strong>{order.ref}</strong> if you get in touch.</Typography>
    {order.testPayment && <Alert severity="info" sx={{ mt: 2 }}>This was a test payment on a Payso demo account — nothing was charged.</Alert>}
    <Box sx={{ mt: 3, p: 2.5, bgcolor: 'primary.light', borderRadius: '20px' }}>
      <Typography sx={{ fontFamily: fonts.playful, fontSize: 24, color: 'primary.dark', lineHeight: 1.2 }}>{order.eventTitle}</Typography>
      <Typography sx={{ mt: .5 }}>{eventWhen({ startsOn: order.startsOn, endsOn: null, startTime: order.startTime, endTime: order.endTime }, true)}</Typography>
      <Typography sx={{ mt: .5 }}>{order.packageName} × {order.quantity} · {order.testPayment ? 'test payment' : `paid ${money(order.total)}`}</Typography>
    </Box>
    {calendarItem && <>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.secondary', mt: 3 }}>Add it to your calendar</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5, mt: 1 }}>
        <Button variant="contained" startIcon={<EventRounded />} href={googleCalendarUrl(calendarItem, contact)} target="_blank" rel="noopener noreferrer" sx={{ whiteSpace: 'nowrap' }}>Google Calendar</Button>
        <Button variant="outlined" onClick={() => downloadIcs(calendarItem, contact)} sx={{ whiteSpace: 'nowrap' }}>Apple / Outlook</Button>
      </Box>
    </>}
    <Box sx={{ textAlign: 'center', mt: 2.5 }}>
      <Button href={eventHref} onClick={linkClick(eventHref)} color="inherit" sx={{ whiteSpace: 'nowrap' }}>Back to the event</Button>
    </Box>
  </>);
}
