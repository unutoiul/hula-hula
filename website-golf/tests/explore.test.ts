import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, it } from 'node:test';
import { DEFAULT_CLUB, groupRentals, normaliseClub, normaliseRentals } from '../src/booking/config.ts';
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
  it('groups each rental set with its Normal and Premium options', () => {
    const groups = groupRentals([
      { id: 'a-premium', label: 'Set A Premium', price: 2000 },
      { id: 'premium', label: 'Set A', price: 1000 },
      { id: 'standard', label: 'Set B', price: 500 },
      { id: 'b-premium', label: 'set b premium', price: 900 },
    ]);
    assert.deepEqual(groups.map((g) => [g.name, g.rentals.map((r) => r.id)]), [['Set A', ['premium', 'a-premium']], ['Set B', ['standard', 'b-premium']]]);
  });
  it('keeps a rental with no set letter on its own, so it never disappears', () => {
    const groups = groupRentals([{ id: 'premium-clubs', label: 'Premium Clubs', price: 2000 }, { id: 'premium', label: 'Set A', price: 1000 }]);
    assert.deepEqual(groups.map((g) => [g.name, g.letter, g.rentals.length]), [['Premium Clubs', '', 1], ['Set A', 'A', 1]]);
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
