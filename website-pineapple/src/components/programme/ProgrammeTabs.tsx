import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import DirectionsBusRounded from '@mui/icons-material/DirectionsBusRounded';
import PaymentsRounded from '@mui/icons-material/PaymentsRounded';
import PlaceRounded from '@mui/icons-material/PlaceRounded';
import { Box, Button, Stack, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type KeyboardEvent } from 'react';
import { photoAssets } from '../../data/photos';
import type { Activity } from '../../../shared/siteContent';
import { useContactForm } from '../../context/ContactFormContext';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { WEEKDAYS, useProgramme } from '../../hooks/krabiDay';
import { brand, fonts } from '../../theme';
import { ResortPhoto } from '../common/ResortPhoto';
import { PostcardFrame } from '../common/PostcardFrame';
import { Sticker } from '../common/VacationDecor';

// The 7-day programme as a week of tabs that opens on today (in Krabi time):
// the day's trip with its photo, times, how you get there and what it costs,
// and a button that asks the front desk for a place. On plum (`onDark`) on
// the homepage, on cream on /experiences.
export function ProgrammeTabs({ onDark = true }: { onDark?: boolean }) {
  const { days, today } = useProgramme();
  const { reduced } = useMotionPreference();
  const openContact = useContactForm();
  const [picked, setPicked] = useState<number | null>(null);
  const weekday = picked ?? (days.some((d) => d.weekday === today) ? today : (days[0]?.weekday ?? 1));
  const day = days.find((d) => d.weekday === weekday);
  if (!day) return null;

  // Arrow keys move along the week, as in any tab list.
  const onKey = (event: KeyboardEvent) => {
    const at = days.findIndex((d) => d.weekday === weekday);
    const next = event.key === 'ArrowRight' ? at + 1 : event.key === 'ArrowLeft' ? at - 1 : null;
    if (next === null) return;
    event.preventDefault();
    const target = days[(next + days.length) % days.length];
    setPicked(target.weekday);
    document.getElementById(`day-tab-${target.weekday}`)?.focus();
  };
  const ask = (trip: Activity) =>
    openContact({
      topic: '7-day programme & tours',
      message: `Hello Royal Pineapple! I’d like to join ${WEEKDAYS[(trip.weekday ?? 1) - 1]}’s trip, ${trip.title} (${trip.timeLabel}).`,
      page: 'The 7-day Krabi programme',
    });
  const ink = onDark ? 'common.white' : 'text.primary';

  return (
    <Box>
      <Box
        role="tablist"
        aria-label="Days of the week"
        onKeyDown={onKey}
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: { xs: 0.5, sm: 1 }, mb: { xs: 3, md: 4 } }}
      >
        {days.map((d) => {
          const selected = d.weekday === weekday;
          const isToday = d.weekday === today;
          return (
            <Box
              key={d.id}
              component="button"
              type="button"
              role="tab"
              id={`day-tab-${d.weekday}`}
              aria-selected={selected}
              aria-controls="day-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setPicked(d.weekday)}
              sx={{
                position: 'relative',
                border: 0,
                cursor: 'pointer',
                font: 'inherit',
                minHeight: { xs: 48, md: 74 },
                py: { xs: 1.25, md: 1.75 },
                px: 0.5,
                borderRadius: { xs: '14px', md: '18px' },
                bgcolor: selected ? brand.pineapple : onDark ? 'rgba(255,255,255,.08)' : 'background.paper',
                color: selected ? brand.ink : ink,
                boxShadow: selected ? '0 10px 22px rgba(0,0,0,.18)' : 'none',
                transition: 'background-color .2s ease, transform .2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  bgcolor: selected ? brand.pineapple : onDark ? 'rgba(255,255,255,.16)' : 'primary.light',
                },
              }}
            >
              <Typography
                component="span"
                sx={{ display: 'block', fontFamily: fonts.playful, fontSize: { xs: 15, md: 22 }, lineHeight: 1.1 }}
              >
                {WEEKDAYS[(d.weekday ?? 1) - 1].slice(0, 3)}
              </Typography>
              <Typography
                component="span"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  fontSize: 12,
                  mt: 0.4,
                  opacity: 0.85,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {d.kicker}
              </Typography>
              {isToday && (
                <Box
                  component="span"
                  sx={{
                    position: 'absolute',
                    top: { xs: -8, md: -10 },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    px: 0.9,
                    py: 0.1,
                    borderRadius: 999,
                    bgcolor: brand.pink,
                    color: brand.ink,
                    fontSize: { xs: 9.5, md: 10.5 },
                    fontWeight: 800,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Today
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Box id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${weekday}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={day.id}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.1fr) minmax(0,1fr)' },
                gap: { xs: 4, md: 6 },
                alignItems: 'center',
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <PostcardFrame>
                  <ResortPhoto image={day.images[0]} alt={`${day.title}: ${day.place ?? ''}`} sizes="(max-width: 900px) 92vw, 52vw" />
                </PostcardFrame>
                {day.images[0] === photoAssets.daySunday.src && (
                  <Box
                    component="a"
                    href="https://horoscope.trueid.net/detail/1g4AeeZxK4eL"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'block',
                      mt: 1.5,
                      color: ink,
                      opacity: 0.7,
                      fontSize: 10,
                      textAlign: 'right',
                      textUnderlineOffset: '3px',
                    }}
                  >
                    Wat Panurat Prachasan · Photo via TrueID
                  </Box>
                )}
                {day.freeBus && (
                  <Sticker
                    color={brand.pineapple}
                    rotate={-10}
                    sx={{
                      position: 'absolute',
                      right: { xs: 8, md: -18 },
                      top: { xs: -22, md: -30 },
                      width: { xs: 88, md: 104 },
                      height: { xs: 88, md: 104 },
                      fontSize: { xs: 19, md: 22 },
                    }}
                  >
                    Free
                    <br />
                    bus!
                  </Sticker>
                )}
              </Box>
              <Box sx={{ color: ink, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="overline" sx={{ color: onDark ? brand.pineapple : 'primary.main' }}>
                  {WEEKDAYS[(day.weekday ?? 1) - 1]} · {day.kicker}
                </Typography>
                <Typography variant="h3" sx={{ fontSize: { xs: 32, md: 44 }, lineHeight: 1.08, mt: 1 }}>
                  {day.title}
                </Typography>
                <Typography
                  sx={{
                    mt: 2,
                    lineHeight: 1.8,
                    opacity: onDark ? 0.9 : 1,
                    color: onDark ? 'inherit' : 'text.secondary',
                    maxWidth: 520,
                    mx: { xs: 'auto', md: 0 },
                  }}
                >
                  {day.detail}
                </Typography>
                <Stack
                  spacing={1.1}
                  sx={{
                    mt: 3,
                    alignItems: { xs: 'center', md: 'flex-start' },
                    '& svg': { fontSize: 19, flexShrink: 0, color: onDark ? brand.pineapple : 'primary.main' },
                  }}
                >
                  {[
                    [AccessTimeRounded, day.timeLabel],
                    [PlaceRounded, day.place],
                    [DirectionsBusRounded, day.transport],
                    [PaymentsRounded, day.priceNote],
                  ]
                    .filter(([, text]) => text)
                    .map(([Icon, text]) => {
                      const I = Icon as typeof PlaceRounded;
                      return (
                        <Stack key={text as string} direction="row" spacing={1.2} alignItems="center">
                          <I />
                          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{text as string}</Typography>
                        </Stack>
                      );
                    })}
                </Stack>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems="center"
                  sx={{ mt: 3.5, justifyContent: { xs: 'center', md: 'flex-start' } }}
                >
                  <Button onClick={() => ask(day)} variant="contained" color="secondary">
                    {day.ctaLabel || 'Book this trip'}
                  </Button>
                  <Typography sx={{ fontSize: 13, opacity: 0.85 }}>Book at the front desk at least an hour before.</Typography>
                </Stack>
              </Box>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
