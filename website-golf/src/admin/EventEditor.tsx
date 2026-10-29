import AddRounded from '@mui/icons-material/AddRounded';
import CallRounded from '@mui/icons-material/CallRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import PointOfSaleRounded from '@mui/icons-material/PointOfSaleRounded';
import West from '@mui/icons-material/West';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Alert, Box, Button, Chip, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { slugify } from '../booking/config';
import { shortDayLabel } from '../booking/dates';
import { money, plural } from '../booking/pricing';
import { GuestStepper } from '../components/booking/GuestStepper';
import { linkClick, navigate } from '../router';
import { ImagePicker } from './ImagePicker';
import { supabase, takenPlaces, type OrderStatus, type StaffEvent, type StaffOrder, type StaffPackage } from './supabase';
import { linesToList, listToLines, Section, toInt } from './ui';

const STATUS: Record<OrderStatus, { label: string; color: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  paid: { label: 'Paid', color: 'success' }, pending: { label: 'Paying…', color: 'info' }, failed: { label: 'Payment failed', color: 'default' },
  expired: { label: 'Not paid', color: 'default' }, cancelled: { label: 'Cancelled', color: 'error' }, refunded: { label: 'Refunded', color: 'warning' },
};

/** "09:00 Registration & coffee" per line ⇄ the schedule. */
const scheduleToText = (schedule: StaffEvent['schedule']) => schedule.map((s) => `${s.time} ${s.text}`.trim()).join('\n');
const textToSchedule = (text: string) => linesToList(text).map((line) => {
  const match = /^(\d{1,2})[:.](\d{2})\s*(.*)$/.exec(line);
  return match ? { time: `${match[1].padStart(2, '0')}:${match[2]}`, text: match[3] } : { time: '', text: line };
});

// /admin/events/<id> — one event: its page on the website (details, cover,
// story, schedule), what's on sale (packages: price, how many, what's in),
// and every order, with sales made at the desk added by hand.
export function EventEditor({ id }: { id: string }) {
  const [event, setEvent] = useState<StaffEvent | null>(null);
  const [packages, setPackages] = useState<StaffPackage[]>([]);
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [e, pk, o] = await Promise.all([
      supabase!.from('golf_events').select('*').eq('id', id).maybeSingle(),
      supabase!.from('golf_event_packages').select('*').eq('event_id', id).order('sort_order').order('created_at'),
      supabase!.from('golf_event_orders').select('*').eq('event_id', id).order('created_at', { ascending: false }),
    ]);
    const failed = e.error ?? pk.error ?? o.error;
    if (failed) { setError(failed.message); return; }
    if (!e.data) { setError('That event doesn’t exist any more.'); return; }
    setEvent(e.data as StaffEvent);
    setPackages(pk.data as StaffPackage[]);
    setOrders(o.data as StaffOrder[]);
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  if (!event) return error ? <Alert severity="error">{error}</Alert> : <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;
  return <Box>
    <Button href="/admin/events" onClick={linkClick('/admin/events')} startIcon={<West />} size="small" sx={{ mb: 1, minHeight: 0 }}>All events</Button>
    <Stack spacing={2.5}>
      <Details event={event} hasOrders={orders.length > 0} onSaved={load} />
      <Packages event={event} packages={packages} orders={orders} onChanged={load} />
      <Orders packages={packages} orders={orders} onChanged={load} />
    </Stack>
  </Box>;
}

// ── The event's page ───────────────────────────────────────────────────────

