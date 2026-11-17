import { useMemo } from 'react';
import { useSiteContent } from '../context/SiteContentContext';

const weekdayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', weekday: 'long' });
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Today's day of the week in Krabi: 1 = Monday … 7 = Sunday (whatever the visitor's own time zone). */
export function krabiWeekday(now = new Date()): number {
  return WEEKDAYS.indexOf(weekdayFmt.format(now)) + 1;
}

/** The 7-day programme in week order, and today's trip in it. */
export function useProgramme() {
  const { activities } = useSiteContent();
  return useMemo(() => {
    const days = activities.filter((a) => a.weekday).sort((a, b) => (a.weekday ?? 0) - (b.weekday ?? 0));
    const today = krabiWeekday();
    return { days, today, todayTrip: days.find((d) => d.weekday === today) ?? null };
  }, [activities]);
}
