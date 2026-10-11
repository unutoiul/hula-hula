import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Button } from '@mui/material';
import { useBookingSearch } from '../../context/BookingSearchContext';

// The one booking CTA, shared by the hero search bar and the Arrival panel so
// both look and behave identically. For now it hands the chosen dates and
// guests straight to SiteMinder's booking engine rather than running the
// in-page availability search (BookingSearchContext.search), which needs the
// SiteMinder API keys on the server.
export function CheckAvailabilityButton() {
  const { bookingUrl } = useBookingSearch();
  return <Button href={bookingUrl} target="_blank" rel="noopener" variant="contained" fullWidth endIcon={<ArrowOutward />}>
    Check availability
  </Button>;
}
