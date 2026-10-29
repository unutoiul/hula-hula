// The club runs on Krabi time (UTC+7, no daylight saving) whatever the
// visitor's own clock says. Days are plain "YYYY-MM-DD" strings and times
// "HH:MM"; both are formatted in UTC so nothing shifts by a time zone.

const KRABI = 'Asia/Bangkok';
export const KRABI_UTC_OFFSET_HOURS = 7;

const krabiParts = new Intl.DateTimeFormat('en-CA', { timeZone: KRABI, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** Today's date and the minutes past midnight, at the club. */
export function krabiNow(at = new Date()): { date: string; minutes: number } {
  const parts = Object.fromEntries(krabiParts.formatToParts(at).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

const asUTC = (iso: string) => new Date(`${iso}T00:00:00Z`);

export function isISODate(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(asUTC(value).getTime()) && asUTC(value).toISOString().startsWith(value);
}

export function addDays(iso: string, days: number): string {
  const date = asUTC(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export const daysBetween = (from: string, to: string) => Math.round((asUTC(to).getTime() - asUTC(from).getTime()) / 86_400_000);
export const isWeekend = (iso: string) => [0, 6].includes(asUTC(iso).getUTCDay());

export const toMinutes = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
export const fromMinutes = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...options });
const long = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const short = fmt({ weekday: 'short', day: 'numeric', month: 'short' });
const weekday = fmt({ weekday: 'short' });
const month = fmt({ month: 'short' });
const monthYear = fmt({ month: 'long', year: 'numeric' });

/** "Saturday 1 November 2026" */
export const dayLabel = (iso: string) => long.format(asUTC(iso));
/** "Sat 1 Nov" */
export const shortDayLabel = (iso: string) => short.format(asUTC(iso));
/** "Sat" */
export const weekdayLabel = (iso: string) => weekday.format(asUTC(iso));
/** "Nov" */
export const monthLabel = (iso: string) => month.format(asUTC(iso));
/** "November 2026" */
export const monthYearLabel = (iso: string) => monthYear.format(asUTC(iso));
export const dayOfMonth = (iso: string) => asUTC(iso).getUTCDate();

/** "7:40 am" — the way the club writes times ("8.00 am and 1.30 pm"). */
export function timeLabel(hhmm: string): string {
  const minutes = toMinutes(hhmm);
  const h = Math.floor(minutes / 60) % 24;
  return `${h % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

/** "2 hrs 15 min", "1 hour", "45 min" */
export function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  if (!h) return `${m} min`;
  const hours = h === 1 ? '1 hour' : `${h} hrs`;
  return m ? `${hours} ${m} min` : hours;
}