function Details({ event, hasOrders, onSaved }: { event: StaffEvent; hasOrders: boolean; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({
    ...event, start_time: event.start_time?.slice(0, 5) ?? '', end_time: event.end_time?.slice(0, 5) ?? '', ends_on: event.ends_on ?? '',
    highlights: listToLines(event.highlights), schedule: scheduleToText(event.schedule),
  });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (change: Partial<typeof form>) => { setStatus(null); setForm((f) => ({ ...f, ...change })); };

  const save = async () => {
    const slug = slugify(form.slug || form.title);
    if (!form.title.trim()) return setStatus({ ok: false, text: 'Give the event a title.' });
    if (!form.starts_on) return setStatus({ ok: false, text: 'Pick the day it starts.' });
    if (form.ends_on && form.ends_on < form.starts_on) return setStatus({ ok: false, text: 'The last day can’t be before the first.' });
    if (!slug || slug === 'order') return setStatus({ ok: false, text: 'Pick a different web address.' });
    setBusy(true);
    const { error } = await supabase!.from('golf_events').update({
      title: form.title.trim(), slug, tagline: form.tagline.trim(), starts_on: form.starts_on, ends_on: form.ends_on || null,
      start_time: form.start_time || null, end_time: form.end_time || null, description: form.description.trim(),
      highlights: linesToList(form.highlights), schedule: textToSchedule(form.schedule), cover_image: form.cover_image || null,
      published: form.published, sales_open: form.sales_open,
    }).eq('id', event.id);
    setBusy(false);
    if (error) return setStatus({ ok: false, text: error.message.includes('slug') ? 'Another event already uses that web address.' : error.message });
    setForm((f) => ({ ...f, slug }));
    setStatus({ ok: true, text: form.published ? 'Saved — it’s on the website.' : 'Saved as a draft (not on the website yet).' });
    await onSaved();
  };

  const remove = async () => {
    const { error } = await supabase!.from('golf_events').delete().eq('id', event.id);
    if (error) { setStatus({ ok: false, text: error.message }); setConfirmDelete(false); return; }
    navigate('/admin/events');
  };

  return <Section title="The event" hint="What guests see on its page." action={event.published ? <Button size="small" href={`/events/${event.slug}`} target="_blank" rel="noopener" endIcon={<OpenInNewRounded sx={{ fontSize: 16 }} />}>View</Button> : undefined}>
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: .5, sm: 3 }}>
        <FormControlLabel control={<Switch checked={form.published} onChange={(e) => set({ published: e.target.checked })} />} label={<Typography sx={{ fontWeight: 700 }}>{form.published ? 'On the website' : 'Draft — hidden'}</Typography>} />
        <FormControlLabel control={<Switch checked={form.sales_open} onChange={(e) => set({ sales_open: e.target.checked })} />} label={form.sales_open ? 'Selling packages' : 'Sales closed'} />
      </Stack>
      <TextField label="Title" required value={form.title} onChange={(e) => set({ title: e.target.value.slice(0, 120) })} placeholder="Pro Day with Cedric" />
      <TextField label="One-line pitch" value={form.tagline} onChange={(e) => set({ tagline: e.target.value.slice(0, 200) })} placeholder="A morning clinic, nine holes with a pro, and lunch on the balcony." />
      <TextField label="Web address" value={form.slug} onChange={(e) => set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60) })} helperText={`hulahula-golf.vercel.app/events/${slugify(form.slug || form.title) || '…'}`} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        <TextField label="Day" type="date" required value={form.starts_on} onChange={(e) => set({ starts_on: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Last day (optional)" type="date" value={form.ends_on} onChange={(e) => set({ ends_on: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Starts" type="time" value={form.start_time} onChange={(e) => set({ start_time: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Ends" type="time" value={form.end_time} onChange={(e) => set({ end_time: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
      </Box>
      <ImagePicker value={form.cover_image ? [form.cover_image] : []} onChange={(images) => set({ cover_image: images[0] ?? null })} label="Cover photo" />
      <TextField label="About the day" multiline minRows={5} value={form.description} onChange={(e) => set({ description: e.target.value.slice(0, 5000) })} helperText="Leave an empty line between paragraphs." />
      <TextField label="Highlights (one per line)" multiline minRows={3} value={form.highlights} onChange={(e) => set({ highlights: e.target.value })} placeholder={'Swing clinic with Cedric\n9 holes with the pro\nLunch & drinks on the balcony'} />
      <TextField label="Schedule (one per line: time, then what happens)" multiline minRows={3} value={form.schedule} onChange={(e) => set({ schedule: e.target.value })} placeholder={'08:30 Registration & coffee\n09:00 Swing clinic\n12:30 Lunch'} />
      {status && <Alert severity={status.ok ? 'success' : 'error'}>{status.text}</Alert>}
      <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
        {hasOrders ? <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Has orders — hide it instead of deleting.</Typography>
          : <Button color="error" onClick={() => setConfirmDelete(true)}>Delete event</Button>}
        <Button variant="contained" onClick={() => void save()} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
      </Stack>
    </Stack>
    <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
      <DialogTitle>Delete “{event.title}”?</DialogTitle>
      <DialogContent><Typography>The event and its packages are removed for good.</Typography></DialogContent>
      <DialogActions><Button onClick={() => setConfirmDelete(false)}>Keep it</Button><Button color="error" variant="contained" onClick={() => void remove()}>Delete</Button></DialogActions>
    </Dialog>
  </Section>;
}

// ── What's on sale ─────────────────────────────────────────────────────────

const blankPackage = (eventId: string, sortOrder: number): StaffPackage => ({ id: '', event_id: eventId, name: '', description: '', includes: [], price: 0, capacity: 20, max_per_order: 4, sort_order: sortOrder, active: true });

function Packages({ event, packages, orders, onChanged }: { event: StaffEvent; packages: StaffPackage[]; orders: StaffOrder[]; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState<StaffPackage | null>(null);
  return <Section title="Packages" hint="What guests can buy. Prices are per person, in baht." action={<Button startIcon={<AddRounded />} onClick={() => setEditing(blankPackage(event.id, (packages.at(-1)?.sort_order ?? 0) + 10))}>Add</Button>}>
    <Stack spacing={1.25}>
      {packages.map((pk) => {
        const taken = takenPlaces(orders, pk.id);
        return <Box key={pk.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider', opacity: pk.active ? 1 : .6 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 700 }}>{pk.name}</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{money(pk.price)} · {taken} of {pk.capacity} sold{pk.active ? '' : ' · hidden'}</Typography>
            <Box sx={{ mt: .75, height: 6, borderRadius: 3, bgcolor: 'rgba(23,60,44,.08)', overflow: 'hidden' }}><Box sx={{ height: '100%', width: `${Math.min(100, (taken / Math.max(1, pk.capacity)) * 100)}%`, bgcolor: taken >= pk.capacity ? 'warning.main' : 'success.main' }} /></Box>
          </Box>
          <IconButton aria-label={`Edit ${pk.name}`} onClick={() => setEditing(pk)} sx={{ border: '1px solid', borderColor: 'divider' }}><EditRounded /></IconButton>
        </Box>;
      })}
      {packages.length === 0 && <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>No packages yet. Add one so guests can book — e.g. “Clinic + 9 holes”, “Spectator & lunch”.</Typography>}
    </Stack>
    {editing && <PackageDialog pack={editing} sold={takenPlaces(orders, editing.id)} hasOrders={orders.some((o) => o.package_id === editing.id)} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await onChanged(); }} />}
  </Section>;
}

function PackageDialog({ pack, sold, hasOrders, onClose, onSaved }: { pack: StaffPackage; sold: number; hasOrders: boolean; onClose: () => void; onSaved: () => Promise<void> }) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState({ ...pack, includes: listToLines(pack.includes) });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (change: Partial<typeof form>) => setForm((f) => ({ ...f, ...change }));

  const save = async () => {
    if (!form.name.trim()) return setError('Give the package a name.');
    setBusy(true);
    const row = { event_id: form.event_id, name: form.name.trim(), description: form.description.trim(), includes: linesToList(form.includes), price: form.price, capacity: form.capacity, max_per_order: form.max_per_order, sort_order: form.sort_order, active: form.active };
    const { error: saveError } = pack.id ? await supabase!.from('golf_event_packages').update(row).eq('id', pack.id) : await supabase!.from('golf_event_packages').insert(row);
    setBusy(false);
    if (saveError) setError(saveError.message); else await onSaved();
  };
  const remove = async () => {
    const { error: deleteError } = await supabase!.from('golf_event_packages').delete().eq('id', pack.id);
    if (deleteError) setError(deleteError.message); else await onSaved();
  };

  return <Dialog open onClose={onClose} fullScreen={phone} fullWidth maxWidth="sm" scroll="paper">
    <DialogTitle>{pack.id ? `Edit ${pack.name}` : 'New package'}</DialogTitle>
    <DialogContent dividers>
      <Stack spacing={2}>
        <TextField label="Name" required value={form.name} onChange={(e) => set({ name: e.target.value.slice(0, 80) })} placeholder="Clinic + 9 holes with Cedric" />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
          <TextField label="Price ฿" type="number" value={form.price} onChange={(e) => set({ price: Math.max(0, toInt(e.target.value)) })} slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }} />
          <TextField label="Places in total" type="number" value={form.capacity} onChange={(e) => set({ capacity: Math.max(0, toInt(e.target.value)) })} helperText={pack.id ? `${sold} sold` : ' '} slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }} />
          <TextField label="Most per order" type="number" value={form.max_per_order} onChange={(e) => set({ max_per_order: Math.min(50, Math.max(1, toInt(e.target.value, 4))) })} slotProps={{ htmlInput: { min: 1, max: 50, inputMode: 'numeric' } }} />
        </Box>
        <TextField label="Description" multiline minRows={2} value={form.description} onChange={(e) => set({ description: e.target.value.slice(0, 400) })} />
        <TextField label="Included (one per line)" multiline minRows={3} value={form.includes} onChange={(e) => set({ includes: e.target.value })} placeholder={'Swing clinic\n9 holes with caddie & cart\nLunch'} />
        <FormControlLabel control={<Switch checked={form.active} onChange={(e) => set({ active: e.target.checked })} />} label={form.active ? 'On sale' : 'Hidden from the event page'} />
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
      {pack.id && !hasOrders ? <Button color="error" onClick={() => void remove()}>Delete</Button> : <Box />}
      <Stack direction="row" spacing={1}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => void save()} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
      </Stack>
    </DialogActions>
  </Dialog>;
}

