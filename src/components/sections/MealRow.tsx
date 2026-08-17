import { Stack, Typography } from '@mui/material';
import { AnimatePresence } from 'motion/react';
import type { Meal } from '../../types';
import { MotionBox } from '../common/motionPrimitives';

interface MealRowProps {
  meal: Meal;
  active: boolean;
  first: boolean;
  onClick: () => void;
}

// One row of the menu list — the meal's name and hours are always visible; its
// description only mounts while active, and `layout` lets Motion smoothly
// reflow the rows below it as that description appears/disappears.
export function MealRow({ meal, active, first, onClick }: MealRowProps) {
  return <MotionBox layout onClick={onClick} sx={{
    cursor: 'pointer', py: { xs: 2, md: 2.75 }, borderTop: first ? 'none' : '1px solid', borderColor: 'divider',
  }}>
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={2}>
      <Typography variant="h3" sx={{ fontSize: active ? { xs: 26, md: 32 } : { xs: 20, md: 24 }, opacity: active ? 1 : .4, transition: 'font-size .35s ease, opacity .35s ease' }}>{meal.name}</Typography>
      <Typography variant="overline" sx={{ flexShrink: 0, color: 'secondary.dark', opacity: active ? 1 : .4, transition: 'opacity .35s ease' }}>{meal.hours}</Typography>
    </Stack>
    <AnimatePresence>
      {active && <MotionBox initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .3 }}>
        <Typography sx={{ mt: 1, maxWidth: 380, fontSize: 14, lineHeight: 1.6, color: 'text.secondary' }}>{meal.detail}</Typography>
      </MotionBox>}
    </AnimatePresence>
  </MotionBox>;
}
