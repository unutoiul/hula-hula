import { Box, Typography } from '@mui/material';
import type { Meal } from '../../types';
import { PostcardFrame } from '../common/PostcardFrame';
import { ResortPhoto } from '../common/ResortPhoto';

export function MealCard({ meal }: { meal: Meal }) {
  return (
    <Box
      component="li"
      sx={{
        display: 'grid',
        gridTemplateColumns: { sm: 'minmax(0, 1fr) minmax(0, 1fr)', md: 'minmax(0, 1fr)' },
        alignContent: 'start',
        alignItems: 'center',
        gap: { xs: 1.5, sm: 3, md: 2 },
      }}
    >
      <PostcardFrame sx={{ aspectRatio: '3 / 2' }}>
        <ResortPhoto
          image={meal.image}
          alt={meal.imageAlt}
          sizes="(min-width: 1536px) 448px, (min-width: 900px) 31vw, (min-width: 600px) 46vw, 94vw"
          sx={{ objectPosition: meal.objectPosition ?? 'center' }}
        />
      </PostcardFrame>
      <Box sx={{ px: { xs: 1, sm: 0, md: 1 } }}>
        <Typography variant="h3" sx={{ fontSize: { xs: 28, lg: 32 }, color: 'primary.dark' }}>
          {meal.name}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, fontWeight: 700, color: 'primary.dark' }}>
          {meal.hours}
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 15, lineHeight: 1.65, color: 'text.secondary' }}>
          {meal.detail}
        </Typography>
      </Box>
    </Box>
  );
}
