import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import { IconButton, Stack, Typography } from '@mui/material';

interface GuestStepperProps {
  label: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
}

export function GuestStepper({ label, value, min = 0, onChange }: GuestStepperProps) {
  return <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography sx={{ fontSize: 15 }}>{label}</Typography>
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <IconButton size="small" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} sx={{ border: '1px solid', borderColor: 'divider' }}><Remove sx={{ fontSize: 16 }} /></IconButton>
      <Typography sx={{ width: 20, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      <IconButton size="small" onClick={() => onChange(value + 1)} sx={{ border: '1px solid', borderColor: 'divider' }}><Add sx={{ fontSize: 16 }} /></IconButton>
    </Stack>
  </Stack>;
}
