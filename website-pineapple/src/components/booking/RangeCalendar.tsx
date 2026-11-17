import East from '@mui/icons-material/East';
import West from '@mui/icons-material/West';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useId, useState } from 'react';
import { fonts } from '../../theme';

const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Six even weeks keep adjacent months aligned and navigation from shifting.
function getMonthCells(year: number, month: number): (Date | null)[] {
  const daysBefore = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: daysBefore }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ...Array.from({ length: 42 - daysBefore - daysInMonth }, () => null),
  ];
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
  const minimum = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
  return <Box sx={{ flex: 1, minWidth: 0 }}>
    <Typography aria-live="polite" sx={{ fontFamily: fonts.sans, fontSize: 15, fontWeight: 700, textAlign: 'center', lineHeight: '44px', mb: 1 }}>{monthFmt.format(new Date(year, month, 1))}</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', rowGap: '4px' }}>
      {WEEKDAY_LABELS.map((w) => <Typography key={w} sx={{ fontFamily: fonts.sans, fontSize: 11, textAlign: 'center', color: 'text.secondary', pb: 1 }}>{w}</Typography>)}
      {getMonthCells(year, month).map((date, index) => {
        if (!date) return <Box key={`blank-${index}`} sx={{ height: 42 }} />;
        const disabled = date < minimum;
        const isCheckIn = isSameDay(date, checkIn);
        const isCheckOut = isSameDay(date, checkOut);
        const inRange = date > checkIn && date < checkOut;
        return <Box key={date.toISOString()} sx={theme => ({
          height: 42, display: 'grid', placeItems: 'center',
          bgcolor: inRange ? alpha(theme.palette.primary.main, .09) : 'transparent',
          backgroundImage: isCheckIn || isCheckOut ? `linear-gradient(to ${isCheckIn ? 'left' : 'right'}, ${alpha(theme.palette.primary.main, .09)} 50%, transparent 50%)` : undefined,
        })}><Box component="button" type="button" disabled={disabled}
          aria-label={date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          aria-current={isSameDay(date, minimum) ? 'date' : undefined}
          aria-pressed={isCheckIn || isCheckOut}
          onClick={() => onSelectDay(date)} sx={(theme) => ({
            width: '100%', maxWidth: 42, height: 42, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontFamily: fonts.sans, fontWeight: isCheckIn || isCheckOut ? 700 : 500, border: 'none', borderRadius: '50%', cursor: disabled ? 'default' : 'pointer',
            color: isCheckIn || isCheckOut ? 'primary.contrastText' : disabled ? 'text.disabled' : 'text.primary',
            bgcolor: isCheckIn || isCheckOut ? 'primary.main' : 'transparent',
            transition: 'background-color .15s ease',
            '&:hover': !disabled && !(isCheckIn || isCheckOut) ? { bgcolor: alpha(theme.palette.primary.main, .18) } : undefined,
            '&:focus-visible': { outline: '2px solid', outlineColor: 'info.main', outlineOffset: 1 },
          })}>{date.getDate()}</Box></Box>;
      })}
    </Box>
  </Box>;
}

const navArrowSx = { position: 'absolute', top: 0, zIndex: 1, width: 44, height: 44, border: '1px solid', borderColor: 'divider', color: 'primary.dark', '&.Mui-disabled': { opacity: .35 } } as const;

interface RangeCalendarProps {
  checkIn: Date;
  checkOut: Date;
  minDate: Date;
  onSelectDay: (day: Date) => void;
  selectingCheckout?: boolean;
}

// Two months side by side, Airbnb-style: pick a check-in, then a check-out —
// the range between fills with a soft tint, the endpoints solid. A single
// pair of arrows (not per-month) pages both months forward together; back is
// disabled once you're viewing the earliest selectable month. The arrows sit
// on the month-name row, so on phones the header reads "‹ Oct 2026 ›".
export function RangeCalendar({ checkIn, checkOut, minDate, onSelectDay, selectingCheckout = false }: RangeCalendarProps) {
  const helpId = useId();
  const [monthOffset, setMonthOffset] = useState(() => Math.max(0, (checkIn.getFullYear() - minDate.getFullYear()) * 12 + checkIn.getMonth() - minDate.getMonth()));
  const anchor = new Date(minDate.getFullYear(), minDate.getMonth() + monthOffset, 1);
  const next = new Date(minDate.getFullYear(), minDate.getMonth() + monthOffset + 1, 1);

  // Fills its container (so callers size it), capped and centered so the two
  // months don't drift apart inside a much wider one.
  return <Box className="stay-calendar" aria-describedby={helpId} sx={{ p: { xs: 2, sm: 2.5 }, width: '100%', maxWidth: 720, mx: 'auto', containerType: 'inline-size' }}>
    <Typography sx={{ fontFamily: fonts.serif, fontSize: 25, color: 'primary.dark', lineHeight: 1.2 }}>Your getaway dates</Typography>
    <Typography id={helpId} aria-live="polite" sx={{ fontSize: 12, color: 'text.secondary', mt: .75, mb: 2 }}>{selectingCheckout ? 'Now choose your check-out date.' : 'Choose your check-in, then your check-out.'}</Typography>
    <Box sx={{ position: 'relative' }}>
    <IconButton aria-label="Previous month" onClick={() => setMonthOffset((o) => Math.max(0, o - 1))} disabled={monthOffset === 0} sx={{ ...navArrowSx, left: 0 }}><West sx={{ fontSize: 16 }} /></IconButton>
    <IconButton aria-label="Next month" onClick={() => setMonthOffset((o) => o + 1)} sx={{ ...navArrowSx, right: 0 }}><East sx={{ fontSize: 16 }} /></IconButton>
    <Stack direction="row" spacing={3}>
      <MonthGrid year={anchor.getFullYear()} month={anchor.getMonth()} checkIn={checkIn} checkOut={checkOut} minDate={minDate} onSelectDay={onSelectDay} />
      <Box sx={{ display: 'none', '@container (min-width: 520px)': { display: 'block' }, flex: 1, minWidth: 0 }}><MonthGrid year={next.getFullYear()} month={next.getMonth()} checkIn={checkIn} checkOut={checkOut} minDate={minDate} onSelectDay={onSelectDay} /></Box>
    </Stack>
    </Box>
  </Box>;
}
