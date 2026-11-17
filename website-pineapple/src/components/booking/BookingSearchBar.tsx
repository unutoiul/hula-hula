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
// `wide` (the homepage hero's booking row): dates, guests and the button in
// one row from tablets up, a flatter card and a squarer button.
export function BookingSearchBar({ wide = false }: { wide?: boolean }) {
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

  const valueSize = wide ? { xs: 14, sm: 13, md: 12, lg: 14 } : 13;
  return <Box sx={{
    width: '100%', maxWidth: wide ? 'none' : 640, display: wide ? { sm: 'flex' } : 'block', alignItems: 'stretch',
    border: '1px solid', borderColor: 'divider', borderTop: wide ? undefined : '4px solid #c92f6b', bgcolor: 'background.paper', color: 'text.primary', borderRadius: wide ? '5px' : '24px', overflow: 'hidden',
    boxShadow: wide ? '0 7px 30px rgba(90,36,72,.035)' : '0 8px 24px rgba(90,36,72,.07)',
  }}>
    {/* Dates and guests sit side by side where the bar is wide enough (sm, lg+)
        and stack where it isn't (phones, and the narrow md hero column). Equal
        flex-basis-0 halves keep the split stable as the date text changes length. */}
    <Box ref={fieldsRef} sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: wide ? { xs: 'column', sm: 'row' } : { xs: 'column', sm: 'row', md: 'column', lg: 'row' }, borderBottom: wide ? { xs: '1px solid #f0dce4', sm: 'none' } : '1px solid', borderColor: 'divider' }}>
      <Box component="button" type="button" aria-label="Choose stay dates" aria-expanded={dateOpen} onClick={() => setDateOpen(true)} sx={{
        border: 0, bgcolor: 'transparent', color: 'inherit', textAlign: 'left',
        flex: wide ? '1.4 1 0' : '1 1 0', minWidth: 0, px: wide ? { xs: 2.5, sm: 4 } : 2.5, py: wide ? { xs: 1.6, sm: 2.1 } : 1.6, cursor: 'pointer',
        borderBottom: wide ? { xs: '1px solid #f0dce4', sm: 'none' } : { xs: '1px solid #f0dce4', sm: 'none', md: '1px solid #f0dce4', lg: 'none' },
        borderRight: wide ? { sm: '1px solid #f0dce4' } : { sm: '1px solid #f0dce4', md: 'none', lg: '1px solid #f0dce4' },
        transition: 'background-color .2s ease', '&:hover': { bgcolor: 'primary.light' }, '&:focus-visible': { outlineOffset: -4 },
      }}>
        <Typography component="span" variant="overline" sx={{ display: 'block', color: 'text.secondary', fontSize: { xs: 11, sm: wide ? '.66rem' : '.6rem' } }}>Check in – check out</Typography>
        <Typography component="span" sx={{ display: 'block', fontFamily: fonts.sans, fontWeight: 400, fontSize: valueSize, mt: .15, textWrap: 'balance', fontVariantNumeric: 'tabular-nums' }}>{bookingDateFmt.format(checkIn)} – {bookingDateFmt.format(checkOut)}</Typography>
      </Box>
      <Box component="button" type="button" aria-label="Choose guests" aria-expanded={!!guestAnchor} onClick={(e) => setGuestAnchor(e.currentTarget)} sx={{
        border: 0, bgcolor: 'transparent', color: 'inherit', textAlign: 'left',
        flex: '1 1 0', minWidth: 0, px: wide ? { xs: 2.5, sm: 3 } : 2.5, py: wide ? { xs: 1.6, sm: 2.1 } : 1.6, cursor: 'pointer',
        transition: 'background-color .2s ease', '&:hover': { bgcolor: 'primary.light' }, '&:focus-visible': { outlineOffset: -4 },
      }}>
        <Typography component="span" variant="overline" sx={{ display: 'block', color: 'text.secondary', fontSize: { xs: 11, sm: wide ? '.66rem' : '.6rem' } }}>Guests</Typography>
        <Typography component="span" sx={{ display: 'block', fontFamily: fonts.sans, fontWeight: 400, fontSize: valueSize, mt: .15 }}>{adults} adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}</Typography>
      </Box>
    </Box>
    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', ...(wide && { minWidth: { xs: 0, sm: 195, lg: 230 }, '& .MuiButton-root': { borderRadius: '3px', minHeight: 52 } }) }}><CheckAvailabilityButton /></Box>

    {/* Anchored to the whole fields row and centered, not to the (much narrower)
        Dates sub-box — the two-month calendar is wider than that box, so
        left-anchoring it there left it hugging the bar's left edge instead of
        reading as attached to the search widget as a whole. On phones it takes a
        fixed width (capped by MUI's default 100% - 32px), since the calendar
        sizes itself to its container. */}
    <Popover open={dateOpen} anchorEl={fieldsRef.current} onClose={() => setDateOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }} slotProps={{ paper: { sx: { mt: 1, border: '1px solid', borderColor: 'divider', borderRadius: '20px', width: { xs: 380, sm: 640 } } } }}>
      <RangeCalendar checkIn={checkIn} checkOut={checkOut} minDate={today} onSelectDay={selectDay} selectingCheckout={selectingCheckout} />
    </Popover>
    <Popover open={!!guestAnchor} anchorEl={guestAnchor} onClose={() => setGuestAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }} slotProps={{ paper: { sx: { mt: 1, borderRadius: '24px', minWidth: 240 } } }}>
      <Stack spacing={2} sx={{ p: 3 }}>
        <GuestStepper label="Adults" value={adults} min={1} onChange={setAdults} />
        <GuestStepper label="Children" value={children} min={0} onChange={setChildren} />
      </Stack>
    </Popover>
  </Box>;
}
