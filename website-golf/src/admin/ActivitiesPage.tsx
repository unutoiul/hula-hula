import AddRounded from '@mui/icons-material/AddRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIcon } from '../booking/activityIcons';
import { DEFAULT_ACTIVITIES, normaliseActivity, normaliseRentals, slugify, type Activity, type Rental } from '../booking/config';
import { money } from '../booking/pricing';
import { useSiteData } from '../context/SiteDataContext';
import { ActivityEditor } from './ActivityEditor';
import { supabase } from './supabase';
import { PageTitle, Section, toInt } from './ui';

interface Row { activity: Activity; active: boolean; sortOrder: number }

// A new activity starts from a sensible blank: one option, an hour long.
const blank = (): Activity => ({
  ...DEFAULT_ACTIVITIES[2], id: '', name: '', tagline: '', icon: 'star', includes: [],
  options: [{ id: 'o1', label: '1 hour', price: 0, minutes: 60, lastStart: '16:00' }], soloPrice: undefined,
  card: { kicker: '', title: '', detail: '', images: [] }, durationBadge: '',
});

// /admin/activities — every activity and its prices (show/hide on the
// website, edit, delete; new ones go last), and the rental club prices.
// Saving here changes the homepage, the prices and the booking pages within
// about half a minute.
export function ActivitiesPage() {
  const { reload } = useSiteData();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [editing, setEditing] = useState<{ activity: Activity; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedRentals, setSavedRentals] = useState(false);

  const load = useCallback(async () => {
    const [a, s] = await Promise.all([
      supabase!.from('golf_activities').select('id,active,sort_order,data').order('sort_order').order('id'),
      supabase!.from('golf_settings').select('value').eq('key', 'rentals').maybeSingle(),
    ]);
    if (a.error) { setError(a.error.message); return; }
    setRows((a.data as { id: string; active: boolean; sort_order: number; data: Record<string, unknown> }[]).map((r) => ({ activity: normaliseActivity(r.data, r.id), active: r.active, sortOrder: r.sort_order })));
    setRentals(normaliseRentals(s.data?.value ?? []));
  }, []);
  useEffect(() => { void load(); }, [load]);

  const after = async (result: { error: { message: string } | null }) => {
    if (result.error) { setError(result.error.message); return result.error.message; }
    setError(null);
    await Promise.all([load(), reload()]);
    return null;
  };

  const save = async (activity: Activity, isNew: boolean) => {
    const { id, ...data } = activity;
    const sortOrder = isNew ? Math.max(0, ...(rows ?? []).map((r) => r.sortOrder)) + 10 : undefined;
    const failure = await after(isNew
      ? await supabase!.from('golf_activities').insert({ id, data, active: true, sort_order: sortOrder })
      : await supabase!.from('golf_activities').update({ data }).eq('id', id));
    if (!failure) setEditing(null);
    return failure;
  };

  const toggle = async (row: Row) => {
    setRows((current) => current?.map((r) => (r.activity.id === row.activity.id ? { ...r, active: !r.active } : r)) ?? null);
    await after(await supabase!.from('golf_activities').update({ active: !row.active }).eq('id', row.activity.id));
  };

  const remove = async (activity: Activity) => {
    await after(await supabase!.from('golf_activities').delete().eq('id', activity.id));
    setDeleting(null);
  };

  const saveRentals = async () => {
    setSavedRentals(false);
    const cleaned = rentals.filter((r) => r.label.trim()).map((r, i) => ({ ...r, id: r.id || slugify(r.label) || `r${i + 1}` }));
    const failure = await after(await supabase!.from('golf_settings').upsert({ key: 'rentals', value: cleaned }));
    if (!failure) setSavedRentals(true);
  };

  if (!rows) return error ? <Alert severity="error">{error}</Alert> : <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;

  return <Box>
    <PageTitle title="Activities & prices" hint="What guests can book, and what it costs." action={<Button variant="contained" startIcon={<AddRounded />} onClick={() => setEditing({ activity: blank(), isNew: true })}>New</Button>} />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

    <Stack spacing={1.25}>
      {rows.map((row) => <Box key={row.activity.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '18px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', opacity: row.active ? 1 : .6 }}>
        <Box aria-hidden sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'success.light', color: 'success.dark' }}><ActivityIcon icon={row.activity.icon} /></Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 700 }}>{row.activity.name}</Typography>
          <Typography noWrap sx={{ fontSize: 13, color: 'text.secondary' }}>{row.activity.options.map((o) => `${o.label} ${money(o.price)}`).join(' · ')}</Typography>
          {!row.active && <Chip size="small" label="Hidden from the website" sx={{ mt: .5 }} />}
        </Box>
        <Tooltip title={row.active ? 'On the website — tap to hide' : 'Hidden — tap to show on the website'}>
          <Switch checked={row.active} onChange={() => void toggle(row)} inputProps={{ 'aria-label': `Show ${row.activity.name} on the website` }} />
        </Tooltip>
        <IconButton aria-label={`Edit ${row.activity.name}`} onClick={() => setEditing({ activity: row.activity, isNew: false })} sx={{ border: '1px solid', borderColor: 'divider' }}><EditRounded /></IconButton>
        <IconButton aria-label={`Delete ${row.activity.name}`} onClick={() => setDeleting(row.activity)} sx={{ ml: { xs: -1, sm: 0 } }}><DeleteOutlineRounded /></IconButton>
      </Box>)}
      {rows.length === 0 && <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>No activities yet — the website shows the built-in ones until you add some.</Typography>}
    </Stack>

    <Box sx={{ mt: 3 }}>
      <Section title="Rental clubs" hint="Offered on golf and range bookings that allow rentals. Prices per set.">
        <Stack spacing={1.25}>
          {rentals.map((r, i) => <Stack key={i} direction="row" spacing={1.25} alignItems="center">
            <TextField label="Set" value={r.label} onChange={(e) => setRentals(rentals.map((x, j) => (j === i ? { ...x, label: e.target.value.slice(0, 60) } : x)))} sx={{ flex: 2 }} />
            <TextField label="Price ฿" type="number" value={r.price} onChange={(e) => setRentals(rentals.map((x, j) => (j === i ? { ...x, price: Math.max(0, toInt(e.target.value)) } : x)))} slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }} sx={{ flex: 1 }} />
            <IconButton aria-label={`Remove ${r.label || 'set'}`} onClick={() => setRentals(rentals.filter((_, j) => j !== i))}><DeleteOutlineRounded /></IconButton>
          </Stack>)}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button startIcon={<AddRounded />} onClick={() => setRentals([...rentals, { id: '', label: '', price: 0 }])}>Add a set</Button>
            <Box sx={{ flex: 1 }} />
            {savedRentals && <Typography sx={{ fontSize: 13, color: 'success.dark' }}>Saved</Typography>}
            <Button variant="contained" onClick={() => void saveRentals()}>Save rental prices</Button>
          </Stack>
        </Stack>
      </Section>
    </Box>

    {editing && <ActivityEditor initial={editing.activity} isNew={editing.isNew} takenIds={rows.map((r) => r.activity.id)} onClose={() => setEditing(null)} onSave={(activity) => save(activity, editing.isNew)} />}
    <Dialog open={!!deleting} onClose={() => setDeleting(null)}>
      <DialogTitle>Delete {deleting?.name}?</DialogTitle>
      <DialogContent><Typography>It disappears from the website and can’t be booked any more. Bookings already made stay on the tee sheet. To take it off for a while instead, use the switch to hide it.</Typography></DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleting(null)}>Keep it</Button>
        <Button color="error" variant="contained" onClick={() => deleting && void remove(deleting)}>Delete</Button>
      </DialogActions>
    </Dialog>
  </Box>;
}
