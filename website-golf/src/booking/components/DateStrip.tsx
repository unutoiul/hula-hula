import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { Box, IconButton, Popover, Stack } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { DayCalendar } from '../../components/booking/DayCalendar';
import { fonts } from '../../theme';
import { bookableDays } from '../availability';
import { dayLabel, dayOfMonth, isWeekend, monthLabel, weekdayLabel } from '../dates';

// The row of days above the tee sheet, like most tee time engines: swipe or
// arrow through the next two months, or jump with the calendar.
export function DateStrip({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const days = bookableDays();
  const row = useRef<HTMLDivElement>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLElement | null>(null);

  // Keep the chosen day in view, whichever way it was chosen.
  useEffect(() => {
    const node = row.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    const container = row.current;
    if (node && container) container.scrollTo({ left: node.offsetLeft - container.clientWidth / 2 + node.offsetWidth / 2, behavior: 'smooth' });
  }, [value]);

  const page = (direction: 1 | -1) => row.current?.scrollBy({ left: direction * row.current.clientWidth * 0.8, behavior: 'smooth' });

  return <Stack direction="row" alignItems="center" spacing={1}>
    <IconButton aria-label="Earlier days" onClick={() => page(-1)} sx={{ display: { xs: 'none', sm: 'inline-flex' }, border: '1px solid', borderColor: 'divider' }}><ChevronLeft /></IconButton>
    {/* Soft edges, so a day cut off at either end reads as "more this way". */}
    <Box ref={row} role="group" aria-label="Choose a day" sx={{
      flex: 1, minWidth: 0, display: 'flex', gap: 1, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, py: .5, px: .25,
      maskImage: 'linear-gradient(90deg, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%)',
    }}>
      {days.map((day, i) => {
        const selected = day === value;
        return <Box key={day} component="button" type="button" aria-pressed={selected} aria-label={dayLabel(day)} onClick={() => onChange(day)} sx={{
          flex: '0 0 64px', display: 'grid', justifyItems: 'center', gap: .1, py: 1, border: '1px solid', borderRadius: '16px', cursor: 'pointer', font: 'inherit',
          borderColor: selected ? 'primary.main' : 'divider', bgcolor: selected ? 'primary.main' : 'background.paper', color: selected ? 'primary.contrastText' : 'text.primary',
          transition: 'background-color .2s ease, border-color .2s ease', '&:hover': { borderColor: 'primary.main', bgcolor: selected ? 'primary.main' : 'primary.light' },
        }}>
          <Box component="span" sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: selected ? 'inherit' : isWeekend(day) ? 'success.main' : 'text.secondary' }}>{i === 0 ? 'Today' : weekdayLabel(day)}</Box>
          <Box component="span" sx={{ fontFamily: fonts.playful, fontSize: 22, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>{dayOfMonth(day)}</Box>
          <Box component="span" sx={{ fontSize: 11, opacity: .8 }}>{monthLabel(day)}</Box>
        </Box>;
      })}
    </Box>
    <IconButton aria-label="Later days" onClick={() => page(1)} sx={{ display: { xs: 'none', sm: 'inline-flex' }, border: '1px solid', borderColor: 'divider' }}><ChevronRight /></IconButton>
    <IconButton aria-label="Pick a day from the calendar" aria-haspopup="dialog" onClick={(e) => setCalendarAnchor(e.currentTarget)} sx={{ border: '1px solid', borderColor: 'primary.main', color: 'primary.main', bgcolor: 'primary.light', width: 48, height: 48 }}><CalendarMonthRounded /></IconButton>
    <Popover open={!!calendarAnchor} anchorEl={calendarAnchor} onClose={() => setCalendarAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { mt: 1, borderRadius: '24px', boxShadow: '0 18px 40px rgba(23,60,44,.16)' } } }}>
      <DayCalendar value={value} min={days[0]} max={days[days.length - 1]} onChange={(day) => { onChange(day); setCalendarAnchor(null); }} />
    </Popover>
  </Stack>;
}
