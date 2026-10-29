import CheckRounded from '@mui/icons-material/CheckRounded';
import East from '@mui/icons-material/East';
import PersonRounded from '@mui/icons-material/PersonRounded';
import PersonOutlineRounded from '@mui/icons-material/PersonOutlineRounded';
import { Alert, Box, Button, Link, Skeleton, Stack, Typography } from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';
import { GuestStepper } from '../../components/booking/GuestStepper';
import { useContact, useSite } from '../../context/SiteDataContext';
import { navigate } from '../../router';
import { fonts } from '../../theme';
import { ActivityIcon } from '../activityIcons';
import { fetchTeeSheet } from '../api';
import { DAY_PARTS, dayPartOf, fits, type DayPart, type Slot } from '../availability';
import { bookHref, useBookingFlow } from '../BookingFlowContext';
import { BookingSummary } from '../components/BookingSummary';
import { DateStrip } from '../components/DateStrip';
import { addDays, durationLabel, fromMinutes, shortDayLabel, timeLabel, toMinutes } from '../dates';
import { fromPrice, money, peopleLabel, plural, pricePerPerson } from '../pricing';

type Sheet = { status: 'loading' | 'ready'; slots: Slot[] } | { status: 'error'; slots: Slot[]; error: string };

// Step 1: what to play, the day and the group, then the tee sheet for that
// day — every start with how many places are left. Picking one holds it for
// a few minutes while the rest of the booking is filled in.
export function TeeTimeStep() {
  const CONTACT = useContact();
  const { activity, option, search, setSearch, time, selectTime, holdExpired, total } = useBookingFlow();
  const [sheet, setSheet] = useState<Sheet>({ status: 'loading', slots: [] });
  const [dayPart, setDayPart] = useState<DayPart | 'all'>('all');
  const [attempt, setAttempt] = useState(0);

  // The address bar follows the search, so a reload or a shared link shows the same sheet.
  useEffect(() => { navigate(bookHref(search), { replace: true }); }, [search]);

  useEffect(() => {
    let cancelled = false;
    setSheet((s) => ({ status: 'loading', slots: s.slots }));
    fetchTeeSheet(search.activity, search.option, search.date)
      .then((slots) => { if (!cancelled) setSheet({ status: 'ready', slots }); })
      .catch((error: Error) => { if (!cancelled) setSheet({ status: 'error', slots: [], error: error.message }); });
    return () => { cancelled = true; };
  }, [search.activity, search.option, search.date, attempt]);

  const visible = sheet.slots.filter((slot) => dayPart === 'all' || dayPartOf(slot.time) === dayPart);
  const openCount = (part: DayPart | 'all') => sheet.slots.filter((s) => (part === 'all' || dayPartOf(s.time) === part) && fits(s, search.players)).length;
  const each = pricePerPerson(activity, option, search.players);
  const goOn = () => { if (time) navigate('/book/extras'); };
  const continueButton = <Button fullWidth variant="contained" disabled={!time} onClick={goOn} endIcon={<East />}>Continue</Button>;
  const { activities } = useSite();
  const people = activity.peopleNoun === 'person' ? 'People' : 'Players';
  // A private-group activity (lessons) has a few fixed sessions — no need to filter by time of day.
  const fewStarts = activity.privateGroup;

  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' }, gap: { xs: 3, md: 4 }, alignItems: 'start' }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.1 }}>Book a tee time</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>Pick what you’d like to play and a time that suits. We’ll hold it while you finish booking.</Typography>

      {holdExpired && !time && <Alert severity="warning" sx={{ mb: 2 }}>Your held time was released after a few minutes. It may still be free — pick it again below.</Alert>}

      <Panel step="1" title="What would you like to play?">
        <Box role="radiogroup" aria-label="Activity" sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))' }, gap: 1.25 }}>
          {activities.map((a) => {
            const selected = a.id === activity.id;
            return <Box key={a.id} component="button" type="button" role="radio" aria-checked={selected} onClick={() => setSearch({ activity: a.id })} sx={{
              display: 'grid', justifyItems: 'start', gap: .5, p: 1.5, textAlign: 'left', font: 'inherit', cursor: 'pointer', borderRadius: '16px',
              border: '2px solid', borderColor: selected ? 'primary.main' : 'divider', bgcolor: selected ? 'primary.light' : 'background.paper', color: 'text.primary',
              transition: 'border-color .2s ease, background-color .2s ease', '&:hover': { borderColor: 'primary.main' },
            }}>
              <Box aria-hidden sx={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: selected ? 'primary.main' : 'success.light', color: selected ? 'primary.contrastText' : 'success.dark', '& svg': { fontSize: 20 } }}><ActivityIcon icon={a.icon} /></Box>
              <Box component="span" sx={{ fontFamily: fonts.playful, fontSize: 17, lineHeight: 1.2 }}>{a.name}</Box>
              <Box component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>from {money(fromPrice(a))}</Box>
            </Box>;
          })}
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} sx={{ mt: 2.5 }} alignItems={{ sm: 'center' }}>
          {activity.options.length > 1 && <Box>
            <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary', fontSize: 10.5 }}>{activity.optionsLabel}</Typography>
            <Stack direction="row" spacing={1} role="radiogroup" aria-label={activity.optionsLabel} sx={{ mt: .5 }}>
              {activity.options.map((o) => <Button key={o.id} role="radio" aria-checked={o.id === option.id} size="small" variant={o.id === option.id ? 'contained' : 'outlined'} color={o.id === option.id ? 'primary' : 'inherit'} onClick={() => setSearch({ option: o.id })} sx={{ borderColor: 'divider' }}>
                {o.label}
              </Button>)}
            </Stack>
          </Box>}
          <Box sx={{ minWidth: { sm: 240 } }}>
            <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary', fontSize: 10.5 }}>{activity.units > 1 ? `People in the ${activity.slotNoun}` : people}</Typography>
            <GuestStepper label={peopleLabel(activity, search.players)} value={search.players} min={activity.minPlayers} max={activity.maxPlayers} onChange={(players) => setSearch({ players })} />
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 1.5 }}>
          {activity.tagline} · {durationLabel(option.minutes)} · {money(each)} per {activity.peopleNoun}
          {activity.soloPrice ? ` (${money(activity.soloPrice)} on your own)` : ''} · up to {activity.maxPlayers} {activity.units > 1 ? `per ${activity.slotNoun}` : 'per group'}.
          {' '}Bigger group? <Link href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp us</Link> and we’ll line up times together.
        </Typography>
      </Panel>

      <Panel step="2" title="Pick a day">
        <DateStrip value={search.date} onChange={(date) => setSearch({ date })} />
      </Panel>

      <Panel step="3" title={`${activity.slotNoun.replace(/^./, (c) => c.toUpperCase())}s on ${shortDayLabel(search.date)}`}>
        {!fewStarts && <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mb: 2 }} role="radiogroup" aria-label="Time of day">
          {([{ id: 'all', label: 'All day', hint: '' }, ...DAY_PARTS] as const).map((part) => <Button key={part.id} role="radio" aria-checked={dayPart === part.id} size="small"
            variant={dayPart === part.id ? 'contained' : 'outlined'} color={dayPart === part.id ? 'primary' : 'inherit'} onClick={() => setDayPart(part.id)} sx={{ borderColor: 'divider' }}>
            {part.label}{sheet.status === 'ready' ? ` · ${openCount(part.id)}` : ''}
          </Button>)}
        </Stack>}

        <Box aria-busy={sheet.status === 'loading'} aria-live="polite">
          {sheet.status === 'error' && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setAttempt((n) => n + 1)}>Try again</Button>}>{sheet.error}</Alert>}
          {sheet.status === 'loading' && sheet.slots.length === 0 && <SlotGrid>{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} variant="rounded" height={104} sx={{ borderRadius: '16px' }} />)}</SlotGrid>}
          {sheet.status !== 'error' && (sheet.status === 'ready' || sheet.slots.length > 0) && <>
            {visible.length === 0 && sheet.status === 'ready'
              ? <Box sx={{ textAlign: 'center', py: 5, px: 2, border: '1px dashed', borderColor: 'divider', borderRadius: '20px' }}>
                <Typography variant="h3" sx={{ fontSize: 24 }}>{sheet.slots.length ? 'Nothing left at this time of day' : 'No more times today'}</Typography>
                <Typography sx={{ color: 'text.secondary', mt: 1, mb: 2.5 }}>{sheet.slots.length ? 'Try another part of the day.' : 'Online booking closes an hour before each start. Try tomorrow — or ask us, we may squeeze you in.'}</Typography>
                <Stack direction="row" spacing={1.5} justifyContent="center">
                  {!sheet.slots.length && <Button variant="contained" onClick={() => setSearch({ date: addDays(search.date, 1) })}>See tomorrow</Button>}
                  <Button variant="outlined" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp us</Button>
                </Stack>
              </Box>
              : <SlotGrid dim={sheet.status === 'loading'}>
                {visible.map((slot) => <SlotButton key={slot.time} slot={slot} selected={slot.time === time} players={search.players} lesson={activity.privateGroup} slotNoun={activity.slotNoun} minutes={option.minutes} price={money(each)} onSelect={() => selectTime(slot.time)} />)}
              </SlotGrid>}
          </>}
        </Box>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 2 }}>
          Prices per {activity.peopleNoun} in Thai baht, paid at the club. Includes {activity.includes.join(', ').toLowerCase()}. Times are Krabi time.
        </Typography>
      </Panel>
    </Box>

    <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
      <BookingSummary action={continueButton} />
    </Box>

    {/* Phones: the time, the total and the way on, always within thumb's reach. */}
    {time && <Box sx={{ display: { md: 'none' }, position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', boxShadow: '0 -8px 24px rgba(23,60,44,.10)', px: 2, py: 1.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{shortDayLabel(search.date)} · {timeLabel(time)}</Typography>
          <Typography sx={{ fontFamily: fonts.playful, fontSize: 20 }}>{money(total)}</Typography>
        </Box>
        <Button variant="contained" onClick={goOn} endIcon={<East />}>Continue</Button>
      </Stack>
    </Box>}
  </Box>;
}

function Panel({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return <Box component="section" aria-label={title} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '24px', p: { xs: 2, sm: 2.5, md: 3 }, mb: 2.5 }}>
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
      <Box aria-hidden sx={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'secondary.main', fontFamily: fonts.playful, fontSize: 15 }}>{step}</Box>
      <Typography variant="h3" sx={{ fontSize: { xs: 21, md: 24 } }}>{title}</Typography>
    </Stack>
    {children}
  </Box>;
}