// ── Orders ─────────────────────────────────────────────────────────────────

function Orders({ packages, orders, onChanged }: { packages: StaffPackage[]; orders: StaffOrder[]; onChanged: () => Promise<void> }) {
  const [showAll, setShowAll] = useState(false);
  const [selling, setSelling] = useState(false);
  const live = orders.filter((o) => o.status === 'paid' || o.status === 'refunded' || o.status === 'cancelled' || (o.status === 'pending' && !!o.expires_at && Date.parse(o.expires_at) > Date.now()));
  const shown = showAll ? orders : live;
  const paid = orders.filter((o) => o.status === 'paid');
  const takings = paid.filter((o) => !o.test_payment).reduce((sum, o) => sum + o.total, 0);
  const people = paid.reduce((sum, o) => sum + o.quantity, 0);

  return <Section title="Orders" hint={`${plural(people, 'place')} paid · ${money(takings)} taken${paid.some((o) => o.test_payment) ? ' (test payments not counted)' : ''}`}
    action={packages.length > 0 ? <Button startIcon={<PointOfSaleRounded />} onClick={() => setSelling(true)}>Desk sale</Button> : undefined}>
    <Stack spacing={1}>
      {shown.map((o) => <OrderRow key={o.id} order={o} onChanged={onChanged} />)}
      {shown.length === 0 && <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>No orders yet.</Typography>}
      {orders.length !== live.length && <Button size="small" onClick={() => setShowAll((s) => !s)} sx={{ alignSelf: 'center' }}>{showAll ? 'Hide' : 'Show'} {plural(orders.length - live.length, 'unfinished payment')}</Button>}
    </Stack>
    {selling && <DeskSaleDialog packages={packages.filter((pk) => pk.active)} orders={orders} onClose={() => setSelling(false)} onSaved={async () => { setSelling(false); await onChanged(); }} />}
  </Section>;
}

