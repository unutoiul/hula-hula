import CheckRounded from '@mui/icons-material/CheckRounded';
import EventAvailableRounded from '@mui/icons-material/EventAvailableRounded';
import PhotoLibraryRounded from '@mui/icons-material/PhotoLibraryRounded';
import { Box, Button, ButtonBase, Container, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { linkClick } from '../../router';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { fonts } from '../../theme';
import { DragCarousel } from '../common/DragCarousel';
import { mediaKind } from '../common/EventMedia';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal } from '../common/ScrollMotion';
import { useEventHighlights, useOfferHighlights, type Highlight } from './cmsCards';

const PERKS_SHOWN = 3;

const COPY = {
  offer: {
    id: 'offers',
    kicker: 'Offers & little extras',
    itemLabel: 'offer',
    heading: (
      <>
        Good deals.
        <br />
        <Box component="span" color="success.main">
          Good times.
        </Box>
      </>
    ),
    intro: 'Special prices and little extras on your stay, while they last.',
  },
  event: {
    id: 'whats-on',
    kicker: 'What’s on at Hula Hula',
    itemLabel: 'event',
    heading: (
      <>
        What’s on.
        <br />
        <Box component="span" color="success.main">
          Come and join in.
        </Box>
      </>
    ),
    intro: 'A few good things happening at the resort while you’re here. Open one for the photos, videos and details.',
  },
} as const;

// The running offers, or the running events, from /admin as compact cards —
// the discount or date on the photo, what's included, the small print and the
// button (an event's opens its own page). While they all fit beside the
// heading (up to two on tablets, three on desktops) they sit in one row next
// to it; more become a swipeable row, four to a screen. Hidden when nothing of
// that kind is running.
export function HighlightsSection({ kind }: { kind: 'offer' | 'event' }) {
  const offers = useOfferHighlights();
  const events = useEventHighlights();
  const items = kind === 'offer' ? offers : events;
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const lg = useMediaQuery(theme.breakpoints.up('lg'), { noSsr: true });
  if (!items.length) return null;
  const copy = COPY[kind];
  const inOneRow = (lg && items.length <= 3) || (md && items.length <= 2);
  // The offers lead the lime "Hula happenings" section, with room below them; events have a section of their own.
  return (
    <Box id={copy.id} sx={{ mb: kind === 'offer' ? { xs: 9, md: 12 } : 0, scrollMarginTop: SECTION_SCROLL_OFFSET }}>
      {inOneRow ? (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            alignItems: 'center',
            gridTemplateColumns: {
              md: `minmax(0, 1fr) repeat(${items.length}, minmax(0, 270px))`,
              lg: `minmax(0, 1fr) repeat(${items.length}, minmax(0, 300px))`,
            },
          }}
        >
          <Reveal>
            <Typography variant="overline" sx={{ display: 'block' }}>
              {copy.kicker}
            </Typography>
            <Typography variant="h2" sx={{ fontSize: 46, lineHeight: 1.04, mt: 1 }}>
              {copy.heading}
            </Typography>
            <Typography sx={{ mt: 2, maxWidth: 340, fontSize: 15, lineHeight: 1.7, color: 'text.secondary' }}>{copy.intro}</Typography>
          </Reveal>
          {items.map((item, i) => (
            <Reveal key={item.id} delay={0.08 * (i + 1)} sx={{ display: 'flex', alignSelf: 'stretch' }}>
              <HighlightCard item={item} />
            </Reveal>
          ))}
        </Box>
      ) : (
        <DragCarousel
          compact
          onDark={false}
          items={items}
          itemLabel={copy.itemLabel}
          sectionKicker={copy.kicker}
          heading={copy.heading}
          renderCard={(item) => <HighlightCard item={item} />}
        />
      )}
    </Box>
  );
}

/** "What's on": the running events in a section of their own, apart from the offers. Hidden when there are none. */
export function WhatsOnSection() {
  const events = useEventHighlights();
  if (!events.length) return null;
  return (
    <Box component="section" aria-label="What’s on" sx={{ py: { xs: 8, md: 11 } }}>
      <Container maxWidth="xl">
        <HighlightsSection kind="event" />
      </Container>
    </Box>
  );
}

