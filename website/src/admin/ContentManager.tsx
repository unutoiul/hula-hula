import AddRounded from '@mui/icons-material/AddRounded';
import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { CarouselCard } from '../components/common/CarouselCard';
import { photoByUrl } from '../data/photos';
import type { CarouselCardData } from '../types';
import { ImageField } from './ImageField';
import { supabase } from './supabase';

// One editor for every CMS table: a list (show/hide, move up/down, edit,
// delete) and a form with a live preview using the site's real card. What
// each table has is described by a ContentConfig (see contentConfigs.ts).

export type Row = Record<string, unknown> & { id?: string; sort_order?: number };

export type Field =
  | { key: string; label: string; kind: 'text' | 'multiline' | 'date' | 'code'; max?: number; required?: boolean; helper?: string; showIf?: (row: Row) => boolean }
  | { key: string; label: string; kind: 'select'; options: { value: string; label: string }[]; helper?: string; showIf?: (row: Row) => boolean }
  | { key: string; label: string; kind: 'images' | 'image'; helper?: string; showIf?: (row: Row) => boolean };

export interface ContentConfig {
  table: 'activities' | 'events' | 'offers';
  noun: string;
  intro: string;
  /** The column that puts an item on the website. */
  liveKey: 'published' | 'active';
  fields: Field[];
  blank: () => Row;
  subtitle: (row: Row) => string;
  preview: (row: Row) => CarouselCardData & { ctaLabel?: string };
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

  const move = (index: number, by: -1 | 1) => {
    if (!rows) return;
    const a = rows[index], b = rows[index + by];
    if (!a || !b) return;
    // Renumber in steps of 10 so a swap never needs more than two writes.
    const ordered = [...rows];
    [ordered[index], ordered[index + by]] = [b, a];
    void run(Promise.all(ordered.map((row, i) => (row.sort_order === (i + 1) * 10 ? null : supabase!.from(config.table).update({ sort_order: (i + 1) * 10 }).eq('id', row.id!))).filter(Boolean))
      .then((results) => ({ error: results.find((r) => r?.error)?.error ?? null })));
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
        {rows.map((row, index) => {
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
            <Stack direction="row" sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <IconButton aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUpwardRounded fontSize="small" /></IconButton>
              <IconButton aria-label="Move down" disabled={index === rows.length - 1} onClick={() => move(index, 1)}><ArrowDownwardRounded fontSize="small" /></IconButton>
            </Stack>
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

function PreviewCard({ card }: { card: CarouselCardData & { ctaLabel?: string } }) {
  return <CarouselCard {...card} images={card.images.length ? card.images : ['/images/hula-hula/poolOverview-1600.webp']} active onClick={() => {}} onCta={() => {}} />;
}
