import { useState } from 'react';

export interface DateRange {
  checkIn: Date;
  checkOut: Date;
  selectDay: (day: Date) => void;
}

// Two-click range selection: the first click always starts a new check-in
// (pushing check-out a day later so callers never see an invalid range);
// the second click either completes the range as check-out, or — if it
// lands before the check-in — restarts the selection from there instead.
// Shared by the hero search bar and the Arrival section's booking panel so
// both pick dates the exact same way.
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

  return { checkIn, checkOut, selectDay };
}
