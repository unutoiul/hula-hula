import { Box, Stack, Typography } from '@mui/material';
import { useBookingSearch } from '../../context/BookingSearchContext';
import { fonts } from '../../theme';
import { CheckAvailabilityButton } from './CheckAvailabilityButton';
import { GuestStepper } from './GuestStepper';
import { PaymentMethods } from './PaymentMethods';
import { RangeCalendar } from './RangeCalendar';

const panelDateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const MS_PER_NIGHT = 1000 * 60 * 60 * 24;

// Widths of the card itself (a container query), not the window: the card
// sits beside the intro on desktops and fills the page below that.
const TWO_COLUMN_SUMMARY = '@container booking-panel (min-width: 520px)';
// The sidebar only comes in once the two months still get ~38px day circles beside it.
const SIDEBAR = '@container booking-panel (min-width: 880px)';

// The Arrival section's full booking widget: the same two-month calendar and
// guest count as the hero search bar — literally the same state, via
// BookingSearchContext, so dates picked in either place show up in both.
// "Check availability" goes on to the booking pages (see
// CheckAvailabilityButton).
//
// The card always fills its column, so its edges line up with the rest of
// the page. When it's wide enough the stay summary moves into a sidebar
// beside the calendar (dates, guests, then the button at the bottom);
// narrower, the summary sits under the calendar.
export function BookingPanel() {
  const today = new Date();
  const { checkIn, checkOut, selectDay, selectingCheckout, adults, setAdults, children, setChildren } = useBookingSearch();
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / MS_PER_NIGHT);

  return (
    <>
      <Box sx={{ containerType: 'inline-size', containerName: 'booking-panel' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr)',
            [SIDEBAR]: { gridTemplateColumns: 'minmax(0,1fr) 280px' },
            border: '1px solid',
            borderColor: 'divider',
            borderTop: '5px solid #c92f6b',
            bgcolor: 'background.paper',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 16px 36px rgba(90,36,72,.09)',
          }}
        >
          <RangeCalendar
            checkIn={checkIn}
            checkOut={checkOut}
            minDate={today}
            onSelectDay={selectDay}
            selectingCheckout={selectingCheckout}
            fill
          />

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 2.5, md: 3 },
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundImage: 'linear-gradient(165deg, rgba(253,230,238,.6), transparent 70%)',
              [SIDEBAR]: { borderTop: 0, borderLeft: '1px solid', borderLeftColor: 'divider', p: '28px 24px 24px' },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr)',
                columnGap: '32px',
                rowGap: '16px',
                [TWO_COLUMN_SUMMARY]: { gridTemplateColumns: 'repeat(2,minmax(0,1fr))' },
                [SIDEBAR]: { gridTemplateColumns: 'minmax(0,1fr)', rowGap: '24px' },
              }}
            >
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  Your stay
                </Typography>
                <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mt: 1 }}>
                  <Box>
                    <Typography sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: 17 }}>
                      {panelDateFmt.format(checkIn)}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Check-in</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontFamily: fonts.playful, fontWeight: 400, fontSize: 17 }}>
                      {panelDateFmt.format(checkOut)}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Check-out</Typography>
                  </Box>
                </Stack>
                <Typography variant="overline" sx={{ display: 'block', color: 'secondary.dark', mt: 1 }}>
                  {nights} night{nights !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box
                sx={{
                  pt: '16px',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  [TWO_COLUMN_SUMMARY]: { pt: 0, borderTop: 0 },
                  [SIDEBAR]: { pt: '24px', borderTop: '1px solid', borderTopColor: 'divider' },
                }}
              >
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  Who’s coming
                </Typography>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <GuestStepper label="Adults" value={adults} min={1} onChange={setAdults} />
                  <GuestStepper label="Children" value={children} min={0} onChange={setChildren} />
                </Stack>
              </Box>
            </Box>
            {/* In the sidebar the button sits at the bottom, level with the calendar's last row. */}
            <Box sx={{ mt: '20px', [SIDEBAR]: { mt: 'auto', pt: '24px' } }}>
              <CheckAvailabilityButton />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        <PaymentMethods centered compact />
      </Box>
    </>
  );
}
