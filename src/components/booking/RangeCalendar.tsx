import East from '@mui/icons-material/East';
import West from '@mui/icons-material/West';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';

const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

interface DayCell {
  date: Date;
  current: boolean;
}

// Sunday-first grid for one month, padded with the trailing/leading days of
// its neighbors (shown faded) just to complete each week row — no fixed
// 6-row grid, so shorter months stay visually shorter.
function getMonthCells(year: number, month: number): DayCell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInThisMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: DayCell[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), current: false });
  for (let d = 1; d <= daysInThisMonth; d++) cells.push({ date: new Date(year, month, d), current: true });
  for (let d = 1; cells.length % 7 !== 0; d++) cells.push({ date: new Date(year, month + 1, d), current: false });
  return cells;
}

interface MonthGridProps {
  year: number;
  month: number;
  checkIn: Date;
  checkOut: Date;
  minDate: Date;
  onSelectDay: (day: Date) => void;
}

function MonthGrid({ year, month, checkIn, checkOut, minDate, onSelectDay }: MonthGridProps) {
  return <Box>
    <Typography sx={{ fontSize: 12.5, fontWeight: 600, textAlign: 'center', mb: 1 }}>{monthFmt.format(new Date(year, month, 1))}</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
      {WEEKDAY_LABELS.map((w) => <Typography key={w} sx={{ fontSize: 9.5, textAlign: 'center', color: 'text.secondary', pb: .25 }}>{w}</Typography>)}
      {getMonthCells(year, month).map(({ date, current }) => {
        const disabled = !current || date < minDate;
        const isCheckIn = isSameDay(date, checkIn);
        const isCheckOut = isSameDay(date, checkOut);
        const inRange = date > checkIn && date < checkOut;
        return <Box key={date.toISOString()} component="button" type="button" disabled={disabled}
          aria-label={date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          aria-current={isCheckIn || isCheckOut ? 'date' : undefined}
          onClick={() => onSelectDay(date)} sx={(theme) => ({
            width: 28, height: 28, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11.5, fontFamily: 'inherit', border: 'none', borderRadius: '50%', cursor: disabled ? 'default' : 'pointer',
            color: isCheckIn || isCheckOut ? 'primary.contrastText' : disabled ? 'text.disabled' : 'text.primary',
            bgcolor: isCheckIn || isCheckOut ? 'primary.main' : inRange ? alpha(theme.palette.primary.main, .12) : 'transparent',
            transition: 'background-color .15s ease',
            '&:hover': !disabled && !(isCheckIn || isCheckOut) ? { bgcolor: alpha(theme.palette.primary.main, .18) } : undefined,
            '&:focus-visible': { outline: '2px solid', outlineColor: 'info.main', outlineOffset: 1 },
          })}>{date.getDate()}</Box>;
      })}
    </Box>
  </Box>;
}

interface RangeCalendarProps {
  checkIn: Date;
  checkOut: Date;
  minDate: Date;
  onSelectDay: (day: Date) => void;
}

// Two months side by side, Airbnb-style: pick a check-in, then a check-out —
// the range between fills with a soft tint, the endpoints solid. A single
// pair of arrows (not per-month) pages both months forward together; back is
// disabled once you're viewing the earliest selectable month.
export function RangeCalendar({ checkIn, checkOut, minDate, onSelectDay }: RangeCalendarProps) {
  const [monthOffset, setMonthOffset] = useState(0);
  const anchor = new Date(minDate.getFullYear(), minDate.getMonth() + monthOffset, 1);
  const next = new Date(minDate.getFullYear(), minDate.getMonth() + monthOffset + 1, 1);

  // The two-month grid has a fixed intrinsic width — without a cap, it stretches to fill
  // whatever (often much wider) container it's in, leaving the nav arrows spread apart and
  // the grid pinned to the left with dead space on the right. Capping + centering fixes both.
  return <Box sx={{ p: 2, maxWidth: 460, mx: 'auto' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: .5 }}>
      <IconButton size="small" onClick={() => setMonthOffset((o) => Math.max(0, o - 1))} disabled={monthOffset === 0} sx={{ visibility: monthOffset === 0 ? 'hidden' : 'visible' }}><West sx={{ fontSize: 14 }} /></IconButton>
      <IconButton size="small" onClick={() => setMonthOffset((o) => o + 1)}><East sx={{ fontSize: 14 }} /></IconButton>
    </Stack>
    <Stack direction="row" spacing={2.5}>
      <MonthGrid year={anchor.getFullYear()} month={anchor.getMonth()} checkIn={checkIn} checkOut={checkOut} minDate={minDate} onSelectDay={onSelectDay} />
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}><MonthGrid year={next.getFullYear()} month={next.getMonth()} checkIn={checkIn} checkOut={checkOut} minDate={minDate} onSelectDay={onSelectDay} /></Box>
    </Stack>
  </Box>;
}
