import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import { IconButton, Stack, Typography } from '@mui/material';
import { fonts } from '../../theme';

interface GuestStepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function GuestStepper({ label, value, min = 0, max = Infinity, onChange }: GuestStepperProps) {
  return <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography sx={{ fontSize: 15 }}>{label}</Typography>
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <IconButton size="small" aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} sx={{ border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}><Remove sx={{ fontSize: 16 }} /></IconButton>
      <Typography sx={{ width: 20, textAlign: 'center', fontFamily: fonts.playful, fontWeight: 400, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      <IconButton size="small" aria-label={`More ${label.toLowerCase()}`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} sx={{ border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}><Add sx={{ fontSize: 16 }} /></IconButton>
    </Stack>
  </Stack>;
}
