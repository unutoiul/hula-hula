import { Alert, Box, Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { toISODate, useBookingSearch } from '../../context/BookingSearchContext';
import { fonts } from '../../theme';
import { useBookingFlow } from '../BookingFlowContext';
import { guestsLabel, mealsLabel, money, nightsLabel, stayLabel } from '../format';

// The running total beside every step: the stay, each room picked, the total
// and what's paid now versus at the hotel. `action` is the step's button.
export function CartSummary({ action, showFit = true }: { action?: ReactNode; showFit?: boolean }) {
  const { checkIn, checkOut, adults, children } = useBookingSearch();
  const { cart, totals, plan, availability } = useBookingFlow();
  const nights = availability.data?.nights ?? Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
  const guests = adults + children;
  const capacity = cart.reduce((sum, { line, roomType }) => sum + roomType.capacity.guests * line.quantity, 0);

  return <Box sx={{ border: '1px solid', borderColor: 'divider', borderTop: '5px solid #50830d', bgcolor: 'background.paper', borderRadius: '24px', p: { xs: 2.5, md: 3 }, boxShadow: '0 16px 36px rgba(23,60,44,.07)' }}>
    <Typography variant="overline" sx={{ color: 'text.secondary' }}>Your stay</Typography>
    <Typography sx={{ fontFamily: fonts.playful, fontSize: 18, mt: .5 }}>{stayLabel(toISODate(checkIn), toISODate(checkOut))}</Typography>
    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{nightsLabel(nights)} · {guestsLabel(adults, children)}</Typography>

    <Divider sx={{ my: 2 }} />
    {cart.length === 0
      ? <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>No rooms picked yet — choose a rate to add it here.</Typography>
      : <Stack spacing={1.5} aria-live="polite">
        {cart.map(({ line, roomType, rate }) => <Stack key={rate.roomRateUuid} direction="row" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{line.quantity} × {roomType.name}</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{rate.name}{mealsLabel(rate.meals).toLowerCase() !== rate.name.toLowerCase() ? ` · ${mealsLabel(rate.meals)}` : ''}</Typography>
          </Box>
          <Typography sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>{money(rate.total * line.quantity, totals.currency)}</Typography>
        </Stack>)}
      </Stack>}

    {cart.length > 0 && <>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={.75}>
        <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontWeight: 700 }}>Total</Typography><Typography sx={{ fontFamily: fonts.playful, fontSize: 22 }}>{money(totals.total, totals.currency)}</Typography></Stack>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: '-4px !important' }}>Taxes and service included</Typography>
        <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.dark' }}><Typography sx={{ fontSize: 14, fontWeight: 700 }}>Pay now</Typography><Typography sx={{ fontSize: 14, fontWeight: 700 }}>{money(totals.dueNow, totals.currency)}</Typography></Stack>
        {totals.balance > 0 && <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: 14 }}>Pay at the hotel</Typography><Typography sx={{ fontSize: 14 }}>{money(totals.balance, totals.currency)}</Typography></Stack>}
      </Stack>
      {showFit && !plan && <Alert severity="info" sx={{ mt: 2, fontSize: 13 }}>
        {cart.reduce((n, { line }) => n + line.quantity, 0) > adults
          ? 'Each room needs at least one adult — remove a room or add an adult.'
          : `These rooms sleep ${capacity}; you’re ${guests}. Add another room to fit everyone.`}
      </Alert>}
    </>}
    {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
  </Box>;
}
