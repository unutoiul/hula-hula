// Formatting for the booking pages. Dates from the API are plain
// "YYYY-MM-DD" stay dates — read as local calendar days, never shifted by a
// time zone.

export function money(amount: number, currency = 'THB'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0, maximumFractionDigits: Number.isInteger(amount) ? 0 : 2 }).format(amount);
}

const asDay = (iso: string) => { const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
const longDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const shortDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export const dayLabel = (iso: string) => longDay.format(asDay(iso));
export const shortDayLabel = (iso: string) => shortDay.format(asDay(iso));
export const stayLabel = (checkIn: string, checkOut: string) => `${shortDayLabel(checkIn)} – ${dayLabel(checkOut)}`;

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
export const nightsLabel = (n: number) => plural(n, 'night');
export const guestsLabel = (adults: number, children: number) => `${plural(adults, 'adult')}${children ? ` · ${plural(children, 'child', 'children')}` : ''}`;

export function mealsLabel(meals: { breakfast: boolean; lunch: boolean; dinner: boolean }): string {
  const included = [meals.breakfast && 'Breakfast', meals.lunch && 'lunch', meals.dinner && 'dinner'].filter(Boolean) as string[];
  if (!included.length) return 'Room only';
  const [first, ...rest] = included;
  return `${first[0].toUpperCase()}${first.slice(1)}${rest.length ? `, ${rest.join(' & ')}` : ''} included`;
}
