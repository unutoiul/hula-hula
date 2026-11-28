import EventRounded from '@mui/icons-material/EventRounded';
import ScheduleRounded from '@mui/icons-material/ScheduleRounded';
import West from '@mui/icons-material/West';
import { Box, Button, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { useEffect, type ReactElement, type ReactNode } from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { linkClick, useLocation } from '../router';
import { SITE_NAME } from '../seo';
import { brand } from '../theme';
import { EventGallery } from '../components/common/EventGallery';
import { mediaKind } from '../components/common/EventMedia';
import { Reveal } from '../components/common/ScrollMotion';
import { eventAt, eventDatesLong, eventHighlight, useEventAction } from '../components/sections/cmsCards';
import { HighlightCard } from '../components/sections/HighlightsSection';
import { PageIntro, PageShell } from './PageShell';

const back = { href: '/#whats-on', onClick: linkClick('/#whats-on') };

/** The page's title and search snippet once the event is known (PageMetadata sets the general ones first). */
function useEventHead(title: string | null, summary: string) {
  useEffect(() => {
    if (!title) return;
    document.title = `${title} — What’s on at ${SITE_NAME}`;
    const description = (summary || `${title} at ${SITE_NAME}, Krabi Town.`).replace(/\s+/g, ' ').slice(0, 160);
    document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
    document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.head.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  }, [title, summary]);
}

// /events/<name> — one event from /admin: when it is, the whole story, its
// button (ask us, book, a link), every photo and video, and what else is on.
// Events disappear once their last day has passed; an old link then says so.
export function EventPage() {
  const { pathname } = useLocation();
  const { events, loaded } = useSiteContent();
  const event = eventAt(pathname, events);
  const action = useEventAction(event);
  useEventHead(event?.title ?? null, event?.summary ?? '');

  if (!event)
    return (
      <PageShell>
        <Container maxWidth="sm" sx={{ py: { xs: 10, md: 14 }, textAlign: 'center' }}>
          {!loaded ? (
            <CircularProgress aria-label="Loading" />
          ) : (
            <>
              <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 44 } }}>
                This one’s over — or moved
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1.5, lineHeight: 1.8 }}>
                The event may have finished, or its link has changed. Here’s what’s happening at the hotel now.
              </Typography>
              <Button {...(events.length ? back : { href: '/', onClick: linkClick('/') })} variant="contained" sx={{ mt: 3 }}>
                {events.length ? 'See what’s on' : 'Back to the hotel'}
              </Button>
            </>
          )}
        </Container>
      </PageShell>
    );

  const card = eventHighlight(event);
  const when = eventDatesLong(event);
  const [lead, ...more] = (event.summary || '')
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean);
  // The cover leads the page, so the gallery shows the rest.
  const gallery = (card.media ?? []).filter((src) => src !== card.image);
  const videos = gallery.filter((src) => mediaKind(src) !== 'image').length;
  const others = events
    .filter((other) => other.id !== event.id)
    .slice(0, 3)
    .map(eventHighlight);

  return (
    <PageShell>
      <PageIntro
        eyebrow="What’s on at Royal Pineapple"
        title={event.title}
        description={lead ?? ''}
        image={card.image}
        imageAlt={event.title}
        crumbs={[{ label: 'What’s on', href: '/#whats-on' }, { label: event.title }]}
      >
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ width: '100%' }}>
          <Fact icon={<EventRounded />}>{when ?? 'Ongoing'}</Fact>
          {event.timeLabel && <Fact icon={<ScheduleRounded />}>{event.timeLabel}</Fact>}
        </Stack>
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
      </PageIntro>

      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 9 } }}>
        {more.length > 0 && (
          <Reveal sx={{ maxWidth: 760, mb: { xs: 6, md: 9 } }}>
            <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 42 } }}>
              About the event
            </Typography>
            {more.map((text, i) => (
              <Typography
                key={i}
                sx={{
                  mt: 2,
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
          </Reveal>
        )}

        {gallery.length > 0 && (
          <Box component="section" aria-labelledby="event-gallery" sx={{ mb: { xs: 6, md: 9 } }}>
            <Typography variant="overline" color="primary.main">
              A little look
            </Typography>
            <Typography id="event-gallery" variant="h2" sx={{ fontSize: { xs: 32, md: 42 }, mt: 1, mb: { xs: 3, md: 4 } }}>
              {videos ? 'Photos & videos' : 'Photos'}
            </Typography>
            <EventGallery title={event.title} media={gallery} />
          </Box>
        )}

        {others.length > 0 && (
          <Box component="section" aria-labelledby="more-events">
            <Typography variant="overline" color="primary.main">
              While you’re here
            </Typography>
            <Typography id="more-events" variant="h2" sx={{ fontSize: { xs: 32, md: 42 }, mt: 1, mb: { xs: 3, md: 4 } }}>
              More happening
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
                gap: { xs: '28px', sm: '25px' },
                maxWidth: { xs: 420, sm: 'none' },
                mx: { xs: 'auto', sm: 0 },
              }}
            >
              {others.map((item, i) => (
                <Box key={item.id} sx={{ display: 'flex', minWidth: 0 }}>
                  <HighlightCard item={item} alternate={i % 2 === 1} />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </PageShell>
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
        bgcolor: brand.blush,
        color: brand.plum,
        fontWeight: 700,
        fontSize: 14,
        border: '1px solid #e9c6d5',
        '& svg': { fontSize: 18, color: brand.royal },
      }}
    >
      {icon}
      <span>{children}</span>
    </Stack>
  );
}
