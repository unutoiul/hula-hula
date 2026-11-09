import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import { IconButton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { fonts } from '../../theme';

interface GuestStepperProps {
  label: ReactNode;
  /** What the − and + buttons are called, when the label isn't plain words. */
  name?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function GuestStepper({ label, name, value, min = 0, max = Infinity, onChange }: GuestStepperProps) {
  const buttons = name ?? String(label).toLowerCase();
  return <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography component="div" sx={{ fontSize: 15 }}>{label}</Typography>
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>
      <IconButton size="small" aria-label={`Fewer ${buttons}`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} sx={{ border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}><Remove sx={{ fontSize: 16 }} /></IconButton>
      <Typography sx={{ width: 20, textAlign: 'center', fontFamily: fonts.playful, fontWeight: 400, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      <IconButton size="small" aria-label={`More ${buttons}`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} sx={{ border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}><Add sx={{ fontSize: 16 }} /></IconButton>
    </Stack>
  </Stack>;
}