function OrderRow({ order: o, onChanged }: { order: StaffOrder; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const digits = o.phone.replace(/\D/g, '');
  const setStatus = async (status: OrderStatus) => {
    setBusy(true);
    await supabase!.from('golf_event_orders').update({ status }).eq('id', o.id);
    setBusy(false);
    await onChanged();
  };
  return <Box sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
    <Box component="button" type="button" aria-expanded={open} onClick={() => setOpen((x) => !x)} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: 0, bgcolor: 'transparent', font: 'inherit', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 700 }}>{o.first_name} {o.last_name}</Typography>
        <Typography noWrap sx={{ fontSize: 13, color: 'text.secondary' }}>{o.package_name} × {o.quantity} · {money(o.total)} · {o.ref}</Typography>
      </Box>
      <Stack alignItems="flex-end" spacing={.5}>
        <Chip size="small" label={STATUS[o.status].label} color={STATUS[o.status].color} />
        <Stack direction="row" spacing={.5}>
          {o.test_payment && <Chip size="small" variant="outlined" label="Test" />}
          {o.source === 'desk' && <Chip size="small" variant="outlined" label="Desk" />}
        </Stack>
      </Stack>
    </Box>
    <Collapse in={open} unmountOnExit>
      <Box sx={{ px: 1.5, pb: 1.5, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
        <Typography sx={{ fontSize: 14 }}>{o.phone}{o.email ? ` · ${o.email}` : ''}</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Ordered {shortDayLabel(o.created_at.slice(0, 10))}{o.tran_ref ? ` · 2C2P ${o.tran_ref}` : ''}</Typography>
        {o.notes && <Typography sx={{ fontSize: 14, mt: .75, whiteSpace: 'pre-line' }}>{o.notes}</Typography>}
        {o.flags.includes('paid_after_expiry') && <Alert severity="warning" sx={{ mt: 1 }}>Paid after the hold ran out — check the package isn’t over-sold.</Alert>}
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 1.25 }}>
          {digits.length >= 8 && <Button size="small" variant="outlined" startIcon={<CallRounded />} href={`tel:+${digits}`}>Call</Button>}
          {digits.length >= 8 && <Button size="small" variant="outlined" startIcon={<WhatsApp />} href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">WhatsApp</Button>}
          {o.email && <Button size="small" variant="outlined" startIcon={<MailOutlineRounded />} href={`mailto:${o.email}?subject=${encodeURIComponent(`Your order ${o.ref}`)}`}>Email</Button>}
          {o.status === 'paid' && <Button size="small" color="error" disabled={busy} onClick={() => void setStatus('cancelled')}>Cancel order</Button>}
          {o.status === 'paid' && o.source === 'online' && <Button size="small" color="warning" disabled={busy} onClick={() => void setStatus('refunded')}>Mark refunded</Button>}
          {(o.status === 'cancelled' || o.status === 'refunded') && <Button size="small" disabled={busy} onClick={() => void setStatus('paid')}>Undo</Button>}
        </Stack>
        {o.status === 'paid' && o.source === 'online' && <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1 }}>Refunds are made in the 2C2P portal; mark it here once done. Cancelling frees the places.</Typography>}
      </Box>
    </Collapse>
  </Box>;
}

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const newRef = () => `HE${Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => CROCKFORD[b % 32]).join('')}`;

