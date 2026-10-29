import SearchRounded from '@mui/icons-material/SearchRounded';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, InputAdornment, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { activityById } from '../booking/config';
import { shortDayLabel, timeLabel } from '../booking/dates';
import { plural } from '../booking/pricing';
import { hhmm, supabase, type StaffBooking } from './supabase';

// "I booked last week, my name's…" — finds a booking on any day by its
// reference, name, phone or email; picking one opens that day's sheet.
export function SearchDialog({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (date: string) => void }) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StaffBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Keep only characters that can't break PostgREST's or() filter syntax.
    const term = query.trim().replace(/[^\p{L}\p{N}@.+\- ]/gu, '');
    if (term.length < 2) { setResults(null); return; }
    let cancelled = false;
    const id = window.setTimeout(async () => {
      const like = `"*${term}*"`;
      const { data, error: searchError } = await supabase!.from('golf_bookings').select('*')
        .or(`ref.ilike.${like},first_name.ilike.${like},last_name.ilike.${like},phone.ilike.${like},email.ilike.${like}`)
        .order('play_date', { ascending: false }).limit(20);
      if (cancelled) return;
      if (searchError) setError(searchError.message); else { setError(null); setResults(data as StaffBooking[]); }
    }, 300);
    return () => { cancelled = true; window.clearTimeout(id); };
  }, [query]);

  return <Dialog open={open} onClose={onClose} fullScreen={phone} fullWidth maxWidth="sm">
    <DialogTitle>Find a booking</DialogTitle>
    <DialogContent dividers>
      <TextField autoFocus fullWidth placeholder="Reference, name, phone or email" value={query} onChange={(e) => setQuery(e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> } }} />
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Stack spacing={1} sx={{ mt: 2 }}>
        {query.trim().length >= 2 && results === null && <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress size={24} /></Box>}
        {results?.length === 0 && <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>No bookings match “{query.trim()}”.</Typography>}
        {results?.map((b) => <Box key={b.id} component="button" type="button" onClick={() => onPick(b.play_date)} sx={{ display: 'block', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '14px', bgcolor: 'background.paper', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography sx={{ fontWeight: 700 }}>{b.first_name} {b.last_name}</Typography>
            {b.status !== 'booked' && <Chip size="small" label={b.status.replace('_', ' ')} />}
          </Stack>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{shortDayLabel(b.play_date)} · {timeLabel(hhmm(b.start_time))} · {activityById(b.activity)?.name} · {plural(b.players, 'person', 'people')} · {b.ref}</Typography>
        </Box>)}
      </Stack>
    </DialogContent>
    <Box sx={{ px: 3, py: 1.5, textAlign: 'right' }}><Button onClick={onClose}>Close</Button></Box>
  </Dialog>;
}
