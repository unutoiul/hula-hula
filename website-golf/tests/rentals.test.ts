import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_ACTIVITIES, DEFAULT_RENTALS, normaliseRentals, rentalsFor, type Rental } from '../src/booking/config.ts';
import { priceLines, totalOf } from '../src/booking/pricing.ts';
import { normaliseRentalSelection, rentalLimit, rentalSelectionError } from '../src/booking/rentals.ts';

const catalog: Rental[] = [
  { id: 'premium-a', label: 'Set A', group: 'Premium', price: 1500, unit: 'set', quantityGroup: 'Club sets', activities: ['golf'] },
  { id: 'normal-a', label: 'Set A', group: 'Normal', price: 1000, unit: 'set', quantityGroup: 'Club sets', activities: ['golf'] },
  { id: 'racket', label: 'Racket', price: 100, unit: 'racket', activities: ['pickleball'] },
  { id: 'ball', label: 'Ball', price: 20, unit: 'ball', maxPerPlayer: 3, activities: ['pickleball', 'footgolf'] },
];

describe('dynamic rental equipment', () => {
  it('covers every sport and keeps the five included equipment kits free', () => {
    for (const activity of DEFAULT_ACTIVITIES) {
      const offered = rentalsFor(activity, DEFAULT_RENTALS);
      assert.ok(offered.length > 0, `${activity.name} needs equipment`);
      if (['golf', 'range'].includes(activity.id)) {
        assert.equal(offered.length, 4);
        assert.ok(offered.every(item => item.price > 0));
      } else {
        assert.equal(offered.length, 1);
        assert.equal(offered[0].price, 0);
        const noEquipment = totalOf(priceLines(activity, activity.options[0], 2));
        const withEquipment = totalOf(priceLines(activity, activity.options[0], 2, { [offered[0].id]: 2 }, offered));
        assert.equal(withEquipment, noEquipment, `${activity.name} equipment must not add a charge`);
      }
    }
  });
  it('offers only equipment assigned to the selected sport, even for a new sport', () => {
    assert.deepEqual(rentalsFor({ id: 'pickleball', rentals: false }, catalog).map(item => item.id), ['racket', 'ball']);
    assert.deepEqual(rentalsFor({ id: 'golf', rentals: true }, catalog).map(item => item.id), ['premium-a', 'normal-a']);
    assert.deepEqual(rentalsFor({ id: 'new-sport', rentals: true }, catalog), []);
  });
  it('allows a racket and several balls for the same player', () => {
    const offered = catalog.slice(2);
    const selected = { racket: 1, ball: 3 };
    assert.equal(rentalSelectionError(offered, 1, selected), null);
    assert.deepEqual(normaliseRentalSelection(offered, 1, selected), selected);
    assert.equal(rentalLimit(offered[1], 1, { racket: 1 }, offered), 3);
  });
  it('shares one club-set allowance across Premium and Normal alternatives', () => {
    const offered = catalog.slice(0, 2);
    assert.equal(rentalLimit(offered[1], 2, { 'premium-a': 1 }, offered), 1);
    assert.ok(rentalSelectionError(offered, 1, { 'premium-a': 1, 'normal-a': 1 }));
    assert.deepEqual(normaliseRentalSelection(offered, 1, { 'premium-a': 1, 'normal-a': 1 }), { 'premium-a': 1 });
  });
  it('reduces stale selections after players or available equipment change', () => {
    assert.deepEqual(normaliseRentalSelection(catalog.slice(2), 1, { racket: 4, ball: 9, 'premium-a': 2 }), { racket: 1, ball: 3 });
  });
  it('rejects unavailable, negative, fractional and excessive quantities', () => {
    for (const selected of [{ missing: 1 }, { racket: -1 }, { racket: 1.5 }, { racket: '1' }, { ball: 4 }]) {
      assert.ok(rentalSelectionError(catalog.slice(2), 1, selected));
    }
  });
  it('preserves database icon URLs, sport assignments and equipment settings', () => {
    const [rental] = normaliseRentals([{ ...catalog[3], image: 'https://example.test/ball.webp', icon: 'ball' }]);
    assert.equal(rental.unit, 'ball');
    assert.equal(rental.maxPerPlayer, 3);
    assert.equal(rental.image, 'https://example.test/ball.webp');
    assert.equal(rental.icon, 'ball');
    assert.deepEqual(rental.activities, ['pickleball', 'footgolf']);
  });
});
