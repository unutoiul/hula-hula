import { Box, Button, Typography } from '@mui/material';
import { fonts } from '../../theme';
import { ResortPhoto } from '../common/ResortPhoto';
import type { CmsCard } from '../sections/cmsCards';

// The hero's instant photo turned into an offer while one is running: the
// offer's picture, its badge and discount, its name and the button to book
// it — the same card the "Treat yourself" carousel shows, as a tilted
// polaroid. Hero.tsx shows the "Make a splash!" photo when there's no offer.
export function HeroOffer({ card }: { card: CmsCard }) {
  return <Box component="figure" aria-label={`Special offer: ${card.title}`} sx={{
    m: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', p: { xs: 1, md: 1.25 }, borderRadius: '12px',
    boxShadow: '0 18px 40px rgba(23,60,44,.22)', transform: 'rotate(-6deg)', transition: 'transform .3s ease',
    '&:hover': { transform: 'rotate(-3deg) scale(1.02)' },
  }}>
    <Box sx={{ aspectRatio: '4 / 3', borderRadius: '8px', overflow: 'hidden' }}>
      <ResortPhoto image={card.images[0]} alt={card.title} sizes="(max-width: 899px) 200px, 280px" />
    </Box>
    <Box component="figcaption" sx={{ px: { xs: .5, md: .75 }, pt: { xs: 1, md: 1.25 }, pb: { xs: .75, md: 1 } }}>
      <Typography variant="overline" sx={{ display: 'block', color: 'success.main', fontSize: { xs: 9.5, md: 10.5 }, lineHeight: 1.4 }}>{card.kicker}</Typography>
      <Typography sx={{ fontFamily: fonts.playful, fontSize: { xs: 17, md: 21 }, lineHeight: 1.15, mt: .25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.title}</Typography>
      {card.ctaLabel && <Button fullWidth size="small" variant="contained" color="secondary" endIcon={card.ctaIcon}
        {...(card.onCta ? { onClick: card.onCta } : { href: card.ctaHref })} sx={{ mt: { xs: 1, md: 1.25 }, minHeight: { xs: 34, md: 40 }, fontSize: { xs: 12, md: 13 } }}>
        {card.ctaLabel}
      </Button>}
    </Box>
  </Box>;
}
