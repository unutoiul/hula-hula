import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Stack, Typography } from '@mui/material';
import type { Meal } from '../../types';

export function MealRow({ meal, active, onClick }: { meal: Meal; active: boolean; onClick: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-pressed={active}
      sx={{
        textAlign: 'left',
        width: '100%',
        minWidth: 0,
        cursor: 'pointer',
        p: { xs: 2, lg: 2.25 },
        bgcolor: active ? 'background.paper' : 'rgba(255,253,249,.4)',
        color: 'text.primary',
        border: '1px solid',
        borderColor: active ? '#cb88a3' : '#ead4df',
        borderRadius: '16px',
        transition: 'background-color .2s, border-color .2s',
        '&:hover': { bgcolor: 'background.paper', borderColor: 'primary.main' },
        '&:focus-visible': { outlineOffset: 3 },
      }}
    >
      <Stack component="span" direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Box component="span" sx={{ minWidth: 0 }}>
          <Typography
            component="span"
            variant="overline"
            sx={{ display: 'block', fontSize: 10, color: active ? 'primary.main' : 'text.secondary' }}
          >
            {meal.hours}
          </Typography>
          <Typography
            component="span"
            variant="h3"
            sx={{
              display: 'block',
              fontSize: { xs: 26, lg: 29 },
              lineHeight: 1.15,
              mt: 0.5,
              color: active ? 'primary.main' : 'text.primary',
            }}
          >
            {meal.name}
          </Typography>
        </Box>
        <Box
          component="span"
          aria-hidden
          sx={{
            width: 32,
            height: 32,
            bgcolor: active ? 'secondary.main' : 'transparent',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ArrowOutward sx={{ fontSize: 18 }} />
        </Box>
      </Stack>
      <Typography component="span" sx={{ display: 'block', mt: 1, fontSize: 13, lineHeight: 1.65, color: 'text.secondary', maxWidth: 460 }}>
        {meal.detail}
      </Typography>
    </Box>
  );
}
