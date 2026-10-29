import AddRounded from '@mui/icons-material/AddRounded';
import { Alert, Box, Button, Chip, CircularProgress, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { normaliseClub, openingHoursLines, WEEKDAYS, type ClubSettings } from '../booking/config';
import { timeLabel } from '../booking/dates';
import { useSiteData } from '../context/SiteDataContext';
import { supabase } from './supabase';
import { PageTitle, Section, toInt } from './ui';

// /admin/settings — the club-wide things the website shows and the booking
// rules it follows: the top-bar message, opening hours (a closed day takes no
// bookings), contact details, the shuttle and the booking rules. One save;
// the website follows within about half a minute.
export function SettingsPage() {
  const { reload } = useSiteData();
  const [club, setClub] = useState<ClubSettings | null>(null);
  const [newPickup, setNewPickup] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    void supabase!.from('golf_settings').select('value').eq('key', 'club').maybeSingle().then(({ data, error }) => {
      if (error) setStatus({ ok: false, text: error.message });
      setClub(normaliseClub(data?.value));
    });
  }, []);

  if (!club) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;
  const set = (change: Partial<ClubSettings>) => { setStatus(null); setClub({ ...club, ...change }); };
  const setContact = (change: Partial<ClubSettings['contact']>) => set({ contact: { ...club.contact, ...change } });
  const setBooking = (change: Partial<ClubSettings['booking']>) => set({ booking: { ...club.booking, ...change } });
  const setDay = (i: number, change: Partial<ClubSettings['hours'][number]>) => set({ hours: club.hours.map((d, j) => (j === i ? { ...d, ...change } : d)) });

  const save = async () => {
    setBusy(true);
    const cleaned = normaliseClub(club);
    const { error } = await supabase!.from('golf_settings').upsert({ key: 'club', value: cleaned });
    setBusy(false);
    if (error) { setStatus({ ok: false, text: error.message }); return; }
    setClub(cleaned);
    setStatus({ ok: true, text: 'Saved — the website shows it within about half a minute.' });
    void reload();
  };

  const saveButton = <Button variant="contained" onClick={() => void save()} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>;

  return <Box>
    <PageTitle title="Club settings" hint="Opening hours, contact details and the booking rules the website follows." action={saveButton} />
    <Stack spacing={2.5}>
      <Section title="Message at the top of the website" hint="The blue strip above the menu on bigger screens.">
        <TextField fullWidth value={club.announcement} onChange={(e) => set({ announcement: e.target.value.slice(0, 140) })} placeholder="Free transfers twice daily · 8:00 am & 1:30 pm" />
      </Section>

      <Section title="Opening hours" hint="Shown on the website. On a closed day, nothing can be booked online.">
        <Stack spacing={1}>
          {club.hours.map((day, i) => <Box key={WEEKDAYS[i]} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', sm: '140px auto 1fr 1fr' }, gap: 1.25, alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700 }}>{WEEKDAYS[i]}</Typography>
            <FormControlLabel control={<Switch checked={!day.closed} onChange={(e) => setDay(i, { closed: !e.target.checked })} />} label={day.closed ? 'Closed' : 'Open'} sx={{ mr: 0 }} />
            {!day.closed && <>
              <TextField label="Opens" type="time" size="small" value={day.open} onChange={(e) => setDay(i, { open: e.target.value || day.open })} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="Closes" type="time" size="small" value={day.close} onChange={(e) => setDay(i, { close: e.target.value || day.close })} slotProps={{ inputLabel: { shrink: true } }} />
            </>}
          </Box>)}
        </Stack>
        <TextField fullWidth label="Note (optional)" value={club.hoursNote} onChange={(e) => set({ hoursNote: e.target.value.slice(0, 140) })} placeholder="e.g. Last tee time 3:30 pm" sx={{ mt: 2 }} />
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 1.5 }}>On the website: {openingHoursLines(club).join(' · ')}</Typography>
      </Section>

      <Section title="Contact details" hint="Used across the website, the booking pages and the emails.">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
          <TextField label="Phone / WhatsApp" value={club.contact.phone} onChange={(e) => setContact({ phone: e.target.value.slice(0, 30) })} helperText="With the country code, e.g. +66 91 998 8891" />
          <TextField label="Email" type="email" value={club.contact.email} onChange={(e) => setContact({ email: e.target.value.slice(0, 120) })} helperText="Booking emails go here too" />
          <TextField label="Line ID" value={club.contact.lineId} onChange={(e) => setContact({ lineId: e.target.value.slice(0, 40) })} placeholder="@hulahulagolfclub" />
          <TextField label="Where we are" value={club.contact.area} onChange={(e) => setContact({ area: e.target.value.slice(0, 120) })} placeholder="near Krabi International Airport, Krabi, Thailand" />
          <TextField label="Facebook link" value={club.contact.facebook} onChange={(e) => setContact({ facebook: e.target.value.slice(0, 200) })} />
          <TextField label="Instagram link" value={club.contact.instagram} onChange={(e) => setContact({ instagram: e.target.value.slice(0, 200) })} />
          <TextField label="Google Maps link" value={club.contact.mapsUrl} onChange={(e) => setContact({ mapsUrl: e.target.value.slice(0, 300) })} sx={{ gridColumn: { sm: '1 / -1' } }} />
        </Box>
      </Section>

      <Section title="Free shuttle" hint="Guests can ask for the pick-up that suits their start time.">
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} alignItems="center">
          {club.transfer.pickups.map((t) => <Chip key={t} label={timeLabel(t)} onDelete={() => set({ transfer: { ...club.transfer, pickups: club.transfer.pickups.filter((p) => p !== t) } })} sx={{ fontWeight: 700 }} />)}
          {club.transfer.pickups.length === 0 && <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>No pick-ups — the shuttle isn’t offered when booking.</Typography>}
        </Stack>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 1.75 }}>
          <TextField label="Add a pick-up" type="time" size="small" value={newPickup} onChange={(e) => setNewPickup(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <Button startIcon={<AddRounded />} disabled={!newPickup} onClick={() => { set({ transfer: { ...club.transfer, pickups: [...new Set([...club.transfer.pickups, newPickup])].sort() } }); setNewPickup(''); }}>Add</Button>
        </Stack>
        <TextField label="Minutes from pick-up to the club" type="number" value={club.transfer.leadMinutes} onChange={(e) => set({ transfer: { ...club.transfer, leadMinutes: Math.max(0, toInt(e.target.value)) } })}
          helperText="A pick-up is offered for starts at least this long after it." slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }} sx={{ mt: 2, maxWidth: 360 }} />
      </Section>

      <Section title="Booking rules">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
          <TextField label="Book up to (days ahead)" type="number" value={club.booking.windowDays} onChange={(e) => setBooking({ windowDays: Math.max(1, toInt(e.target.value, 60)) })} slotProps={{ htmlInput: { min: 1, inputMode: 'numeric' } }} />
          <TextField label="Online booking closes (minutes before a start)" type="number" value={club.booking.minLeadMinutes} onChange={(e) => setBooking({ minLeadMinutes: Math.max(0, toInt(e.target.value)) })} slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }} />
          <TextField label="Hold a picked time for (minutes)" type="number" value={club.booking.holdMinutes} onChange={(e) => setBooking({ holdMinutes: Math.max(3, toInt(e.target.value, 10)) })} slotProps={{ htmlInput: { min: 3, inputMode: 'numeric' } }} />
          <TextField label="Free cancellation up to (hours before)" type="number" value={club.booking.cancellationHours} onChange={(e) => setBooking({ cancellationHours: Math.max(0, toInt(e.target.value)) })} slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }} />
          <TextField label="Customary caddie tip ฿" type="number" value={club.booking.caddieTip} onChange={(e) => setBooking({ caddieTip: Math.max(0, toInt(e.target.value)) })} slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }} />
        </Box>
      </Section>

      {status && <Alert severity={status.ok ? 'success' : 'error'}>{status.text}</Alert>}
      <Stack direction="row" justifyContent="flex-end">{saveButton}</Stack>
    </Stack>
  </Box>;
}
