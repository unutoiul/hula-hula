import AddRounded from '@mui/icons-material/AddRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import { Alert, Autocomplete, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, InputAdornment, MenuItem, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { CarouselCard } from '../components/common/CarouselCard';
import type { Highlight } from '../components/sections/cmsCards';
import { HighlightCard } from '../components/sections/HighlightsSection';
import { photoByUrl } from '../data/photos';
import type { CarouselCardData } from '../types';
import { ImageField } from './ImageField';
import { supabase } from './supabase';

// One editor for every CMS table: a list (show/hide, edit, delete; new items
// go last) and a form with a live preview using the site's real card. What
// each table has is described by a ContentConfig (see contentConfigs.ts).

export type Row = Record<string, unknown> & { id?: string; sort_order?: number };

export type Field =
  | { key: string; label: string; kind: 'text' | 'multiline' | 'date' | 'code'; max?: number; required?: boolean; helper?: string; showIf?: (row: Row) => boolean }
  | { key: string; label: string; kind: 'select'; options: { value: string; label: string }[]; helper?: string; showIf?: (row: Row) => boolean }
  | { key: string; label: string; kind: 'images' | 'image'; helper?: string; showIf?: (row: Row) => boolean }
  | { key: string; label: string; kind: 'number'; min: number; max: number; unit?: string; helper?: string; showIf?: (row: Row) => boolean }
  | { key: string; label: string; kind: 'tags'; suggestions: string[]; helper?: string; showIf?: (row: Row) => boolean }
  | { key: string; label: string; kind: 'roomTypes' | 'switch'; helper?: string; showIf?: (row: Row) => boolean }
  /** A heading between groups of fields; `key` is only for React. */
  | { key: string; label: string; kind: 'section'; helper?: string; showIf?: (row: Row) => boolean };

export interface ContentConfig {
  table: 'activities' | 'events' | 'offers';
  noun: string;
  intro: string;
  /** The column that puts an item on the website. */
  liveKey: 'published' | 'active';
  fields: Field[];
  blank: () => Row;
  subtitle: (row: Row) => string;
  /** The live preview: an activity's card, or the offer/event card the homepage shows. */
  preview: (row: Row) => (CarouselCardData & { ctaLabel?: string }) | Highlight;
  firstImage: (row: Row) => string | null;
}

const thumbOf = (src: string) => photoByUrl.get(src)?.srcSet.split(',')[0].trim().split(' ')[0] ?? src;

export function ContentManager({ config }: { config: ContentConfig }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase!.from(config.table).select('*').order('sort_order').order('created_at');
    if (loadError) setError(loadError.message); else { setRows(data as Row[]); setError(null); }
  }, [config.table]);
  useEffect(() => { setRows(null); void load(); }, [load]);

  const run = async (work: PromiseLike<{ error: { message: string } | null }>) => {
    const { error: workError } = await work;
    if (workError) setError(workError.message);
    await load();
  };

  const remove = (row: Row) => {
    if (!window.confirm(`Delete “${String(row.title)}”? This can’t be undone.`)) return;
    void run(supabase!.from(config.table).delete().eq('id', row.id!));
  };

  return <Box>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
      <Typography sx={{ color: 'text.secondary', maxWidth: 560 }}>{config.intro}</Typography>
      <Button variant="contained" startIcon={<AddRounded />} onClick={() => setEditing({ ...config.blank(), sort_order: ((rows?.at(-1)?.sort_order as number | undefined) ?? 0) + 10 })}>Add {config.noun}</Button>
    </Stack>
    {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
    {!rows ? <CircularProgress /> : rows.length === 0
      ? <Typography sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>Nothing here yet — add the first {config.noun}.</Typography>
      : <Stack spacing={1.5}>
        {rows.map((row) => {
          const image = config.firstImage(row);
          const live = Boolean(row[config.liveKey]);
          return <Stack key={row.id} direction="row" alignItems="center" spacing={2} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '18px', bgcolor: 'background.paper', opacity: live ? 1 : .7 }}>
            <Box sx={{ width: 72, height: 54, flexShrink: 0, borderRadius: '12px', overflow: 'hidden', bgcolor: 'divider' }}>
              {image && <Box component="img" src={thumbOf(image)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(row.title)}</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{config.subtitle(row)}</Typography>
            </Box>
            <Tooltip title={live ? 'On the website — switch off to hide' : 'Hidden — switch on to show on the website'}>
              <Switch checked={live} onChange={(e) => void run(supabase!.from(config.table).update({ [config.liveKey]: e.target.checked }).eq('id', row.id!))} slotProps={{ input: { 'aria-label': `Show “${String(row.title)}” on the website` } }} />
            </Tooltip>
            <IconButton aria-label={`Edit “${String(row.title)}”`} onClick={() => setEditing(row)}><EditRounded fontSize="small" /></IconButton>
            <IconButton aria-label={`Delete “${String(row.title)}”`} onClick={() => remove(row)}><DeleteOutlineRounded fontSize="small" /></IconButton>
          </Stack>;
        })}
      </Stack>}
    {editing && <EditDialog config={config} initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />}
  </Box>;
}

