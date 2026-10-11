import East from '@mui/icons-material/East';
import West from '@mui/icons-material/West';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { fonts } from '../../theme';

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

// Each month shares the calendar's width evenly (one month on phones, two from
// sm up); day buttons grow with their column up to 40px.
function MonthGrid({ year, month, checkIn, checkOut, minDate, onSelectDay }: MonthGridProps) {
  return <Box sx={{ flex: 1, minWidth: 0 }}>
    {/* 40px tall to line up with the absolutely positioned month arrows. */}
    <Typography sx={{ fontFamily: fonts.playful, fontSize: { xs: 16, sm: 14 }, fontWeight: 400, textAlign: 'center', lineHeight: '40px', mb: .5 }}>{monthFmt.format(new Date(year, month, 1))}</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '2px' }}>
      {WEEKDAY_LABELS.map((w) => <Typography key={w} sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: { xs: 12, sm: 10.5 }, textAlign: 'center', color: 'text.secondary', pb: .5 }}>{w}</Typography>)}
      {getMonthCells(year, month).map(({ date, current }) => {
        const disabled = !current || date < minDate;
        const isCheckIn = isSameDay(date, checkIn);
        const isCheckOut = isSameDay(date, checkOut);
        const inRange = date > checkIn && date < checkOut;
        return <Box key={date.toISOString()} component="button" type="button" disabled={disabled}
          aria-label={date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          aria-current={isCheckIn || isCheckOut ? 'date' : undefined}
          onClick={() => onSelectDay(date)} sx={(theme) => ({
            width: '100%', maxWidth: 40, aspectRatio: '1 / 1', p: 0, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: { xs: 14, sm: 12.5 }, fontFamily: fonts.playful, fontWeight: 400, border: 'none', borderRadius: '50%', cursor: disabled ? 'default' : 'pointer',
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

const navArrowSx = { position: 'absolute', top: 16, zIndex: 1, width: 40, height: 40, border: '1px solid', borderColor: 'divider', '&.Mui-disabled': { opacity: .4 } } as const;

interface RangeCalendarProps {
  checkIn: Date;
  checkOut: Date;
  minDate: Date;
  onSelectDay: (day: Date) => void;
}

// Two months side by side, Airbnb-style: pick a check-in, then a check-out —
// the range between fills with a soft tint, the endpoints solid. A single
// pair of arrows (not per-month) pages both months forward together; back is
// disabled once you're viewing the earliest selectable month. The arrows sit
// on the month-name row, so on phones the header reads "‹ Oct 2026 ›".
export function RangeCalendar({ checkIn, checkOut, minDate, onSelectDay }: RangeCalendarProps) {
  const [monthOffset, setMonthOffset] = useState(0);
  const anchor = new Date(minDate.getFullYear(), minDate.getMonth() + monthOffset, 1);
  const next = new Date(minDate.getFullYear(), minDate.getMonth() + monthOffset + 1, 1);

  // Fills its container (so callers size it), capped and centered so the two
  // months don't drift apart inside a much wider one.
  return <Box sx={{ position: 'relative', p: 2, width: '100%', maxWidth: { sm: 560 }, mx: 'auto' }}>
    <IconButton aria-label="Previous month" onClick={() => setMonthOffset((o) => Math.max(0, o - 1))} disabled={monthOffset === 0} sx={{ ...navArrowSx, left: 16 }}><West sx={{ fontSize: 16 }} /></IconButton>
    <IconButton aria-label="Next month" onClick={() => setMonthOffset((o) => o + 1)} sx={{ ...navArrowSx, right: 16 }}><East sx={{ fontSize: 16 }} /></IconButton>
    <Stack direction="row" spacing={2.5}>
      <MonthGrid year={anchor.getFullYear()} month={anchor.getMonth()} checkIn={checkIn} checkOut={checkOut} minDate={minDate} onSelectDay={onSelectDay} />
      <Box sx={{ display: { xs: 'none', sm: 'block' }, flex: 1, minWidth: 0 }}><MonthGrid year={next.getFullYear()} month={next.getMonth()} checkIn={checkIn} checkOut={checkOut} minDate={minDate} onSelectDay={onSelectDay} /></Box>
    </Stack>
  </Box>;
}
