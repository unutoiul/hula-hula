import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import UndoRounded from '@mui/icons-material/UndoRounded';
import UnarchiveOutlined from '@mui/icons-material/UnarchiveOutlined';
import WhatsApp from '@mui/icons-material/WhatsApp';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, IconButton, Link, ListItemIcon,
  ListItemText, Menu, MenuItem, Snackbar, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import { countryName } from '../booking/countries';
import { dayLabel, guestsLabel, mealsLabel, money, nightsLabel, plural } from '../booking/format';
import {
  type Badge, channelName, type DeskBooking, FLAG_LABELS, guestCount, guestName, isPaid, isReversed, isTest, nightCount, paymentBadge, paymentPortal,
  paymentProviderOf, savingsOf, siteMinderBadge, siteMinderText, stampLabel,
} from './bookingModel';
import { InfoButton } from './InfoButton';
import { supabase } from './supabase';

const TONES: Record<Badge['tone'], { bg: string; fg: string; dot: string }> = {
  success: { bg: '#e7f4cc', fg: '#315707', dot: '#50830d' },
  warning: { bg: '#fff1cc', fg: '#7a4f00', dot: '#e0a100' },
  error: { bg: '#fde7e4', fg: '#9c2a1c', dot: '#d64532' },
  info: { bg: '#d9f5fc', fg: '#0b5266', dot: '#006d8a' },
  default: { bg: 'rgba(23,60,44,.06)', fg: '#4b6457', dot: '#9aab9f' },
};

/** A status pill with a coloured dot: "● Paid", "● To enter in SiteMinder". */
export function StatusChip({ badge }: { badge: Badge }) {
  const tone = TONES[badge.tone];
  return <Chip size="small" label={badge.label}
    icon={<Box component="span" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: tone.dot, ml: '8px !important', flexShrink: 0 }} />}
    sx={{ bgcolor: tone.bg, color: tone.fg, fontWeight: 700, fontSize: 12, height: 24, border: 0, '& .MuiChip-label': { pl: .75, pr: 1.25 } }} />;
}

// One booking, everything staff need, in a panel from the right (full screen
// on a phone): the guest, the stay, the payment, where it stands with
// SiteMinder, what happened when, and the team's own notes.
export function BookingDetail({ booking, onClose, onChanged }: { booking: DeskBooking | null; onClose: () => void; onChanged: () => Promise<void> }) {
  return <Drawer anchor="right" open={!!booking} onClose={onClose}
    slotProps={{ paper: { sx: { width: { xs: '100%', sm: 580 }, bgcolor: 'background.default' } } }}>
    {booking && <DetailBody key={booking.ref} b={booking} onClose={onClose} onChanged={onChanged} />}
  </Drawer>;
}

