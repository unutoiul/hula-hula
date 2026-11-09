import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { addDays, dayLabel, monthYearLabel } from '../booking/dates';
import { plural } from '../booking/pricing';
import { shiftMonth, WEEKDAYS } from '../components/booking/DayCalendar';
import { fonts } from '../theme';

export interface DayTotals { bookings: number; people: number }

// Upcoming days get a deeper tint the busier they are, against the month's
// busiest day. Six bookings is the least that counts as "busy", so one
// booking in a quiet month doesn't look like a full day.
function busyTint(bookings: number, busiest: number) {
  const share = bookings / Math.max(busiest, 6);
  return share > 2 / 3 ? '#9fe0f0' : share > 1 / 3 ? '#bdebf6' : 'primary.light';
}

// The month at the top of the tee sheet, always open: each day shows how many
// bookings it has, so the booked days stand out and any day is one tap away.
// `totals` is null until the month's numbers have loaded.
export function BookingCalendar({ value, today, month, totals, onSelect, onMonthChange, onToday, onRefresh }: {
  value: string; today: string; month: string; totals: Map<string, DayTotals> | null;
  onSelect: (date: string) => void; onMonthChange: (month: string) => void; onToday: () => void; onRefresh: () => void;
}) {
  const first = `${month}-01`;
  const lead = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7;
  const days = Array.from({ length: 31 }, (_, i) => addDays(first, i)).filter((d) => d.startsWith(month));
  const all = [...(totals?.values() ?? [])];
  const busiest = Math.max(0, ...all.map((t) => t.bookings));
  const bookings = all.reduce((sum, t) => sum + t.bookings, 0);
  const people = all.reduce((sum, t) => sum + t.people, 0);
  const showingToday = value === today && month === today.slice(0, 7);

  return <Box component="section" aria-label="Bookings calendar" sx={{ p: { xs: 1, sm: 2 }, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
    <Stack direction="row" alignItems="center" spacing={.5} sx={{ px: { xs: .75, sm: .5 }, pb: 1 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography aria-live="polite" sx={{ fontFamily: fonts.playful, fontSize: { xs: 21, sm: 25 }, lineHeight: 1.15 }}>{monthYearLabel(first)}</Typography>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary', minHeight: '1.5em' }}>{!totals ? '' : bookings ? `${plural(bookings, 'booking')} · ${plural(people, 'person', 'people')}` : 'No bookings yet'}</Typography>
      </Box>
      <Button size="small" variant="outlined" disabled={showingToday} onClick={onToday} sx={{ flexShrink: 0, mr: .5 }}>Today</Button>
      <IconButton aria-label="Previous month" onClick={() => onMonthChange(shiftMonth(month, -1))}><ChevronLeft /></IconButton>
      <IconButton aria-label="Next month" onClick={() => onMonthChange(shiftMonth(month, 1))}><ChevronRight /></IconButton>
      <IconButton aria-label="Refresh" onClick={onRefresh} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}><RefreshRounded /></IconButton>
    </Stack>

    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: { xs: .5, sm: .75 } }}>
      {WEEKDAYS.map((d) => <Typography key={d} aria-hidden sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', color: 'text.secondary', textAlign: 'center', py: .5 }}>{d}</Typography>)}
      {Array.from({ length: lead }, (_, i) => <Box key={`lead-${i}`} />)}
      {days.map((day) => {
        const total = totals?.get(day);
        const selected = day === value;
        const isToday = day === today;
        const past = day < today;
        const background = selected ? 'primary.main' : !total ? 'transparent' : past ? 'rgba(23,60,44,.05)' : busyTint(total.bookings, busiest);
        return <Box key={day} component="button" type="button" onClick={() => onSelect(day)} aria-pressed={selected} aria-current={isToday ? 'date' : undefined}
          aria-label={`${dayLabel(day)}: ${total ? plural(total.bookings, 'booking') : 'no bookings'}`} title={total ? `${plural(total.bookings, 'booking')} · ${plural(total.people, 'person', 'people')}` : undefined} sx={{
            display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: .25, minWidth: 0, minHeight: { xs: 52, sm: 60, md: 48 }, py: { xs: .5, md: .5 }, px: { xs: .5, md: 1.25 },
            border: isToday && !selected ? '2px solid' : '1px solid', borderColor: isToday ? 'primary.main' : total && !selected ? 'transparent' : selected ? 'primary.main' : 'rgba(23,60,44,.08)', borderRadius: '14px',
            bgcolor: background, color: selected ? 'primary.contrastText' : past ? 'text.secondary' : 'text.primary', cursor: 'pointer', font: 'inherit', transition: 'background-color .15s ease, border-color .15s ease',
            '&:hover': selected ? undefined : { borderColor: 'primary.main' }, '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.dark', outlineOffset: '1px' },
          }}>
          <Stack direction="row" alignItems="center" spacing={.5} component="span">
            <Box component="span" sx={{ fontSize: { xs: 14, sm: 15 }, fontWeight: selected || isToday ? 800 : 600, lineHeight: 1.3, fontVariantNumeric: 'tabular-nums' }}>{Number(day.slice(8))}</Box>
            {isToday && <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: selected ? 'inherit' : 'primary.main' }}>Today</Box>}
          </Stack>
          {total && <Box component="span" sx={{ minWidth: 20, height: 20, px: '5px', boxSizing: 'border-box', borderRadius: '10px', display: 'grid', placeItems: 'center', fontSize: 12, lineHeight: 1, fontWeight: 800, fontVariantNumeric: 'tabular-nums', bgcolor: selected ? 'common.white' : past ? 'rgba(23,60,44,.14)' : 'primary.main', color: selected ? 'primary.main' : past ? 'text.secondary' : 'common.white' }}>{total.bookings}</Box>}
        </Box>;
      })}
    </Box>
  </Box>;
}
