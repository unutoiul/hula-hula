import BackpackRounded from '@mui/icons-material/BackpackRounded';
import SportsGolfRounded from '@mui/icons-material/SportsGolfRounded';
import SportsTennisRounded from '@mui/icons-material/SportsTennisRounded';
import SportsSoccerRounded from '@mui/icons-material/SportsSoccerRounded';
import ShoppingBasketRounded from '@mui/icons-material/ShoppingBasketRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { groupRentals, type Rental } from '../../booking/config';
import { money } from '../../booking/pricing';
import { fonts } from '../../theme';

const EQUIPMENT_ICONS = { equipment: BackpackRounded, golf: SportsGolfRounded, racket: SportsTennisRounded, ball: SportsSoccerRounded, basket: ShoppingBasketRounded };

/** Artwork URLs and the fallback icon choice both come from the rental record. */
export function RentalVisual({ rental, height = 64 }: { rental: Pick<Rental, 'label' | 'image' | 'group' | 'icon'>; height?: number | { xs: number; md: number } }) {
  const Icon = EQUIPMENT_ICONS[rental.icon ?? 'equipment'];
  return <Box aria-hidden sx={{ bgcolor: /premium/i.test(rental.group ?? '') ? '#fff2cf' : '#e6f1df', borderRadius: '16px', height, display: 'grid', placeItems: 'center', overflow: 'hidden', p: .75 }}>
    {rental.image
      ? <Box component="img" src={rental.image} alt="" loading="lazy" decoding="async" sx={{ display: 'block', width: '100%', height: '100%', minHeight: 0, objectFit: 'contain' }} />
      : <Icon sx={{ fontSize: 36, color: 'primary.dark' }} />}
  </Box>;
}

const BESIDE = { xs: '80px minmax(0,1fr)', sm: '96px minmax(0,1fr)' };

type Control = (rental: Rental, label: ReactNode) => ReactNode;

// One set: its picture and words, then its price with room for a stepper
// beside it, even on the narrowest phones.
function RentalItem({ rental, compact, control }: { rental: Rental; compact: boolean; control?: Control }) {
  const price = <Stack direction="row" flexWrap="wrap" alignItems="baseline" columnGap={.75}>
    <Typography component="span" sx={{ fontSize: 16, fontWeight: 800, color: rental.price === 0 ? 'success.dark' : 'primary.main', whiteSpace: 'nowrap' }}>{rental.price === 0 ? 'Free' : money(rental.price)}</Typography>
    <Typography component="span" sx={{ fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>{rental.price === 0 ? 'with your booking' : `per ${rental.unit || 'item'}`}</Typography>
  </Stack>;
  return <Box sx={{ display: 'grid', gridTemplateColumns: compact ? '64px minmax(0,1fr)' : { ...BESIDE, md: '80px minmax(0,1fr)' }, alignContent: 'start', columnGap: compact ? 1.5 : 2, rowGap: 1.25, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '20px', p: compact ? 1.5 : 2, minWidth: 0 }}>
    <RentalVisual rental={rental} height={compact ? 64 : 80} />
    <Box sx={{ minWidth: 0, alignSelf: 'center' }}>
      <Typography sx={{ fontWeight: 700, fontSize: compact ? 15 : 17, lineHeight: 1.25 }}>{rental.label}</Typography>
      <Typography sx={{ fontSize: 13, lineHeight: 1.4, color: 'text.secondary', mt: .25 }}>{rental.description || 'Add to your booking.'}</Typography>
    </Box>
    <Box sx={{ gridColumn: '1 / -1', minWidth: 0, pt: control ? .75 : 1, borderTop: '1px solid', borderColor: 'divider' }}>
      {control ? control(rental, price) : price}
    </Box>
  </Box>;
}

/** The rentals under their group headings (Premium, Normal…), each group's sets side by side where there's room. */
export function RentalSets({ rentals, compact = false, control }: { rentals: Rental[]; compact?: boolean; control?: Control }) {
  return <Stack spacing={compact ? 2.25 : 4}>
    {groupRentals(rentals).map((group) => <Box key={group.id} component="section" aria-label={group.name || undefined}>
      {group.name && <Stack direction="row" alignItems="center" spacing={.5} sx={{ mb: compact ? 1 : 1.5 }}>
        {/premium/i.test(group.name) && <StarRounded aria-hidden sx={{ fontSize: compact ? 19 : 24, color: '#d9a521' }} />}
        <Typography component="h3" sx={{ fontFamily: fonts.playful, fontSize: compact ? 20 : 26, lineHeight: 1.2 }}>{group.name}</Typography>
      </Stack>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', ...(!compact && { md: 'repeat(2, minmax(0,1fr))' }) }, gap: compact ? 1.25 : { xs: 2, md: 3 } }}>
        {group.rentals.map((rental) => <RentalItem key={rental.id} rental={rental} compact={compact} control={control} />)}
      </Box>
    </Box>)}
  </Stack>;
}