function SlotGrid({ children, dim = false }: { children: ReactNode; dim?: boolean }) {
  return <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(138px, 1fr))', gap: 1.25, opacity: dim ? .55 : 1, transition: 'opacity .2s ease' }}>{children}</Box>;
}

function SlotButton({ slot, selected, players, lesson, slotNoun, minutes, price, onSelect }: { slot: Slot; selected: boolean; players: number; lesson: boolean; slotNoun: string; minutes: number; price: string; onSelect: () => void }) {
  const open = fits(slot, players);
  const bays = slot.baysLeft !== undefined;
  const status = slot.blocked ? 'Not available'
    : bays ? (slot.baysLeft ? plural(slot.baysLeft, slotNoun) + ' free' : 'Fully booked')
    : lesson ? (slot.spotsLeft ? `Until ${timeLabel(fromMinutes(toMinutes(slot.time) + minutes))}` : 'Booked')
    : slot.spotsLeft === 0 ? 'Fully booked'
    : !open ? `Only ${slot.spotsLeft} left`
    : slot.spotsLeft === slot.capacity ? 'All open' : `${slot.spotsLeft} of ${slot.capacity} open`;
  return <Box component="button" type="button" disabled={!open} aria-pressed={selected} onClick={onSelect}
    aria-label={`${timeLabel(slot.time)}, ${status}${open ? `, ${price} per person` : ''}`} sx={{
      position: 'relative', display: 'grid', justifyItems: 'start', gap: .5, p: 1.5, minHeight: 104, textAlign: 'left', font: 'inherit', borderRadius: '16px', cursor: open ? 'pointer' : 'not-allowed',
      border: '2px solid', borderColor: selected ? 'primary.main' : open ? 'divider' : 'transparent',
      bgcolor: selected ? 'primary.main' : open ? 'background.paper' : 'rgba(23,60,44,.04)', color: selected ? 'primary.contrastText' : open ? 'text.primary' : 'text.disabled',
      transition: 'border-color .2s ease, background-color .2s ease, transform .2s ease',
      '&:hover:not(:disabled)': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
    }}>
    {selected && <CheckRounded aria-hidden sx={{ position: 'absolute', top: 10, right: 10, fontSize: 20, color: 'secondary.main' }} />}
    <Box component="span" sx={{ fontFamily: fonts.playful, fontSize: 22, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', textDecoration: open ? 'none' : 'line-through' }}>{timeLabel(slot.time)}</Box>
    {/* One figure per place in the group: solid for the open ones, faded outlines for those taken. */}
    {!bays && !lesson && slot.capacity <= 6 && <Stack direction="row" spacing={.1} aria-hidden sx={{ color: selected ? 'secondary.main' : open ? 'success.main' : 'text.disabled', '& svg': { fontSize: 16 } }}>
      {Array.from({ length: slot.capacity }, (_, i) => i < slot.spotsLeft ? <PersonRounded key={i} /> : <PersonOutlineRounded key={i} sx={{ opacity: .4 }} />)}
    </Stack>}
    <Box component="span" sx={{ fontSize: 12, fontWeight: 700, color: selected ? 'inherit' : open ? 'success.dark' : 'inherit' }}>{status}</Box>
    {open && <Box component="span" sx={{ fontSize: 12, opacity: .8 }}>{price} pp</Box>}
  </Box>;
}
