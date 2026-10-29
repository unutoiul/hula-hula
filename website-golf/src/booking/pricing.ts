import type { Activity, ActivityOption, Rental } from './config.ts';

export interface PriceLine { label: string; detail?: string; amount: number }

export function money(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(amount);
}

export const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

/** "3 players", "1 person" — in the activity's own words. */
export const peopleLabel = (activity: Pick<Activity, 'peopleNoun'>, count: number) => plural(count, activity.peopleNoun, activity.peopleNoun === 'person' ? 'people' : 'players');

/** Per person: an activity's solo price applies to one person on their own. */
export function pricePerPerson(activity: Activity, option: ActivityOption, players: number): number {
  return activity.soloPrice && players === 1 ? activity.soloPrice : option.price;
}

/** "from ฿850" — the cheapest way in, for cards and pickers. */
export const fromPrice = (activity: Activity) => Math.min(...activity.options.map((o) => o.price));

export function priceLines(activity: Activity, option: ActivityOption, players: number, rentals: Record<string, number> = {}, rentalCatalog: Rental[] = []): PriceLine[] {
  const each = pricePerPerson(activity, option, players);
  const lines: PriceLine[] = [{ label: `${activity.name} · ${option.label}`, detail: `${peopleLabel(activity, players)} × ${money(each)}`, amount: each * players }];
  for (const rental of rentalCatalog) {
    const count = rentals[rental.id] ?? 0;
    if (count > 0) lines.push({ label: rental.label, detail: `${count} × ${money(rental.price)}`, amount: count * rental.price });
  }
  return lines;
}

export const totalOf = (lines: PriceLine[]) => lines.reduce((sum, line) => sum + line.amount, 0);
