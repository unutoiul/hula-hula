import { useState } from 'react';

export interface DateRange {
  checkIn: Date;
  checkOut: Date;
  selectDay: (day: Date) => void;
  // True between the first click (check-in) and the second (check-out) of a
  // range selection. Exposed so a consumer with its own chrome around the
  // calendar — the hero bar's popover — can react to a range just having
  // completed without this hook needing to know that popover exists.
  selectingCheckout: boolean;
}

// Two-click range selection: the first click always starts a new check-in
// (pushing check-out a day later so callers never see an invalid range);
// the second click either completes the range as check-out, or — if it
// lands before the check-in — restarts the selection from there instead.
// One instance lives in BookingSearchContext, shared by the hero search bar
// and the Arrival section's booking panel, so picking a date in either place
// picks it everywhere and one search covers both.
export function useDateRange(initialCheckIn: Date, initialCheckOut: Date, onRangeComplete?: () => void): DateRange {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [selectingCheckout, setSelectingCheckout] = useState(false);

  const selectDay = (day: Date) => {
    if (!selectingCheckout || day <= checkIn) {
      setCheckIn(day);
      const dayAfter = new Date(day); dayAfter.setDate(dayAfter.getDate() + 1);
      setCheckOut(dayAfter);
      setSelectingCheckout(true);
    } else {
      setCheckOut(day);
      setSelectingCheckout(false);
      onRangeComplete?.();
    }
  };

  return { checkIn, checkOut, selectDay, selectingCheckout };
}
