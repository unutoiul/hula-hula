import East from '@mui/icons-material/East';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useBookingSearch } from '../../context/BookingSearchContext';
import { fonts } from '../../theme';

// Sits directly under the Arrival section's calendar/guest panel and renders
// whatever the last search() produced — loading, no availability, an error,
// or the room list. Nothing to show before a first search, so it renders
// nothing at all rather than an empty shell.
export function SearchResults() {
  const { status, results, errorMessage, currency, bookingUrl } = useBookingSearch();

  if (status === 'idle') return null;

  const priceFmt = new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 });

  return <Box sx={{ width: '100%', maxWidth: 780, mx: 'auto', mt: 3 }}>
    {status === 'loading' && (
      <Typography sx={{ fontSize: 14, color: 'text.secondary', textAlign: 'center', py: 3 }}>Checking availability…</Typography>
    )}

    {status === 'error' && (
      <Typography role="alert" sx={{ fontSize: 14, color: 'error.main', textAlign: 'center', py: 3 }}>{errorMessage}</Typography>
    )}

    {status === 'results' && results.length === 0 && (
      <Typography role="alert" sx={{ fontSize: 14, color: 'text.secondary', textAlign: 'center', py: 3 }}>
        No rooms available for those dates — try different dates.
      </Typography>
    )}

    {status === 'results' && results.length > 0 && (
      <Stack spacing={1.5}>
        {results.map((room) => (
          <Stack key={room.roomTypeUuid} direction={{ xs: 'column', sm: 'row' }} spacing={2}
            alignItems={{ sm: 'center' }} justifyContent="space-between"
            sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.default', p: { xs: 2.5, sm: 3 } }}>
            <Box>
              <Typography variant="h3" sx={{ fontSize: 20 }}>{room.name}</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: .5 }}>{room.nights} night{room.nights !== 1 ? 's' : ''}</Typography>
            </Box>
            <Stack direction={{ xs: 'row', sm: 'column' }} alignItems={{ xs: 'center', sm: 'flex-end' }} justifyContent="space-between" spacing={{ xs: 0, sm: .5 }}>
              <Box sx={{ textAlign: { sm: 'right' } }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>From</Typography>
                <Typography sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: 20 }}>{priceFmt.format(room.fromPrice)}</Typography>
              </Box>
              <Button href={bookingUrl} target="_blank" rel="noopener" variant="outlined" size="small" endIcon={<East sx={{ fontSize: 16 }} />}>
                Book now
              </Button>
            </Stack>
          </Stack>
        ))}
      </Stack>
    )}
  </Box>;
}
