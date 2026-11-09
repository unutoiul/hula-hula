import AddRounded from '@mui/icons-material/AddRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { Box, Button, Chip, CircularProgress, IconButton, InputAdornment, Menu, MenuItem, Stack, Switch, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { ActivityIcon } from '../booking/activityIcons';
import { rentalsFor, type Activity, type Rental } from '../booking/config';
import { money } from '../booking/pricing';
import { RentalGroupsEditor } from './RentalGroupsEditor';
import { PageTitle, Section } from './ui';

interface Row { activity: Activity; active: boolean; sortOrder: number }

/** Staff browse compact lists; fields open only for the item they are editing. */
export function ActivitiesManager({ rows, rentals, savedEquipment, saving, saved, onAdd, onEdit, onDelete, onToggle, onRentalsChange, onSave }: {
  rows: Row[]; rentals: Rental[]; savedEquipment: Rental[]; saving: boolean; saved: boolean;
  onAdd: () => void; onEdit: (activity: Activity) => void; onDelete: (activity: Activity) => void;
  onToggle: (row: Row) => void; onRentalsChange: (rentals: Rental[]) => void; onSave: () => void;
}) {
  const [panel, setPanel] = useState<'activities' | 'equipment'>('activities');
  const [activityQuery, setActivityQuery] = useState('');
  const [equipmentQuery, setEquipmentQuery] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [sport, setSport] = useState('all');
  const [menu, setMenu] = useState<{ anchor: HTMLElement; activity: Activity } | null>(null);
  const dirty = rentals !== savedEquipment;
  const visible = rows.filter(row => `${row.activity.name} ${row.activity.tagline}`.toLowerCase().includes(activityQuery.trim().toLowerCase()) && (visibility === 'all' || row.active === (visibility === 'visible')));
  const showEquipment = (id: string) => { setSport(id); setEquipmentQuery(''); setPanel('equipment'); };
  const searchAdornment = <InputAdornment position="start"><SearchRounded sx={{ fontSize: 20 }} /></InputAdornment>;

  return <>
    <PageTitle title="Activities & equipment" hint="Your sports, prices and gear, all in one place." action={<Button variant="contained" startIcon={<AddRounded />} onClick={onAdd}>Add activity</Button>} />
    <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mb: 3 }}>
      <Chip size="small" label={`${rows.length} activities`} sx={{ bgcolor: 'success.light', fontWeight: 700 }} />
      <Chip size="small" label={`${rows.filter(row => row.active).length} on the website`} variant="outlined" />
      <Chip size="small" label={`${rentals.filter(item => item.price === 0).length} free equipment kits`} variant="outlined" />
    </Stack>
    <Tabs value={panel} onChange={(_, value) => setPanel(value)} aria-label="Manage activities or equipment" sx={{ mb: 2.5, borderBottom: '1px solid', borderColor: 'divider', '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 15, px: { xs: 1.5, sm: 2.5 }, minWidth: 0, flex: { xs: 1, sm: 'none' } } }}>
      <Tab id="activities-tab" aria-controls="activities-panel" value="activities" label={`Activities (${rows.length})`} />
      <Tab id="equipment-tab" aria-controls="equipment-panel" value="equipment" label={`Equipment (${rentals.length})${dirty ? ' •' : ''}`} />
    </Tabs>

    <Box role="tabpanel" id="activities-panel" aria-labelledby="activities-tab" hidden={panel !== 'activities'}>
      <Section title="Your activities" hint="Manage prices, booking options and what appears on the website.">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
          <TextField fullWidth size="small" label="Search activities" value={activityQuery} onChange={event => setActivityQuery(event.target.value)} slotProps={{ input: { startAdornment: searchAdornment } }} />
          <TextField select size="small" label="Visibility" value={visibility} onChange={event => setVisibility(event.target.value)} sx={{ minWidth: { sm: 170 } }}>
            <MenuItem value="all">All activities</MenuItem><MenuItem value="visible">On the website</MenuItem><MenuItem value="hidden">Hidden</MenuItem>
          </TextField>
        </Stack>
        <Stack spacing={1.25}>
          {visible.map(row => <Box component="article" key={row.activity.id} sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.2fr) minmax(0,1fr) auto' }, gap: { xs: 2, md: 2.5 }, alignItems: 'center', p: { xs: 2, md: 2.25 }, borderRadius: '18px', border: '1px solid', borderColor: 'divider', bgcolor: row.active ? 'background.paper' : '#f3f4ed' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              <Box aria-hidden sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '14px', display: 'grid', placeItems: 'center', bgcolor: 'success.light', color: 'success.dark' }}><ActivityIcon icon={row.activity.icon} /></Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography component="h3" sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{row.activity.name}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: .5 }}>{row.activity.bookOnline ? 'Online booking' : 'Booked by message'}</Typography>
                <Chip size="small" clickable label={`${rentalsFor(row.activity, rentals).length} equipment items →`} onClick={() => showEquipment(row.activity.id)} sx={{ mt: .75, height: 24, fontSize: 11, bgcolor: '#eef3e6' }} />
              </Box>
            </Stack>
            <Stack direction="row" flexWrap="wrap" useFlexGap gap={.75} sx={{ minWidth: 0 }}>
              {row.activity.options.map(option => <Chip key={option.id} size="small" label={`${option.label} · ${money(option.price)}`} sx={{ bgcolor: '#f4f5ed', borderRadius: '8px', fontSize: 12, height: 28 }} />)}
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ borderTop: { xs: '1px solid', md: 'none' }, borderColor: 'divider', pt: { xs: 1, md: 0 } }}>
              <Stack direction="row" alignItems="center" spacing={.25}>
                <Switch size="small" checked={row.active} onChange={() => onToggle(row)} inputProps={{ 'aria-label': `Show ${row.activity.name} on the website` }} />
                <Typography sx={{ fontSize: 12, color: 'text.secondary', minWidth: 43 }}>{row.active ? 'Visible' : 'Hidden'}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={.5}>
                <Button size="small" variant="outlined" startIcon={<EditRounded sx={{ fontSize: 16 }} />} onClick={() => onEdit(row.activity)} sx={{ minHeight: 36, py: .75, px: 1.5 }}>Edit</Button>
                <Tooltip title="More actions"><IconButton size="small" aria-label={`More actions for ${row.activity.name}`} onClick={event => setMenu({ anchor: event.currentTarget, activity: row.activity })}><MoreVertRounded fontSize="small" /></IconButton></Tooltip>
              </Stack>
            </Stack>
          </Box>)}
          {visible.length === 0 && <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 5 }}>No activities match these filters.</Typography>}
        </Stack>
      </Section>
    </Box>

    <Box role="tabpanel" id="equipment-panel" aria-labelledby="equipment-tab" hidden={panel !== 'equipment'}>
      <Section title="Equipment library" hint="Small icons, clear prices and equipment for each sport. Open an item to edit it.">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
          <TextField fullWidth size="small" label="Search equipment" value={equipmentQuery} onChange={event => setEquipmentQuery(event.target.value)} slotProps={{ input: { startAdornment: searchAdornment } }} />
          <TextField select size="small" label="Sport" value={sport} onChange={event => setSport(event.target.value)} sx={{ minWidth: { sm: 210 } }}>
            <MenuItem value="all">All sports</MenuItem>
            {rows.map(row => <MenuItem key={row.activity.id} value={row.activity.id}>{row.activity.name}</MenuItem>)}
          </TextField>
        </Stack>
        <RentalGroupsEditor rentals={rentals} sportId={sport} query={equipmentQuery} sports={rows.map(row => ({ id: row.activity.id, name: row.activity.name }))} onChange={onRentalsChange} />
      </Section>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ position: 'sticky', bottom: 12, zIndex: 3, p: { xs: 1.5, sm: 2 }, mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: '18px', bgcolor: 'background.paper', boxShadow: '0 6px 28px rgba(23,60,44,.1)' }}>
        <Typography aria-live="polite" sx={{ fontSize: 13, color: dirty ? 'warning.dark' : 'text.secondary', fontWeight: dirty ? 700 : 400 }}>{saving ? 'Saving your changes…' : dirty ? 'You have unsaved equipment changes' : saved ? 'Changes saved' : 'Equipment changes are saved together'}</Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {dirty && <Button size="small" color="inherit" disabled={saving} onClick={() => onRentalsChange(savedEquipment)}>Discard</Button>}
          <Button variant="contained" size="small" startIcon={saving ? <CircularProgress size={15} color="inherit" /> : <SaveRounded />} disabled={saving || !dirty} onClick={onSave}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </Stack>
      </Stack>
    </Box>
    <Menu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>
      <MenuItem onClick={() => { if (menu) onDelete(menu.activity); setMenu(null); }} sx={{ color: 'error.main', gap: 1 }}><DeleteOutlineRounded fontSize="small" />Delete activity</MenuItem>
    </Menu>
  </>;
}
