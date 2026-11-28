import EventRounded from '@mui/icons-material/EventRounded';
import ScheduleRounded from '@mui/icons-material/ScheduleRounded';
import West from '@mui/icons-material/West';
import { Box, Breadcrumbs, Button, CircularProgress, Container, Link, Stack, Typography } from '@mui/material';
import { useEffect, type ReactElement, type ReactNode } from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { linkClick, useLocation } from '../router';
import { SITE_NAME } from '../seo';
import { EventGallery } from '../components/common/EventGallery';
import { mediaKind } from '../components/common/EventMedia';
import { ResortPhoto } from '../components/common/ResortPhoto';
import { Reveal, ScrollTilt } from '../components/common/ScrollMotion';
import { Sticker } from '../components/common/VacationDecor';
import { eventAt, eventDatesLong, eventHighlight, useEventAction } from '../components/sections/cmsCards';
import { HighlightCard } from '../components/sections/HighlightsSection';

const back = { href: '/#whats-on', onClick: linkClick('/#whats-on') };

/** The page's title and search snippet once the event is known (PageMetadata sets the general ones first). */
function useEventHead(title: string | null, summary: string) {
  useEffect(() => {
    if (!title) return;
    document.title = `${title} — What’s on at ${SITE_NAME}`;
    const description = (summary || `${title} at ${SITE_NAME}, Ao Nang, Krabi.`).replace(/\s+/g, ' ').slice(0, 160);
    document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
    document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.head.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  }, [title, summary]);
}

