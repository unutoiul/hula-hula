import { Box, Popover, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useBookingSearch } from '../../context/BookingSearchContext';
import { fonts } from '../../theme';
import { CheckAvailabilityButton } from './CheckAvailabilityButton';
import { GuestStepper } from './GuestStepper';
import { RangeCalendar } from './RangeCalendar';

const bookingDateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// A Soneva-style hero search bar: dates + guests only (a single property needs
// no destination field), each opening a small popover to edit. Dates/guests
// are shared state (BookingSearchContext) with the Arrival section's full
// panel, and both end in the same CheckAvailabilityButton.
export function BookingSearchBar() {
  const today = new Date();
  const { checkIn, checkOut, selectDay, selectingCheckout, adults, setAdults, children, setChildren } = useBookingSearch();

  const fieldsRef = useRef<HTMLDivElement>(null);
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

  return <Box sx={{
    width: '100%', maxWidth: 640,
    border: '1px solid', borderColor: 'divider', borderTop: '4px solid #50830d', bgcolor: 'background.paper', color: 'text.primary', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(23,60,44,.07)',
  }}>
    {/* Dates and guests sit side by side where the bar is wide enough (sm, lg+)
        and stack where it isn't (phones, and the narrow md hero column). Equal
        flex-basis-0 halves keep the split stable as the date text changes length. */}
    <Box ref={fieldsRef} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row', md: 'column', lg: 'row' }, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box component="button" type="button" aria-label="Choose stay dates" aria-expanded={dateOpen} onClick={() => setDateOpen(true)} sx={{
        border: 0, bgcolor: 'transparent', color: 'inherit', textAlign: 'left',
        flex: '1 1 0', minWidth: 0, px: 2.5, py: 1.6, cursor: 'pointer',
        borderBottom: { xs: '1px solid #d6e1ce', sm: 'none', md: '1px solid #d6e1ce', lg: 'none' }, borderRight: { sm: '1px solid #d6e1ce', md: 'none', lg: '1px solid #d6e1ce' },
        transition: 'background-color .2s ease', '&:hover': { bgcolor: 'secondary.light' }, '&:focus-visible': { outlineOffset: -4 },
      }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: { xs: 11, sm: '.6rem' } }}>Your dates</Typography>
        <Typography sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: 13, mt: .15, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{bookingDateFmt.format(checkIn)} – {bookingDateFmt.format(checkOut)}</Typography>
      </Box>
      <Box component="button" type="button" aria-label="Choose guests" aria-expanded={!!guestAnchor} onClick={(e) => setGuestAnchor(e.currentTarget)} sx={{
        border: 0, bgcolor: 'transparent', color: 'inherit', textAlign: 'left',
        flex: '1 1 0', minWidth: 0, px: 2.5, py: 1.6, cursor: 'pointer',
        transition: 'background-color .2s ease', '&:hover': { bgcolor: 'secondary.light' }, '&:focus-visible': { outlineOffset: -4 },
      }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: { xs: 11, sm: '.6rem' } }}>Your people</Typography>
        <Typography sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: 13, mt: .15, whiteSpace: 'nowrap' }}>{adults} adult{adults !== 1 ? 's' : ''}{children > 0 ? ` · ${children} child${children !== 1 ? 'ren' : ''}` : ''}</Typography>
      </Box>
    </Box>
    <Box sx={{ p: 1.5 }}><CheckAvailabilityButton /></Box>

    {/* Anchored to the whole fields row and centered, not to the (much narrower)
        Dates sub-box — the two-month calendar is wider than that box, so
        left-anchoring it there left it hugging the bar's left edge instead of
        reading as attached to the search widget as a whole. On phones it takes a
        fixed width (capped by MUI's default 100% - 32px), since the calendar
        sizes itself to its container. */}
    <Popover open={dateOpen} anchorEl={fieldsRef.current} onClose={() => setDateOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }} slotProps={{ paper: { sx: { mt: 1, borderRadius: '24px', width: { xs: 380, sm: 520 } } } }}>
      <RangeCalendar checkIn={checkIn} checkOut={checkOut} minDate={today} onSelectDay={selectDay} />
    </Popover>
    <Popover open={!!guestAnchor} anchorEl={guestAnchor} onClose={() => setGuestAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }} slotProps={{ paper: { sx: { mt: 1, borderRadius: '24px', minWidth: 240 } } }}>
      <Stack spacing={2} sx={{ p: 3 }}>
        <GuestStepper label="Adults" value={adults} min={1} onChange={setAdults} />
        <GuestStepper label="Children" value={children} min={0} onChange={setChildren} />
      </Stack>
    </Popover>
  </Box>;
}