function EditDialog({ config, initial, onClose, onSaved }: { config: ContentConfig; initial: Row; onClose: () => void; onSaved: () => void }) {
  const [row, setRow] = useState<Row>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: string, value: unknown) => setRow((current) => ({ ...current, [key]: value }));
  const missing = config.fields.filter((f) => 'required' in f && f.required && !String(row[f.key] ?? '').trim());

  const save = async () => {
    setSaving(true); setError(null);
    // Empty optional text becomes null, so "no promo code" is really none.
    const payload: Row = { ...row };
    for (const field of config.fields) if (typeof payload[field.key] === 'string' && !(payload[field.key] as string).trim() && field.kind !== 'multiline') payload[field.key] = null;
    delete payload.created_at; delete payload.updated_at;
    const query = row.id ? supabase!.from(config.table).update(payload).eq('id', row.id) : supabase!.from(config.table).insert(payload);
    const { error: saveError } = await query;
    setSaving(false);
    if (saveError) setError(saveError.message); else onSaved();
  };

  return <Dialog open onClose={onClose} maxWidth="md" fullWidth scroll="paper">
    <DialogTitle>{row.id ? `Edit ${config.noun}` : `New ${config.noun}`}</DialogTitle>
    <DialogContent dividers>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 300px' }, gap: 3 }}>
        <Stack spacing={2.5}>
          {config.fields.filter((field) => !field.showIf || field.showIf(row)).map((field) => {
            const value = row[field.key];
            switch (field.kind) {
              case 'section':
                return <Box key={field.key} sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="overline" sx={{ color: 'success.dark' }}>{field.label}</Typography>
                  {field.helper && <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{field.helper}</Typography>}
                </Box>;
              case 'number':
                return <TextField key={field.key} type="number" label={field.label} value={value ?? ''} helperText={field.helper}
                  onChange={(e) => set(field.key, e.target.value === '' ? null : Math.min(field.max, Math.max(field.min, Number(e.target.value))))}
                  slotProps={{ htmlInput: { min: field.min, max: field.max, step: 1 }, input: field.unit ? { endAdornment: <InputAdornment position="end">{field.unit}</InputAdornment> } : undefined }} sx={{ maxWidth: 260 }} />;
              case 'tags':
                return <Autocomplete key={field.key} multiple freeSolo options={field.suggestions} value={(value as string[] | undefined) ?? []}
                  onChange={(_, next) => set(field.key, [...new Set(next.map((t) => t.trim()).filter(Boolean))].slice(0, 8))}
                  renderValue={(tags, getItemProps) => tags.map((tag, index) => <Chip {...getItemProps({ index })} key={tag} label={tag} size="small" />)}
                  renderInput={(params) => <TextField {...params} label={field.label} helperText={field.helper} placeholder="Pick or type, then Enter" />} />;
              case 'roomTypes':
                return <RoomTypesField key={field.key} label={field.label} helper={field.helper} value={(value as string[] | undefined) ?? []} onChange={(next) => set(field.key, next)} />;
              case 'switch':
                return <Box key={field.key}>
                  <FormControlLabel control={<Switch checked={Boolean(value)} onChange={(e) => set(field.key, e.target.checked)} />} label={field.label} />
                  {field.helper && <Typography sx={{ fontSize: 12, color: 'text.secondary', ml: 6.5, mt: -.5 }}>{field.helper}</Typography>}
                </Box>;
              case 'images':
              case 'image':
                return <ImageField key={field.key} label={field.label} multiple={field.kind === 'images'} folder={config.table}
                  value={field.kind === 'images' ? (value as string[] | undefined) ?? [] : value ? [value as string] : []}
                  onChange={(next) => set(field.key, field.kind === 'images' ? next : next[0] ?? null)} />;
              case 'select':
                return <TextField key={field.key} select label={field.label} value={(value as string) ?? ''} onChange={(e) => set(field.key, e.target.value)} helperText={field.helper}>
                  {field.options.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                </TextField>;
              case 'date':
                return <TextField key={field.key} type="date" label={field.label} value={(value as string) ?? ''} onChange={(e) => set(field.key, e.target.value || null)} helperText={field.helper} slotProps={{ inputLabel: { shrink: true } }} />;
              default:
                return <TextField key={field.key} label={field.label} required={field.required} multiline={field.kind === 'multiline'} minRows={field.kind === 'multiline' ? 3 : undefined}
                  value={(value as string) ?? ''} helperText={field.helper ?? (field.max ? `${String(value ?? '').length}/${field.max}` : undefined)}
                  onChange={(e) => set(field.key, field.kind === 'code' ? e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 40) : e.target.value.slice(0, field.max ?? 600))} />;
            }
          })}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch checked={Boolean(row[config.liveKey])} onChange={(e) => set(config.liveKey, e.target.checked)} />
            <Typography>{row[config.liveKey] ? 'Shown on the website' : 'Hidden (draft)'}</Typography>
          </Stack>
        </Stack>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>Preview</Typography>
          <Box sx={{ position: 'sticky', top: 0 }}><PreviewCard card={config.preview(row)} /></Box>
        </Box>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" disabled={saving || missing.length > 0} onClick={() => void save()}>{saving ? 'Saving…' : 'Save'}</Button>
    </DialogActions>
  </Dialog>;
}

