import CallRounded from '@mui/icons-material/CallRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import PaymentsRounded from '@mui/icons-material/PaymentsRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Alert, Box, Button, Card, CardActionArea, Chip, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';
import { ActivityIcon } from '../booking/activityIcons';
import { activityName, findActivity, isPrivateTransfer, rentalName } from '../booking/config';
import { useSite } from '../context/SiteDataContext';
import { countryName } from '../booking/countries';
import { durationLabel, timeLabel } from '../booking/dates';
import { balanceDue, money, onlineAmount, plural } from '../booking/pricing';
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
  const site = useSite();
  const activity = findActivity(site, b.activity);
  const option = activity?.options.find((o) => o.id === b.option);
  const name = activityName(site, b.activity);
  const phoneDigits = b.phone.replace(/\D/g, '');
  const rentals = Object.entries(b.rentals).filter(([, n]) => n > 0).map(([id, n]) => { const rental = site.rentals.find((r) => r.id === id); return `${n} × ${rental ? rentalName(rental) : id}`; }).join(', ');
  const done = b.status === 'cancelled' || b.status === 'no_show';
  const balance = balanceDue(b);
  const online = onlineAmount(b);
  const settled = !!b.paid_at || !!b.balance_paid_at;
  const privateTransfer = isPrivateTransfer(b);

  const setStatus = (status: BookingStatus) => save({ status });
  const save = async (patch: Partial<Pick<StaffBooking, 'status' | 'balance_paid_at'>>) => {
    setBusy(true); setError(null);
    const { error: updateError } = await supabase!.from('golf_bookings').update(patch).eq('id', b.id);
    setBusy(false); setConfirmCancel(false);
    if (updateError) setError(updateError.message); else onChanged();
  };

  const hasTags = b.status !== 'booked' || settled || !!b.transfer || privateTransfer || b.source !== 'online';

  // On a phone the tags drop under the name, so the name keeps the full width.
  return <Card variant="outlined" sx={{ borderRadius: '18px', borderColor: b.status === 'checked_in' ? 'success.main' : 'divider', bgcolor: b.status === 'checked_in' ? 'success.light' : 'background.paper', opacity: done ? .65 : 1 }}>
    <CardActionArea aria-expanded={open} onClick={() => setOpen((o) => !o)} sx={{ display: 'grid', alignItems: 'center', columnGap: 1.5, rowGap: .5, p: 1.5, gridTemplateColumns: { xs: 'auto minmax(0, 1fr) auto', sm: 'auto minmax(0, 1fr) auto auto' }, gridTemplateAreas: { xs: '"icon main expand" ". tags tags"', sm: '"icon main tags expand"' } }}>
      <Box aria-hidden sx={{ gridArea: 'icon', width: 40, height: 40, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: b.status === 'checked_in' ? 'success.main' : 'primary.light', color: b.status === 'checked_in' ? 'white' : 'primary.main', '& svg': { fontSize: 21 } }}>
        {b.status === 'checked_in' ? <CheckCircleRounded /> : <ActivityIcon icon={activity?.icon} />}
      </Box>
      <Box sx={{ gridArea: 'main', minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 700, textDecoration: b.status === 'cancelled' ? 'line-through' : 'none' }}>{b.first_name} {b.last_name}</Typography>
        <Typography noWrap sx={{ fontSize: 13, color: 'text.secondary' }}>{name}{option ? ` · ${option.label}` : ''} · {plural(b.players, 'person', 'people')} · {b.paid_at && balance > 0 ? `${money(balance)} to pay` : money(b.total)}</Typography>
      </Box>
      {hasTags && <Stack direction="row" flexWrap="wrap" useFlexGap gap={.5} sx={{ gridArea: 'tags', justifyContent: { sm: 'flex-end' } }}>
        {b.status !== 'booked' && <Chip size="small" color={STATUS[b.status].color} label={STATUS[b.status].label} />}
        {settled && <Chip size="small" variant="outlined" color="success" label={b.test_payment ? 'Test' : balance > 0 ? 'Deposit' : 'Paid'} />}
        {b.transfer && <Chip size="small" variant="outlined" label="Pick-up" />}
        {privateTransfer && <Chip size="small" variant="outlined" color="primary" label="Private car" />}
        {b.source !== 'online' && <Chip size="small" variant="outlined" label={SOURCE[b.source]} />}
      </Stack>}
      <ExpandMoreRounded sx={{ gridArea: 'expand', color: 'text.secondary', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }} />
    </CardActionArea>

    <Collapse in={open} unmountOnExit>
      <Box sx={{ px: 1.5, pb: 1.75, borderTop: '1px dashed', borderColor: 'divider', pt: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', columnGap: 2, rowGap: .5, fontSize: 14 }}>
          <Detail label="Ref">{b.ref} · {SOURCE[b.source]}</Detail>
          <Detail label="Time">{timeLabel(hhmm(b.start_time))} · about {durationLabel(b.minutes)}</Detail>
          {b.phone && <Detail label="Phone">{b.phone}</Detail>}
          {b.email && <Detail label="Email">{b.email}</Detail>}
          {b.country && <Detail label="From">{countryName(b.country)}</Detail>}
          {b.handicap && <Detail label="Handicap">{b.handicap}</Detail>}
          {b.experience && <Detail label="Experience">{b.experience}</Detail>}
          {rentals && <Detail label="Rentals">{rentals}</Detail>}
          {b.transfer && <Detail label="Pick-up">{timeLabel(hhmm(b.transfer))} from {b.pickup_from}</Detail>}
          {privateTransfer && <Detail label="Private transfer">From {b.pickup_from}. Agree the price and pick-up time with the guest.</Detail>}
          {b.notes && <Detail label="Notes"><Box component="span" sx={{ whiteSpace: 'pre-line' }}>{b.notes}</Box></Detail>}
          <Detail label={settled ? 'Price' : 'To pay'}>{b.lines.map((l) => `${l.label} ${money(l.amount)}`).join(' + ')}{b.lines.length > 1 ? ` = ${money(b.total)}` : ''}</Detail>
          {b.paid_at && <Detail label={online < b.total ? 'Deposit paid' : 'Paid online'}>{money(online)}</Detail>}
          {b.paid_at && balance > 0 && <Detail label="To pay at club"><strong>{money(balance)}</strong></Detail>}
          {b.balance_paid_at && <Detail label="Paid at club">{money(b.total - online)}</Detail>}
          {b.tran_ref && <Detail label="Payso">{b.tran_ref}</Detail>}
        </Box>
        {b.flags.includes('paid_after_expiry') && <Alert severity="warning" sx={{ mt: 1.5 }}>Paid after the hold ran out — check this time isn’t overbooked.</Alert>}

        {(b.phone || b.email) && <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          {phoneDigits.length >= 8 && <Button size="small" variant="outlined" startIcon={<CallRounded />} href={`tel:+${phoneDigits}`}>Call</Button>}
          {phoneDigits.length >= 8 && <Button size="small" variant="outlined" startIcon={<WhatsApp />} href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer">WhatsApp</Button>}
          {b.email && <Button size="small" variant="outlined" startIcon={<MailOutlineRounded />} href={`mailto:${b.email}?subject=${encodeURIComponent(`Your booking ${b.ref}`)}`}>Email</Button>}
        </Stack>}

        {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 1.75 }}>
          {b.status === 'booked' && <Button variant="contained" color="success" disabled={busy} onClick={() => void setStatus('checked_in')} startIcon={<CheckCircleRounded />} sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>They’ve arrived</Button>}
          {balance > 0 && !done && <Button variant="outlined" color="success" disabled={busy} onClick={() => void save({ balance_paid_at: new Date().toISOString() })} startIcon={<PaymentsRounded />} sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>{money(balance)} paid at the club</Button>}
          {b.balance_paid_at && !done && <Button size="small" variant="outlined" disabled={busy} onClick={() => void save({ balance_paid_at: null })}>Undo · not paid yet</Button>}
          {b.status === 'booked' && <>
            <Button size="small" variant="outlined" color="warning" disabled={busy} onClick={() => void setStatus('no_show')}>No-show</Button>
            <Button size="small" variant="outlined" color="error" disabled={busy} onClick={() => setConfirmCancel(true)}>Cancel booking</Button>
          </>}
          {b.status !== 'booked' && <Button size="small" variant="outlined" disabled={busy} onClick={() => void setStatus('booked')}>Undo · back to booked</Button>}
        </Stack>
      </Box>
    </Collapse>

    <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)}>
      <DialogTitle>Cancel {b.first_name}’s booking?</DialogTitle>
      <DialogContent><Typography>{name} at {timeLabel(hhmm(b.start_time))} for {plural(b.players, 'person', 'people')}. The time opens up again on the website straight away. Let them know — this doesn’t email them.{b.paid_at ? ` They paid ${online < b.total ? `a ${money(online)} deposit` : money(online)} online, so any refund is made in the Payso control panel.` : ''}</Typography></DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmCancel(false)}>Keep it</Button>
        <Button color="error" variant="contained" disabled={busy} onClick={() => void setStatus('cancelled')}>Cancel booking</Button>
      </DialogActions>
    </Dialog>
  </Card>;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return <>
    <Typography component="span" sx={{ fontSize: 13, color: 'text.secondary' }}>{label}</Typography>
    <Typography component="span" sx={{ fontSize: 14, minWidth: 0, overflowWrap: 'anywhere' }}>{children}</Typography>
  </>;
}
