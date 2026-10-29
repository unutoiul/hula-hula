import CheckRounded from '@mui/icons-material/CheckRounded';
import EventAvailableRounded from '@mui/icons-material/EventAvailableRounded';
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { fonts } from '../../theme';
import { DragCarousel } from '../common/DragCarousel';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal } from '../common/ScrollMotion';
import { useHighlights, type Highlight } from './cmsCards';

const PERKS_SHOWN = 3;

// "Offers & what's on": every running offer and event from /admin as compact
// cards — the discount or date on the photo, what's included, the small print
// and the button. While they all fit beside the heading (up to two on tablets,
// three on desktops) they sit in one row next to it; more become a swipeable
// row, four to a screen. Hidden when nothing is running (the hero then shows
// its photo instead of these).
export function HighlightsSection() {
  const items = useHighlights();
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const lg = useMediaQuery(theme.breakpoints.up('lg'), { noSsr: true });
  if (!items.length) return null;
  const offers = items.some((item) => item.kind === 'offer');
  const events = items.some((item) => item.kind === 'event');
  const kicker = offers && events ? 'Offers & what’s on' : offers ? 'Offers & little extras' : 'What’s on at Hula Hula';
  const heading = events && !offers
    ? <>What’s on.<br /><Box component="span" color="success.main">Come and join in.</Box></>
    : <>Good deals.<br /><Box component="span" color="success.main">Good times.</Box></>;
  const inOneRow = (lg && items.length <= 3) || (md && items.length <= 2);
  return <Box id="offers" sx={{ mb: { xs: 9, md: 12 }, scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    {inOneRow
      ? <Box sx={{ display: 'grid', gap: 3, alignItems: 'center', gridTemplateColumns: { md: `minmax(0, 1fr) repeat(${items.length}, minmax(0, 270px))`, lg: `minmax(0, 1fr) repeat(${items.length}, minmax(0, 300px))` } }}>
        <Reveal>
          <Typography variant="overline" sx={{ display: 'block' }}>{kicker}</Typography>
          <Typography variant="h2" sx={{ fontSize: 46, lineHeight: 1.04, mt: 1 }}>{heading}</Typography>
          <Typography sx={{ mt: 2, maxWidth: 340, fontSize: 15, lineHeight: 1.7, color: 'text.secondary' }}>
            {offers ? 'Special prices and little extras on your stay, while they last.' : 'A few good things happening at the resort while you’re here.'}
            {offers && events && ' And a few good things happening while you’re here.'}
          </Typography>
        </Reveal>
        {items.map((item, i) => <Reveal key={item.id} delay={0.08 * (i + 1)} sx={{ display: 'flex', alignSelf: 'stretch' }}><HighlightCard item={item} /></Reveal>)}
      </Box>
      : <DragCarousel compact onDark={false} items={items} itemLabel="offer or event" sectionKicker={kicker} heading={heading}
        renderCard={(item) => <HighlightCard item={item} />} />}
  </Box>;
}

export function HighlightCard({ item }: { item: Highlight }) {
  const isOffer = item.kind === 'offer';
  const morePerks = item.perks.length - PERKS_SHOWN;
  return <Box component="article" sx={{ width: '100%', display: 'flex', flexDirection: 'column', p: .9, bgcolor: 'background.paper', borderRadius: '22px', border: '1px solid rgba(23,60,44,.10)', boxShadow: '0 8px 22px rgba(23,60,44,.07)' }}>
    <Box sx={{ position: 'relative', aspectRatio: '5 / 4', borderRadius: '15px', overflow: 'hidden' }}>
      <ResortPhoto image={item.image} alt={item.title} sizes="(max-width: 600px) 78vw, (max-width: 1200px) 33vw, 25vw" />
      <Box sx={{ position: 'absolute', top: 10, left: 10, px: 1.1, py: .35, borderRadius: 99, bgcolor: isOffer ? 'primary.main' : '#fffef8', color: isOffer ? 'common.white' : 'text.primary', fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(23,60,44,.15)' }}>
        {isOffer ? 'Offer' : 'What’s on'}
      </Box>
      {item.tag && <Box sx={{
        position: 'absolute', right: 10, bottom: 10, px: 1.3, py: .3, borderRadius: 99,
        bgcolor: isOffer ? 'secondary.main' : '#fffef8', border: '2px solid #fffef8', boxShadow: '0 3px 10px rgba(23,60,44,.18)',
        fontFamily: fonts.playful, fontSize: 18, lineHeight: 1.25,
      }}>{item.tag}</Box>}
    </Box>
    <Box sx={{ px: { xs: 1.25, md: 1.5 }, pt: 1.75, pb: 1.25, display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Typography variant="overline" noWrap sx={{ color: 'success.main', fontSize: 10.5, lineHeight: 1.5 }}>{item.label}</Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 22, md: 23 }, lineHeight: 1.15, mt: .5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</Typography>
      {item.description && <Typography sx={{ mt: .75, fontSize: 13.5, lineHeight: 1.55, color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</Typography>}
      {item.perks.length > 0 && <Stack component="ul" spacing={.5} aria-label="Included" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1.25 }}>
        {item.perks.slice(0, PERKS_SHOWN).map((perk) => <Stack component="li" key={perk} direction="row" spacing={.75} alignItems="flex-start">
          <CheckRounded sx={{ fontSize: 16, color: 'success.main', mt: '2px', flexShrink: 0 }} />
          <Typography sx={{ fontSize: 13, lineHeight: 1.45 }}>{perk}</Typography>
        </Stack>)}
        {morePerks > 0 && <Typography component="li" sx={{ fontSize: 12.5, color: 'text.secondary', pl: 2.75 }}>+ {morePerks} more</Typography>}
      </Stack>}
      {item.note && <Stack direction="row" spacing={.75} alignItems="center" sx={{ mt: 1.25, color: 'text.secondary' }}>
        <EventAvailableRounded sx={{ fontSize: 16 }} /><Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{item.note}</Typography>
      </Stack>}
      {item.ctaLabel && <Box sx={{ mt: 'auto', pt: 2 }}>
        <Button fullWidth size="small" variant={isOffer ? 'contained' : 'outlined'} endIcon={item.ctaIcon} {...(item.onCta ? { onClick: item.onCta } : { href: item.ctaHref })} sx={{ minHeight: 40 }}>
          {item.ctaLabel}
        </Button>
      </Box>}
    </Box>
  </Box>;
}