function DeskSaleDialog({ packages, orders, onClose, onSaved }: { packages: StaffPackage[]; orders: StaffOrder[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const theme = useTheme();
  const phoneScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [packageId, setPackageId] = useState(packages[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pack = packages.find((pk) => pk.id === packageId);
  const left = pack ? Math.max(0, pack.capacity - takenPlaces(orders, pack.id)) : 0;

  const save = async () => {
    if (!pack || !name.trim()) return setError('Pick a package and add a name.');
    const [first, ...rest] = name.trim().split(/\s+/);
    setBusy(true);
    const { error: saveError } = await supabase!.rpc('golf_event_reserve', { p_order: {
      ref: newRef(), package_id: pack.id, quantity, first_name: first, last_name: rest.join(' '), phone: phone.trim(), email: email.trim().toLowerCase(), notes: notes.trim(), source: 'desk',
    } });
    setBusy(false);
    if (saveError) setError(saveError.message.includes('sold out') ? `Only ${left} left in this package.` : saveError.message); else await onSaved();
  };

  return <Dialog open onClose={onClose} fullScreen={phoneScreen} fullWidth maxWidth="xs">
    <DialogTitle>Sale at the desk</DialogTitle>
    <DialogContent dividers>
      <Stack spacing={2}>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Paid in cash, by card at the club or by transfer. Counts as paid straight away.</Typography>
        <TextField select label="Package" value={packageId} onChange={(e) => setPackageId(e.target.value)}>
          {packages.map((pk) => <MenuItem key={pk.id} value={pk.id}>{pk.name} · {money(pk.price)}</MenuItem>)}
        </TextField>
        <GuestStepper label={`How many (${left} left)`} value={quantity} min={1} max={Math.max(1, left)} onChange={setQuantity} />
        <TextField label="Name" required value={name} onChange={(e) => setName(e.target.value.slice(0, 120))} />
        <TextField label="Phone / WhatsApp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value.slice(0, 30))} />
        <TextField label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 120))} />
        <TextField label="Notes (optional)" multiline minRows={2} value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 1000))} />
        {pack && <Stack direction="row" justifyContent="space-between" sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'success.light' }}><Typography>{quantity} × {money(pack.price)}</Typography><Typography sx={{ fontWeight: 700 }}>{money(quantity * pack.price)}</Typography></Stack>}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 1.5 }}>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={() => void save()} disabled={busy || left < 1}>{busy ? 'Saving…' : 'Record sale'}</Button>
    </DialogActions>
  </Dialog>;
}