export function HighlightCard({ item }: { item: Highlight }) {
  const isOffer = item.kind === 'offer';
  const morePerks = item.perks.length - PERKS_SHOWN;
  // An event opens its own page (photos, videos, the full story); the chip says how many photos and videos are waiting there.
  const media = item.media ?? [];
  const videos = media.filter((src) => mediaKind(src) !== 'image').length;
  const page = item.link ? { href: item.link, onClick: linkClick(item.link) } : null;
  return (
    <Box
      component="article"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 0.9,
        bgcolor: 'background.paper',
        borderRadius: '22px',
        border: '1px solid rgba(23,60,44,.10)',
        boxShadow: '0 8px 22px rgba(23,60,44,.07)',
      }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '5 / 4', borderRadius: '15px', overflow: 'hidden' }}>
        <ResortPhoto image={item.image} alt={item.title} sizes="(max-width: 600px) 78vw, (max-width: 1200px) 33vw, 25vw" />
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            px: 1.1,
            py: 0.35,
            borderRadius: 99,
            bgcolor: isOffer ? 'primary.main' : '#fffef8',
            color: isOffer ? 'common.white' : 'text.primary',
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(23,60,44,.15)',
          }}
        >
          {isOffer ? 'Offer' : 'What’s on'}
        </Box>
        {item.tag && (
          <Box
            sx={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              px: 1.3,
              py: 0.3,
              borderRadius: 99,
              bgcolor: isOffer ? 'secondary.main' : '#fffef8',
              border: '2px solid #fffef8',
              boxShadow: '0 3px 10px rgba(23,60,44,.18)',
              fontFamily: fonts.playful,
              fontSize: 18,
              lineHeight: 1.25,
            }}
          >
            {item.tag}
          </Box>
        )}
        {page && (
          <ButtonBase
            component="a"
            {...page}
            tabIndex={-1}
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
              p: 1.25,
              '& img': { transition: 'transform .4s ease' },
              '&:hover .gallery-chip': { bgcolor: 'secondary.main' },
            }}
          >
            {media.length > 1 && (
              <Box
                className="gallery-chip"
                title={`${media.length} photos${videos ? ' & videos' : ''}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.35,
                  borderRadius: 99,
                  bgcolor: '#fffef8',
                  color: 'text.primary',
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(23,60,44,.15)',
                  transition: 'background-color .2s ease',
                }}
              >
                <PhotoLibraryRounded sx={{ fontSize: 15 }} />
                {media.length}
              </Box>
            )}
          </ButtonBase>
        )}
      </Box>
      <Box sx={{ px: { xs: 1.25, md: 1.5 }, pt: 1.75, pb: 1.25, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Typography variant="overline" noWrap sx={{ color: 'success.main', fontSize: 10.5, lineHeight: 1.5 }}>
          {item.label}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: 22, md: 23 },
            lineHeight: 1.15,
            mt: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.title}
        </Typography>
        {item.description && (
          <Typography
            sx={{
              mt: 0.75,
              fontSize: 13.5,
              lineHeight: 1.55,
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </Typography>
        )}
        {item.perks.length > 0 && (
          <Stack component="ul" spacing={0.5} aria-label="Included" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1.25 }}>
            {item.perks.slice(0, PERKS_SHOWN).map((perk) => (
              <Stack component="li" key={perk} direction="row" spacing={0.75} alignItems="flex-start">
                <CheckRounded sx={{ fontSize: 16, color: 'success.main', mt: '2px', flexShrink: 0 }} />
                <Typography sx={{ fontSize: 13, lineHeight: 1.45 }}>{perk}</Typography>
              </Stack>
            ))}
            {morePerks > 0 && (
              <Typography component="li" sx={{ fontSize: 12.5, color: 'text.secondary', pl: 2.75 }}>
                + {morePerks} more
              </Typography>
            )}
          </Stack>
        )}
        {item.note && (
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1.25, color: 'text.secondary' }}>
            <EventAvailableRounded sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{item.note}</Typography>
          </Stack>
        )}
        {item.ctaLabel && (
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Button
              fullWidth
              size="small"
              variant={isOffer ? 'contained' : 'outlined'}
              endIcon={item.ctaIcon}
              {...(page ?? (item.onCta ? { onClick: item.onCta } : { href: item.ctaHref }))}
              sx={{ minHeight: 40 }}
            >
              {item.ctaLabel}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
