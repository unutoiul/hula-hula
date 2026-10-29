import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIcon } from '../booking/activityIcons';
import { buildSheet, fits } from '../booking/availability';
import { ACTIVITIES, activityById, type ActivityId } from '../booking/config';
import { shortDayLabel, timeLabel } from '../booking/dates';
import { money, plural, priceLines, totalOf } from '../booking/pricing';
import { GuestStepper } from '../components/booking/GuestStepper';
import { hhmm, supabase, type BookingSource, type StaffBlock, type StaffBooking } from './supabase';

// A phone or walk-in booking, from the desk. The times list shows what's
// free on the day's sheet; "squeeze them in" lets staff go over a full time
// or a blocked one. Saved through the same golf_book() as the website.
export function AddBookingDialog({ open, date, bookings, blocks, onClose, onSaved }: {
  open: boolean; date: string; bookings: StaffBooking[]; blocks: StaffBlock[]; onClose: () => void; onSaved: () => void;
}) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const [activityId, setActivityId] = useState<ActivityId>('golf');
  const [optionId, setOptionId] = useState('9');
  const [players, setPlayers] = useState(2);
  const [time, setTime] = useState('');
  const [force, setForce] = useState(false);
  const [source, setSource] = useState<BookingSource>('phone');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activity = activityById(activityId)!;
  const option = activity.options.find((o) => o.id === optionId) ?? activity.options[0];

  // Start fresh each time it opens.
  useEffect(() => {
    if (!open) return;
    setTime(''); setForce(false); setName(''); setPhoneNumber(''); setEmail(''); setNotes(''); setError(null);
  }, [open]);

  const sheet = useMemo(() => buildSheet(activity, option, date,
    bookings.filter((b) => b.activity === activity.id).map((b) => ({ time: hhmm(b.start_time), minutes: b.minutes, players: b.players })),
    blocks.filter((b) => !b.activity || b.activity === activity.id).map((b) => ({ start: hhmm(b.start_time), end: hhmm(b.end_time) })),
    { includePast: true }), [activity, option, date, bookings, blocks]);
  const slot = sheet.find((s) => s.time === time);
  const overbook = !!slot && !fits(slot, players);
  const lines = priceLines(activity, option, players);

  const pickActivity = (id: ActivityId) => {
    const next = activityById(id)!;
    setActivityId(id); setOptionId(next.options[0].id); setTime('');
    setPlayers((p) => Math.min(next.maxPlayers, Math.max(next.minPlayers, p)));
  };

  const save = async () => {
    setError(null);
    if (!time || !name.trim()) { setError('Pick a time and add a name.'); return; }
    if (overbook && !force) { setError('That time is full for this group. Tick “Squeeze them in” to book it anyway.'); return; }
    const [first, ...rest] = name.trim().split(/\s+/);
    setBusy(true);
    const { error: saveError } = await supabase!.rpc('golf_book', {
      p_booking: {
        activity: activity.id, option: option.id, play_date: date, start_time: time, minutes: option.minutes, players,
        first_name: first, last_name: rest.join(' '), phone: phoneNumber.trim(), email: email.trim().toLowerCase(), notes: notes.trim(),
        lines, total: totalOf(lines), source,
      },
      p_capacity: activity.capacity, p_units: activity.units, p_private: !!activity.privateGroup, p_force: force,
    });
    setBusy(false);
    if (saveError) setError(saveError.message.includes('taken') ? 'Someone just took that time. Pick another, or squeeze them in.' : saveError.message);
    else onSaved();
  };

  return <Dialog open={open} onClose={onClose} fullScreen={phone} fullWidth maxWidth="sm" scroll="paper">
    <DialogTitle sx={{ pb: 1 }}>New booking · {shortDayLabel(date)}</DialogTitle>
    <DialogContent dividers>
      <Stack spacing={2.25}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {ACTIVITIES.map((a) => <Button key={a.id} onClick={() => pickActivity(a.id)} variant={a.id === activity.id ? 'contained' : 'outlined'} color={a.id === activity.id ? 'primary' : 'inherit'}
            startIcon={<ActivityIcon activity={a.id} />} sx={{ borderColor: 'divider', px: 1, fontSize: 13, minHeight: 44 }}>{a.name}</Button>)}
        </Box>
        {activity.options.length > 1 && <ToggleButtonGroup exclusive value={option.id} onChange={(_, v) => { if (v) { setOptionId(v); setTime(''); } }} fullWidth size="small">
          {activity.options.map((o) => <ToggleButton key={o.id} value={o.id} sx={{ textTransform: 'none', fontWeight: 700 }}>{o.label}</ToggleButton>)}
        </ToggleButtonGroup>}
        <GuestStepper label={activity.id === 'lesson' ? 'People' : 'Players'} value={players} min={1} max={force ? 40 : activity.maxPlayers} onChange={setPlayers} />
        <TextField select label="Time" value={time} onChange={(e) => setTime(e.target.value)} fullWidth>
          {sheet.map((s) => {
            const free = fits(s, players);
            const note = s.blocked ? 'closed' : s.baysLeft !== undefined ? `${plural(s.baysLeft, 'bay')} free` : s.spotsLeft === 0 ? 'full' : `${s.spotsLeft} left`;
            return <MenuItem key={s.time} value={s.time} sx={{ color: free ? 'text.primary' : 'text.disabled' }}>{timeLabel(s.time)} · {note}</MenuItem>;
          })}
        </TextField>
        {overbook && <FormControlLabel control={<Checkbox checked={force} onChange={(e) => setForce(e.target.checked)} />} label="Squeeze them in (go over what’s free)" />}
        <TextField label="Name" required value={name} onChange={(e) => setName(e.target.value.slice(0, 120))} autoComplete="off" />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Phone / WhatsApp" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.slice(0, 30))} fullWidth />
          <TextField label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 120))} fullWidth />
        </Stack>
        <TextField label="Notes (optional)" multiline minRows={2} value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 1000))} placeholder="Rental clubs, a birthday, hotel for pick-up…" />
        <ToggleButtonGroup exclusive value={source} onChange={(_, v) => { if (v) setSource(v); }} fullWidth size="small">
          <ToggleButton value="phone" sx={{ textTransform: 'none', fontWeight: 700 }}>By phone / chat</ToggleButton>
          <ToggleButton value="walk_in" sx={{ textTransform: 'none', fontWeight: 700 }}>Walk-in</ToggleButton>
        </ToggleButtonGroup>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'success.light' }}>
          <Typography sx={{ fontSize: 14 }}>{lines[0].detail}</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{money(totalOf(lines))}</Typography>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 1.5 }}>
      <Button onClick={onClose}>Close</Button>
      <Button variant="contained" disabled={busy} onClick={() => void save()}>{busy ? 'Saving…' : 'Save booking'}</Button>
    </DialogActions>
  </Dialog>;
}
