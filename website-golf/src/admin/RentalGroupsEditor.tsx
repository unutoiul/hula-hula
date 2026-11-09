import AddRounded from '@mui/icons-material/AddRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import { Box, Button, Chip, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { groupRentals, RENTAL_ICONS, type Rental, type RentalGroup } from '../booking/config';
import { RentalVisual } from '../components/activities/RentalCard';
import { ImagePicker } from './ImagePicker';
import { toInt } from './ui';

// Rentals as staff manage them: groups like Premium and Normal, each with its
// own sets and its own list of sports that offer it. Nothing is saved until
// the page's Save button, so a mistake here can be undone by reloading.
export function RentalGroupsEditor({ rentals, sports, sportId = 'all', onChange }: { rentals: Rental[]; sports: { id: string; name: string }[]; sportId?: string; onChange: (rentals: Rental[]) => void }) {
  const visible = sportId === 'all' ? rentals : rentals.filter(rental => rental.activities?.includes(sportId));
  const groups = groupRentals(visible);
  const updateGroup = (group: RentalGroup, change: Partial<Rental>) => onChange(rentals.map((r) => (group.rentals.includes(r) ? { ...r, ...change } : r)));
  const updateSet = (set: Rental, change: Partial<Rental>) => onChange(rentals.map((r) => (r === set ? { ...r, ...change } : r)));
  const removeSet = (set: Rental) => onChange(rentals.filter((r) => r !== set));
  const addSet = (group: RentalGroup) => onChange([...rentals, { id: '', label: '', price: 0, group: group.name, unit: 'item', icon: 'equipment', maxPerPlayer: 1, quantityGroup: '', activities: sportId === 'all' ? group.rentals[0].activities ?? [] : [sportId] }]);
  const addGroup = () => {
    let name = 'New group';
    for (let n = 2; rentals.some(rental => rental.group?.trim().toLowerCase() === name.toLowerCase()); n++) name = `New group ${n}`;
    onChange([...rentals, { id: '', label: '', price: 0, group: name, unit: 'item', icon: 'equipment', maxPerPlayer: 1, quantityGroup: '', activities: sportId === 'all' ? [] : [sportId] }]);
  };

  return <Stack spacing={1.5}>
    {/* Keyed by position: a group's name changes as it's typed. */}
    {groups.map((group, g) => {
      return <Box key={g} component="fieldset" aria-label={`Rental group ${group.name}`} sx={{ m: 0, minWidth: 0, p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: '20px' }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField fullWidth label="Group name" placeholder="Premium" value={group.name} onChange={(e) => updateGroup(group, { group: e.target.value.slice(0, 40) })}
            helperText={group.name.trim() ? undefined : 'Give it a name, or these show with no heading.'} />
          <IconButton aria-label={`Delete the group ${group.name}`} onClick={() => onChange(rentals.filter((r) => !group.rentals.includes(r)))} sx={{ mt: .5 }}><DeleteOutlineRounded /></IconButton>
        </Stack>

        <Stack spacing={1.25} sx={{ mt: 2 }}>
          {group.rentals.map((set, s) => <Box key={s} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '16px', bgcolor: 'background.default' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: '64px minmax(0,1fr)' }, gap: 1.5, alignItems: 'start' }}>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}><RentalVisual rental={set} height={64} /></Box>
              <Stack spacing={1.25} sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField size="small" label="Equipment name" placeholder="Set A, racket, ball basket…" value={set.label} onChange={(e) => updateSet(set, { label: e.target.value.slice(0, 60) })} sx={{ flex: 2, minWidth: 0 }} />
                  <TextField size="small" label="Price ฿" type="number" value={set.price} onChange={(e) => updateSet(set, { price: Math.max(0, toInt(e.target.value)) })} slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }} sx={{ flex: 1, minWidth: 84 }} />
                  <IconButton aria-label={`Remove ${set.label || 'this set'}`} onClick={() => removeSet(set)}><DeleteOutlineRounded /></IconButton>
                </Stack>
                <TextField size="small" fullWidth label="Short description" value={set.description ?? ''} onChange={(e) => updateSet(set, { description: e.target.value.slice(0, 240) })} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0,1fr))' }, gap: 1.25 }}>
                  <TextField size="small" label="Price is per…" placeholder="item, set, racket, basket" value={set.unit ?? 'set'} onChange={e => updateSet(set, { unit: e.target.value.slice(0, 20) })} />
                  <TextField select size="small" label="Fallback icon" value={set.icon ?? 'equipment'} onChange={e => updateSet(set, { icon: e.target.value as Rental['icon'] })}>
                    {RENTAL_ICONS.map(icon => <MenuItem key={icon} value={icon}>{({ equipment: 'Equipment', golf: 'Golf clubs', racket: 'Racket', ball: 'Ball', basket: 'Ball basket' })[icon]}</MenuItem>)}
                  </TextField>
                  <TextField size="small" type="number" label="Maximum per player" value={set.maxPerPlayer ?? 1} onChange={e => updateSet(set, { maxPerPlayer: Math.min(20, Math.max(1, toInt(e.target.value))) })} slotProps={{ htmlInput: { min: 1, max: 20, inputMode: 'numeric' } }} />
                  <TextField size="small" label="Shared allowance (optional)" placeholder="e.g. Club sets" value={set.quantityGroup ?? ''} onChange={e => updateSet(set, { quantityGroup: e.target.value.slice(0, 60) })} helperText="Matching names share the limit. Leave blank for independent quantities." />
                </Box>
                {groups.length > 1 && <TextField select size="small" fullWidth label="Group" value={group.name} onChange={(e) => {
                  const target = groups.find((candidate) => candidate.name === e.target.value);
                  if (target) updateSet(set, { group: target.name });
                }}>
                  {groups.map((option) => <MenuItem key={option.id} value={option.name}>{option.name.trim() || 'No group'}</MenuItem>)}
                </TextField>}
              </Stack>
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mt: 1.75, mb: .75 }}>Available for these sports</Typography>
            <Stack direction="row" flexWrap="wrap" useFlexGap gap={.75}>
              {sports.map(sport => {
                const assigned = set.activities ?? [];
                const on = assigned.includes(sport.id);
                return <Chip key={sport.id} clickable label={sport.name} color={on ? 'primary' : 'default'} variant={on ? 'filled' : 'outlined'} aria-pressed={on}
                  onClick={() => updateSet(set, { activities: on ? assigned.filter(id => id !== sport.id) : [...assigned, sport.id] })} sx={{ fontWeight: 700 }} />;
              })}
            </Stack>
            {!set.activities?.length && <Typography sx={{ fontSize: 12.5, color: 'warning.dark', mt: .75 }}>Choose a sport to show this equipment in its booking.</Typography>}
            <Box sx={{ mt: 1.5 }}><ImagePicker label="Illustration or photo (saved with this equipment)" value={set.image ? [set.image] : []} onChange={(images) => updateSet(set, { image: images[0] ?? '' })} /></Box>
          </Box>)}
        </Stack>
        <Button startIcon={<AddRounded />} onClick={() => addSet(group)} sx={{ mt: 1 }}>Add equipment{group.name.trim() ? ` to ${group.name.trim()}` : ''}</Button>
      </Box>;
    })}
    {groups.length === 0 && <Typography sx={{ color: 'text.secondary', py: 2 }}>No equipment added{sportId === 'all' ? '' : ' for this sport'} yet. Add a group, then its rental items.</Typography>}
    <Box><Button variant="outlined" startIcon={<AddRounded />} onClick={addGroup}>Add equipment group</Button></Box>
  </Stack>;
}
