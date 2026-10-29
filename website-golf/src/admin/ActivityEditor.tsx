import AddRounded from '@mui/icons-material/AddRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState, type ReactNode } from 'react';
import { ActivityIcon } from '../booking/activityIcons';
import { ICONS, normaliseActivity, slugify, type Activity } from '../booking/config';
import { ImagePicker } from './ImagePicker';
import { linesToList, listToLines, toInt } from './ui';

// Everything about one activity, in the order staff think about it: what it
// is, what it costs, when it runs and for how many, what's included, and its
// card on the homepage. `isNew` lets the name set the activity's link name.
export function ActivityEditor({ initial, isNew, takenIds, onClose, onSave }: {
  initial: Activity; isNew: boolean; takenIds: string[]; onClose: () => void; onSave: (activity: Activity) => Promise<string | null>;
}) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const [a, setA] = useState<Activity>(initial);
  const [includes, setIncludes] = useState(listToLines(initial.includes));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (change: Partial<Activity>) => setA((x) => ({ ...x, ...change }));
  const setOption = (i: number, change: Partial<Activity['options'][number]>) => set({ options: a.options.map((o, j) => (j === i ? { ...o, ...change } : o)) });
  const id = isNew ? slugify(a.name) : a.id;

  const save = async () => {
    setError(null);
    if (!a.name.trim()) return setError('Give the activity a name.');
    if (isNew && (!id || takenIds.includes(id))) return setError('That name is already used by another activity — try a different one.');
    if (a.options.some((o) => !o.label.trim())) return setError('Every option needs a name, like “9 holes” or “1 hour”.');
    if (a.options.some((o) => o.lastStart < a.firstStart)) return setError('An option’s last start can’t be before the first start of the day.');
    setBusy(true);
    const cleaned = normaliseActivity({ ...a, includes: linesToList(includes) } as unknown as Record<string, unknown>, id);
    const failure = await onSave(cleaned);
    setBusy(false);
    if (failure) setError(failure);
  };

  return <Dialog open onClose={busy ? undefined : onClose} fullScreen={phone} fullWidth maxWidth="md" scroll="paper">
    <DialogTitle>{isNew ? 'New activity' : `Edit ${initial.name}`}</DialogTitle>
    <DialogContent dividers>
      <Stack spacing={3}>
        <Group title="What it is">
          <TextField label="Name" required value={a.name} onChange={(e) => set({ name: e.target.value.slice(0, 60) })} helperText={isNew ? (id ? `Its link will be /book?activity=${id}` : ' ') : `Link name: ${a.id} (stays the same)`} />
          <TextField label="Short description" value={a.tagline} onChange={(e) => set({ tagline: e.target.value.slice(0, 120) })} placeholder="e.g. 9-hole, par 36 course" />
          <Box>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: .75 }}>Icon</Typography>
            <ToggleButtonGroup exclusive value={a.icon} onChange={(_, v) => { if (v) set({ icon: v }); }} sx={{ flexWrap: 'wrap' }}>
              {ICONS.map((icon) => <ToggleButton key={icon} value={icon} aria-label={icon} sx={{ width: 52, height: 48 }}><ActivityIcon icon={icon} /></ToggleButton>)}
            </ToggleButtonGroup>
          </Box>
        </Group>

        <Group title="Prices & options" hint="Each option is a way to book it — 9 or 18 holes, 1 or 2 hours… Prices are per person, in baht.">
          <TextField label="The options are called" value={a.optionsLabel} onChange={(e) => set({ optionsLabel: e.target.value.slice(0, 20) })} placeholder="Holes, How long…" sx={{ maxWidth: 280 }} />
          {a.options.map((o, i) => <Box key={i} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1.4fr 1fr 1fr 1fr auto' }, gap: 1.25, alignItems: 'center', p: 1.5, borderRadius: '14px', bgcolor: 'rgba(23,60,44,.03)' }}>
            <TextField label="Option" value={o.label} onChange={(e) => setOption(i, { label: e.target.value.slice(0, 40) })} sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }} />
            <TextField label="Price ฿" type="number" value={o.price} onChange={(e) => setOption(i, { price: Math.max(0, toInt(e.target.value)) })} slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }} />
            <TextField label="Takes (min)" type="number" value={o.minutes} onChange={(e) => setOption(i, { minutes: Math.max(10, toInt(e.target.value, 60)) })} slotProps={{ htmlInput: { min: 10, step: 5, inputMode: 'numeric' } }} />
            <TextField label="Last start" type="time" value={o.lastStart} onChange={(e) => setOption(i, { lastStart: e.target.value || o.lastStart })} slotProps={{ inputLabel: { shrink: true } }} />
            <IconButton aria-label={`Remove ${o.label || 'option'}`} disabled={a.options.length === 1} onClick={() => set({ options: a.options.filter((_, j) => j !== i) })}><DeleteOutlineRounded /></IconButton>
          </Box>)}
          <Button startIcon={<AddRounded />} onClick={() => set({ options: [...a.options, { id: `o${Date.now().toString(36)}`, label: '', price: a.options[0]?.price ?? 0, minutes: 60, lastStart: a.options[0]?.lastStart ?? '16:00' }] })} sx={{ alignSelf: 'flex-start' }}>Add an option</Button>
          <TextField label="Price for one person on their own (optional)" type="number" value={a.soloPrice ?? ''} onChange={(e) => set({ soloPrice: e.target.value ? Math.max(0, toInt(e.target.value)) : undefined })}
            helperText="Leave empty unless one person pays a different price (like a private lesson)." slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }} sx={{ maxWidth: 420 }} />
        </Group>

        <Group title="When it runs & group size">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
            <TextField label="First start" type="time" value={a.firstStart} onChange={(e) => set({ firstStart: e.target.value || a.firstStart })} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Minutes between starts" type="number" value={a.interval} onChange={(e) => set({ interval: Math.max(5, toInt(e.target.value, 30)) })} slotProps={{ htmlInput: { min: 5, inputMode: 'numeric' } }} />
            <TextField label="People per start" type="number" value={a.capacity} onChange={(e) => set({ capacity: Math.max(1, toInt(e.target.value, 4)) })} helperText="A flight, a bay…" slotProps={{ htmlInput: { min: 1, inputMode: 'numeric' } }} />
            <TextField label="Side by side" type="number" value={a.units} onChange={(e) => set({ units: Math.max(1, toInt(e.target.value, 1)) })} helperText="e.g. 6 range bays" slotProps={{ htmlInput: { min: 1, inputMode: 'numeric' } }} />
            <TextField label="Fewest per booking" type="number" value={a.minPlayers} onChange={(e) => set({ minPlayers: Math.max(1, toInt(e.target.value, 1)) })} slotProps={{ htmlInput: { min: 1, inputMode: 'numeric' } }} />
            <TextField label="Most per booking" type="number" value={a.maxPlayers} onChange={(e) => set({ maxPlayers: Math.max(1, toInt(e.target.value, 4)) })} slotProps={{ htmlInput: { min: 1, inputMode: 'numeric' } }} />
            <TextField label="One start is a…" value={a.slotNoun} onChange={(e) => set({ slotNoun: e.target.value.slice(0, 20) })} placeholder="tee time, bay, session" />
            <TextField select label="People are" value={a.peopleNoun} onChange={(e) => set({ peopleNoun: e.target.value as Activity['peopleNoun'] })}>
              <MenuItem value="player">players</MenuItem><MenuItem value="person">people</MenuItem>
            </TextField>
          </Box>
          <Toggle checked={a.privateGroup} onChange={(v) => set({ privateGroup: v })} label="One group per start" hint="Each start goes to one booking, however small (lessons)." />
        </Group>

        <Group title="What's included & good to know">
          <TextField label="Included (one per line)" multiline minRows={3} value={includes} onChange={(e) => setIncludes(e.target.value)} placeholder={'Green fee\nCaddie\nGolf cart'} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 1.5 }}>
            <TextField label="What to wear" value={a.wear} onChange={(e) => set({ wear: e.target.value.slice(0, 200) })} />
            <TextField label="Badge on the price card" value={a.durationBadge} onChange={(e) => set({ durationBadge: e.target.value.slice(0, 10) })} placeholder="1–3 hr" helperText="Optional, very short" />
          </Box>
          <Stack>
            <Toggle checked={a.caddie} onChange={(v) => set({ caddie: v })} label="A caddie comes with it" hint="Shows the caddie-tip note when booking." />
            <Toggle checked={a.rentals} onChange={(v) => set({ rentals: v })} label="Rental clubs can be added" />
            <Toggle checked={a.noSkillNeeded} onChange={(v) => set({ noSkillNeeded: v })} label="“No golf skill needed” badge" />
            <Toggle checked={a.askHandicap} onChange={(v) => set({ askHandicap: v })} label="Ask for a handicap" />
            <Toggle checked={a.askExperience} onChange={(v) => set({ askExperience: v })} label="Ask how much golf they’ve played" />
          </Stack>
        </Group>

        <Group title="Card on the homepage" hint="The “ways to play” card. Without a photo, the activity only shows in the prices and booking.">
          <TextField label="Small heading" value={a.card.kicker} onChange={(e) => set({ card: { ...a.card, kicker: e.target.value.slice(0, 60) } })} placeholder="FootGolf · 9 or 18 holes" />
          <TextField label="Title" value={a.card.title} onChange={(e) => set({ card: { ...a.card, title: e.target.value.slice(0, 80) } })} placeholder="Golf rules. Football feet." />
          <TextField label="Text" multiline minRows={2} value={a.card.detail} onChange={(e) => set({ card: { ...a.card, detail: e.target.value.slice(0, 300) } })} />
          <ImagePicker value={a.card.images} onChange={(images) => set({ card: { ...a.card, images } })} max={4} label="Photos" />
        </Group>
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 1.5 }}>
      <Button onClick={onClose} disabled={busy}>Cancel</Button>
      <Button variant="contained" onClick={() => void save()} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
    </DialogActions>
  </Dialog>;
}

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return <Stack spacing={1.75}>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{title}</Typography>
      {hint && <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{hint}</Typography>}
    </Box>
    {children}
  </Stack>;
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (value: boolean) => void; label: string; hint?: string }) {
  return <FormControlLabel control={<Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />}
    label={<Box><Typography sx={{ fontSize: 14.5 }}>{label}</Typography>{hint && <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{hint}</Typography>}</Box>} sx={{ alignItems: 'flex-start', '& .MuiSwitch-root': { mt: -.5 } }} />;
}
