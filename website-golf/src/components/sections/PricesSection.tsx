import CheckRounded from '@mui/icons-material/CheckRounded';
import East from '@mui/icons-material/East';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { ActivityIcon } from '../../booking/activityIcons';
import { bookHref } from '../../booking/BookingFlowContext';
import { ACTIVITIES, CADDIE_TIP, RENTALS, type ActivityId } from '../../booking/config';
import { money } from '../../booking/pricing';
import { photoAssets as p } from '../../data/photos';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { linkClick } from '../../router';
import { fonts } from '../../theme';
import { ClubPhoto } from '../common/ClubPhoto';
import { Reveal } from '../common/ScrollMotion';
import { Sticker } from '../common/VacationDecor';

// How long each one takes, as the brochure puts it.
const DURATION: Partial<Record<ActivityId, string>> = { footgolf: '1–3 hr', puttgolf: '1 hr', range: 'per hr', lesson: '3.5 hr' };
// Golf and FootGolf get the wide cards on the top row; the other three share the second.
const SPAN: Record<ActivityId, number> = { golf: 3, footgolf: 3, puttgolf: 2, range: 2, lesson: 2 };
// The wide cards have room for a photo beside the prices on large screens.
const PHOTO: Partial<Record<ActivityId, { image: string; alt: string; position?: string }>> = {
  golf: { image: p.golfSwing.src, alt: 'A golfer mid-swing beside a golf cart, with his caddie watching' },
  footgolf: { image: p.footgolfFlag.src, alt: 'FootGolf players with their footballs around the hole 8 flag', position: '68% center' },
};

// The rate card: every package from the club's brochure, built from the same
// config the booking pages price from, so the two can never disagree.
export function PricesSection() {
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
        {ACTIVITIES.map((activity, i) => <Reveal key={activity.id} delay={Math.min(i, 3) * 0.08} sx={{ display: 'flex', gridColumn: { lg: `span ${SPAN[activity.id]}` } }}>
          <Box component="article" aria-labelledby={`price-${activity.id}`} sx={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRadius: '24px', border: '1px solid rgba(23,60,44,.10)', borderTop: '5px solid #50830d', p: { xs: 2.5, md: 3 }, boxShadow: '0 10px 26px rgba(23,60,44,.07)' }}>
            {PHOTO[activity.id] && <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'absolute', top: 20, right: 20, bottom: 20, width: '40%', borderRadius: '14px 56px 14px 14px', overflow: 'hidden' }}>
              <ClubPhoto image={PHOTO[activity.id]!.image} alt={PHOTO[activity.id]!.alt} sizes="(min-width: 1200px) 260px, 1px" sx={{ objectPosition: PHOTO[activity.id]!.position ?? 'center' }} />
            </Box>}
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, maxWidth: { lg: PHOTO[activity.id] ? '56%' : 'none' } }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pr: DURATION[activity.id] && !PHOTO[activity.id] ? 8 : 0 }}>
                <Box aria-hidden sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'success.light', color: 'success.dark' }}><ActivityIcon activity={activity.id} /></Box>
                <Box>
                  <Typography id={`price-${activity.id}`} variant="h3" sx={{ fontSize: { xs: 26, md: 30 }, lineHeight: 1.1 }}>{activity.name}</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{activity.tagline}</Typography>
                </Box>
              </Stack>
              {DURATION[activity.id] && <Box aria-label={`Takes ${DURATION[activity.id]}`} sx={{ position: 'absolute', zIndex: 1, top: 16, right: 16, width: 58, height: 58, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'secondary.main', fontFamily: fonts.playful, fontSize: 15, lineHeight: 1, textAlign: 'center', transform: 'rotate(8deg)', boxShadow: '0 3px 0 rgba(23,60,44,.10)' }}>{DURATION[activity.id]}</Box>}

              <Stack direction="row" flexWrap="wrap" useFlexGap gap={{ xs: 2, md: 3 }} sx={{ mt: 2.5 }}>
                {activity.soloPrice
                  ? <>
                    <Price label="1 person" amount={activity.soloPrice} />
                    <Price label="2–3 people, each" amount={activity.options[0].price} />
                  </>
                  : activity.id === 'range'
                    ? <Price label="Per person, per hour" amount={activity.options[0].price} />
                    : activity.options.map((option) => <Price key={option.id} label={option.label} amount={option.price} />)}
              </Stack>

              <Stack component="ul" spacing={.75} sx={{ listStyle: 'none', p: 0, m: 0, mt: 2.5, mb: 3 }}>
                {activity.includes.map((item) => <Stack component="li" key={item} direction="row" spacing={1} alignItems="center">
                  <CheckRounded sx={{ fontSize: 18, color: 'success.main' }} /><Typography sx={{ fontSize: 14 }}>{item}</Typography>
                </Stack>)}
              </Stack>

              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 'auto' }}>
                <Button href={bookHref({ activity: activity.id })} onClick={linkClick(bookHref({ activity: activity.id }))} variant="outlined" size="small" endIcon={<East sx={{ fontSize: 17 }} />}>Book {activity.name === 'Golf lesson' ? 'a lesson' : activity.name}</Button>
                {activity.noSkillNeeded && <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'secondary.dark', border: '1.5px dashed', borderColor: 'secondary.dark', borderRadius: 1, px: 1, py: .4, transform: 'rotate(-2deg)', whiteSpace: 'nowrap' }}>No golf skill needed</Typography>}
              </Stack>
            </Box>
          </Box>
        </Reveal>)}
      </Box>

      <Reveal><Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} alignItems="center" sx={{ mt: { xs: 5, md: 6 }, p: { xs: 2.5, md: 3 }, borderRadius: '24px', border: '1px dashed', borderColor: 'success.main', position: 'relative' }}>
        <Sticker rotate={-8} sx={{ flexShrink: 0, width: 100, height: 100, fontSize: 17 }}>Tip your<br />caddie!</Sticker>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 4 }, flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
          <Note title="Caddie tip">Not included — {money(CADDIE_TIP)} per caddie is customary, in cash.</Note>
          <Note title="Rental clubs">{RENTALS.map((r) => money(r.price)).join(' – ')} a set, for golf and the range.</Note>
          <Note title="Free transfer">Twice a day, with pick-ups at 8:00 am and 1:30 pm. Ask when you book.</Note>
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
