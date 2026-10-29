import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSite } from '../context/SiteDataContext';
import { fromMinutes, shortDayLabel, timeLabel } from '../booking/dates';
import { supabase } from './supabase';

// Every half hour from 6 am to 8 pm.
const TIMES = Array.from({ length: 29 }, (_, i) => fromMinutes(6 * 60 + i * 30));

// Closing times on the sheet (maintenance, a tournament, a private event):
// no online booking can start inside the block. Bookings already there stay.
export function BlockDialog({ open, date, onClose, onSaved }: { open: boolean; date: string; onClose: () => void; onSaved: () => void }) {
  const theme = useTheme();
  const { activities } = useSite();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const [activity, setActivity] = useState<string>('all');
  const [start, setStart] = useState('06:00');
  const [end, setEnd] = useState('20:00');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (open) { setActivity('all'); setStart('06:00'); setEnd('20:00'); setReason(''); setError(null); } }, [open]);

  const save = async () => {
    if (end <= start) { setError('“Until” has to be after “From”.'); return; }
    setBusy(true); setError(null);
    const { error: saveError } = await supabase!.from('golf_blocks').insert({ play_date: date, activity: activity === 'all' ? null : activity, start_time: start, end_time: end, reason: reason.trim() });
    setBusy(false);
    if (saveError) setError(saveError.message); else onSaved();
  };

  return <Dialog open={open} onClose={onClose} fullScreen={phone} fullWidth maxWidth="xs">
    <DialogTitle>Block time · {shortDayLabel(date)}</DialogTitle>
    <DialogContent dividers>
      <Stack spacing={2.25}>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Nobody can book a start inside this time online. Bookings already made stay on the sheet.</Typography>
        <TextField select label="What" value={activity} onChange={(e) => setActivity(e.target.value)}>
          <MenuItem value="all">Everything (the whole club)</MenuItem>
          {activities.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
        </TextField>
        <Stack direction="row" spacing={2}>
          <TextField select label="From" value={start} onChange={(e) => setStart(e.target.value)} fullWidth>
            {TIMES.slice(0, -1).map((t) => <MenuItem key={t} value={t}>{timeLabel(t)}</MenuItem>)}
          </TextField>
          <TextField select label="Until" value={end} onChange={(e) => setEnd(e.target.value)} fullWidth>
            {TIMES.slice(1).map((t) => <MenuItem key={t} value={t}>{timeLabel(t)}</MenuItem>)}
          </TextField>
        </Stack>
        <TextField label="Why (optional, staff only)" value={reason} onChange={(e) => setReason(e.target.value.slice(0, 120))} placeholder="Tournament, maintenance, private event…" />
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 1.5 }}>
      <Button onClick={onClose}>Close</Button>
      <Button variant="contained" disabled={busy} onClick={() => void save()}>{busy ? 'Saving…' : 'Block it'}</Button>
    </DialogActions>
  </Dialog>;
}
