import ArrowOutward from '@mui/icons-material/ArrowOutward';
import East from '@mui/icons-material/East';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Button } from '@mui/material';
import { ONSITE_BOOKING, useBookingSearch } from '../../context/BookingSearchContext';
import { linkClick } from '../../router';

const prefetchBooking = () => { void import('../../booking/BookingApp'); };

// The one booking CTA, shared by the hero search bar and the Arrival panel so
// both look and behave identically. With on-site booking switched on it opens
// /book for the chosen dates and guests (loading that page's code as soon as
// the pointer is near); otherwise it hands them to the hotel's booking
// engine, or — until that's set up — to the front desk on WhatsApp.
export function CheckAvailabilityButton({ fullWidth = true }: { fullWidth?: boolean }) {
  const { bookHref, siteMinderUrl } = useBookingSearch();
  if (!ONSITE_BOOKING) {
    const whatsapp = siteMinderUrl.startsWith('https://wa.me/');
    return <Button href={siteMinderUrl} target="_blank" rel="noopener" variant="contained" fullWidth={fullWidth} startIcon={whatsapp ? <WhatsApp /> : undefined} endIcon={whatsapp ? undefined : <ArrowOutward />} sx={{ whiteSpace: 'nowrap' }}>
      {whatsapp ? 'Ask for a room' : 'Check availability'}
    </Button>;
  }
  return <Button href={bookHref} onClick={linkClick(bookHref)} onPointerEnter={prefetchBooking} onFocus={prefetchBooking} variant="contained" fullWidth={fullWidth} endIcon={<East />} sx={{ whiteSpace: 'nowrap' }}>
    Check availability
  </Button>;
}
