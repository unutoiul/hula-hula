import CloseRounded from '@mui/icons-material/CloseRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import { Alert, Box, Button, Divider, IconButton, Stack, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';
import type { RateOffer } from '../../../shared/bookingContract';
import { toISODate, useBookingSearch } from '../../context/BookingSearchContext';
import { fonts } from '../../theme';
import { useBookingFlow } from '../BookingFlowContext';
import { guestsLabel, mealsLabel, money, nightsLabel, shortDayLabel, stayLabel } from '../format';

/** The basket's column on wide screens: stays in view, and scrolls by itself
 * when a long stay makes it taller than the window, so its button can always
 * be reached. The side and bottom padding keep the card's shadow from being cut. */
export const stickyCartSx = { position: { md: 'sticky' }, top: { md: 24 }, maxHeight: { md: 'calc(100vh - 24px)' }, overflowY: { md: 'auto' }, mx: { md: -2 }, px: { md: 2 }, pb: { md: 5 } } as const;

// Under each room: what every night costs, adding up to the amount beside the
// room — rates change from night to night, so an average doesn't tell a guest
// what they're paying. aria-live="off": a screen reader announces the room
// that was added, not a list of dates.
function NightlyPrices({ nightly, quantity, currency }: { nightly: RateOffer['nightly']; quantity: number; currency: string }) {
  const [open, setOpen] = useState(true);
  if (nightly.length === 0) return null;
  return <Box aria-live="off" sx={{ mt: .5 }}>
    <Button size="small" variant="text" aria-expanded={open} onClick={() => setOpen((v) => !v)}
      endIcon={<ExpandMoreRounded sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }} />}
      sx={{ minHeight: 0, p: 0, py: .25, fontSize: 12 }}>Price per night</Button>
    {open && <Box sx={{ mt: .5, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', columnGap: 1.5, rowGap: .25 }}>
      {nightly.map((night) => <Box key={night.date} sx={{ display: 'contents' }}>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{shortDayLabel(night.date)}</Typography>
        <Typography sx={{ fontSize: 12.5, textAlign: 'right', whiteSpace: 'nowrap' }}>
          {quantity > 1 && <Box component="span" sx={{ color: 'text.secondary' }}>{quantity} × {money(night.amount, currency)} = </Box>}
          {money(night.amount * quantity, currency)}
        </Typography>
      </Box>)}
    </Box>}
  </Box>;
}

// The running total beside every step: the stay, each room picked, the total
// and what's paid now versus at the hotel. `action` is the step's button;
// `editable` lets the guest take rooms out (✕ per room, or Clear all).
export function CartSummary({ action, showFit = true, editable = false }: { action?: ReactNode; showFit?: boolean; editable?: boolean }) {
  const { checkIn, checkOut, adults, children } = useBookingSearch();
  const { cart, totals, plan, setQuantity, clearCart } = useBookingFlow();
  // From the dates on screen, so the summary never lags behind a search still loading.
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
  // At least one adult per room — the same rule the booking itself follows.
  const bookedAdults = Math.max(adults, totals.rooms);
  const savings = cart.reduce((sum, { line, rate }) => sum + (rate.offer?.savings ?? 0) * line.quantity, 0);
  const guests = bookedAdults + children;
  const capacity = cart.reduce((sum, { line, roomType }) => sum + roomType.capacity.guests * line.quantity, 0);

  return <Box sx={{ border: '1px solid', borderColor: 'divider', borderTop: '5px solid #50830d', bgcolor: 'background.paper', borderRadius: '24px', p: { xs: 2.5, md: 3 }, boxShadow: '0 16px 36px rgba(23,60,44,.07)' }}>
    <Typography variant="overline" sx={{ color: 'text.secondary' }}>Your stay</Typography>
    <Typography sx={{ fontFamily: fonts.playful, fontSize: 18, mt: .5 }}>{stayLabel(toISODate(checkIn), toISODate(checkOut))}</Typography>
    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{nightsLabel(nights)} · {guestsLabel(bookedAdults, children)}</Typography>
    {bookedAdults > adults && <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: .5 }}>Each room is booked for at least one adult.</Typography>}

    <Divider sx={{ my: 2 }} />
    {cart.length === 0
      ? <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>No rooms picked yet — choose a rate to add it here.</Typography>
      : <Stack spacing={1.5} aria-live="polite">
        {cart.map(({ line, roomType, rate }) => <Box key={rate.roomRateUuid}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{line.quantity} × {roomType.name}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{rate.name}{mealsLabel(rate.meals).toLowerCase() !== rate.name.toLowerCase() ? ` · ${mealsLabel(rate.meals)}` : ''}</Typography>
            </Box>
            <Stack direction="row" alignItems="flex-start" spacing={.25} sx={{ flexShrink: 0 }}>
              <Typography sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>{money(rate.total * line.quantity, totals.currency)}</Typography>
              {editable && <IconButton size="small" aria-label={`Remove ${roomType.name} (${rate.name})`} onClick={() => setQuantity(roomType, rate, 0)} sx={{ mt: '-5px', mr: '-8px', color: 'text.secondary' }}><CloseRounded sx={{ fontSize: 16 }} /></IconButton>}
            </Stack>
          </Stack>
          <NightlyPrices nightly={rate.nightly} quantity={line.quantity} currency={totals.currency} />
        </Box>)}
        {editable && <Button size="small" onClick={clearCart} sx={{ alignSelf: 'flex-start', minHeight: 0, py: .25, fontSize: 12 }}>Clear all</Button>}
      </Stack>}

    {cart.length > 0 && <>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={.75}>
        {savings > 0 && <Stack direction="row" justifyContent="space-between" sx={{ color: 'secondary.dark' }}><Typography sx={{ fontSize: 14, fontWeight: 700 }}>Special offer savings</Typography><Typography sx={{ fontSize: 14, fontWeight: 700 }}>−{money(savings, totals.currency)}</Typography></Stack>}
        <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontWeight: 700 }}>Total</Typography><Typography sx={{ fontFamily: fonts.playful, fontSize: 22 }}>{money(totals.total, totals.currency)}</Typography></Stack>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: '-4px !important' }}>Taxes and service included</Typography>
        <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.dark' }}><Typography sx={{ fontSize: 14, fontWeight: 700 }}>Pay now</Typography><Typography sx={{ fontSize: 14, fontWeight: 700 }}>{money(totals.dueNow, totals.currency)}</Typography></Stack>
        {totals.balance > 0 && <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: 14 }}>Pay at the hotel</Typography><Typography sx={{ fontSize: 14 }}>{money(totals.balance, totals.currency)}</Typography></Stack>}
      </Stack>
      {showFit && !plan && <Alert severity="info" sx={{ mt: 2, fontSize: 13 }}>
        These rooms sleep {capacity}; you’re {guests}. Add another room to fit everyone.
      </Alert>}
    </>}
    {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
  </Box>;
}
