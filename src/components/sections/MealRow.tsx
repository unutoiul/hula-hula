import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Stack, Typography } from '@mui/material';
import type { Meal } from '../../types';

export function MealRow({ meal, active, first, onClick }: { meal: Meal; active: boolean; first: boolean; onClick: () => void }) {
  return <Box component="button" type="button" onClick={onClick} aria-pressed={active} sx={{ textAlign: 'left', width: '100%', cursor: 'pointer', py: 2.5, px: 0, bgcolor: 'transparent', color: 'text.primary', border: 'none', borderTop: first ? 'none' : '1px solid rgba(23,60,44,.18)' }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
      <Box><Typography variant="overline" sx={{ fontSize: 10, color: active ? 'primary.main' : 'text.secondary' }}>{meal.hours}</Typography><Typography variant="h3" sx={{ fontSize: { xs: 25, md: 32 }, lineHeight: 1.15, mt: .5, color: active ? 'primary.main' : 'text.primary' }}>{meal.name}</Typography></Box>
      <Box sx={{ width: 35, height: 35, bgcolor: active ? 'secondary.main' : 'transparent', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ArrowOutward sx={{ fontSize: 21 }} /></Box>
    </Stack>
    {active && <Typography sx={{ mt: 1.5, fontSize: 14, lineHeight: 1.7, color: 'text.secondary', maxWidth: 390 }}>{meal.detail}</Typography>}
  </Box>;
}
