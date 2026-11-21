import { rentalName, type Activity, type ActivityOption, type Rental } from './config.ts';

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
    if (count > 0) lines.push({ label: `Rental · ${rentalName(rental)}`, detail: `${count} × ${money(rental.price)}`, amount: count * rental.price });
  }
  return lines;
}

export const totalOf = (lines: PriceLine[]) => lines.reduce((sum, line) => sum + line.amount, 0);

/** What's paid online to book: the activity's deposit for each person in the group, never more than the booking costs. With no deposit set, the full price. */
export const depositFor = (activity: Pick<Activity, 'deposit'>, players: number, total: number) => (activity.deposit > 0 ? Math.min(activity.deposit * players, total) : total);

/** "4 players × ฿500": how a group's deposit adds up, or empty for one that wasn't worked out that way. */
export const depositDetail = (activity: Pick<Activity, 'deposit' | 'peopleNoun'>, players: number, deposit: number) => (activity.deposit > 0 && deposit === activity.deposit * players ? `${peopleLabel(activity, players)} × ${money(activity.deposit)}` : '');

/** How a booking's deposit reads in its conditions: "A ฿2,000 deposit (4 players × ฿500)". */
export const bookingDepositTerms = (deposit: number, detail: string) => `A ${money(deposit)} deposit${detail ? ` (${detail})` : ''}`;

const depositEach = (activity: Pick<Activity, 'deposit' | 'peopleNoun'>) => `${money(activity.deposit)} deposit per ${activity.peopleNoun}`;

/** How the deposit reads in the conditions before the group is known: "A ฿500 deposit per player", or empty with no deposit. */
export const perPersonDepositTerms = (activity: Pick<Activity, 'deposit' | 'peopleNoun'>) => (activity.deposit > 0 ? `A ${depositEach(activity)}` : '');

/** The money columns of a saved booking (supabase/deposits.sql). */
interface SavedBooking { total: number; deposit: number; paid_at: string | null; paid_amount: number | null; balance_paid_at: string | null }

/** What a saved booking pays online: what Payso reported once it's paid, the deposit asked for until then. */
export const onlineAmount = (b: SavedBooking) => (b.paid_at ? Number(b.paid_amount ?? b.deposit) : b.deposit);

/** What's left to collect at the club. */
export const balanceDue = (b: SavedBooking) => (b.balance_paid_at ? 0 : Math.max(0, b.total - onlineAmount(b)));

/** "฿500 deposit per player online when you book, the rest at the club", for the pages that explain how paying works. */
export const paymentNote = (activity: Pick<Activity, 'deposit' | 'peopleNoun'>) => (activity.deposit > 0 ? `${depositEach(activity)} online when you book, the rest at the club` : 'paid online when you book');
