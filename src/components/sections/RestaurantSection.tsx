import { Box, Container, Stack, Typography } from '@mui/material';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import type { Meal } from '../../types';
import { MetaLabel } from '../common/MetaLabel';
import { MotionBox } from '../common/motionPrimitives';
import { MealRow } from './MealRow';

// The restaurant's dish photo crossfades to match whichever meal is active —
// cycling on its own every 5s, or instantly on click. One image, one story,
// always in sync, rather than a static plate photo bolted on beside the copy.
function RestaurantShowcase({ meals }: { meals: Meal[] }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const id = setInterval(() => setActive((i) => (i + 1) % meals.length), 5000);
    return () => clearInterval(id);
  }, [meals.length, reduceMotion]);

  const meal = meals[active];

  return <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 7 }} alignItems="stretch">
    <Box sx={{ position: 'relative', flex: { md: '1 1 48%' }, minHeight: { xs: 260, md: 460 }, overflow: 'hidden' }}>
      <AnimatePresence>
        <MotionBox key={meal.name}
          initial={{ opacity: 0, scale: 1.07 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? .2 : 1, ease: [.22, 1, .36, 1] }}
          sx={{ position: 'absolute', inset: 0, backgroundImage: `url(${meal.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      </AnimatePresence>
    </Box>
    <Box sx={{ flex: { md: '1 1 52%' } }}>
      {meals.map((m, i) => <MealRow key={m.name} meal={m} active={i === active} first={i === 0} onClick={() => setActive(i)} />)}
    </Box>
  </Stack>;
}

export function RestaurantSection({ meals }: { meals: Meal[] }) {
  return <Container id="dine" maxWidth="xl" sx={{ py: SECTION_Y, scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Box sx={{ maxWidth: 620, mb: { xs: 6, md: 8 } }}>
      <MetaLabel>02 / Restaurant</MetaLabel>
      <Typography variant="h2" sx={{ mt: 2, fontSize: { xs: 40, md: 68 }, lineHeight: .95 }}>Krabi on a plate,<br /><Box component="em">morning to night.</Box></Typography>
      <Typography sx={{ mt: 3, maxWidth: 420, fontSize: 16, lineHeight: 1.6, color: 'text.secondary' }}>Thai flavors, fresh from Krabi's markets and fishing boats — cooked slow, served open-air above the garden.</Typography>
    </Box>
    <RestaurantShowcase meals={meals} />
  </Container>;
}
