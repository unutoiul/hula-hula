import { Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function MetaLabel({ children }: { children: ReactNode }) {
  return <Typography variant="overline" sx={{ display: 'block', color: 'inherit' }}>{children}</Typography>;
}
