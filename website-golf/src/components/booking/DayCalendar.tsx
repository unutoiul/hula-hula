import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { addDays, monthYearLabel } from '../../booking/dates';
import { fonts } from '../../theme';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const shiftMonth = (month: string, by: number) => {
  const date = new Date(`${month}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + by);
  return date.toISOString().slice(0, 7);
};

// A one-month calendar for picking a single day, Monday first. Days outside
// min…max can't be picked; today is ringed.
export function DayCalendar({ value, min, max, onChange }: { value: string; min: string; max: string; onChange: (date: string) => void }) {
  const [month, setMonth] = useState(value.slice(0, 7));
  const first = `${month}-01`;
  const lead = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7;
  const days = Array.from({ length: 31 }, (_, i) => addDays(first, i)).filter((d) => d.startsWith(month));

  return <Box sx={{ width: 300, maxWidth: '100%', p: 2 }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
      <IconButton aria-label="Previous month" size="small" disabled={month <= min.slice(0, 7)} onClick={() => setMonth(shiftMonth(month, -1))}><ChevronLeft /></IconButton>
      <Typography aria-live="polite" sx={{ fontFamily: fonts.playful, fontSize: 17 }}>{monthYearLabel(first)}</Typography>
      <IconButton aria-label="Next month" size="small" disabled={month >= max.slice(0, 7)} onClick={() => setMonth(shiftMonth(month, 1))}><ChevronRight /></IconButton>
    </Stack>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: .5, textAlign: 'center' }}>
      {WEEKDAYS.map((d) => <Typography key={d} aria-hidden sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', py: .5 }}>{d}</Typography>)}
      {Array.from({ length: lead }, (_, i) => <Box key={`lead-${i}`} />)}
      {days.map((day) => {
        const disabled = day < min || day > max;
        const selected = day === value;
        return <Box key={day} component="button" type="button" disabled={disabled} aria-pressed={selected} aria-label={new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' })}
          onClick={() => onChange(day)} sx={{
            aspectRatio: '1', border: day === min && !selected ? '1px solid' : 0, borderColor: 'primary.main', borderRadius: '50%', cursor: disabled ? 'default' : 'pointer',
            bgcolor: selected ? 'primary.main' : 'transparent', color: selected ? 'primary.contrastText' : disabled ? 'text.disabled' : 'text.primary',
            font: 'inherit', fontSize: 14, fontVariantNumeric: 'tabular-nums', transition: 'background-color .2s ease',
            '&:hover:not(:disabled)': { bgcolor: selected ? 'primary.main' : 'secondary.light' },
          }}>{Number(day.slice(8))}</Box>;
      })}
    </Box>
  </Box>;
}
