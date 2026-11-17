import { Box, Stack, Typography, useTheme } from '@mui/material';
import { useBookingSearch } from '../../context/BookingSearchContext';
import { fonts } from '../../theme';
import { CheckAvailabilityButton } from './CheckAvailabilityButton';
import { GuestStepper } from './GuestStepper';
import { PaymentMethods } from './PaymentMethods';
import { RangeCalendar } from './RangeCalendar';

const panelDateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const MS_PER_NIGHT = 1000 * 60 * 60 * 24;

// The Arrival section's full booking widget: the same two-month calendar and
// guest count as the hero search bar — literally the same state, via
// BookingSearchContext, so dates picked in either place show up in both.
// "Check availability" goes on to the booking pages (see
// CheckAvailabilityButton).
export function BookingPanel() {
  const theme = useTheme();
  const today = new Date();
  const { checkIn, checkOut, selectDay, selectingCheckout, adults, setAdults, children, setChildren } = useBookingSearch();
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / MS_PER_NIGHT);

  return <>
    {/* Capped to its natural content width and centered — otherwise, as a plain flex
        block, it stretches to fill whatever (often much wider) column it's given,
        leaving the calendar and sidebar looking stranded apart from each other. */}
    <Box sx={{
      display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 780, mx: 'auto',
      border: '1px solid', borderColor: 'divider', borderTop: '5px solid #c92f6b', bgcolor: 'background.paper', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 16px 36px rgba(90,36,72,.09)',
    }}>
      <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
        <RangeCalendar checkIn={checkIn} checkOut={checkOut} minDate={today} onSelectDay={selectDay} selectingCheckout={selectingCheckout} />
      </Box>

      <Box sx={{
        flexShrink: 0, p: { xs: 2.5, md: 3 }, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 4,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundImage: 'linear-gradient(165deg, rgba(253,230,238,.6), transparent 70%)',
      }}>
        <Box>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Your dates</Typography>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          <Box>
            <Typography sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: 17 }}>{panelDateFmt.format(checkIn)}</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Check-in</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: 17 }}>{panelDateFmt.format(checkOut)}</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Check-out</Typography>
          </Box>
        </Stack>
        <Typography variant="overline" sx={{ display: 'block', color: 'secondary.dark', mt: 1 }}>{nights} night{nights !== 1 ? 's' : ''}</Typography>
        </Box>
        <Stack spacing={2} sx={{ mt: { xs: 2, sm: 0 }, pt: { xs: 2, sm: 0 }, borderTop: { xs: `1px solid ${theme.palette.divider}`, sm: 'none' } }}>
          <GuestStepper label="Adults" value={adults} min={1} onChange={setAdults} />
          <GuestStepper label="Children" value={children} min={0} onChange={setChildren} />
        </Stack>

        <Box sx={{ mt: 2.5, gridColumn: '1 / -1' }}><CheckAvailabilityButton /></Box>
      </Box>
    </Box>
    <Box sx={{ mt: 2.5 }}><PaymentMethods centered compact /></Box>
  </>;
}