function DetailBody({ b, onClose, onChanged }: { b: DeskBooking; onClose: () => void; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [keying, setKeying] = useState(false);
  const paid = isPaid(b);
  const reversed = isReversed(b);
  const sm = siteMinderBadge(b);
  const provider = paymentProviderOf(b);
  const portal = paymentPortal(provider);
  const phoneDigits = b.guest_phone?.replace(/[^\d]/g, '') ?? '';

  const act = async (work: () => PromiseLike<{ error: { message: string } | null }>, done?: string) => {
    setBusy(true); setError(null); setMenu(null);
    const { error: actError } = await work();
    if (actError) setError(actError.message); else if (done) setToast(done);
    await onChanged();
    setBusy(false);
  };
  const setArchived = (archived: boolean) => act(() => supabase!.rpc('admin_set_archived', { p_ref: b.ref, p_archived: archived }), archived ? 'Archived' : 'Moved back from the archive');
  const copy = async (text: string, done: string) => {
    try { await navigator.clipboard.writeText(text); setToast(done); } catch { setError('Couldn’t copy — select the text and copy it instead.'); }
  };
  const refreshPayment = async () => {
    setBusy(true); setError(null);
    try {
      const { data, error: sessionError } = await supabase!.auth.getSession();
      if (sessionError || !data.session) throw new Error('Please sign in again.');
      const response = await fetch('/api/booking/refresh-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ ref: b.ref }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(result.error || `Could not check ${provider} right now.`);
      }
      await onChanged();
      setToast(`Payment status checked with ${provider}`);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : `Could not check ${provider} right now.`);
    } finally { setBusy(false); }
  };

  return <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    {/* Header: who, which booking, where it stands, and what to do next. */}
    <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={.5}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: '.06em', color: 'text.secondary' }}>{b.ref}</Typography>
          <Tooltip title="Copy booking reference"><IconButton size="small" aria-label="Copy booking reference" onClick={() => void copy(b.ref, 'Reference copied')}><ContentCopyRounded sx={{ fontSize: 15 }} /></IconButton></Tooltip>
        </Stack>
        <IconButton aria-label="Close" onClick={onClose} edge="end"><CloseRounded /></IconButton>
      </Stack>
      <Typography variant="h2" sx={{ fontSize: { xs: 26, sm: 30 }, lineHeight: 1.15, overflowWrap: 'anywhere' }}>{guestName(b)}</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: .5 }}>
        {dayLabel(b.check_in)} → {dayLabel(b.check_out)} · {nightsLabel(nightCount(b))}
      </Typography>
      <Stack direction="row" flexWrap="wrap" useFlexGap gap={.75} sx={{ mt: 1.5 }}>
        <StatusChip badge={paymentBadge(b)} />
        {sm && <StatusChip badge={sm} />}
        {isTest(b) && <StatusChip badge={{ label: 'Test payment', tone: 'info' }} />}
        {b.archived_at && <StatusChip badge={{ label: 'Archived', tone: 'default' }} />}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="center">
        {paid && !b.keyed_at && <Button variant="contained" size="small" startIcon={<CheckRounded />} disabled={busy} onClick={() => setKeying(true)} sx={{ flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}>Entered in SiteMinder</Button>}
        <Button variant="outlined" size="small" startIcon={<ContentCopyRounded />} onClick={() => void copy(siteMinderText(b), 'Booking details copied')} sx={{ flex: { xs: paid && !b.keyed_at ? 'none' : 1, sm: 'none' }, whiteSpace: 'nowrap' }}>Copy<Box component="span" sx={{ display: { xs: paid && !b.keyed_at ? 'none' : 'inline', sm: 'inline' } }}>&nbsp;details</Box></Button>
        <IconButton aria-label="More actions" onClick={(e) => setMenu(e.currentTarget)} sx={{ border: '1px solid', borderColor: 'divider' }}><MoreVertRounded /></IconButton>
        {busy && <CircularProgress size={18} />}
      </Stack>
      <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {b.guest_email && <MenuItem component="a" href={`mailto:${b.guest_email}?subject=${encodeURIComponent(`Your Hula Hula booking ${b.ref}`)}`}><ListItemIcon><EmailOutlined fontSize="small" /></ListItemIcon><ListItemText>Email the guest</ListItemText></MenuItem>}
        {phoneDigits && <MenuItem component="a" href={`tel:+${phoneDigits}`}><ListItemIcon><PhoneOutlined fontSize="small" /></ListItemIcon><ListItemText>Call the guest</ListItemText></MenuItem>}
        {phoneDigits && <MenuItem component="a" href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener"><ListItemIcon><WhatsApp fontSize="small" /></ListItemIcon><ListItemText>WhatsApp the guest</ListItemText></MenuItem>}
        {(b.guest_email || phoneDigits) && <Divider />}
        {b.keyed_at && <MenuItem onClick={() => void act(() => supabase!.rpc('admin_set_keyed', { p_ref: b.ref, p_keyed: false }), 'Marked as not in SiteMinder')}><ListItemIcon><UndoRounded fontSize="small" /></ListItemIcon><ListItemText primary="Not in SiteMinder after all" secondary="Holds the room on the website again" /></MenuItem>}
        {b.archived_at
          ? <MenuItem onClick={() => void setArchived(false)}><ListItemIcon><UnarchiveOutlined fontSize="small" /></ListItemIcon><ListItemText>Move back from the archive</ListItemText></MenuItem>
          : <MenuItem onClick={() => void setArchived(true)}><ListItemIcon><ArchiveOutlined fontSize="small" /></ListItemIcon><ListItemText>Archive</ListItemText></MenuItem>}
      </Menu>
    </Box>

    <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, sm: 3 }, py: 2.5 }}>
      <Stack spacing={2}>
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {b.flags.filter((flag) => flag !== 'test_payment' && flag !== 'preview_site').map((flag) => <Alert key={flag} severity="warning">{FLAG_LABELS[flag] ?? flag}</Alert>)}
        {b.status === 'paid' && b.delivery_error && <Alert severity="error">The “enter in SiteMinder” email to reservations keeps failing ({b.delivery_error.slice(0, 160)}). The website retries every night — everything you need is on this page meanwhile.</Alert>}

        <Section title="Guest">
          <Rows rows={[
            ['Name', guestName(b)],
            ['Email', b.guest_email && <Link href={`mailto:${b.guest_email}`} sx={{ overflowWrap: 'anywhere' }}>{b.guest_email}</Link>],
            ['Phone', b.guest_phone && <Link href={`tel:+${phoneDigits}`}>{b.guest_phone}</Link>],
            ['Country', b.guest_country && countryName(b.guest_country)],
            ['Arrival time', b.arrival_time],
          ]} />
          {b.special_requests && <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '12px', bgcolor: 'secondary.light' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'secondary.dark', mb: .25 }}>Special requests</Typography>
            <Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{b.special_requests}</Typography>
          </Box>}
        </Section>

        <Section title="Stay">
          <Rows rows={[
            ['Check-in', dayLabel(b.check_in)],
            ['Check-out', dayLabel(b.check_out)],
            ['Length', nightsLabel(nightCount(b))],
            ['Guests', (() => { const g = guestCount(b); return guestsLabel(g.adults, g.children); })()],
            ['Promo code', b.promo_code],
          ]} />
          <Stack spacing={1.25} sx={{ mt: 1.5 }}>
            {b.items.map((item, i) => <RoomCard key={i} item={item} currency={b.currency} />)}
          </Stack>
        </Section>

        <Section title="Payment" info={<p>This payment went through {provider}. To refund or void it, find the {provider} transaction number below in {portal}.</p>}>
          {reversed && <Alert severity="warning" sx={{ mb: 2 }}>{provider} reports this payment as {paymentBadge(b).label.toLowerCase()}. Check the amount in the portal and review the reservation in SiteMinder. The payment change does not cancel the stay automatically.</Alert>}
          <Rows rows={[
            ['Status', <StatusChip key="s" badge={paymentBadge(b)} />],
            [reversed ? 'Original payment' : 'Paid online', reversed ? (b.paid_amount === null ? `Check ${portal}` : money(b.paid_amount, b.currency)) : paid ? money(b.paid_amount ?? b.deposit_amount, b.currency) : `${money(b.deposit_amount, b.currency)} due — not paid`],
            ['Total for the stay', money(b.total_amount, b.currency)],
            ['To pay at the hotel', reversed ? 'Confirm with reservations after reviewing the reversal' : b.balance_amount > 0 ? money(b.balance_amount, b.currency) : paid ? 'Nothing — paid in full' : null],
            ['Offer savings', savingsOf(b) > 0 ? money(savingsOf(b), b.currency) : null],
            ['Paid with', channelName(b.channel_code)],
            ['Paid at', b.paid_at && stampLabel(b.paid_at)],
            [`${provider} transaction`, b.tran_ref],
            ['Approval code', b.approval_code],
            ['Invoice number', b.invoice_no],
            ['Payment last checked', b.last_inquiry_at && stampLabel(b.last_inquiry_at)],
            [`${provider} reply`, !paid && b.resp_code ? `${b.resp_code}${b.resp_desc ? ` · ${b.resp_desc}` : ''}` : null],
          ]} />
          <Button variant="outlined" size="small" disabled={busy} onClick={() => void refreshPayment()} sx={{ mt: 2 }}>{busy ? 'Checking…' : `Check ${provider} status`}</Button>
        </Section>

        {(paid || reversed) && <Section title="SiteMinder" info={<p>SiteMinder doesn’t accept bookings from the website yet, so each paid booking is emailed to reservations to enter by hand. Press “Entered in SiteMinder” once it’s in — until then the website keeps the room off sale so it isn’t sold twice.</p>}>
          <Rows rows={[
            ['Status', sm && <StatusChip key="s" badge={sm} />],
            ['Emailed to reservations', b.delivered_at && stampLabel(b.delivered_at)],
            ['Entered', b.keyed_at && `${stampLabel(b.keyed_at)}${b.keyed_by ? ` by ${b.keyed_by}` : ''}`],
            ['SiteMinder number', b.siteminder_res_id],
          ]} />
        </Section>}

        <Section title="Activity"><Timeline b={b} /></Section>
        <Notes b={b} onSaved={async () => { await onChanged(); setToast('Note saved'); }} />
      </Stack>
    </Box>

    <KeyedDialog open={keying} onClose={() => setKeying(false)} onConfirm={async (id) => { setKeying(false); await act(() => supabase!.rpc('admin_set_keyed', { p_ref: b.ref, p_keyed: true, p_siteminder_id: id }), 'Marked as entered in SiteMinder'); }} />
    <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast(null)} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
  </Box>;
}

