import East from '@mui/icons-material/East';
import { Box, Button, Popover, Stack, Typography } from '@mui/material';
import { useRef, useState, type ReactNode } from 'react';
import { ActivityIcon } from '../../booking/activityIcons';
import { bookableDays } from '../../booking/availability';
import { bookHref } from '../../booking/BookingFlowContext';
import { ACTIVITIES, type Activity } from '../../booking/config';
import { krabiNow, shortDayLabel } from '../../booking/dates';
import { fromPrice, money, plural } from '../../booking/pricing';
import { linkClick } from '../../router';
import { fonts } from '../../theme';
import { DayCalendar } from './DayCalendar';
import { GuestStepper } from './GuestStepper';

const paper = { mt: 1, borderRadius: '24px', boxShadow: '0 18px 40px rgba(23,60,44,.16)' } as const;

// The homepage's tee time search, in the same shape as the resort's stay
// search bar: what to play, which day and how many, each opening a small
// panel — then straight onto that day's tee sheet at /book. `stacked` puts
// the activity on its own row, for narrow columns.
export function QuickBook({ maxWidth = 640, stacked = false }: { maxWidth?: number | string; stacked?: boolean }) {
  const days = bookableDays();
  const [activity, setActivity] = useState<Activity>(ACTIVITIES[0]);
  const [date, setDate] = useState(krabiNow().date);
  const [players, setPlayers] = useState(2);
  const [open, setOpen] = useState<'activity' | 'date' | 'players' | null>(null);
  const fields = useRef<HTMLDivElement>(null);

  const pick = (next: Activity) => {
    setActivity(next);
    setPlayers((p) => Math.min(next.maxPlayers, Math.max(next.minPlayers, p)));
    setOpen(null);
  };
  const href = bookHref({ activity: activity.id, option: activity.options[0].id, date, players });
  const people = plural(players, activity.id === 'lesson' ? 'person' : 'player', activity.id === 'lesson' ? 'people' : 'players');

  return <Box sx={{ width: '100%', maxWidth, border: '1px solid', borderColor: 'divider', borderTop: '4px solid #50830d', bgcolor: 'background.paper', color: 'text.primary', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(23,60,44,.07)' }}>
    <Box ref={fields} sx={{ display: 'grid', gridTemplateColumns: stacked ? '1fr 1fr' : { xs: '1fr 1fr', sm: '1.3fr 1fr 1fr' }, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Field label="Play" value={<Stack direction="row" spacing={.75} alignItems="center"><ActivityIcon activity={activity.id} sx={{ fontSize: 17, color: 'success.main' }} /><span>{activity.name}</span></Stack>}
        expanded={open === 'activity'} onClick={() => setOpen('activity')} ariaLabel={`Activity: ${activity.name}`} sx={stacked ? { gridColumn: '1 / -1', borderBottom: '1px solid #d6e1ce' } : { gridColumn: { xs: '1 / -1', sm: 'auto' }, borderBottom: { xs: '1px solid #d6e1ce', sm: 'none' }, borderRight: { sm: '1px solid #d6e1ce' } }} />
      <Field label="Day" value={days[0] === date ? `Today · ${shortDayLabel(date)}` : shortDayLabel(date)} expanded={open === 'date'} onClick={() => setOpen('date')} ariaLabel={`Day: ${shortDayLabel(date)}`} sx={{ borderRight: '1px solid #d6e1ce' }} />
      <Field label={activity.id === 'lesson' ? 'People' : 'Players'} value={people} expanded={open === 'players'} onClick={() => setOpen('players')} ariaLabel={`${people}`} />
    </Box>
    <Box sx={{ p: 1.5 }}>
      <Button fullWidth variant="contained" href={href} onClick={linkClick(href)} endIcon={<East />}>Find a tee time</Button>
    </Box>

    {/* Anchored to the whole fields row, so each panel lines up under the bar. */}
    <Popover open={open === 'activity'} anchorEl={fields.current} onClose={() => setOpen(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} slotProps={{ paper: { sx: { ...paper, width: 320, maxWidth: 'calc(100vw - 32px)' } } }}>
      <Stack component="ul" role="listbox" aria-label="Activity" sx={{ listStyle: 'none', m: 0, p: 1 }}>
        {ACTIVITIES.map((a) => <Box component="li" key={a.id} role="option" aria-selected={a.id === activity.id}>
          <Box component="button" type="button" onClick={() => pick(a)} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, border: 0, borderRadius: '14px', font: 'inherit', textAlign: 'left', cursor: 'pointer', color: 'inherit', bgcolor: a.id === activity.id ? 'primary.light' : 'transparent', '&:hover': { bgcolor: 'secondary.light' } }}>
            <Box aria-hidden sx={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'success.light', color: 'success.dark', '& svg': { fontSize: 19 } }}><ActivityIcon activity={a.id} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontFamily: fonts.playful, fontSize: 16 }}>{a.name}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{a.tagline}</Typography>
            </Box>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>from {money(fromPrice(a))}</Typography>
          </Box>
        </Box>)}
      </Stack>
    </Popover>
    <Popover open={open === 'date'} anchorEl={fields.current} onClose={() => setOpen(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }} slotProps={{ paper: { sx: paper } }}>
      <DayCalendar value={date} min={days[0]} max={days[days.length - 1]} onChange={(day) => { setDate(day); setOpen(null); }} />
    </Popover>
    <Popover open={open === 'players'} anchorEl={fields.current} onClose={() => setOpen(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { ...paper, width: 300, p: 2.5 } } }}>
      <GuestStepper label={activity.id === 'lesson' ? 'People' : 'Players'} value={players} min={activity.minPlayers} max={activity.maxPlayers} onChange={setPlayers} />
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1.5 }}>Up to {activity.maxPlayers} {activity.id === 'range' ? 'in a bay' : 'in a group'}. More of you? We’ll line up times together.</Typography>
    </Popover>
  </Box>;
}

function Field({ label, value, expanded, onClick, ariaLabel, sx }: { label: string; value: ReactNode; expanded: boolean; onClick: () => void; ariaLabel: string; sx?: object }) {
  return <Box component="button" type="button" aria-label={ariaLabel} aria-haspopup="dialog" aria-expanded={expanded} onClick={onClick} sx={{
    border: 0, bgcolor: expanded ? 'secondary.light' : 'transparent', color: 'inherit', textAlign: 'left', minWidth: 0, px: 2.5, py: 1.6, cursor: 'pointer', font: 'inherit',
    transition: 'background-color .2s ease', '&:hover': { bgcolor: 'secondary.light' }, '&:focus-visible': { outlineOffset: -4 }, ...sx,
  }}>
    <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: { xs: 11, sm: '.6rem' } }}>{label}</Typography>
    <Box sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: 14, mt: .15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</Box>
  </Box>;
}
