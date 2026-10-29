import CallRounded from '@mui/icons-material/CallRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Alert, Box, Button, Chip, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';
import { ActivityIcon } from '../booking/activityIcons';
import { activityById, RENTALS } from '../booking/config';
import { countryName } from '../booking/countries';
import { durationLabel, timeLabel } from '../booking/dates';
import { money, plural } from '../booking/pricing';
import { hhmm, supabase, type BookingStatus, type StaffBooking } from './supabase';

const STATUS: Record<BookingStatus, { label: string; color: 'default' | 'success' | 'warning' | 'error' }> = {
  booked: { label: 'Booked', color: 'default' },
  checked_in: { label: 'Arrived', color: 'success' },
  no_show: { label: 'No-show', color: 'warning' },
  cancelled: { label: 'Cancelled', color: 'error' },
};
const SOURCE = { online: 'Online', phone: 'Phone', walk_in: 'Walk-in' } as const;

// One booking on the day's sheet: who, how many, what's owed — tap it for
// the phone number, extras and notes, and to check the group in, mark a
// no-show or cancel.
export function BookingCard({ booking: b, onChanged }: { booking: StaffBooking; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const activity = activityById(b.activity)!;
  const option = activity.options.find((o) => o.id === b.option);
  const phoneDigits = b.phone.replace(/\D/g, '');
  const rentals = RENTALS.filter((r) => (b.rentals[r.id] ?? 0) > 0).map((r) => `${b.rentals[r.id]} × ${r.label}`).join(', ');
  const done = b.status === 'cancelled' || b.status === 'no_show';

  const setStatus = async (status: BookingStatus) => {
    setBusy(true); setError(null);
    const { error: updateError } = await supabase!.from('golf_bookings').update({ status }).eq('id', b.id);
    setBusy(false); setConfirmCancel(false);
    if (updateError) setError(updateError.message); else onChanged();
  };

  return <Box sx={{ borderRadius: '18px', border: '1px solid', borderColor: b.status === 'checked_in' ? 'success.main' : 'divider', bgcolor: b.status === 'checked_in' ? 'success.light' : 'background.paper', opacity: done ? .65 : 1, overflow: 'hidden' }}>
    <Box component="button" type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: 0, bgcolor: 'transparent', color: 'inherit', font: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
      <Box aria-hidden sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: b.status === 'checked_in' ? 'success.main' : 'primary.light', color: b.status === 'checked_in' ? 'white' : 'primary.main', '& svg': { fontSize: 21 } }}>
        {b.status === 'checked_in' ? <CheckCircleRounded /> : <ActivityIcon activity={b.activity} />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 700, textDecoration: b.status === 'cancelled' ? 'line-through' : 'none' }}>{b.first_name} {b.last_name}</Typography>
        <Typography noWrap sx={{ fontSize: 13, color: 'text.secondary' }}>{activity.name}{option ? ` · ${option.label}` : ''} · {plural(b.players, 'person', 'people')} · {money(b.total)}</Typography>
      </Box>
      <Stack alignItems="flex-end" spacing={.5} sx={{ flexShrink: 0 }}>
        {b.status !== 'booked' && <Chip size="small" color={STATUS[b.status].color} label={STATUS[b.status].label} />}
        <Stack direction="row" spacing={.5}>
          {b.transfer && <Chip size="small" variant="outlined" label="Pick-up" />}
          {b.source !== 'online' && <Chip size="small" variant="outlined" label={SOURCE[b.source]} />}
        </Stack>
      </Stack>
      <ExpandMoreRounded sx={{ color: 'text.secondary', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }} />
    </Box>

    <Collapse in={open} unmountOnExit>
      <Box sx={{ px: 1.5, pb: 1.75, borderTop: '1px dashed', borderColor: 'divider', pt: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 2, rowGap: .5, fontSize: 14 }}>
          <Detail label="Ref">{b.ref} · {SOURCE[b.source]}</Detail>
          <Detail label="Time">{timeLabel(hhmm(b.start_time))} · about {durationLabel(b.minutes)}</Detail>
          {b.phone && <Detail label="Phone">{b.phone}</Detail>}
          {b.email && <Detail label="Email">{b.email}</Detail>}
          {b.country && <Detail label="From">{countryName(b.country)}</Detail>}
          {b.handicap && <Detail label="Handicap">{b.handicap}</Detail>}
          {b.experience && <Detail label="Experience">{b.experience}</Detail>}
          {rentals && <Detail label="Rentals">{rentals}</Detail>}
          {b.transfer && <Detail label="Pick-up">{timeLabel(hhmm(b.transfer))} from {b.pickup_from}</Detail>}
          {b.notes && <Detail label="Notes"><Box component="span" sx={{ whiteSpace: 'pre-line' }}>{b.notes}</Box></Detail>}
          <Detail label="To pay">{b.lines.map((l) => `${l.label} ${money(l.amount)}`).join(' + ')}{b.lines.length > 1 ? ` = ${money(b.total)}` : ''}</Detail>
        </Box>

        {(b.phone || b.email) && <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          {phoneDigits.length >= 8 && <Button size="small" variant="outlined" startIcon={<CallRounded />} href={`tel:+${phoneDigits}`}>Call</Button>}
          {phoneDigits.length >= 8 && <Button size="small" variant="outlined" startIcon={<WhatsApp />} href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer">WhatsApp</Button>}
          {b.email && <Button size="small" variant="outlined" startIcon={<MailOutlineRounded />} href={`mailto:${b.email}?subject=${encodeURIComponent(`Your booking ${b.ref}`)}`}>Email</Button>}
        </Stack>}

        {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 1.75 }}>
          {b.status === 'booked' && <>
            <Button variant="contained" color="success" disabled={busy} onClick={() => void setStatus('checked_in')} startIcon={<CheckCircleRounded />} sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>They’ve arrived</Button>
            <Button size="small" variant="outlined" color="warning" disabled={busy} onClick={() => void setStatus('no_show')}>No-show</Button>
            <Button size="small" variant="outlined" color="error" disabled={busy} onClick={() => setConfirmCancel(true)}>Cancel booking</Button>
          </>}
          {b.status !== 'booked' && <Button size="small" variant="outlined" disabled={busy} onClick={() => void setStatus('booked')}>Undo · back to booked</Button>}
        </Stack>
      </Box>
    </Collapse>

    <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)}>
      <DialogTitle>Cancel {b.first_name}’s booking?</DialogTitle>
      <DialogContent><Typography>{activity.name} at {timeLabel(hhmm(b.start_time))} for {plural(b.players, 'person', 'people')}. The time opens up again on the website straight away. Let them know — this doesn’t email them.</Typography></DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmCancel(false)}>Keep it</Button>
        <Button color="error" variant="contained" disabled={busy} onClick={() => void setStatus('cancelled')}>Cancel booking</Button>
      </DialogActions>
    </Dialog>
  </Box>;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return <>
    <Typography component="span" sx={{ fontSize: 13, color: 'text.secondary' }}>{label}</Typography>
    <Typography component="span" sx={{ fontSize: 14, minWidth: 0, overflowWrap: 'anywhere' }}>{children}</Typography>
  </>;
}