function Section({ title, info, children }: { title: string; info?: ReactNode; children: ReactNode }) {
  return <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '18px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
    <Stack direction="row" alignItems="center" spacing={.25} sx={{ mb: 1 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>{title}</Typography>
      {info && <InfoButton label={title}>{info}</InfoButton>}
    </Stack>
    {children}
  </Box>;
}

/** Label / value pairs; empty values are left out. */
function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: { xs: '120px minmax(0, 1fr)', sm: '170px minmax(0, 1fr)' }, rowGap: 1, columnGap: 2, alignItems: 'center' }}>
    {rows.filter(([, value]) => value !== null && value !== undefined && value !== '').map(([label, value]) => <Box key={label} sx={{ display: 'contents' }}>
      <Typography component="dt" sx={{ fontSize: 13, color: 'text.secondary' }}>{label}</Typography>
      <Typography component="dd" sx={{ m: 0, fontSize: 14, fontWeight: 600, overflowWrap: 'anywhere' }}>{value}</Typography>
    </Box>)}
  </Box>;
}

function RoomCard({ item, currency }: { item: DeskBooking['items'][number]; currency: string }) {
  const [nightly, setNightly] = useState(false);
  return <Box sx={{ p: 1.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
    <Stack direction="row" justifyContent="space-between" spacing={1.5}>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700 }}>{item.quantity} × {item.roomTypeName}</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{item.rateName} · {mealsLabel(item.meals)}</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{guestsLabel(item.adults, item.children)}{item.quantity > 1 ? ' in each room' : ''}</Typography>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 700 }}>{money(item.unitTotal * item.quantity, currency)}</Typography>
        {item.unitOriginalTotal && item.unitOriginalTotal > item.unitTotal && <Typography sx={{ fontSize: 12, color: 'text.secondary', textDecoration: 'line-through' }}>{money(item.unitOriginalTotal * item.quantity, currency)}</Typography>}
      </Box>
    </Stack>
    {item.offer && <Box sx={{ mt: 1, p: 1.25, borderRadius: '10px', bgcolor: 'success.light' }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'success.dark' }}>Offer: {item.offer.title}{item.offer.percent > 0 ? ` · −${item.offer.percent}%` : ''}</Typography>
      {item.offer.perks.length > 0 && <Typography sx={{ fontSize: 13, color: 'success.dark' }}>To arrange: {item.offer.perks.join(' · ')}</Typography>}
    </Box>}
    <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1 }}>{item.cancellation}</Typography>
    {item.nightly.length > 0 && <>
      <Button size="small" variant="text" onClick={() => setNightly((v) => !v)} sx={{ mt: .5, minHeight: 0, p: 0, fontSize: 12 }}>{nightly ? 'Hide nightly prices' : `Nightly prices (${plural(item.nightly.length, 'night')})`}</Button>
      {nightly && <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: .5, fontSize: 13 }}>
        {item.nightly.map((night) => <Box key={night.date} sx={{ display: 'contents' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{dayLabel(night.date)}</Typography>
          <Typography sx={{ fontSize: 13, textAlign: 'right' }}>{money(night.amount, currency)}</Typography>
        </Box>)}
      </Box>}
    </>}
  </Box>;
}

