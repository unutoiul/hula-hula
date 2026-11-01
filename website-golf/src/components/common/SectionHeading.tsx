import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function SectionHeading({ eyebrow, title, description, action, dark = false }: { eyebrow: string; title: string; description?: string; action?: ReactNode; dark?: boolean }) {
  return <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'flex-end' }} justifyContent="space-between" gap={2.5} sx={{ mb: { xs: 3, md: 4 } }}><Box sx={{ maxWidth: 680 }}><Typography variant="overline" sx={{ color: dark ? 'secondary.main' : 'success.dark' }}>{eyebrow}</Typography><Typography variant="h2" sx={{ mt: 1, fontSize: { xs: 34, md: 46 }, lineHeight: 1.1, textWrap: 'balance', color: dark ? 'white' : 'primary.dark' }}>{title}</Typography>{description && <Typography sx={{ mt: 1.5, lineHeight: 1.8, color: dark ? 'rgba(255,255,255,.8)' : 'text.secondary' }}>{description}</Typography>}</Box>{action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}</Stack>;
}
