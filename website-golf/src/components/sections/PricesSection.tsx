import CheckRounded from '@mui/icons-material/CheckRounded';
import East from '@mui/icons-material/East';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { ActivityIcon } from '../../booking/activityIcons';
import { bookHref } from '../../booking/BookingFlowContext';
import { timeLabel } from '../../booking/dates';
import { money } from '../../booking/pricing';
import { useSite } from '../../context/SiteDataContext';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { linkClick } from '../../router';
import { fonts } from '../../theme';
import { ClubPhoto } from '../common/ClubPhoto';
import { Reveal } from '../common/ScrollMotion';
import { Sticker } from '../common/VacationDecor';

/**
 * How wide each card is on a large screen (6 columns): the first two share
 * the top row as wide cards with a photo, the rest go three to a row, and a
 * short last row stretches to fill.
 */
function spans(count: number): number[] {
  const wide = Math.min(2, count);
  const rest = count - wide;
  return Array.from({ length: count }, (_, i) => {
    if (i < wide) return wide === 1 ? 6 : 3;
    const inLastRow = rest % 3, lastRowStart = count - inLastRow;
    return inLastRow && i >= lastRowStart ? 6 / inLastRow : 2;
  });
}

// The rate card: every activity and its prices, straight from what staff set
// in /admin — the same values the booking pages price from, so the two can
// never disagree.
export function PricesSection() {
  const { activities, rentals, club } = useSite();
  const span = spans(activities.length);
  const rentalPrices = rentals.map((r) => r.price).sort((a, b) => a - b);
  return <Box id="prices" component="section" sx={{ py: SECTION_Y, bgcolor: '#e7f4cc', scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl">
      <Reveal><Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-end' }} justifyContent="space-between" gap={3} sx={{ mb: { xs: 5, md: 6 }, textAlign: { xs: 'center', md: 'left' } }}>
        <Box>
          <Typography variant="overline" color="success.dark">Prices &amp; packages</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: 43, md: 64 }, lineHeight: 1.03, mt: 1.5 }}>Simple prices.<br /><Box component="span" color="primary.main">Good times included.</Box></Typography>
        </Box>
        <Typography sx={{ maxWidth: 380, color: 'text.secondary', lineHeight: 1.8 }}>Per person, in Thai baht, paid at the club on the day. Caddie, cart and equipment are in the price wherever you need them.</Typography>
      </Stack></Reveal>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(6, 1fr)' }, gap: { xs: 2, md: 2.5 } }}>
        {activities.map((activity, i) => {
          const photo = span[i] >= 3 ? activity.card.images[0] : undefined;
          return <Reveal key={activity.id} delay={Math.min(i, 3) * 0.08} sx={{ display: 'flex', gridColumn: { lg: `span ${span[i]}` } }}>
            <Box component="article" aria-labelledby={`price-${activity.id}`} sx={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRadius: '24px', border: '1px solid rgba(23,60,44,.10)', borderTop: '5px solid #50830d', p: { xs: 2.5, md: 3 }, boxShadow: '0 10px 26px rgba(23,60,44,.07)' }}>
              {photo && <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'absolute', top: 20, right: 20, bottom: 20, width: '40%', borderRadius: '14px 56px 14px 14px', overflow: 'hidden' }}>
                <ClubPhoto image={photo} alt={activity.card.title || activity.name} sizes="(min-width: 1200px) 260px, 1px" />
              </Box>}
              {activity.durationBadge && <Box aria-label={`Takes ${activity.durationBadge}`} sx={{ position: 'absolute', zIndex: 1, top: 16, right: 16, width: 58, height: 58, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'secondary.main', fontFamily: fonts.playful, fontSize: 15, lineHeight: 1, textAlign: 'center', transform: 'rotate(8deg)', boxShadow: '0 3px 0 rgba(23,60,44,.10)' }}>{activity.durationBadge}</Box>}
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, maxWidth: { lg: photo ? '56%' : 'none' } }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pr: activity.durationBadge && !photo ? 8 : 0 }}>
                  <Box aria-hidden sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'success.light', color: 'success.dark' }}><ActivityIcon icon={activity.icon} /></Box>
                  <Box>
                    <Typography id={`price-${activity.id}`} variant="h3" sx={{ fontSize: { xs: 26, md: 30 }, lineHeight: 1.1 }}>{activity.name}</Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{activity.tagline}</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" flexWrap="wrap" useFlexGap gap={{ xs: 2, md: 3 }} sx={{ mt: 2.5 }}>
                  {activity.soloPrice && <Price label="1 person" amount={activity.soloPrice} />}
                  {activity.options.map((option) => <Price key={option.id} label={activity.soloPrice ? `${option.label} · 2+ each` : option.label} amount={option.price} />)}
                </Stack>

                <Stack component="ul" spacing={.75} sx={{ listStyle: 'none', p: 0, m: 0, mt: 2.5, mb: 3 }}>
                  {activity.includes.map((item) => <Stack component="li" key={item} direction="row" spacing={1} alignItems="center">
                    <CheckRounded sx={{ fontSize: 18, color: 'success.main' }} /><Typography sx={{ fontSize: 14 }}>{item}</Typography>
                  </Stack>)}
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 'auto' }}>
                  <Button href={bookHref({ activity: activity.id })} onClick={linkClick(bookHref({ activity: activity.id }))} variant="outlined" size="small" endIcon={<East sx={{ fontSize: 17 }} />}>Book</Button>
                  {activity.noSkillNeeded && <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'secondary.dark', border: '1.5px dashed', borderColor: 'secondary.dark', borderRadius: 1, px: 1, py: .4, transform: 'rotate(-2deg)', whiteSpace: 'nowrap' }}>No golf skill needed</Typography>}
                </Stack>
              </Box>
            </Box>
          </Reveal>;
        })}
      </Box>

      <Reveal><Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} alignItems="center" sx={{ mt: { xs: 5, md: 6 }, p: { xs: 2.5, md: 3 }, borderRadius: '24px', border: '1px dashed', borderColor: 'success.main', position: 'relative' }}>
        <Sticker rotate={-8} sx={{ flexShrink: 0, width: 100, height: 100, fontSize: 17 }}>Tip your<br />caddie!</Sticker>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 4 }, flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
          <Note title="Caddie tip">Not included — {money(club.booking.caddieTip)} per caddie is customary, in cash.</Note>
          {rentalPrices.length > 0 && <Note title="Rental clubs">{rentalPrices.length > 1 ? `${money(rentalPrices[0])} – ${money(rentalPrices.at(-1)!)}` : money(rentalPrices[0])} a set.</Note>}
          {club.transfer.pickups.length > 0 && <Note title="Free transfer">Pick-ups at {club.transfer.pickups.map(timeLabel).join(' and ')}. Ask when you book.</Note>}
        </Box>
      </Stack></Reveal>
    </Container>
  </Box>;
}

function Price({ label, amount }: { label: string; amount: number }) {
  return <Box>
    <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'text.secondary' }}>{label}</Typography>
    <Typography sx={{ fontFamily: fonts.playful, fontSize: { xs: 30, md: 36 }, lineHeight: 1.1, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>{money(amount)}</Typography>
  </Box>;
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return <Box>
    <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
    <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: .5, lineHeight: 1.6 }}>{children}</Typography>
  </Box>;
}
