import { Box, Stack, Typography, useTheme } from '@mui/material';
import { useBookingSearch } from '../../context/BookingSearchContext';
import { fonts } from '../../theme';
import { CheckAvailabilityButton } from './CheckAvailabilityButton';
import { GuestStepper } from './GuestStepper';
import { RangeCalendar } from './RangeCalendar';
import { SearchResults } from './SearchResults';

const panelDateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const MS_PER_NIGHT = 1000 * 60 * 60 * 24;

// The Arrival section's full booking widget: the same two-month calendar and
// guest count as the hero search bar — literally the same state, via
// BookingSearchContext, so dates picked in either place show up in both.
// "Check availability" currently hands off to SiteMinder (see
// CheckAvailabilityButton); SearchResults below renders the in-page search's
// results once that is switched back on.
export function BookingPanel() {
  const theme = useTheme();
  const today = new Date();
  const { checkIn, checkOut, selectDay, adults, setAdults, children, setChildren } = useBookingSearch();
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / MS_PER_NIGHT);

  return <>
    {/* Capped to its natural content width and centered — otherwise, as a plain flex
        block, it stretches to fill whatever (often much wider) column it's given,
        leaving the calendar and sidebar looking stranded apart from each other. */}
    <Box sx={{
      display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', maxWidth: 780, mx: 'auto',
      border: '1px solid', borderColor: 'divider', bgcolor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 12px 32px rgba(23,60,44,.05)',
    }}>
      <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
        <RangeCalendar checkIn={checkIn} checkOut={checkOut} minDate={today} onSelectDay={selectDay} />
      </Box>

      <Box sx={{
        width: { md: 264 }, flexShrink: 0, p: { xs: 2.5, md: 3 },
        borderTop: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
        borderLeft: { md: `1px solid ${theme.palette.divider}` },
      }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Your dates</Typography>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          <Box>
            <Typography sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: 17 }}>{panelDateFmt.format(checkIn)}</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Check-in</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: 17 }}>{panelDateFmt.format(checkOut)}</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Check-out</Typography>
          </Box>
        </Stack>
        <Typography variant="overline" sx={{ display: 'block', color: 'secondary.dark', mt: 1 }}>{nights} night{nights !== 1 ? 's' : ''}</Typography>

        <Stack spacing={2} sx={{ mt: 3, pt: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <GuestStepper label="Adults" value={adults} min={1} onChange={setAdults} />
          <GuestStepper label="Children" value={children} min={0} onChange={setChildren} />
        </Stack>

        <Box sx={{ mt: 3 }}><CheckAvailabilityButton /></Box>
      </Box>
    </Box>

    <SearchResults />
  </>;
}
