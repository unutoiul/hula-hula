import Search from '@mui/icons-material/Search';
import { Box, Button, Popover, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useBookingSearch } from '../../context/BookingSearchContext';
import { fonts } from '../../theme';
import { GuestStepper } from './GuestStepper';
import { RangeCalendar } from './RangeCalendar';

const bookingDateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// A Soneva-style hero search bar: dates + guests only (a single property needs
// no destination field), each opening a small popover to edit. Dates/guests
// and the actual availability search are shared state (BookingSearchContext)
// with the Arrival section's full panel — Search here just runs that same
// search and scrolls down to where the results render, rather than sending
// the guest away from the page to check.
export function BookingSearchBar() {
  const today = new Date();
  const { checkIn, checkOut, selectDay, selectingCheckout, adults, setAdults, children, setChildren, status, search } = useBookingSearch();

  const barRef = useRef<HTMLDivElement>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [guestAnchor, setGuestAnchor] = useState<HTMLElement | null>(null);

  // Close the popover the moment a range completes (selectingCheckout flips
  // back to false) — but not on mount, when it's already false and there's
  // nothing to close.
  const wasSelectingCheckout = useRef(selectingCheckout);
  useEffect(() => {
    if (wasSelectingCheckout.current && !selectingCheckout) setDateOpen(false);
    wasSelectingCheckout.current = selectingCheckout;
  }, [selectingCheckout]);

  function handleSearch() {
    search();
    document.getElementById('arrival')?.scrollIntoView({ behavior: 'smooth' });
  }

  return <Box ref={barRef} sx={{
    position: 'relative',
    display: 'flex', flexDirection: { xs: 'column', sm: 'row', md: 'column', lg: 'row' },
    // Content-sized in row mode, not stretched to a 640px cap — with Guests
    // previously the only flex:1 segment, stretching the bar left it soaking
    // up all the leftover width as dead space next to "1 adult". Full width
    // on mobile (xs) still makes sense since the segments stack there.
    width: { xs: '100%', sm: 'fit-content', md: '100%', lg: 'fit-content' }, maxWidth: { xs: 640, sm: 'none' },
    border: '1px solid', borderColor: 'divider', bgcolor: 'white', color: 'text.primary', borderRadius: 3, overflow: 'hidden', boxShadow: '0 5px 18px rgba(23,60,44,.04)',
  }}>
    <Box component="button" type="button" aria-label="Choose stay dates" aria-expanded={dateOpen} onClick={() => setDateOpen(true)} sx={{
      border: 0, bgcolor: 'transparent', color: 'inherit', textAlign: 'left',
      // A fixed width in row mode, not flex:1 — flex items don't shrink below their
      // content's intrinsic width by default, so with flex:1 the date text (which
      // varies a character or two as days/months change, e.g. "Aug 8" vs "Aug 18")
      // was nudging this box's rendered width every time it updated, shifting the
      // whole bar. A stable width sidesteps that instead of fighting flexbox for it.
      flex: { xs: 1, sm: '0 0 232px', md: 1, lg: '0 0 232px' }, minWidth: 0, px: 2.5, py: 1.4, cursor: 'pointer',
      borderBottom: { xs: '1px solid #d6e1ce', sm: 'none', md: '1px solid #d6e1ce', lg: 'none' }, borderRight: { sm: '1px solid #d6e1ce', md: 'none', lg: '1px solid #d6e1ce' },
      transition: 'background-color .2s ease', '&:hover': { bgcolor: 'secondary.light' },
    }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '.6rem' }}>Your dates</Typography>
      <Typography sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: 13, mt: .15, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{bookingDateFmt.format(checkIn)} – {bookingDateFmt.format(checkOut)}</Typography>
    </Box>
    <Box component="button" type="button" aria-label="Choose guests" aria-expanded={!!guestAnchor} onClick={(e) => setGuestAnchor(e.currentTarget)} sx={{
      border: 0, bgcolor: 'transparent', color: 'inherit', textAlign: 'left',
      // Fixed width too, same reasoning as Dates above — sized to comfortably fit
      // the longest realistic case ("2 adults · 3 children") without ballooning.
      flex: { xs: 1, sm: '0 0 180px', md: 1, lg: '0 0 180px' }, minWidth: 0, px: 2.5, py: 1.4, cursor: 'pointer',
      transition: 'background-color .2s ease', '&:hover': { bgcolor: 'secondary.light' },
    }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '.6rem' }}>Your people</Typography>
      <Typography sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: 13, mt: .15, whiteSpace: 'nowrap' }}>{adults} adult{adults !== 1 ? 's' : ''}{children > 0 ? ` · ${children} child${children !== 1 ? 'ren' : ''}` : ''}</Typography>
    </Box>
    <Button onClick={handleSearch} disabled={status === 'loading'} aria-label="Search availability" color="inherit" sx={{
      minWidth: { xs: '100%', sm: 56, md: '100%', lg: 56 }, height: { sm: 'auto' }, py: { xs: 1, sm: 0, md: 1, lg: 0 }, borderRadius: 0,
      bgcolor: 'primary.main', color: 'white',
      '&:hover': { bgcolor: 'primary.dark' },
    }}><Search sx={{ fontSize: 20 }} /></Button>

    {/* Anchored to the whole bar and centered, not to the (much narrower) Dates
        sub-box — the two-month calendar is wider than that box, so left-anchoring
        it there left it hugging the bar's left edge instead of reading as attached
        to the search widget as a whole. */}
    <Popover open={dateOpen} anchorEl={barRef.current} onClose={() => setDateOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }} slotProps={{ paper: { sx: { mt: 1.5, borderRadius: 3 } } }}>
      <RangeCalendar checkIn={checkIn} checkOut={checkOut} minDate={today} onSelectDay={selectDay} />
    </Popover>
    <Popover open={!!guestAnchor} anchorEl={guestAnchor} onClose={() => setGuestAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }} slotProps={{ paper: { sx: { mt: 1.5, borderRadius: 3, minWidth: 220 } } }}>
      <Stack spacing={2} sx={{ p: 3 }}>
        <GuestStepper label="Adults" value={adults} min={1} onChange={setAdults} />
        <GuestStepper label="Children" value={children} min={0} onChange={setChildren} />
      </Stack>
    </Popover>
  </Box>;
}
