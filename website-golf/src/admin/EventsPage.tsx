import AddRounded from '@mui/icons-material/AddRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { addDays, krabiNow, shortDayLabel } from '../booking/dates';
import { money } from '../booking/pricing';
import { ClubPhoto } from '../components/common/ClubPhoto';
import { photoAssets as p } from '../data/photos';
import { linkClick, navigate } from '../router';
import { supabase, takenPlaces, type StaffEvent, type StaffOrder, type StaffPackage } from './supabase';
import { PageTitle } from './ui';

// /admin/events — every event, upcoming first: is it live, is it selling,
// how many places are gone and what's come in. "New event" makes a draft
// (hidden from the website) and opens it.
export function EventsPage() {
  const [events, setEvents] = useState<StaffEvent[] | null>(null);
  const [packages, setPackages] = useState<StaffPackage[]>([]);
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void Promise.all([
      supabase!.from('golf_events').select('*').order('starts_on', { ascending: false }),
      supabase!.from('golf_event_packages').select('*'),
      supabase!.from('golf_event_orders').select('*').in('status', ['paid', 'pending']),
    ]).then(([e, pk, o]) => {
      const failed = e.error ?? pk.error ?? o.error;
      if (failed) { setError(failed.message); return; }
      setEvents(e.data as StaffEvent[]);
      setPackages(pk.data as StaffPackage[]);
      setOrders(o.data as StaffOrder[]);
    });
  }, []);

  const create = async () => {
    setCreating(true);
    const { data, error: createError } = await supabase!.from('golf_events').insert({
      slug: `event-${Date.now().toString(36)}`, title: 'New event', starts_on: addDays(krabiNow().date, 21), published: false,
    }).select('id').single();
    setCreating(false);
    if (createError) setError(createError.message); else navigate(`/admin/events/${data.id}`);
  };

  if (!events) return error ? <Alert severity="error">{error}</Alert> : <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;
  const today = krabiNow().date;
  const upcoming = events.filter((e) => (e.ends_on ?? e.starts_on) >= today).reverse();
  const past = events.filter((e) => (e.ends_on ?? e.starts_on) < today);

  const card = (event: StaffEvent) => {
    const own = packages.filter((pk) => pk.event_id === event.id);
    const capacity = own.reduce((sum, pk) => sum + pk.capacity, 0);
    const taken = own.reduce((sum, pk) => sum + takenPlaces(orders, pk.id), 0);
    const takings = orders.filter((o) => o.event_id === event.id && o.status === 'paid' && !o.test_payment).reduce((sum, o) => sum + o.total, 0);
    const href = `/admin/events/${event.id}`;
    return <Box key={event.id} component="a" href={href} onClick={linkClick(href)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: '18px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'inherit', textDecoration: 'none', '&:hover': { borderColor: 'primary.main' } }}>
      <Box sx={{ width: { xs: 72, sm: 96 }, height: { xs: 72, sm: 72 }, flexShrink: 0, borderRadius: '12px', overflow: 'hidden' }}><ClubPhoto image={event.cover_image || p.fairwayBalcony.src} alt="" sizes="100px" /></Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 700 }}>{event.title}</Typography>
        <Typography noWrap sx={{ fontSize: 13, color: 'text.secondary' }}>{shortDayLabel(event.starts_on)} · {taken}/{capacity} places · {money(takings)} taken</Typography>
        <Stack direction="row" spacing={.75} sx={{ mt: .5 }}>
          <Chip size="small" label={event.published ? 'On the website' : 'Draft'} color={event.published ? 'success' : 'default'} />
          {event.published && !event.sales_open && <Chip size="small" label="Sales closed" />}
        </Stack>
      </Box>
      <ChevronRightRounded sx={{ color: 'text.secondary' }} />
    </Box>;
  };

  return <Box>
    <PageTitle title="Events" hint="Special days with packages guests pay for online." action={<Button variant="contained" startIcon={<AddRounded />} disabled={creating} onClick={() => void create()}>New event</Button>} />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Stack spacing={1.25}>
      {upcoming.map(card)}
      {upcoming.length === 0 && <Box sx={{ textAlign: 'center', py: 5, px: 2, border: '1px dashed', borderColor: 'divider', borderRadius: '20px' }}>
        <Typography variant="h3" sx={{ fontSize: 22 }}>No upcoming events</Typography>
        <Typography sx={{ color: 'text.secondary', mt: .75 }}>Make one with “New event” — it stays a draft until you put it on the website.</Typography>
      </Box>}
    </Stack>
    {past.length > 0 && <>
      <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary', mt: 4, mb: 1 }}>Past events</Typography>
      <Stack spacing={1.25}>{past.map(card)}</Stack>
    </>}
  </Box>;
}