// The rooms an offer covers, named as on the booking page (from SiteMinder).
// "All rooms" is on by default and stored as an empty list, so a room type
// added in SiteMinder later is covered too. Switching it off starts with every
// room ticked, to take out the ones the offer shouldn't cover.
let roomTypesRequest: Promise<{ uuid: string; name: string }[]> | null = null;
function RoomTypesField({ label, helper, value, onChange }: { label: string; helper?: string; value: string[]; onChange: (next: string[]) => void }) {
  const [options, setOptions] = useState<{ uuid: string; name: string }[]>([]);
  useEffect(() => {
    roomTypesRequest ??= fetch('/api/booking/room-types').then((r) => (r.ok ? r.json() : [])).catch(() => []);
    void roomTypesRequest.then(setOptions);
  }, []);
  const allRooms = value.length === 0;
  const selected = value.map((uuid) => options.find((o) => o.uuid === uuid) ?? { uuid, name: uuid });
  return <Box>
    <FormControlLabel label={`All rooms${options.length ? ` (${options.length})` : ''}`} control={<Switch checked={allRooms} disabled={!options.length}
      onChange={(e) => onChange(e.target.checked ? [] : options.map((o) => o.uuid))} />} />
    {allRooms
      ? <Typography sx={{ fontSize: 12, color: 'text.secondary', ml: 6.5, mt: -.5 }}>The offer covers every room — including any added later in SiteMinder. Switch off to choose rooms.</Typography>
      : <Autocomplete multiple options={options} value={selected} getOptionLabel={(o) => o.name} isOptionEqualToValue={(a, b) => a.uuid === b.uuid} sx={{ mt: 1 }}
        // Taking out the last room means "no limit" again, not "no rooms".
        onChange={(_, next) => onChange(next.map((o) => o.uuid))}
        renderValue={(items, getItemProps) => items.map((o, index) => <Chip {...getItemProps({ index })} key={o.uuid} label={o.name} size="small" />)}
        renderInput={(params) => <TextField {...params} label={label} helperText={helper ?? 'Remove the rooms this offer shouldn’t cover'} />} />}
  </Box>;
}

function PreviewCard({ card }: { card: (CarouselCardData & { ctaLabel?: string }) | Highlight }) {
  if ('kind' in card) return <HighlightCard item={{ ...card, onCta: () => {}, ctaHref: undefined }} />;
  return <CarouselCard {...card} images={card.images.length ? card.images : ['/images/hula-hula/poolOverview-1600.webp']} active onClick={() => {}} onCta={() => {}} />;
}
