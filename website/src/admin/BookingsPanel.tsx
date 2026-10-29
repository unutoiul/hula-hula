import CheckRounded from '@mui/icons-material/CheckRounded';
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { dayLabel, money, plural } from '../booking/format';
import { supabase } from './supabase';

interface AdminBooking {
  ref: string; status: 'paid' | 'delivered'; check_in: string; check_out: string;
  items: { roomTypeName: string; rateName: string; quantity: number }[]; currency: string;
  total_amount: number; deposit_amount: number; paid_amount: number | null; tran_ref: string | null; flags: string[];
  created_at: string; paid_at: string | null; delivered_at: string | null; keyed_at: string | null; delivery_error: string | null;
}

const FLAG_LABELS: Record<string, string> = {
  paid_after_expiry: 'Paid after hold expired — check availability',
  amount_mismatch: 'Amount differs — check 2C2P',
  guest_email_failed: 'Guest email failed — forward it',
  details_deleted: 'Guest details missing — see 2C2P',
  test_payment: 'TEST payment — nothing charged, collect at the hotel',
};

// Paid website bookings from the last 60 days — no guest details, which are
// deleted once the booking email has gone to reservations. "Entered in
// SiteMinder" tells the website SiteMinder now counts the room, so it stops
// holding it back from other guests.
export function BookingsPanel() {
  const [rows, setRows] = useState<AdminBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase!.rpc('admin_bookings');
    if (loadError) setError(loadError.message); else setRows(data as AdminBooking[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const markKeyed = async (ref: string) => {
    const { error: markError } = await supabase!.rpc('admin_mark_keyed', { p_ref: ref });
    if (markError) setError(markError.message);
    await load();
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!rows) return <CircularProgress />;
  return <Box>
    <Typography sx={{ color: 'text.secondary', mb: 3, maxWidth: 640 }}>Bookings paid on the website. Each one arrives as an “ACTION: enter in SiteMinder” email with the guest’s details; once it’s in SiteMinder, mark it here. Refunds are made in the 2C2P portal.</Typography>
    {rows.length === 0 ? <Typography sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>No website bookings in the last 60 days.</Typography>
      : <Stack spacing={1.5}>
        {rows.map((b) => {
          const rooms = b.items.reduce((sum, item) => sum + item.quantity, 0);
          return <Box key={b.ref} sx={{ p: 2, border: '1px solid', borderColor: b.keyed_at ? 'divider' : 'secondary.dark', borderRadius: '18px', bgcolor: 'background.paper' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{b.ref} · {dayLabel(b.check_in)} → {dayLabel(b.check_out)}</Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{plural(rooms, 'room')}: {b.items.map((item) => `${item.quantity} × ${item.roomTypeName} (${item.rateName})`).join(', ')}</Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Paid {money(b.paid_amount ?? b.deposit_amount, b.currency)} of {money(b.total_amount, b.currency)}{b.tran_ref ? ` · 2C2P ${b.tran_ref}` : ''}</Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap gap={.75} sx={{ mt: 1 }}>
                  {b.status === 'paid' && <Chip size="small" color="warning" label={b.delivery_error ? 'Email to reservations failing — retrying' : 'Sending to reservations…'} />}
                  {b.flags.map((flag) => <Chip key={flag} size="small" color="warning" variant="outlined" label={FLAG_LABELS[flag] ?? flag} />)}
                </Stack>
              </Box>
              <Box sx={{ flexShrink: 0 }}>
                {b.keyed_at
                  ? <Chip icon={<CheckRounded />} label="In SiteMinder" color="success" variant="outlined" />
                  : <Button variant="contained" size="small" onClick={() => void markKeyed(b.ref)}>Entered in SiteMinder</Button>}
              </Box>
            </Stack>
          </Box>;
        })}
      </Stack>}
  </Box>;
}