// /events/<name> — one event from /admin: when it is, the whole story, its
// button (ask us, book, a link), every photo and video, and what else is on.
// Events disappear once their last day has passed; an old link then says so.
export default function EventPage() {
  const { pathname } = useLocation();
  const { events, loaded } = useSiteContent();
  const event = eventAt(pathname, events);
  const action = useEventAction(event);
  useEventHead(event?.title ?? null, event?.summary ?? '');

  if (!event)
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 10, md: 14 }, textAlign: 'center' }}>
        {!loaded ? (
          <CircularProgress aria-label="Loading" />
        ) : (
          <>
            <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 44 } }}>
              This one’s over — or moved
            </Typography>
            <Typography sx={{ color: 'text.secondary', mt: 1.5, lineHeight: 1.8 }}>
              The event may have finished, or its link has changed. Here’s what’s happening at the resort now.
            </Typography>
            <Button {...(events.length ? back : { href: '/', onClick: linkClick('/') })} variant="contained" sx={{ mt: 3 }}>
              {events.length ? 'See what’s on' : 'Back to the resort'}
            </Button>
          </>
        )}
      </Container>
    );

  const card = eventHighlight(event);
  const when = eventDatesLong(event);
  const paragraphs = (event.summary || '')
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean);
  // The cover leads the page, so the gallery shows the rest (or everything, if the cover is a stand-in).
  const gallery = (card.media ?? []).filter((src) => src !== card.image);
  const videos = gallery.filter((src) => mediaKind(src) !== 'image').length;
  const others = events
    .filter((other) => other.id !== event.id)
    .slice(0, 3)
    .map(eventHighlight);

  return (
    <>
      <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 7, md: 10 } }}>
        <Breadcrumbs
          aria-label="Breadcrumb"
          sx={{
            mb: { xs: 3, md: 4 },
            fontSize: 13,
            color: 'text.secondary',
            '& a': { display: 'inline-flex', alignItems: 'center', minHeight: 44 },
          }}
        >
          <Link href="/" onClick={linkClick('/')} color="inherit" underline="hover">
            Hula Hula Resort
          </Link>
          <Link {...back} color="inherit" underline="hover">
            What’s on
          </Link>
          <Typography
            aria-current="page"
            sx={{
              fontSize: 'inherit',
              maxWidth: { xs: 180, sm: 'none' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {event.title}
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
            gap: { xs: 5, md: 8 },
            alignItems: 'center',
          }}
        >
          <Reveal sx={{ minWidth: 0 }}>
            <Typography variant="overline" sx={{ display: 'block', color: 'success.main' }}>
              What’s on at Hula Hula
            </Typography>
            <Typography
              variant="h1"
              sx={{
                mt: 1.5,
                fontSize: { xs: 'clamp(2.2rem, 9vw, 3rem)', md: 'clamp(2.75rem, 4.4vw, 4rem)' },
                lineHeight: 1.05,
                overflowWrap: 'anywhere',
              }}
            >
              {event.title}
            </Typography>
            <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 3 }}>
              <Fact icon={<EventRounded />}>{when ?? 'Ongoing'}</Fact>
              {event.timeLabel && <Fact icon={<ScheduleRounded />}>{event.timeLabel}</Fact>}
            </Stack>
            {paragraphs.map((text, i) => (
              <Typography
                key={i}
                sx={{
                  mt: i ? 2 : 3,
                  fontSize: { xs: 16, md: 17 },
                  lineHeight: 1.85,
                  color: 'text.secondary',
                  whiteSpace: 'pre-line',
                  overflowWrap: 'anywhere',
                }}
              >
                {text}
              </Typography>
            ))}
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ mt: 4, alignItems: { xs: 'stretch', sm: 'center' } }}>
              {action && (
                <Button
                  variant="contained"
                  size="large"
                  endIcon={action.icon}
                  {...(action.onClick
                    ? { onClick: action.onClick }
                    : { href: action.href, ...(action.href?.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {}) })}
                >
                  {action.label}
                </Button>
              )}
              <Button {...back} color="inherit" startIcon={<West />}>
                All events
              </Button>
            </Stack>
          </Reveal>
          <Reveal delay={0.1} sx={{ position: 'relative', pb: 3 }}>
            <ScrollTilt amount={-3}>
              <Box
                sx={{
                  aspectRatio: '5 / 4',
                  border: '8px solid white',
                  borderRadius: '24px 90px 24px 24px',
                  overflow: 'hidden',
                  transform: 'rotate(-2deg)',
                  boxShadow: '0 18px 40px rgba(18,78,57,.12)',
                  bgcolor: 'white',
                }}
              >
                <ResortPhoto image={card.image} alt={event.title} eager sizes="(max-width: 900px) 92vw, 46vw" />
              </Box>
            </ScrollTilt>
            {card.tag && (
              <Sticker color="#f9f70c" sx={{ position: 'absolute', left: { xs: 8, md: -18 }, bottom: 0 }}>
                {card.tag}
              </Sticker>
            )}
          </Reveal>
        </Box>

        {gallery.length > 0 && (
          <Box component="section" aria-labelledby="event-gallery" sx={{ mt: { xs: 8, md: 11 } }}>
            <Reveal>
              <Typography variant="overline" sx={{ display: 'block' }}>
                A little look
              </Typography>
              <Typography
                id="event-gallery"
                variant="h2"
                sx={{ fontSize: { xs: 36, md: 48 }, lineHeight: 1.05, mt: 1, mb: { xs: 3, md: 4 } }}
              >
                {videos ? 'Photos & videos' : 'Photos'}
              </Typography>
            </Reveal>
            <EventGallery title={event.title} media={gallery} />
          </Box>
        )}

        {others.length > 0 && (
          <Box component="section" aria-labelledby="more-events" sx={{ mt: { xs: 8, md: 11 } }}>
            <Typography variant="overline" sx={{ display: 'block' }}>
              While you’re here
            </Typography>
            <Typography id="more-events" variant="h2" sx={{ fontSize: { xs: 36, md: 48 }, lineHeight: 1.05, mt: 1, mb: { xs: 3, md: 4 } }}>
              More happening
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
                gap: 3,
              }}
            >
              {others.map((item) => (
                <Box key={item.id} sx={{ display: 'flex' }}>
                  <HighlightCard item={item} />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
}

function Fact({ icon, children }: { icon: ReactElement; children: ReactNode }) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: 99,
        bgcolor: '#e7f4cc',
        color: 'primary.dark',
        fontWeight: 700,
        fontSize: 14,
        '& svg': { fontSize: 18, color: 'success.main' },
      }}
    >
      {icon}
      <span>{children}</span>
    </Stack>
  );
}
