import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useContactForm } from '../../context/ContactFormContext';
import { dietaryChoices, meals } from '../../data/content';
import { SECTION_HEADING, SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { ResortPhoto } from '../common/ResortPhoto';
import { PostcardFrame } from '../common/PostcardFrame';
import { Reveal } from '../common/ScrollMotion';
import { MealRow } from './MealRow';

// Chaba, the arched dining room: breakfast, lunch and dinner, the photo
// following whichever meal is picked.
export function DineSection() {
  const openContact = useContactForm();
  const [active, setActive] = useState(0);
  return (
    <Box id="dine" component="section" aria-labelledby="chaba-heading" sx={{ bgcolor: '#fcecf1', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
      <Container maxWidth="xl" sx={{ py: SECTION_Y }}>
        <Reveal>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,1.05fr) minmax(0,1fr)' },
              alignItems: 'end',
              gap: { xs: 2.5, lg: 6 },
              mb: { xs: 4, md: 5 },
              textAlign: { xs: 'center', lg: 'left' },
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="overline" color="primary.main">
                Chaba Restaurant
              </Typography>
              <Typography id="chaba-heading" variant="h2" sx={{ fontSize: SECTION_HEADING, lineHeight: 1.08, mt: 1.5 }}>
                Something delicious.
                <br />
                Something for you.
              </Typography>
            </Box>
            <Typography sx={{ maxWidth: 440, mx: { xs: 'auto', lg: 0 }, color: 'text.secondary', lineHeight: 1.8 }}>
              Under the arches and the painted flamingos, from the first coffee to dinner after a day out.
            </Typography>
          </Box>
        </Reveal>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,1.05fr) minmax(0,1fr)' },
            alignItems: 'stretch',
            gap: { xs: 4, lg: 6 },
          }}
        >
          <Reveal
            sx={{ minWidth: 0, width: '100%', maxWidth: { xs: 680, lg: 'none' }, mx: 'auto', display: 'flex', flexDirection: 'column' }}
          >
            <PostcardFrame
              sx={{
                aspectRatio: { xs: '4 / 3', lg: 'auto' },
                flex: { lg: 1 },
                minHeight: { lg: 420 },
                boxShadow: '0 12px 26px rgba(90,36,72,.07)',
              }}
            >
              <ResortPhoto
                image={meals[active].image}
                alt={`Chaba Restaurant at ${meals[active].name.toLowerCase()}`}
                sizes="(max-width: 1200px) 92vw, 50vw"
              />
            </PostcardFrame>
            <Stack
              direction="row"
              flexWrap="wrap"
              useFlexGap
              justifyContent="space-between"
              gap={1}
              sx={{ px: 1, pt: 1.5, color: 'text.secondary', fontSize: 11, letterSpacing: '.04em' }}
            >
              <span>Chaba Restaurant · {meals[active].name}</span>
              <span>{meals[active].hours}</span>
            </Stack>
          </Reveal>
          <Reveal delay={0.12} sx={{ minWidth: 0 }}>
            <Box
              role="group"
              aria-label="Choose a meal to view its restaurant photograph"
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3,minmax(0,1fr))', lg: 'minmax(0,1fr)' },
                gap: 1.25,
              }}
            >
              {meals.map((meal, i) => (
                <MealRow key={meal.name} meal={meal} active={i === active} onClick={() => setActive(i)} />
              ))}
            </Box>
            <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75} sx={{ mt: 2.5 }}>
              {dietaryChoices.map((choice) => (
                <Box
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
              sx={{ mt: 2.5 }}
            >
              Ask about the menu
            </Button>
          </Reveal>
        </Box>
      </Container>
    </Box>
  );
}
