import ArrowOutward from '@mui/icons-material/ArrowOutward';
import StarRounded from '@mui/icons-material/StarRounded';
import { Box, Link, Typography } from '@mui/material';
import { GOOGLE_REVIEWS } from '../../data/content';

const STAR_GOLD = '#f4b400';
const count = new Intl.NumberFormat('en-US').format(GOOGLE_REVIEWS.count);

// Five stars with the rating's share filled in gold (4.2 → four and a fifth).
function Stars({ rating }: { rating: number }) {
  const row = (color: string) => <Box sx={{ display: 'flex', '& svg': { fontSize: 18, color, flexShrink: 0 } }}>
    {[0, 1, 2, 3, 4].map((i) => <StarRounded key={i} />)}
  </Box>;
  return <Box aria-hidden sx={{ position: 'relative', lineHeight: 0 }}>
    {row('#ead9e1')}
    <Box sx={{ position: 'absolute', inset: 0, width: `${(rating / 5) * 100}%`, overflow: 'hidden' }}>{row(STAR_GOLD)}</Box>
  </Box>;
}

// Guest proof under the hero's buttons: the Google rating as one quiet,
// clickable pill that opens the reviews on Google in a new tab.
export function HeroReviews() {
  const { rating, label, url } = GOOGLE_REVIEWS;
  return <Link href={url} target="_blank" rel="noopener noreferrer" underline="none"
    aria-label={`Rated ${rating} out of 5 from ${count} Google reviews, ${label}. Read the reviews on Google (opens in a new tab)`}
    sx={{
      display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', columnGap: 1, rowGap: .25,
      px: 1.75, py: 1, borderRadius: '999px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
      boxShadow: '0 6px 18px rgba(90,36,72,.07)', color: 'text.primary', transition: 'box-shadow .2s ease, border-color .2s ease',
      '&:hover': { borderColor: 'primary.main', boxShadow: '0 8px 22px rgba(90,36,72,.12)' },
      '&:hover .reviews-count': { textDecoration: 'underline' },
    }}>
    <Typography component="span" sx={{ fontWeight: 700, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>{rating.toFixed(1)}</Typography>
    <Stars rating={rating} />
    <Typography component="span" className="reviews-count" sx={{ fontSize: 14, color: 'primary.main', fontWeight: 600, textUnderlineOffset: '3px' }}>{count} Google reviews</Typography>
    {/* Phones: the rating, stars and reviews link stay on one line. */}
    <Typography component="span" sx={{ display: { xs: 'none', sm: 'inline' }, fontSize: 14, color: 'text.secondary' }}>· {label}</Typography>
    <ArrowOutward aria-hidden sx={{ fontSize: 15, color: 'text.secondary' }} />
  </Link>;
}
