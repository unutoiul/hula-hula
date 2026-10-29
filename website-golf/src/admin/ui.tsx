import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

// Small building blocks shared by the staff app's pages.

/** One card on an admin page: a title, an optional hint, and its fields. */
export function Section({ title, hint, action, children }: { title: string; hint?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return <Box component="section" aria-label={title} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '22px', p: { xs: 2, sm: 2.5, md: 3 } }}>
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: 21, md: 24 } }}>{title}</Typography>
        {hint && <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: .25 }}>{hint}</Typography>}
      </Box>
      {action}
    </Stack>
    {children}
  </Box>;
}

/** A page title with its main button beside it. */
export function PageTitle({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="h1" sx={{ fontSize: { xs: 30, md: 38 }, lineHeight: 1.1 }}>{title}</Typography>
      {hint && <Typography sx={{ color: 'text.secondary', mt: .75, fontSize: 14.5 }}>{hint}</Typography>}
    </Box>
    {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
  </Stack>;
}

/** Textarea text ⇄ a list, one item per line. */
export const linesToList = (text: string) => text.split('\n').map((line) => line.trim()).filter(Boolean);
export const listToLines = (list: string[]) => list.join('\n');

/** A whole number from a form field, or the fallback. */
export const toInt = (value: string, fallback = 0) => { const n = parseInt(value, 10); return Number.isFinite(n) ? n : fallback; };
