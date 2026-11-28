import CheckRounded from '@mui/icons-material/CheckRounded';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useContactForm } from '../context/ContactFormContext';
import { celebrations, recommendedDay, tours } from '../data/content';
import { photoAssets as p } from '../data/photos';
import { WEEKDAYS, useProgramme } from '../hooks/krabiDay';
import { brand, fonts } from '../theme';
import { ProgrammeTabs } from '../components/programme/ProgrammeTabs';
import { ResortPhoto } from '../components/common/ResortPhoto';
import { PostcardFrame } from '../components/common/PostcardFrame';
import { PageIntro, PageShell } from './PageShell';

// /experiences — the whole 7-day programme (today first), the hotel's
// recommended Koh Klang day, the island tours from the tour desk, and the
// treats to add to a stay.
export function ExperiencesPage() {
  const openContact = useContactForm();
  const { days, today } = useProgramme();
  const ask = (topic: string, message: string) => openContact({ topic, message, page: 'Experiences' });
  return (
    <PageShell>
      <PageIntro
        eyebrow="Activities & experiences"
        title="Make your stay more than a room."
        image={p.dayMonday.src}
        imageAlt="Guests painting batik on Koh Klang"
        description="A different trip every day of the week — local culture, Thai food, temples, sport, shopping and the beach — plus the island tours from our tour desk and a few treats for special occasions."
        crumbs={[{ label: 'Explore Krabi', href: '/#programme' }, { label: 'Experiences' }]}
      >
        <Button href="#week" variant="contained">
          See this week
        </Button>
        <Button
          onClick={() => ask('7-day programme & tours', 'Hello Royal Pineapple! I have a question about your trips.')}
          variant="outlined"
          startIcon={<ChatBubbleOutlineRounded />}
        >
          Ask the tour desk
        </Button>
      </PageIntro>

      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 9 } }}>
        <Box id="week" sx={{ scrollMarginTop: 120 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 48 } }}>
            One stay. Seven ways to see Krabi.
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1.5, mb: 4, maxWidth: 640, lineHeight: 1.8 }}>
            Some trips are free with the hotel bus; some have a small charge for the boat or the car. Book at the front desk at least an
            hour before.
          </Typography>
          <ProgrammeTabs onDark={false} />
        </Box>

        {/* The week at a glance, today first. */}
        <Box
          component="ol"
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
            mt: { xs: 6, md: 8 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))', lg: 'repeat(4,minmax(0,1fr))' },
            gap: 2,
          }}
        >
          {[...days.filter((d) => (d.weekday ?? 0) >= today), ...days.filter((d) => (d.weekday ?? 0) < today)].map((d) => (
            <Box
              component="li"
              key={d.id}
              sx={{
                borderRadius: '20px',
                overflow: 'hidden',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: d.weekday === today ? 'primary.main' : 'divider',
              }}
            >
              <Box sx={{ height: 150, position: 'relative' }}>
                <ResortPhoto image={d.images[0]} alt="" sizes="(max-width: 600px) 92vw, 25vw" />
                <Box
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: 12,
                    px: 1.2,
                    py: 0.35,
                    borderRadius: 999,
                    bgcolor: d.weekday === today ? brand.pink : 'rgba(255,253,249,.94)',
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {d.weekday === today ? `Today · ${WEEKDAYS[(d.weekday ?? 1) - 1]}` : WEEKDAYS[(d.weekday ?? 1) - 1]}
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontFamily: fonts.playful, fontSize: 19, lineHeight: 1.2 }}>{d.title}</Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
                  {d.timeLabel} · {d.priceNote}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            mt: { xs: 8, md: 11 },
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) minmax(0,1.1fr)' },
            gap: { xs: 4, md: 7 },
            alignItems: 'center',
          }}
        >
          <PostcardFrame sx={{ aspectRatio: '4 / 3' }}>
            <ResortPhoto
              image={p.khanapNam.src}
              alt="Khao Khanap Nam, the twin limestone peaks on the Krabi River"
              sizes="(max-width: 900px) 92vw, 46vw"
            />
          </PostcardFrame>
          <Box>
            <Typography variant="overline" color="primary.main">
              Recommended by the hotel
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, lineHeight: 1.08, mt: 1 }}>
              {recommendedDay.title}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { sm: 'repeat(2,minmax(0,1fr))' }, gap: 3, mt: 3 }}>
              {[
                { label: 'Morning', ...recommendedDay.morning },
                { label: 'Evening', ...recommendedDay.evening, note: undefined },
              ].map((part) => (
                <Box key={part.label}>
                  <Typography sx={{ fontWeight: 800 }}>
                    {part.label}{' '}
                    <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      {part.time}
                    </Box>
                  </Typography>
                  <Stack component="ul" spacing={0.75} sx={{ listStyle: 'none', p: 0, m: 0, mt: 1.25 }}>
                    {part.items.map((i) => (
                      <Stack component="li" key={i} direction="row" spacing={1}>
                        <CheckRounded sx={{ fontSize: 18, color: 'primary.main', mt: '2px' }} />
                        <Typography sx={{ fontSize: 14.5 }}>{i}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  {part.note && (
                    <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 1.25, lineHeight: 1.6 }}>{part.note}</Typography>
                  )}
                </Box>
              ))}
            </Box>
            <Button
              onClick={() => ask('7-day programme & tours', `Hello Royal Pineapple! I’d like to book the ${recommendedDay.title} day.`)}
              variant="contained"
              sx={{ mt: 3 }}
            >
              Book this day
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 8, md: 11 } }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 } }}>
            Island tours from the tour desk
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1.5, maxWidth: 620, lineHeight: 1.8 }}>
            The front desk books the island trips Krabi is famous for. Ask for today’s boats and prices.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,minmax(0,1fr))' }, gap: 2.5, mt: 3 }}>
            {tours.map((t) => (
              <Box
                key={t.title}
                component="button"
                type="button"
                onClick={() => ask('7-day programme & tours', `Hello Royal Pineapple! I’d like to book the ${t.title} tour.`)}
                sx={{
                  p: 0,
                  border: 0,
                  textAlign: 'left',
                  cursor: 'pointer',
                  bgcolor: 'transparent',
                  color: 'inherit',
                  font: 'inherit',
                  '&:hover img': { transform: 'scale(1.04)' },
                  '& img': { transition: 'transform .5s ease' },
                }}
              >
                <PostcardFrame sx={{ aspectRatio: '16 / 10' }}>
                  <ResortPhoto image={t.image} alt="" sizes="(max-width: 900px) 92vw, 30vw" />
                </PostcardFrame>
                <Typography sx={{ fontFamily: fonts.playful, fontSize: 24, mt: 1.5 }}>{t.title}</Typography>
                <Typography sx={{ fontSize: 14.5, color: 'text.secondary' }}>{t.detail}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          id="celebrate"
          sx={{ mt: { xs: 8, md: 11 }, p: { xs: 3, md: 5 }, borderRadius: '32px', bgcolor: 'primary.light', scrollMarginTop: 120 }}
        >
          <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 } }}>
            Make a moment of it
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))', lg: 'repeat(4,minmax(0,1fr))' },
              gap: 2,
              mt: 3,
            }}
          >
            {celebrations.map((c) => (
              <Box key={c.title} sx={{ p: 2.5, borderRadius: '20px', bgcolor: 'background.paper' }}>
                <Typography sx={{ fontFamily: fonts.playful, fontSize: 22 }}>{c.title}</Typography>
                <Typography sx={{ fontSize: 14.5, color: 'text.secondary', mt: 0.75, lineHeight: 1.6 }}>{c.detail}</Typography>
              </Box>
            ))}
          </Box>
          <Button
            onClick={() =>
              ask('Floating breakfast & celebrations', 'Hello Royal Pineapple! We’re celebrating during our stay and would love …')
            }
            variant="contained"
            startIcon={<ChatBubbleOutlineRounded />}
            sx={{ mt: 3 }}
          >
            Plan a surprise
          </Button>
        </Box>
      </Container>
    </PageShell>
  );
}
