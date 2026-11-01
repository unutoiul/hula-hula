import AddRounded from '@mui/icons-material/AddRounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import { Alert, Box, Button, Chip, CircularProgress, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { normaliseClub, type ClubOffer } from '../booking/config';
import { offerStatus, offerValidation } from '../booking/offers';
import { notifyContentChanged } from '../data/contentSync';
import { supabase } from './supabase';
import { PageTitle, Section } from './ui';
import { ImagePicker } from './ImagePicker';

// /admin/offers — the promotions on Home, Events & offers and All offers.
// They're kept in the club settings row alongside opening hours and the rest,
// so a save reads the latest settings first and swaps in only the offers.
export function OffersPage() {
  const [offers, setOffers] = useState<ClubOffer[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    void supabase!.from('golf_settings').select('value').eq('key', 'club').maybeSingle().then(({ data, error }) => {
      if (error) { setStatus({ ok: false, text: error.message }); return; }
      setOffers(normaliseClub(data?.value).offers);
    });
  }, []);

  if (!offers) return status ? <Alert severity="error">Could not load offers: {status.text}. Refresh to try again; nothing has been changed.</Alert> : <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;
  const set = (next: ClubOffer[]) => { setStatus(null); setOffers(next); };

  const save = async () => {
    const invalidOffer = offers.map(offerValidation).find(Boolean);
    if (invalidOffer) { setStatus({ ok: false, text: invalidOffer }); return; }
    setBusy(true);
    const latest = await supabase!.from('golf_settings').select('value').eq('key', 'club').maybeSingle();
    if (latest.error) { setBusy(false); setStatus({ ok: false, text: latest.error.message }); return; }
    const cleaned = normaliseClub({ ...normaliseClub(latest.data?.value), offers });
    const { data, error } = await supabase!.from('golf_settings').upsert({ key: 'club', value: cleaned }).select('value').single();
    setBusy(false);
    if (error) { setStatus({ ok: false, text: error.message }); return; }
    setOffers(normaliseClub(data.value).offers);
    setStatus({ ok: true, text: 'Saved. Website tabs in this browser refresh now; other visitors see updates within 30 seconds. Offer dates use Thailand time.' });
    notifyContentChanged('site');
  };

  const saveButton = <Button variant="contained" onClick={() => void save()} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>;
  const labels = { live: 'Live now', hidden: 'Hidden', scheduled: 'Scheduled', expired: 'Expired', invalid: 'Needs attention' };

  return <Box>
    <PageTitle title="Offers" hint="Live offers appear on Home, Events & offers, and All offers. Dates are inclusive, in Thailand time. Each status shows how the offer will be once saved."
      action={<Stack direction="row" spacing={1}><Button href="/offers" target="_blank" rel="noopener" endIcon={<OpenInNewRounded />}>View offers</Button>{saveButton}</Stack>} />
    <Stack spacing={2.5}>
      <Alert severity="info">Offers are enquiry-based: guests contact the club through WhatsApp. An offer does not automatically discount a tee-time booking.</Alert>
      {offers.map((offer, index) => {
        const change = (patch: Partial<ClubOffer>) => set(offers.map((o, i) => i === index ? { ...o, ...patch } : o));
        const state = offerStatus(offer);
        return <Section key={offer.id} title={offer.title || 'Untitled offer'}
          action={<Chip size="small" label={labels[state]} color={state === 'live' ? 'success' : state === 'invalid' ? 'error' : state === 'scheduled' ? 'info' : 'default'} />}>
          <Stack spacing={2}>
            <FormControlLabel control={<Switch checked={offer.active} onChange={e => change({ active: e.target.checked })} />} label="Publish this offer" />
            <TextField label="Offer title" required value={offer.title} onChange={e => change({ title: e.target.value.slice(0, 100) })} />
            <TextField label="Price / headline" value={offer.priceLabel} onChange={e => change({ priceLabel: e.target.value.slice(0, 80) })} />
            <TextField label="Description and conditions" multiline minRows={3} value={offer.description} onChange={e => change({ description: e.target.value.slice(0, 600) })} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Starts (optional)" type="date" value={offer.startsOn} onChange={e => change({ startsOn: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="Ends (optional)" type="date" value={offer.endsOn} onChange={e => change({ endsOn: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            </Stack>
            {offerValidation(offer) && <Alert severity="warning">{offerValidation(offer)}</Alert>}
            <TextField label="Guest’s WhatsApp enquiry" value={offer.message} onChange={e => change({ message: e.target.value.slice(0, 600) })} />
            <ImagePicker label="Offer photo" value={offer.image ? [offer.image] : []} onChange={images => change({ image: images[0] ?? '' })} />
            <Button color="error" onClick={() => set(offers.filter((_, i) => i !== index))}>Remove offer</Button>
          </Stack>
        </Section>;
      })}
      {offers.length === 0 && <Box sx={{ textAlign: 'center', py: 5, px: 2, border: '1px dashed', borderColor: 'divider', borderRadius: '20px' }}>
        <Typography variant="h3" sx={{ fontSize: 22 }}>No offers</Typography>
        <Typography sx={{ color: 'text.secondary', mt: .75 }}>Add one when you are ready; the homepage hides this section while none are live.</Typography>
      </Box>}
      <Button disabled={offers.length >= 12} startIcon={<AddRounded />} onClick={() => set([...offers, { id: crypto.randomUUID(), title: 'New offer', description: '', priceLabel: '', image: '', active: false, startsOn: '', endsOn: '', message: '' }])}>Add an offer</Button>
      {status && <Alert severity={status.ok ? 'success' : 'error'}>{status.text}</Alert>}
      <Stack direction="row" justifyContent="flex-end">{saveButton}</Stack>
    </Stack>
  </Box>;
}
