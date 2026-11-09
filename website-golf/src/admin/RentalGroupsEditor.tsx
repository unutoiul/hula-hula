import AddRounded from '@mui/icons-material/AddRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { groupRentals, RENTAL_ICONS, type Rental, type RentalGroup } from '../booking/config';
import { money } from '../booking/pricing';
import { RentalVisual } from '../components/activities/RentalCard';
import { ImagePicker } from './ImagePicker';
import { toInt } from './ui';

// Equipment stays compact until staff open one item. All changes are drafts
// until the page's Save changes button is used.
export function RentalGroupsEditor({ rentals, sports, sportId = 'all', query = '', onChange }: { rentals: Rental[]; sports: { id: string; name: string }[]; sportId?: string; query?: string; onChange: (rentals: Rental[]) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const visible = rentals.filter(rental => rental.id === expanded || ((sportId === 'all' || rental.activities?.includes(sportId)) && (!rental.label || `${rental.label} ${rental.group ?? ''} ${rental.description ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()))));
  const groups = groupRentals(visible);
  const allGroups = groupRentals(rentals);
  const updateGroup = (group: RentalGroup, change: Partial<Rental>) => onChange(rentals.map(rental => group.rentals.includes(rental) ? { ...rental, ...change } : rental));
  const updateItem = (item: Rental, change: Partial<Rental>) => onChange(rentals.map(rental => rental === item ? { ...rental, ...change } : rental));
  const addItem = (group?: RentalGroup) => {
    let name = 'New group';
    for (let n = 2; rentals.some(rental => rental.group === name); n++) name = `New group ${n}`;
    const id = `r-${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
    onChange([...rentals, { id, label: '', price: 0, group: group?.name ?? name, unit: 'item', icon: 'equipment', maxPerPlayer: 1, quantityGroup: '', activities: sportId === 'all' ? group?.rentals[0].activities ?? [] : [sportId] }]);
    setExpanded(id);
  };

  return <Stack spacing={3}>
    {groups.map((group, g) => <Box key={g} component="section" aria-label={group.name || 'Equipment'} sx={{ minWidth: 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Typography component="h3" sx={{ fontWeight: 700, fontSize: 15, overflowWrap: 'anywhere' }}>{group.name || 'Equipment'}</Typography>
          <Chip size="small" label={group.rentals.length} sx={{ height: 22, fontSize: 11, bgcolor: 'success.light' }} />
        </Stack>
        <Box component="details" sx={{ position: 'relative', flexShrink: 0, '& > summary': { cursor: 'pointer', color: 'text.secondary', fontSize: 12, py: 1 } }}>
          <summary>Group settings</summary>
          <Box sx={{ position: 'absolute', zIndex: 2, right: 0, top: '100%', width: 260, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '16px', boxShadow: '0 10px 28px rgba(23,60,44,.12)' }}>
            <TextField fullWidth size="small" label="Group name" value={group.name} onChange={event => updateGroup(group, { group: event.target.value.slice(0, 40) })} />
            <Button color="error" size="small" startIcon={<DeleteOutlineRounded />} onClick={() => onChange(rentals.filter(rental => !group.rentals.includes(rental)))} sx={{ mt: 1 }}>Remove this group</Button>
          </Box>
        </Box>
      </Stack>
      <Stack spacing={1}>
        {group.rentals.map(item => {
          const id = item.id;
          const assignedSports = sports.filter(sport => item.activities?.includes(sport.id)).map(sport => sport.name).join(' · ');
          return <Accordion key={id} expanded={expanded === id} onChange={(_, open) => setExpanded(open ? id : null)} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: expanded === id ? 'primary.main' : 'divider', bgcolor: 'background.paper', borderRadius: '16px !important', '&::before': { display: 'none' }, overflow: 'hidden' }}>
            <AccordionSummary expandIcon={<ExpandMoreRounded />} aria-label={`Edit ${item.label || 'new equipment'}`} sx={{ px: { xs: 1.5, sm: 2 }, minHeight: 86, '& .MuiAccordionSummary-content': { minWidth: 0, my: 1.5, mr: 1.25 } }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '48px minmax(0,1fr) auto', alignItems: 'center', gap: { xs: 1.25, sm: 2 }, width: '100%' }}>
                <RentalVisual rental={item} height={48} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{item.label || 'New equipment'}</Typography>
                  <Typography noWrap title={assignedSports} sx={{ mt: .3, fontSize: 12, color: assignedSports ? 'text.secondary' : 'warning.dark' }}>{assignedSports || 'Choose a sport'}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right', pl: .5 }}>
                  <Typography sx={{ fontWeight: 700, color: item.price === 0 ? 'success.dark' : 'primary.main', fontSize: 14, whiteSpace: 'nowrap' }}>{item.price === 0 ? 'Free' : money(item.price)}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: .25 }}>{item.price === 0 ? 'Included' : `per ${item.unit || 'item'}`}</Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 1.5, sm: 2.5 }, pb: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'rgba(231,244,204,.14)' }}>
              <Stack spacing={2.25}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'minmax(0,2fr) minmax(0,1fr)' }, gap: 2 }}>
                  <TextField fullWidth size="small" label="Equipment name" placeholder="Set A, paddle & ball…" value={item.label} onChange={event => updateItem(item, { label: event.target.value.slice(0, 60) })} />
                  <TextField fullWidth size="small" label="Price ฿" type="number" value={item.price} onChange={event => updateItem(item, { price: Math.max(0, toInt(event.target.value)) })} helperText="0 = included for free" slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }} />
                  <TextField fullWidth size="small" label="Short description" value={item.description ?? ''} onChange={event => updateItem(item, { description: event.target.value.slice(0, 240) })} sx={{ gridColumn: '1 / -1' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>Available for</Typography>
                  <Stack direction="row" flexWrap="wrap" useFlexGap gap={.75}>
                    {sports.map(sport => {
                      const assigned = item.activities ?? [];
                      const on = assigned.includes(sport.id);
                      return <Chip key={sport.id} clickable size="small" label={sport.name} color={on ? 'primary' : 'default'} variant={on ? 'filled' : 'outlined'} aria-pressed={on} onClick={() => updateItem(item, { activities: on ? assigned.filter(sportId => sportId !== sport.id) : [...assigned, sport.id] })} sx={{ height: 32, fontSize: 12 }} />;
                    })}
                  </Stack>
                </Box>
                <ImagePicker fit="contain" label="Equipment icon or image" value={item.image ? [item.image] : []} onChange={images => updateItem(item, { image: images[0] ?? '' })} />
                <Box component="details" sx={{ '& > summary': { cursor: 'pointer', fontSize: 13, color: 'text.secondary', py: 1 } }}>
                  <summary>Quantity & display settings</summary>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))' }, gap: 2, pt: 1.5 }}>
                    <TextField size="small" label="Price is per…" placeholder="item, set, kit" value={item.unit ?? 'item'} onChange={event => updateItem(item, { unit: event.target.value.slice(0, 20) })} />
                    <TextField select size="small" label="Fallback icon" value={item.icon ?? 'equipment'} onChange={event => updateItem(item, { icon: event.target.value as Rental['icon'] })}>
                      {RENTAL_ICONS.map(icon => <MenuItem key={icon} value={icon}>{({ equipment: 'Equipment', golf: 'Golf clubs', racket: 'Racket', ball: 'Ball', basket: 'Ball basket' })[icon]}</MenuItem>)}
                    </TextField>
                    <TextField size="small" type="number" label="Maximum per player" value={item.maxPerPlayer ?? 1} onChange={event => updateItem(item, { maxPerPlayer: Math.min(20, Math.max(1, toInt(event.target.value))) })} slotProps={{ htmlInput: { min: 1, max: 20 } }} />
                    <TextField size="small" label="Shared allowance" value={item.quantityGroup ?? ''} onChange={event => updateItem(item, { quantityGroup: event.target.value.slice(0, 60) })} helperText="Same name = shared limit. Blank = separate allowance." />
                    {allGroups.length > 1 && <TextField select size="small" label="Display group" value={item.group ?? ''} onChange={event => updateItem(item, { group: event.target.value })}>
                      {allGroups.map(option => <MenuItem key={option.id} value={option.name}>{option.name || 'Equipment'}</MenuItem>)}
                    </TextField>}
                  </Box>
                </Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Button color="error" size="small" startIcon={<DeleteOutlineRounded />} onClick={() => onChange(rentals.filter(rental => rental !== item))}>Remove item</Button>
                  <Button size="small" variant="outlined" onClick={() => setExpanded(null)}>Done editing</Button>
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>;
        })}
      </Stack>
      <Button size="small" startIcon={<AddRounded />} onClick={() => addItem(group)} sx={{ mt: 1 }}>Add to {group.name || 'this group'}</Button>
    </Box>)}
    {groups.length === 0 && <Box sx={{ textAlign: 'center', py: 5, border: '1px dashed', borderColor: 'divider', borderRadius: '18px' }}>
      <Typography sx={{ fontWeight: 700 }}>{query ? 'No equipment matches your search' : 'No equipment added for this sport yet'}</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: .5 }}>Add an item or choose another sport.</Typography>
    </Box>}
    <Box><Button variant="outlined" size="small" startIcon={<AddRounded />} onClick={() => addItem()}>Add equipment group</Button></Box>
  </Stack>;
}
