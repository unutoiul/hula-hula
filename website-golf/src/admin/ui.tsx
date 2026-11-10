import { Box, Card, CardContent, Container, Paper, Stack, Typography, type ContainerProps, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

// Small building blocks shared by the staff app's pages.

/** The one width and set of side margins for the staff app: its header, every page and the pinned buttons. */
export function AdminContainer({ sx, ...props }: ContainerProps) {
  return <Container maxWidth="lg" {...props} sx={[{ px: { xs: 2, sm: 3 } }, ...(Array.isArray(sx) ? sx : [sx])]} />;
}

const SECTION_PADDING = { xs: 2, sm: 2.5, md: 3 };

/** One card on an admin page: a title, an optional hint, and its fields. */
export function Section({ title, hint, action, sx, children }: { title: string; hint?: ReactNode; action?: ReactNode; sx?: SxProps<Theme>; children: ReactNode }) {
  return <Card component="section" variant="outlined" aria-label={title} sx={[{ borderRadius: '22px' }, ...(Array.isArray(sx) ? sx : [sx])]}>
    <CardContent sx={{ p: SECTION_PADDING, '&:last-child': { pb: SECTION_PADDING } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="flex-start" justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h3" sx={{ fontSize: { xs: 21, md: 24 } }}>{title}</Typography>
          {hint && <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: .25 }}>{hint}</Typography>}
        </Box>
        {action}
      </Stack>
      {children}
    </CardContent>
  </Card>;
}

/** A page title with its main button beside it, or full width under it on a phone. */
export function PageTitle({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'flex-end' }} justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="h1" sx={{ fontSize: { xs: 30, md: 38 }, lineHeight: 1.1 }}>{title}</Typography>
      {hint && <Typography sx={{ color: 'text.secondary', mt: .75, fontSize: 14.5 }}>{hint}</Typography>}
    </Box>
    {action && <Box sx={{ flexShrink: 0, '& > .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>{action}</Box>}
  </Stack>;
}

/** The dashed box a list shows when there's nothing in it. */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return <Paper variant="outlined" sx={{ textAlign: 'center', py: 5, px: 2, borderStyle: 'dashed', borderRadius: '20px', bgcolor: 'transparent' }}>
    <Typography variant="h3" sx={{ fontSize: 22 }}>{title}</Typography>
    {children && <Typography sx={{ color: 'text.secondary', mt: .75 }}>{children}</Typography>}
  </Paper>;
}

/** Textarea text ⇄ a list, one item per line. */
export const linesToList = (text: string) => text.split('\n').map((line) => line.trim()).filter(Boolean);
export const listToLines = (list: string[]) => list.join('\n');

/** A whole number from a form field, or the fallback. */
export const toInt = (value: string, fallback = 0) => { const n = parseInt(value, 10); return Number.isFinite(n) ? n : fallback; };
