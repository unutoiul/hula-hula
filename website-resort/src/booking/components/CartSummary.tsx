import CloseRounded from '@mui/icons-material/CloseRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import { Alert, Box, Button, Divider, IconButton, Stack, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';
import type { RateOffer } from '../../../shared/bookingContract';
import { PaymentMethods } from '../../components/booking/PaymentMethods';
import { toISODate, useBookingSearch } from '../../context/BookingSearchContext';
import { useBookingFlow } from '../BookingFlowContext';
import { guestsLabel, mealsLabel, money, nightsLabel, shortDayLabel } from '../format';

/** The basket's column on wide screens: stays in view, and scrolls by itself
 * when a long stay makes it taller than the window, so its button can always
 * be reached. The side and bottom padding keep the card's shadow from being cut. */
export const stickyCartSx = { position: { md: 'sticky' }, top: { md: 24 }, maxHeight: { md: 'calc(100vh - 24px)' }, overflowY: { md: 'auto' }, mx: { md: -2 }, px: { md: 2 }, pb: { md: 5 } } as const;

// Under each room: what every night costs, adding up to the amount beside the
// room — rates change from night to night, so an average doesn't tell a guest
// what they're paying. aria-live="off": a screen reader announces the room
// that was added, not a list of dates.
function NightlyPrices({ nightly, quantity, currency }: { nightly: RateOffer['nightly']; quantity: number; currency: string }) {
  const [open, setOpen] = useState(false);
  if (nightly.length === 0) return null;
  return <Box aria-live="off" sx={{ mt: .5 }}>
    <Button size="small" variant="text" aria-expanded={open} onClick={() => setOpen((v) => !v)}
      endIcon={<ExpandMoreRounded sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }} />}
      sx={{ minHeight: 32, p: 0, fontSize: 12, textDecoration: 'none', borderRadius: 1, '&:hover': { textDecoration: 'underline' } }}>Price per night</Button>
    {open && <Box sx={{ mt: .5, p: 1.25, bgcolor: 'rgba(23,60,44,.035)', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', columnGap: 1.5, rowGap: .75 }}>
      {nightly.map((night) => <Box key={night.date} sx={{ display: 'contents' }}>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{shortDayLabel(night.date)}</Typography>
        <Typography sx={{ fontSize: 12.5, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {quantity > 1 && <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: 11 }}>{quantity} × {money(night.amount, currency)}</Box>}
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
  const { cart, totals, plan, setQuantity, clearCart, availability } = useBookingFlow();
  // From the dates on screen, so the summary never lags behind a search still loading.
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
  // At least one adult per room — the same rule the booking itself follows.
  const bookedAdults = Math.max(adults, totals.rooms);
  const savings = cart.reduce((sum, { line, rate }) => sum + (rate.offer?.savings ?? 0) * line.quantity, 0);
  const guests = bookedAdults + children;
  const capacity = cart.reduce((sum, { line, roomType }) => sum + roomType.capacity.guests * line.quantity, 0);

  return <Box sx={{ border: '1px solid', borderColor: 'divider', borderTop: '4px solid #50830d', bgcolor: 'background.paper', borderRadius: '20px', p: { xs: 2.5, md: 3 }, boxShadow: '0 12px 32px rgba(23,60,44,.055)', fontVariantNumeric: 'tabular-nums' }}>
    <Typography variant="overline" sx={{ color: 'text.secondary' }}>Your stay</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5, mt: 1.5, mb: 1.5 }}>
      {[{ label: 'Check-in', date: checkIn }, { label: 'Check-out', date: checkOut }].map(({ label, date }, index) => <Box key={label} sx={{ minWidth: 0, ...(index ? { borderLeft: '1px solid', borderColor: 'divider', pl: 1.5 } : {}) }}>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: .5 }}>{label}</Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.5 }}>{shortDayLabel(toISODate(date))}</Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{date.getFullYear()}</Typography>
      </Box>)}
    </Box>
    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{nightsLabel(nights)} · {guestsLabel(bookedAdults, children)}</Typography>
    {bookedAdults > adults && <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: .5 }}>Each room is booked for at least one adult.</Typography>}

    <Divider sx={{ my: 2 }} />
    {cart.length === 0
      ? <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>No rooms picked yet — choose a rate to add it here.</Typography>
      : <Stack spacing={1.5} aria-live="polite">
        {cart.map(({ line, roomType, rate }) => <Box key={rate.roomRateUuid}>
          <Stack direction="row" justifyContent="space-between" spacing={1.25}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.5 }}>{line.quantity} × {roomType.name}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{rate.name}{mealsLabel(rate.meals).toLowerCase() !== rate.name.toLowerCase() ? ` · ${mealsLabel(rate.meals)}` : ''}</Typography>
            </Box>
            <Stack direction="row" alignItems="flex-start" spacing={.25} sx={{ flexShrink: 0 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{money(rate.total * line.quantity, totals.currency)}</Typography>
              {editable && <IconButton size="small" aria-label={`Remove ${roomType.name} (${rate.name})`} onClick={() => setQuantity(roomType, rate, 0)} sx={{ mt: '-5px', mr: '-8px', color: 'text.secondary' }}><CloseRounded sx={{ fontSize: 16 }} /></IconButton>}
            </Stack>
          </Stack>
          <NightlyPrices nightly={rate.nightly} quantity={line.quantity} currency={totals.currency} />
        </Box>)}
        {editable && <Button size="small" onClick={clearCart} sx={{ alignSelf: 'flex-start', minHeight: 0, py: .25, fontSize: 12 }}>Clear all</Button>}
      </Stack>}

    {cart.length > 0 && <>
      <Divider sx={{ my: 2 }} />
      {savings > 0 && <Stack spacing={1} sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" spacing={1}><Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Before special offer</Typography><Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>{money(totals.total + savings, totals.currency)}</Typography></Stack>
        <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ color: 'success.dark', bgcolor: 'rgba(80,131,13,.07)', px: 1.25, py: 1, borderRadius: '8px' }}><Typography sx={{ fontSize: 12, fontWeight: 600 }}>Special offer savings</Typography><Typography sx={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>−{money(savings, totals.currency)}</Typography></Stack>
      </Stack>}
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}><Typography sx={{ fontSize: 15, fontWeight: 700 }}>Total stay</Typography><Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.8px', whiteSpace: 'nowrap' }}>{money(totals.total, totals.currency)}</Typography></Stack>
      <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: .25 }}>Includes taxes and service charges</Typography>
      <Box sx={{ mt: 2.5, p: 1.75, borderRadius: '12px', bgcolor: 'rgba(80,131,13,.065)', border: '1px solid rgba(80,131,13,.15)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Due now</Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 700, whiteSpace: 'nowrap' }}>{money(totals.dueNow, totals.currency)}</Typography>
        </Stack>
        <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: .5 }}>{totals.balance > 0 ? 'Deposit to confirm your stay' : 'Full payment for your stay'}</Typography>
        {totals.balance > 0 && <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 1.25, pt: 1.25, borderTop: '1px solid', borderColor: 'divider' }}><Typography sx={{ fontSize: 12 }}>At the hotel</Typography><Typography sx={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{money(totals.balance, totals.currency)}</Typography></Stack>}
      </Box>
      {showFit && !plan && <Alert severity="info" sx={{ mt: 2, fontSize: 13 }}>
        These rooms sleep {capacity}; you’re {guests}. Add another room to fit everyone.
      </Alert>}
    </>}
    {action && <Box sx={{ mt: 2.5, '& > .MuiButton-root': { borderRadius: '12px', minHeight: 50 } }}>{action}</Box>}
    {action && cart.length > 0 && <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2.5, pt: 2.5 }}><PaymentMethods compact provider={availability.data?.paymentProvider ?? '2c2p'} /></Box>}
  </Box>;
}
