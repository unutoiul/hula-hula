import AddRounded from '@mui/icons-material/AddRounded';
import AirportShuttleRounded from '@mui/icons-material/AirportShuttleRounded';
import BlockRounded from '@mui/icons-material/BlockRounded';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import CloseRounded from '@mui/icons-material/CloseRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import { Alert, Box, Button, Chip, IconButton, LinearProgress, Popover, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIcon } from '../booking/activityIcons';
import { ACTIVITIES, activityById, type ActivityId } from '../booking/config';
import { addDays, krabiNow, shortDayLabel, timeLabel } from '../booking/dates';
import { money, plural } from '../booking/pricing';
import { DayCalendar } from '../components/booking/DayCalendar';
import { fonts } from '../theme';
import { AddBookingDialog } from './AddBookingDialog';
import { BlockDialog } from './BlockDialog';
import { BookingCard } from './BookingCard';
import { hhmm, supabase, type StaffBlock, type StaffBooking } from './supabase';

type Filter = ActivityId | 'all';

// One day at the club: what's coming up, who's here, who needs picking up,
// and the buttons for the things that happen at the desk — a phone booking,
// a walk-in, closing a time. Reloads every minute and when the tab comes back.
export function DaySheet({ jumpTo }: { jumpTo: string | null }) {
  const today = krabiNow().date;
  const [date, setDate] = useState(today);
  const [bookings, setBookings] = useState<StaffBooking[] | null>(null);
  const [blocks, setBlocks] = useState<StaffBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [showCancelled, setShowCancelled] = useState(false);
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLElement | null>(null);
  const [adding, setAdding] = useState(false);
  const [blocking, setBlocking] = useState(false);

  useEffect(() => { if (jumpTo) setDate(jumpTo.split('#')[0]); }, [jumpTo]);

  const load = useCallback(async () => {
    setLoading(true);
    const [b, k] = await Promise.all([
      supabase!.from('golf_bookings').select('*').eq('play_date', date).order('start_time').order('created_at'),
      supabase!.from('golf_blocks').select('*').eq('play_date', date).order('start_time'),
    ]);
    setLoading(false);
    if (b.error || k.error) { setError((b.error ?? k.error)!.message); return; }
    setError(null);
    setBookings(b.data as StaffBooking[]);
    setBlocks(k.data as StaffBlock[]);
  }, [date]);

  useEffect(() => {
    setBookings(null);
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [load]);

  const active = useMemo(() => (bookings ?? []).filter((b) => b.status !== 'cancelled'), [bookings]);
  const shown = (bookings ?? []).filter((b) => (filter === 'all' || b.activity === filter) && (showCancelled || b.status !== 'cancelled'));
  const shownBlocks = blocks.filter((b) => filter === 'all' || !b.activity || b.activity === filter);
  const cancelled = (bookings ?? []).filter((b) => b.status === 'cancelled').length;
  const pickups = useMemo(() => {
    const byTime = new Map<string, StaffBooking[]>();
    for (const b of active) if (b.transfer) byTime.set(hhmm(b.transfer), [...(byTime.get(hhmm(b.transfer)) ?? []), b]);
    return [...byTime.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [active]);

  // The day as one timeline: each start time with its bookings, blocked times slotted in.
  const timeline = useMemo(() => {
    const rows: { time: string; node: ReactNode }[] = [];
    for (const block of shownBlocks) rows.push({ time: hhmm(block.start_time), node: <BlockRow key={block.id} block={block} onRemoved={load} /> });
    for (const booking of shown) rows.push({ time: hhmm(booking.start_time), node: <BookingCard key={booking.id} booking={booking} onChanged={load} /> });
    return rows.sort((a, b) => a.time.localeCompare(b.time));
  }, [shown, shownBlocks, load]);

  return <Box>
    {/* The day */}
    <Stack direction="row" alignItems="center" spacing={1}>
      <IconButton aria-label="Previous day" onClick={() => setDate(addDays(date, -1))} sx={{ border: '1px solid', borderColor: 'divider' }}><ChevronLeft /></IconButton>
      <Button onClick={(e) => setCalendarAnchor(e.currentTarget)} color="inherit" variant="outlined" sx={{ flex: 1, borderColor: 'divider', fontFamily: fonts.playful, fontSize: 18, fontWeight: 500 }}>
        {date === today ? 'Today · ' : date === addDays(today, 1) ? 'Tomorrow · ' : ''}{shortDayLabel(date)}
      </Button>
      <IconButton aria-label="Next day" onClick={() => setDate(addDays(date, 1))} sx={{ border: '1px solid', borderColor: 'divider' }}><ChevronRight /></IconButton>
      <IconButton aria-label="Refresh" onClick={() => void load()} sx={{ display: { xs: 'none', sm: 'inline-flex' }, border: '1px solid', borderColor: 'divider' }}><RefreshRounded /></IconButton>
    </Stack>
    {date !== today && <Button size="small" onClick={() => setDate(today)} sx={{ mt: .5, minHeight: 0 }}>Back to today</Button>}
    <Popover open={!!calendarAnchor} anchorEl={calendarAnchor} onClose={() => setCalendarAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }} slotProps={{ paper: { sx: { mt: 1, borderRadius: '24px' } } }}>
      <DayCalendar value={date} min={addDays(today, -365)} max={addDays(today, 365)} onChange={(d) => { setDate(d); setCalendarAnchor(null); }} />
    </Popover>
    <Box sx={{ height: 4, mt: 1.5 }}>{loading && <LinearProgress sx={{ borderRadius: 2 }} />}</Box>

    {error && <Alert severity="error" sx={{ mt: 1 }} action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>{error}</Alert>}

    {/* The numbers */}
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, mt: 1 }}>
      <Stat label="Bookings" value={String(active.length)} />
      <Stat label="People" value={String(active.reduce((sum, b) => sum + b.players, 0))} />
      <Stat label="Arrived" value={`${active.filter((b) => b.status === 'checked_in').length}/${active.filter((b) => b.status !== 'no_show').length}`} />
      <Stat label="Due" value={money(active.filter((b) => b.status !== 'no_show').reduce((sum, b) => sum + b.total, 0))} small />
    </Box>

    {/* For the driver */}
    {pickups.length > 0 && <Box sx={{ mt: 1.5, p: 1.75, borderRadius: '18px', bgcolor: 'secondary.light', border: '1px solid', borderColor: 'secondary.main' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: .75 }}><AirportShuttleRounded sx={{ fontSize: 20 }} /><Typography sx={{ fontWeight: 700 }}>Shuttle pick-ups</Typography></Stack>
      {pickups.map(([time, list]) => <Box key={time} sx={{ mt: .75 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{timeLabel(time)} · {plural(list.reduce((sum, b) => sum + b.players, 0), 'person', 'people')}</Typography>
        {list.map((b) => <Typography key={b.id} sx={{ fontSize: 13, color: 'text.secondary' }}>{b.first_name} {b.last_name} ({b.players}) — {b.pickup_from} · <Box component="a" href={`tel:${b.phone.replace(/[^\d+]/g, '')}`} sx={{ color: 'primary.main' }}>{b.phone}</Box></Typography>)}
      </Box>)}
    </Box>}

    {/* What to show */}
    <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: 'auto', pb: .5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
      {(['all', ...ACTIVITIES.map((a) => a.id)] as Filter[]).map((id) => {
        const count = id === 'all' ? active.length : active.filter((b) => b.activity === id).length;
        return <Chip key={id} clickable onClick={() => setFilter(id)} color={filter === id ? 'primary' : 'default'} variant={filter === id ? 'filled' : 'outlined'}
          icon={id === 'all' ? undefined : <ActivityIcon activity={id} />} label={`${id === 'all' ? 'All' : activityById(id)!.name} · ${count}`} sx={{ flexShrink: 0, fontWeight: 700 }} />;
      })}
    </Stack>

    {/* The timeline */}
    <Stack spacing={1.25} sx={{ mt: 2 }}>
      {bookings === null && !error && <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>Loading the tee sheet…</Typography>}
      {bookings !== null && timeline.length === 0 && <Box sx={{ textAlign: 'center', py: 6, px: 2, border: '1px dashed', borderColor: 'divider', borderRadius: '20px' }}>
        <Typography variant="h3" sx={{ fontSize: 22 }}>Nothing booked{filter === 'all' ? '' : ` for ${activityById(filter)!.name}`} yet</Typography>
        <Typography sx={{ color: 'text.secondary', mt: .75 }}>Online bookings appear here by themselves. Add phone and walk-in bookings with the button below.</Typography>
      </Box>}
      {timeline.map((row, i) => <Box key={i}>
        {(i === 0 || timeline[i - 1].time !== row.time) && <Typography sx={{ fontFamily: fonts.playful, fontSize: 17, color: 'primary.main', mt: i ? 1 : 0, mb: .75 }}>{timeLabel(row.time)}</Typography>}
        {row.node}
      </Box>)}
      {cancelled > 0 && <Button size="small" onClick={() => setShowCancelled((s) => !s)} sx={{ alignSelf: 'center' }}>{showCancelled ? 'Hide' : 'Show'} {plural(cancelled, 'cancelled booking')}</Button>}
    </Stack>

    {/* The desk's two buttons — pinned to the bottom of a phone. */}
    <Box sx={{ position: { xs: 'fixed', md: 'static' }, left: 0, right: 0, bottom: 0, zIndex: 10, mt: { md: 3 }, px: { xs: 1.5, md: 0 }, py: { xs: 1.25, md: 0 }, bgcolor: { xs: 'background.paper', md: 'transparent' }, borderTop: { xs: '1px solid', md: 0 }, borderColor: 'divider', boxShadow: { xs: '0 -8px 24px rgba(23,60,44,.10)', md: 'none' } }}>
      <Stack direction="row" spacing={1.25} sx={{ maxWidth: 'md', mx: 'auto' }}>
        <Button fullWidth variant="contained" startIcon={<AddRounded />} onClick={() => setAdding(true)}>Add booking</Button>
        <Button fullWidth variant="outlined" startIcon={<BlockRounded />} onClick={() => setBlocking(true)}>Block time</Button>
      </Stack>
    </Box>

    <AddBookingDialog open={adding} date={date} bookings={active} blocks={blocks} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); void load(); }} />
    <BlockDialog open={blocking} date={date} onClose={() => setBlocking(false)} onSaved={() => { setBlocking(false); void load(); }} />
  </Box>;
}