function Timeline({ b }: { b: DeskBooking }) {
  const events = ([
    [b.created_at, 'Booking started on the website', null],
    [b.paid_at, `Paid ${money(b.paid_amount ?? b.deposit_amount, b.currency)}`, channelName(b.channel_code)],
    [b.guest_emailed_at, 'Confirmation emailed to the guest', b.guest_email],
    [b.delivered_at, b.delivery_method === 'siteconnect' ? 'Sent to SiteMinder' : 'Emailed to reservations', b.delivery_method === 'siteconnect' ? b.siteminder_res_id : null],
    [b.keyed_at, 'Entered in SiteMinder', b.keyed_by],
    [b.archived_at, 'Archived', b.archived_by],
  ] as [string | null, string, string | null][]).filter((e): e is [string, string, string | null] => !!e[0]).sort((x, y) => x[0].localeCompare(y[0]));
  if (!isPaid(b) && !isReversed(b) && b.status !== 'pending') events.push([b.expires_at, b.status === 'failed' ? 'The payment page couldn’t be opened' : 'Room hold ran out without payment', null]);
  return <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none' }}>
    {events.map(([at, label, detail], i) => <Box component="li" key={`${label}${at}`} sx={{ display: 'grid', gridTemplateColumns: '18px minmax(0, 1fr)', columnGap: 1.25 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: i === events.length - 1 ? 'primary.main' : 'divider', mt: .75, border: '2px solid', borderColor: i === events.length - 1 ? 'primary.light' : 'background.paper' }} />
        {i < events.length - 1 && <Box sx={{ flex: 1, width: 2, bgcolor: 'divider', my: .25 }} />}
      </Box>
      <Box sx={{ pb: i < events.length - 1 ? 1.5 : 0, minWidth: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{label}</Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', overflowWrap: 'anywhere' }}>{stampLabel(at)}{detail ? ` · ${detail}` : ''}</Typography>
      </Box>
    </Box>)}
  </Box>;
}

function Notes({ b, onSaved }: { b: DeskBooking; onSaved: () => Promise<void> }) {
  const [note, setNote] = useState(b.staff_notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const changed = note.trim() !== (b.staff_notes ?? '');
  const save = async () => {
    setSaving(true); setError(null);
    const { error: saveError } = await supabase!.rpc('admin_set_note', { p_ref: b.ref, p_note: note });
    setSaving(false);
    if (saveError) setError(saveError.message); else await onSaved();
  };
  return <Section title="Team notes" info={<p>Only staff see these — the guest never does. Handy for “called the guest”, “airport pick-up booked”, the SiteMinder booking number and the like.</p>}>
    <TextField multiline minRows={3} fullWidth placeholder="Add a note for the team…" value={note} onChange={(e) => setNote(e.target.value.slice(0, 4000))} />
    {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
    <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
      {changed && <Button size="small" onClick={() => setNote(b.staff_notes ?? '')}>Discard</Button>}
      <Button size="small" variant="contained" disabled={!changed || saving} onClick={() => void save()}>{saving ? 'Saving…' : 'Save note'}</Button>
    </Stack>
  </Section>;
}

function KeyedDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (siteMinderId: string) => Promise<void> }) {
  const [id, setId] = useState('');
  return <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Entered in SiteMinder?</DialogTitle>
    <DialogContent>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2 }}>Once it’s in SiteMinder, SiteMinder counts the room, so the website stops holding it.</Typography>
      <TextField autoFocus fullWidth label="SiteMinder booking number (optional)" value={id} onChange={(e) => setId(e.target.value.slice(0, 60))} />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={() => void onConfirm(id)}>Yes, it’s entered</Button>
    </DialogActions>
  </Dialog>;
}
