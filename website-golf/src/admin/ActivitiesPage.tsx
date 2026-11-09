import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { assignRentalIds, DEFAULT_ACTIVITIES, normaliseActivity, normaliseRentals, type Activity, type Rental } from '../booking/config';
import { notifyContentChanged } from '../data/contentSync';
import { ActivityEditor } from './ActivityEditor';
import { ActivitiesManager } from './ActivitiesManager';
import { supabase } from './supabase';

interface Row { activity: Activity; active: boolean; sortOrder: number }

// A new activity starts from a sensible blank: one option, an hour long.
const blank = (): Activity => ({
  ...DEFAULT_ACTIVITIES.find((a) => a.id === 'puttgolf')!, id: '', name: '', tagline: '', about: '', bookOnline: true, icon: 'star', includes: [],
  options: [{ id: 'o1', label: '1 hour', price: 0, minutes: 60, lastStart: '16:00' }], soloPrice: undefined,
  card: { kicker: '', title: '', detail: '', images: [] }, durationBadge: '', rentals: true,
});

// /admin/activities — every activity and its prices (show/hide on the
// website, edit, delete; new ones go last), and the rental groups.
// Saving here changes the homepage, the prices and the booking pages within
// about half a minute.
export function ActivitiesPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [editing, setEditing] = useState<{ activity: Activity; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedRentals, setSavedRentals] = useState(false);
  const [savedEquipment, setSavedEquipment] = useState<Rental[]>([]);
  const [savingRentals, setSavingRentals] = useState(false);

  const load = useCallback(async (refreshRentals = true) => {
    const [a, s] = await Promise.all([
      supabase!.from('golf_activities').select('id,active,sort_order,data').order('sort_order').order('id'),
      supabase!.from('golf_settings').select('value').eq('key', 'rentals').maybeSingle(),
    ]);
    if (a.error) { setError(a.error.message); return; }
    if (s.error) { setError(s.error.message); return; }
    const loaded = (a.data as { id: string; active: boolean; sort_order: number; data: Record<string, unknown> }[]).map((r) => ({ activity: normaliseActivity(r.data, r.id), active: r.active, sortOrder: r.sort_order }));
    setRows(loaded);
    // Rentals from before groups existed are offered wherever rentals were switched on.
    const legacySports = loaded.filter((r) => r.activity.rentals).map((r) => r.activity.id);
    if (refreshRentals) {
      const fresh = normaliseRentals(s.data?.value ?? []).map((r) => (r.activities ? r : { ...r, activities: legacySports }));
      setRentals(fresh);
      setSavedEquipment(fresh);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const after = async (result: { error: { message: string } | null }, refreshRentals = false) => {
    if (result.error) { setError(result.error.message); return result.error.message; }
    setError(null);
    notifyContentChanged('site');
    await load(refreshRentals);
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
    if (rentals.some(rental => !rental.label.trim())) { setError('Give each equipment item a name before saving.'); return; }
    setSavingRentals(true);
    setSavedRentals(false);
    try {
      const cleaned = normaliseRentals(assignRentalIds(rentals.map(rental => ({ ...rental, label: rental.label.trim(), group: rental.group?.trim() ?? '' }))));
      const failure = await after(await supabase!.from('golf_settings').upsert({ key: 'rentals', value: cleaned }), true);
      if (!failure) setSavedRentals(true);
    } catch { setError('Could not save the equipment. Please try again.'); }
    finally { setSavingRentals(false); }
  };

  if (!rows) return error ? <Alert severity="error">{error}</Alert> : <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;

  return <Box>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <ActivitiesManager rows={rows} rentals={rentals} savedEquipment={savedEquipment} saving={savingRentals} saved={savedRentals}
      onAdd={() => setEditing({ activity: blank(), isNew: true })} onEdit={activity => setEditing({ activity, isNew: false })}
      onDelete={setDeleting} onToggle={row => void toggle(row)} onSave={() => void saveRentals()}
      onRentalsChange={next => { setRentals(next); setSavedRentals(false); }} />

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
