import East from '@mui/icons-material/East';
import { Box, Container, Stack, Typography } from '@mui/material';
import { bookHref } from '../../booking/BookingFlowContext';
import { useSite } from '../../context/SiteDataContext';
import { postcards, type Postcard } from '../../data/content';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { linkClick } from '../../router';
import { ClubPhoto } from '../common/ClubPhoto';
import { Reveal } from '../common/ScrollMotion';
import { Sticker } from '../common/VacationDecor';

const TILTS = [-1.5, 2, -1.5, -2, 1.5];
const RATIO = '1350 / 1070'; // the painted cards, frame trimmed

// The painted pineapple postcards: the club card large on the left and four
// smaller ones beside it (a swipeable row on phones). Each one is a link to
// the real thing, with its label hanging off the bottom like a luggage tag.
export function PostcardsSection() {
  const { activities } = useSite();
  // An activity taken offline in /admin sends its postcard to the activities list instead.
  const linkOf = (card: Postcard) => card.href ? { href: card.href, cta: card.cta }
    : activities.some((a) => a.id === card.activity) ? { href: bookHref({ activity: card.activity }), cta: card.cta } : { href: '#play', cta: 'See what to play' };

  return <Box id="postcards" component="section" aria-label="Postcards from the club" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET, pt: { xs: 7, md: 10 }, pb: { xs: 1, md: 2 } }}>
    <Container maxWidth="xl">
      <Reveal><Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-end' }} justifyContent="space-between" gap={3} sx={{ mb: { xs: 3, md: 7 }, textAlign: { xs: 'center', md: 'left' } }}>
        <Box>
          <Typography variant="overline" color="success.main">Postcards from the club</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: 43, md: 64 }, lineHeight: 1.03, mt: 1.5 }}>Greetings from<br /><Box component="span" color="primary.main">Hula Hula.</Box></Typography>
        </Box>
        <Typography sx={{ maxWidth: 400, color: 'text.secondary', lineHeight: 1.8 }}>Meet the club’s pineapple. He’s played the nine holes, emptied a bucket at the range, holed a few putts and stayed on for sunset — and sent a postcard from each. Tap one to book the real thing.</Typography>
      </Stack></Reveal>

      {/* One reveal for the lot: per-card reveals would keep the next card in
          the phone row invisible while it's only peeking in. */}
      <Reveal sx={{
        // Phones and tablets: one swipeable row, bleeding to the screen edges.
        display: { xs: 'flex', md: 'grid' }, gap: { xs: 2.5, md: 0 }, overflowX: { xs: 'auto', md: 'visible' }, scrollSnapType: 'x mandatory',
        mx: { xs: -2, sm: -3, md: 0 }, px: { xs: 2, sm: 3, md: 0 }, pt: { xs: 2, md: 0 }, pb: { xs: 4, md: 3 }, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        // Desktop: the big card is exactly two small cards plus the row gap tall,
        // so it's sized 50px wider than two small ones (the 40px gap times the card's ratio).
        gridTemplateColumns: { md: 'calc((100% - 106px) / 2 + 50px) 1fr 1fr' }, columnGap: { md: '28px' }, rowGap: { md: '40px' },
      }}>
        {postcards.map((card, i) => {
          const featured = i === 0;
          const { href, cta } = linkOf(card);
          return <Box key={card.image} sx={{
            flex: { xs: '0 0 auto', md: 'initial' }, width: { xs: 'min(80vw, 420px)', md: 'auto' }, scrollSnapAlign: 'center',
            gridRow: { md: featured ? 'span 2' : 'auto' }, position: 'relative',
          }}>
            {featured && <Sticker rotate={-12} sx={{ display: { xs: 'none', md: 'inline-flex' }, position: 'absolute', zIndex: 2, top: -34, left: -30, width: 112, height: 112, fontSize: 19 }}>Wish you<br />were here!</Sticker>}
            <Box component="a" href={href} onClick={href.startsWith('/') ? linkClick(href) : undefined} sx={{
              position: 'relative', display: 'block', height: { md: '100%' }, color: 'text.primary', textDecoration: 'none', borderRadius: featured ? '30px' : '22px',
              transform: `rotate(${TILTS[i % TILTS.length]}deg)`, transition: 'transform .35s cubic-bezier(.2,.8,.2,1)',
              '&:hover, &:focus-visible': { transform: 'rotate(0deg) translateY(-6px)' },
              '&:hover .postcard-art, &:focus-visible .postcard-art': { boxShadow: '0 28px 54px rgba(23,60,44,.24)' },
              '&:hover .postcard-tag, &:focus-visible .postcard-tag': { bgcolor: 'primary.main', color: 'common.white' },
              '&:hover .postcard-tag svg': { transform: 'translateX(3px)' },
            }}>
              <Box className="postcard-art" sx={{
                position: 'relative', overflow: 'hidden', bgcolor: '#fffef8', border: { xs: '7px solid #fffef8', md: `${featured ? 10 : 7}px solid #fffef8` },
                borderRadius: 'inherit', boxShadow: '0 16px 36px rgba(23,60,44,.14)', transition: 'box-shadow .35s ease',
                aspectRatio: { xs: RATIO, md: featured ? 'auto' : RATIO }, height: { md: featured ? '100%' : 'auto' },
              }}>
                {/* On desktop the big card's photo fills the box the grid gives it rather than sizing it. */}
                <ClubPhoto image={card.image} alt={card.alt} sizes={featured ? '(max-width: 900px) 80vw, 50vw' : '(max-width: 900px) 80vw, 25vw'}
                  sx={featured ? { position: { md: 'absolute' }, inset: 0 } : undefined} />
              </Box>
              <Box className="postcard-tag" sx={{
                position: 'absolute', left: '50%', bottom: -19, transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: .75,
                height: 40, px: 2.25, borderRadius: 999, border: '3px solid #fffef8', bgcolor: 'secondary.main', color: 'text.primary', whiteSpace: 'nowrap',
                fontSize: featured ? 15.5 : 14.5, fontWeight: 700, boxShadow: '0 6px 16px rgba(23,60,44,.16)', transition: 'background-color .2s ease, color .2s ease',
                '& svg': { fontSize: 17, transition: 'transform .2s ease' },
              }}>{cta}<East /></Box>
            </Box>
          </Box>;
        })}
      </Reveal>
    </Container>
  </Box>;
}
