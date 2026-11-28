import ArrowOutward from '@mui/icons-material/ArrowOutward';
import East from '@mui/icons-material/East';
import { Button } from '@mui/material';
import { BOOKING_ENGINE, ONSITE_BOOKING, useBookingSearch } from '../../context/BookingSearchContext';
import { useContactForm } from '../../context/ContactFormContext';
import { linkClick } from '../../router';

const prefetchBooking = () => {
  void import('../../booking/BookingApp');
};

// The one booking CTA, shared by the hero search bar, the Arrival panel and
// the room pages, so they all look and behave the same. In order of
// preference: on-site booking (/book with live rates and Stripe), the
// hotel's SiteMinder booking engine, or — until either is set up — a booking
// request emailed to reservations with the chosen dates and guests.
export function CheckAvailabilityButton({ fullWidth = true, room }: { fullWidth?: boolean; room?: string }) {
  const { bookHref, siteMinderUrl } = useBookingSearch();
  const openContact = useContactForm();
  if (ONSITE_BOOKING) {
    return (
      <Button
        href={bookHref}
        onClick={linkClick(bookHref)}
        onPointerEnter={prefetchBooking}
        onFocus={prefetchBooking}
        variant="contained"
        fullWidth={fullWidth}
        endIcon={<East />}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Check availability
      </Button>
    );
  }
  if (BOOKING_ENGINE) {
    return (
      <Button
        href={siteMinderUrl}
        target="_blank"
        rel="noopener"
        variant="contained"
        fullWidth={fullWidth}
        endIcon={<ArrowOutward />}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Check availability
      </Button>
    );
  }
  return (
    <Button
      variant="contained"
      fullWidth={fullWidth}
      endIcon={<East />}
      sx={{ whiteSpace: 'nowrap' }}
      onClick={() =>
        openContact({
          topic: 'Room booking & availability',
          booking: true,
          page: room ?? 'Booking search',
          message: room ? `Hello Royal Pineapple! We’d love to stay in the ${room}.` : 'Hello Royal Pineapple! We’d love to stay with you.',
        })
      }
    >
      Request these dates
    </Button>
  );
}
