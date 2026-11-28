import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useContactForm } from '../../context/ContactFormContext';
import { dietaryChoices, meals } from '../../data/content';
import { SECTION_HEADING, SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { Reveal } from '../common/ScrollMotion';
import { MealCard } from './MealCard';

export function DineSection() {
  const openContact = useContactForm();
  return (
    <Box id="dine" component="section" aria-labelledby="chaba-heading" sx={{ bgcolor: '#fcecf1', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
      <Container maxWidth="xl" sx={{ py: SECTION_Y }}>
        <Reveal>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { md: 'repeat(3, minmax(0, 1fr))' },
              alignItems: 'end',
              gap: { xs: 1.5, md: 3 },
              mb: { xs: 3, md: 4 },
            }}
          >
            <Box sx={{ gridColumn: { md: 'span 2' } }}>
              <Typography variant="overline" color="primary.main">
                Chaba Restaurant
              </Typography>
              <Typography id="chaba-heading" variant="h2" sx={{ fontSize: SECTION_HEADING, lineHeight: 1.08, mt: 1 }}>
                Something delicious.
                <br />
                Something for you.
              </Typography>
            </Box>
            <Typography sx={{ maxWidth: 440, color: 'text.secondary', lineHeight: 1.75 }}>
              Under the arches and the painted flamingos, from the first coffee to dinner after a day out.
            </Typography>
          </Box>
        </Reveal>
        <Box
          component="ul"
          aria-label="Meals at Chaba"
          sx={{
            m: 0,
            p: 0,
            listStyle: 'none',
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' },
            gap: { xs: 4, sm: 3 },
          }}
        >
          {meals.map((meal) => <MealCard key={meal.name} meal={meal} />)}
        </Box>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={2}
          sx={{ mt: { xs: 3, md: 4 }, pt: 2.5, borderTop: '1px solid #e9cbd7' }}
        >
          <Stack component="ul" aria-label="Cuisine and dietary choices" direction="row" flexWrap="wrap" useFlexGap gap={0.75} sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {dietaryChoices.map((choice) => (
              <Box
                component="li"
                key={choice}
                sx={{
                  px: 1.25,
                  py: 0.5,
                  border: '1px solid #e9cbd7',
                  borderRadius: 999,
                  bgcolor: 'rgba(255,253,249,.65)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'primary.dark',
                }}
              >
                {choice}
              </Box>
            ))}
          </Stack>
          <Button
            onClick={() =>
              openContact({
                topic: 'Dining at Chaba',
                message: 'Hello Royal Pineapple! I have a question about dining at Chaba.',
                page: 'Chaba Restaurant',
              })
            }
            variant="outlined"
            startIcon={<ChatBubbleOutlineRounded />}
          >
            Ask about the menu
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
