import ArrowOutward from '@mui/icons-material/ArrowOutward';
import East from '@mui/icons-material/East';
import { Button } from '@mui/material';
import { ONSITE_BOOKING, useBookingSearch } from '../../context/BookingSearchContext';
import { linkClick } from '../../router';

const prefetchBooking = () => { void import('../../booking/BookingApp'); };

// The one booking CTA, shared by the hero search bar and the Arrival panel so
// both look and behave identically. With on-site booking switched on it opens
// /book for the chosen dates and guests (loading that page's code as soon as
// the pointer is near); otherwise it hands them to SiteMinder's booking engine.
export function CheckAvailabilityButton() {
  const { bookHref, siteMinderUrl } = useBookingSearch();
  if (!ONSITE_BOOKING) {
    return <Button href={siteMinderUrl} target="_blank" rel="noopener" variant="contained" fullWidth endIcon={<ArrowOutward />}>
      Check availability
    </Button>;
  }
  return <Button href={bookHref} onClick={linkClick(bookHref)} onPointerEnter={prefetchBooking} onFocus={prefetchBooking} variant="contained" fullWidth endIcon={<East />}>
    Check availability
  </Button>;
}
