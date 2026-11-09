import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, it } from 'node:test';
import { assignRentalIds, DEFAULT_CLUB, groupRentals, normaliseClub, normaliseRentals, rentalName, rentalsFor } from '../src/booking/config.ts';
import { activeOffers } from '../src/booking/offers.ts';
import { courseMapImage, GOLF_HOLES, golfHole } from '../src/data/course.ts';
import { refineMapLabels } from '../scripts/refine-course-labels.ts';

describe('homepage offers', () => {
  const offer = DEFAULT_CLUB.offers[0];
  it('shows only active offers within their inclusive date window', () => {
    const current = { ...offer, startsOn: '2026-11-02', endsOn: '2026-11-02' };
    assert.deepEqual(activeOffers([
      current, { ...offer, active: false },
      { ...offer, startsOn: '2026-11-03' }, { ...offer, endsOn: '2026-11-01' },
    ], '2026-11-02'), [current]);
  });
  it('lets staff remove every offer without restoring a default promotion', () => {
    assert.deepEqual(normaliseClub({ offers: [] }).offers, []);
    assert.deepEqual(normaliseClub({ offers: [null, {}, { title: 'New offer', active: true }] }).offers.map(o => o.title), ['New offer']);
  });
});

describe('course and rental presentation', () => {
  it('ships a transparent Golf Club logo and matching browser icon', () => {
    for (const [file, size] of [['hula-hula-golf.png', 600], ['favicon.png', 64]] as const) {
      const png = readFileSync(new URL(`../public/logo/${file}`, import.meta.url));
      assert.equal(png.subarray(1, 4).toString(), 'PNG');
      assert.equal(png.readUInt32BE(16), size);
      assert.equal(png.readUInt32BE(20), size);
      assert.equal(png[25], 6, 'PNG must preserve RGBA transparency');
    }
  });
  it('has nine physical golf holes, par 36, used for both rounds', () => {
    assert.equal(GOLF_HOLES.length, 9);
    assert.equal(GOLF_HOLES.reduce((total, hole) => total + hole.par, 0), 36);
    for (let number = 1; number <= 9; number++) {
      assert.equal(golfHole(number).physical, golfHole(number + 9).physical);
      assert.equal(golfHole(number).round, 1);
      assert.equal(golfHole(number + 9).round, 2);
      assert.deepEqual(golfHole(number + 9).yards, GOLF_HOLES[number - 1].second);
    }
    assert.deepEqual(golfHole(18).yards, [320, 294, 250]);
  });
  it('keeps staff-uploaded rental pictures and descriptions', () => {
    const [rental] = normaliseRentals([{ id: 'premium', label: 'Set A', price: 1000, image: '/uploads/set-a.webp', description: 'Newer clubs' }]);
    assert.equal(rental.image, '/uploads/set-a.webp');
    assert.equal(rental.description, 'Newer clubs');
    assert.equal(rental.price, 1000);
  });
  it('keeps a rental’s group and the sports that offer it', () => {
    const [grouped, plain] = normaliseRentals([{ id: 'a', label: 'Set A', price: 1, group: ' Premium ', activities: ['golf', 7, 'range'] }, { id: 'b', label: 'Set B', price: 1 }]);
    assert.equal(grouped.group, 'Premium');
    assert.deepEqual(grouped.activities, ['golf', 'range']);
    assert.equal(plain.activities, undefined);
  });
  it('lists each group with its own Set A and Set B, in the order added', () => {
    const groups = groupRentals([
      { id: 'p-a', label: 'Set A', price: 2000, group: 'Premium' },
      { id: 'n-a', label: 'Set A', price: 1000, group: 'Normal' },
      { id: 'p-b', label: 'Set B', price: 1500, group: 'premium' },
      { id: 'n-b', label: 'Set B', price: 500, group: 'Normal' },
    ]);
    assert.deepEqual(groups.map((g) => [g.name, g.rentals.map((r) => r.id)]), [['Premium', ['p-a', 'p-b']], ['Normal', ['n-a', 'n-b']]]);
  });
  it('keeps rentals with no group together, so none disappear', () => {
    const groups = groupRentals([{ id: 'premium-clubs', label: 'Premium Clubs', price: 2000 }, { id: 'premium', label: 'Set A', price: 1000 }]);
    assert.deepEqual(groups.map((g) => [g.name, g.rentals.length]), [['', 2]]);
  });
  it('offers a rental only on the sports ticked for it', () => {
    const golf = { id: 'golf', rentals: true }, pickleball = { id: 'pickleball', rentals: false };
    const rentals = [{ id: 'clubs', label: 'Set A', price: 1, activities: ['golf'] }, { id: 'paddle', label: 'Paddle', price: 1, activities: ['pickleball'] }];
    assert.deepEqual(rentalsFor(golf, rentals).map((r) => r.id), ['clubs']);
    assert.deepEqual(rentalsFor(pickleball, rentals).map((r) => r.id), ['paddle']);
  });
  it('falls back to the activity’s old switch for rentals not yet set up per sport', () => {
    const rentals = [{ id: 'old', label: 'Set A', price: 1 }];
    assert.equal(rentalsFor({ id: 'golf', rentals: true }, rentals).length, 1);
    assert.equal(rentalsFor({ id: 'footgolf', rentals: false }, rentals).length, 0);
  });
  it('names a rental with its group, without saying the group twice', () => {
    assert.equal(rentalName({ label: 'Set A', group: 'Premium' }), 'Premium Set A');
    assert.equal(rentalName({ label: 'Premium Clubs', group: 'Premium' }), 'Premium Clubs');
    assert.equal(rentalName({ label: 'Set B' }), 'Set B');
  });
  it('gives every group’s Set A its own id and never changes an existing one', () => {
    const ids = assignRentalIds([
      { id: 'premium', label: 'Set A', price: 1, group: 'Normal' },
      { id: '', label: 'Set A', price: 1, group: 'Premium' },
      { id: '', label: 'Set A', price: 1, group: 'Premium' },
      { id: '', label: 'A very long rental name indeed', price: 1, group: 'Premium' },
    ]).map((r) => r.id);
    assert.equal(ids[0], 'premium');
    assert.equal(new Set(ids).size, 4);
    assert.ok(ids.every((id) => id.length > 0 && id.length <= 20));
    assert.deepEqual(ids.slice(1, 3), ['premium-set-a', 'premium-set-a-2']);
  });
  it('serves only the current vector maps for all 18 selections in both activities', () => {
    const maps = new Set<string>();
    for (const activity of ['golf', 'footgolf'] as const) {
      for (let number = 1; number <= 18; number++) {
        const image = courseMapImage(activity, number);
        assert.ok(image.endsWith('.svg'));
        assert.ok(existsSync(new URL(`../public${image}`, import.meta.url)), `Missing map: ${image}`);
        maps.add(image);
      }
    }
    assert.equal(maps.size, 27);
    assert.equal(courseMapImage('golf', 1), courseMapImage('golf', 10));
    assert.notEqual(courseMapImage('footgolf', 1), courseMapImage('footgolf', 10));
    assert.ok(readdirSync(new URL('../public/images/course-guides/', import.meta.url)).every(file => file.endsWith('.svg')));
  });
  it('rejects invalid map selections', () => {
    for (const number of [0, 19, -1, 1.5, NaN]) assert.throws(() => courseMapImage('golf', number), RangeError);
  });
  it('uses actual SVG text instead of traced glyphs in every map', () => {
    for (const activity of ['golf', 'footgolf'] as const) {
      for (let number = 1; number <= 18; number++) {
        const svg = readFileSync(new URL(`../public${courseMapImage(activity, number)}`, import.meta.url), 'utf8');
        assert.ok(svg.includes('id="course-labels"'));
        assert.match(svg, /<text\b/);
        assert.doesNotMatch(svg, /<image\b/);
        if (activity === 'golf') {
          const hole = golfHole(number);
          assert.ok(svg.includes(`>HOLE ${hole.physical}</text>`));
          for (const yards of [...GOLF_HOLES[hole.physical - 1].first, ...GOLF_HOLES[hole.physical - 1].second]) assert.ok(svg.includes(`>${yards} yd</text>`));
        } else assert.ok(svg.includes(`>${number}</text>`));
        assert.equal(refineMapLabels(svg, activity, number), svg, 'Refining labels twice must not add duplicate text');
      }
    }
  });
  it('leaves course and route contours untouched when replacing a number badge', () => {
    const course = 'M120,180L460,180L460,800L120,800Z';
    const route = 'M200,600L250,400L255,405L205,605Z';
    const badge = 'M500,0L619,0L619,137L500,137Z';
    const tracedNumber = 'M540,60L550,60L550,100L540,100Z';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 904"><path fill="#72a257" d="${course}"/><path fill="#db8425" d="${route}${badge}${tracedNumber}"/></svg>`;
    const result = refineMapLabels(svg, 'footgolf', 18);
    assert.ok(result.includes(course));
    assert.ok(result.includes(route));
    assert.ok(!result.includes(tracedNumber));
    assert.ok(result.includes('>18</text>'));
  });
});
