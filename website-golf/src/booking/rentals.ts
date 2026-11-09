import { rentalName, type Rental } from './config.ts';

const groupOf = (rental: Rental) => rental.quantityGroup === undefined && ['premium-clubs', 'premium', 'standard'].includes(rental.id) ? 'club sets' : rental.quantityGroup?.trim().toLowerCase() || `item:${rental.id}`;
const allowance = (rental: Rental, players: number, catalog: Rental[]) => players * Math.min(...catalog.filter(item => groupOf(item) === groupOf(rental)).map(item => item.maxPerPlayer ?? 1));

/** Shared by the guest stepper, saved searches, desk bookings and server validation. */
export function rentalLimit(rental: Rental, players: number, selected: Record<string, number>, catalog: Rental[]): number {
  const used = catalog.filter(item => item.id !== rental.id && groupOf(item) === groupOf(rental)).reduce((total, item) => total + Math.max(0, selected[item.id] || 0), 0);
  return Math.max(0, allowance(rental, players, catalog) - used);
}

/** Drop withdrawn equipment and reduce quantities when a guest reduces their group size. */
export function normaliseRentalSelection(catalog: Rental[], players: number, raw: Record<string, number>): Record<string, number> {
  const selected: Record<string, number> = {};
  for (const rental of catalog) {
    const count = raw[rental.id];
    if (!Number.isInteger(count) || count <= 0) continue;
    const allowed = Math.min(count, rentalLimit(rental, players, selected, catalog));
    if (allowed > 0) selected[rental.id] = allowed;
  }
  return selected;
}

export function rentalSelectionError(catalog: Rental[], players: number, raw: Record<string, unknown>): string | null {
  for (const [id, count] of Object.entries(raw)) {
    if (count === 0) continue;
    if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) return 'Please choose whole, positive equipment quantities.';
    const rental = catalog.find(item => item.id === id);
    if (!rental) return 'That equipment is no longer offered for this sport. Please choose your extras again.';
    const selected = Object.fromEntries(Object.entries(raw).filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isInteger(entry[1]) && entry[1] > 0));
    if (count > rentalLimit(rental, players, selected, catalog)) return `Please reduce the quantity of ${rentalName(rental)} to fit your group’s equipment allowance.`;
  }
  return null;
}