function Stat({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return <Box sx={{ p: { xs: 1.25, sm: 1.75 }, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', minWidth: 0 }}>
    <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'text.secondary' }}>{label}</Typography>
    <Typography noWrap sx={{ fontFamily: fonts.playful, fontSize: small ? { xs: 16, sm: 22 } : { xs: 22, sm: 26 }, lineHeight: 1.2, mt: .25 }}>{value}</Typography>
  </Box>;
}

function BlockRow({ block, onRemoved }: { block: StaffBlock; onRemoved: () => void }) {
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    await supabase!.from('golf_blocks').delete().eq('id', block.id);
    setBusy(false);
    onRemoved();
  };
  return <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, borderRadius: '16px', border: '1px dashed', borderColor: 'text.secondary', bgcolor: 'rgba(23,60,44,.04)' }}>
    <BlockRounded sx={{ color: 'text.secondary' }} />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Closed {timeLabel(hhmm(block.start_time))} – {timeLabel(hhmm(block.end_time))} · {block.activity ? activityById(block.activity)!.name : 'Everything'}</Typography>
      {block.reason && <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{block.reason}</Typography>}
    </Box>
    <IconButton aria-label="Remove this block" disabled={busy} onClick={() => void remove()}><CloseRounded /></IconButton>
  </Stack>;
}
