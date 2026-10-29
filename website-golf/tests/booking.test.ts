// Unit tests for the pure booking rules: `npm run test:unit` (Node's own test
// runner, which strips the TypeScript types itself — which is why the modules
// under test import each other with .ts extensions). The same rules run in
// the browser, in /admin and in the api/ functions.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildSheet, fits, isBookableDay, rulesFrom } from '../src/booking/availability.ts';
import { DEFAULT_CLUB, DEFAULT_SITE, findActivity, normaliseActivity, normaliseClub, openingHoursLines, pickupFor, slugify } from '../src/booking/config.ts';
import { addDays, fromMinutes, isISODate, krabiNow, timeLabel, toMinutes } from '../src/booking/dates.ts';
import { money, priceLines, totalOf } from '../src/booking/pricing.ts';

const golf = findActivity(DEFAULT_SITE, 'golf')!;
const range = findActivity(DEFAULT_SITE, 'range')!;
const lesson = findActivity(DEFAULT_SITE, 'lesson')!;
const option = (activity: typeof golf, id: string) => activity.options.find((o) => o.id === id)!;
const rules = rulesFrom(DEFAULT_CLUB);
// A fixed "now": Krabi, 06:00 on Monday 2 November 2026; most tests look at the Wednesday.
const now = { date: '2026-11-02', minutes: 6 * 60 };
const day = '2026-11-04';
const sheet = (activity: typeof golf, optionId: string, bookings: { time: string; minutes: number; players: number }[] = [], blocks: { start: string; end: string }[] = []) =>
  buildSheet(activity, option(activity, optionId), day, bookings, blocks, { rules, now });
const at = (slots: ReturnType<typeof buildSheet>, time: string) => slots.find((s) => s.time === time)!;

describe('prices (from the club brochure)', () => {
  it('golf is per player and includes rental sets as extra lines', () => {
    const lines = priceLines(golf, option(golf, '18'), 3, { standard: 1, premium: 1 }, DEFAULT_SITE.rentals);
    assert.equal(lines[0].amount, 3 * 2080);
    assert.equal(totalOf(lines), 3 * 2080 + 500 + 1000);
  });
  it('a lesson on your own costs 2,990; two or three pay 2,100 each', () => {
    assert.equal(totalOf(priceLines(lesson, lesson.options[0], 1)), 2990);
    assert.equal(totalOf(priceLines(lesson, lesson.options[0], 3)), 6300);
  });
  it('the range is 250 per person per hour', () => {
    assert.equal(totalOf(priceLines(range, option(range, '2h'), 4)), 4 * 500);
  });
  it('formats baht without decimals', () => {
    assert.equal(money(2080), '฿2,080');
  });
});

describe('dates and times (Krabi time)', () => {
  it('reads the club clock in UTC+7', () => {
    assert.deepEqual(krabiNow(new Date('2026-11-01T18:30:00Z')), { date: '2026-11-02', minutes: 90 });
  });
  it('round-trips times and labels them the club way', () => {
    assert.equal(fromMinutes(toMinutes('13:30')), '13:30');
    assert.equal(timeLabel('13:30'), '1:30 pm');
    assert.equal(timeLabel('08:00'), '8:00 am');
  });
  it('rejects impossible dates', () => {
    assert.ok(isISODate('2026-02-28'));
    assert.ok(!isISODate('2026-02-30'));
    assert.ok(!isISODate('tomorrow'));
  });
});

describe('the free shuttle', () => {
  it('offers the latest pick-up that arrives in time', () => {
    assert.equal(pickupFor('09:00', DEFAULT_CLUB), '08:00');
    assert.equal(pickupFor('15:00', DEFAULT_CLUB), '13:30');
  });
  it('offers none too early, or when it would mean hours of waiting', () => {
    assert.equal(pickupFor('08:30', DEFAULT_CLUB), null);
    assert.equal(pickupFor('13:00', DEFAULT_CLUB), null);
  });
  it('follows the pick-up times staff set', () => {
    assert.equal(pickupFor('11:00', { ...DEFAULT_CLUB, transfer: { pickups: ['10:00'], leadMinutes: 30 } }), '10:00');
  });
});

describe('the tee sheet', () => {
  it('runs from the first to the last tee at the set interval, all open on an empty day', () => {
    const slots = sheet(golf, '9');
    assert.equal(slots[0].time, golf.firstStart);
    assert.equal(slots.at(-1)!.time, option(golf, '9').lastStart);
    assert.equal(toMinutes(slots[1].time) - toMinutes(slots[0].time), golf.interval);
    assert.ok(slots.every((s) => s.spotsLeft === golf.capacity));
  });
  it('stops earlier for 18 holes', () => {
    assert.equal(sheet(golf, '18').at(-1)!.time, option(golf, '18').lastStart);
  });
  it('drops today’s starts that are too soon — but staff see the whole day', () => {
    const later = { date: day, minutes: 10 * 60 + 5 };
    const online = buildSheet(golf, option(golf, '9'), day, [], [], { rules, now: later });
    assert.ok(online.every((slot) => toMinutes(slot.time) >= later.minutes + rules.minLeadMinutes));
    assert.equal(buildSheet(golf, option(golf, '9'), day, [], [], { rules, now: later, includePast: true })[0].time, golf.firstStart);
  });
  it('only opens the booking window', () => {
    assert.ok(isBookableDay(addDays(now.date, rules.windowDays), rules.windowDays, now));
    assert.ok(!isBookableDay(addDays(now.date, rules.windowDays + 1), rules.windowDays, now));
    assert.deepEqual(buildSheet(golf, option(golf, '9'), addDays(now.date, -1), [], [], { rules, now }), []);
  });
  it('takes nothing online on a day the club is closed', () => {
    const closedWednesday = rulesFrom({ ...DEFAULT_CLUB, hours: DEFAULT_CLUB.hours.map((h, i) => (i === 2 ? { ...h, closed: true } : h)) });
    assert.deepEqual(buildSheet(golf, option(golf, '9'), day, [], [], { rules: closedWednesday, now }), []);
    assert.ok(buildSheet(golf, option(golf, '9'), day, [], [], { rules: closedWednesday, now, includePast: true }).length > 0);
  });
  it('takes bookings’ players off their start, and a group only fits where there’s room', () => {
    const slot = at(sheet(golf, '9', [{ time: '09:10', minutes: 135, players: 3 }]), '09:10');
    assert.equal(slot.spotsLeft, 1);
    assert.ok(fits(slot, 1) && !fits(slot, 2));
    assert.equal(at(sheet(golf, '9', [{ time: '09:10', minutes: 135, players: 4 }]), '09:10').spotsLeft, 0);
  });
  it('gives a private-group start to one group only', () => {
    assert.equal(at(sheet(lesson, 'half', [{ time: '09:00', minutes: 210, players: 1 }]), '09:00').spotsLeft, 0);
  });
  it('holds a range bay for every hour it’s booked', () => {
    const bookings = Array.from({ length: range.units }, () => ({ time: '10:00', minutes: 120, players: 2 }));
    const slots = sheet(range, '1h', bookings);
    assert.equal(at(slots, '10:00').baysLeft, 0);
    assert.equal(at(slots, '11:00').baysLeft, 0);
    assert.equal(at(slots, '12:00').baysLeft, range.units);
    // A two-hour booking at 09:00 runs into the full 10:00 hour.
    assert.equal(at(sheet(range, '2h', bookings), '09:00').baysLeft, 0);
  });
  it('closes blocked starts', () => {
    const slots = sheet(golf, '9', [], [{ start: '12:00', end: '14:00' }]);
    assert.ok(at(slots, '12:00').blocked && at(slots, '13:50').blocked);
    assert.ok(!at(slots, '14:00').blocked && !fits(at(slots, '12:30'), 1));
  });
});

describe('what staff save in /admin', () => {
  it('fills in anything missing from a stored activity', () => {
    const activity = normaliseActivity({ name: 'Padel', options: [{ label: '1 hour', price: 600 }] }, 'padel');
    assert.equal(activity.id, 'padel');
    assert.equal(activity.options[0].price, 600);
    assert.equal(activity.options[0].minutes, 60);
    assert.ok(activity.capacity >= 1 && activity.maxPlayers >= activity.minPlayers);
  });
  it('never lets bad values through', () => {
    const activity = normaliseActivity({ name: 'X', options: [{ label: 'Y', price: -5, lastStart: '25:99' }], capacity: 0, icon: 'rocket' }, 'x');
    assert.equal(activity.options[0].price, 0);
    assert.equal(activity.options[0].lastStart, '16:00');
    assert.equal(activity.capacity, 1);
    assert.equal(activity.icon, 'golf');
  });
  it('keeps the club settings complete', () => {
    assert.deepEqual(normaliseClub(null), DEFAULT_CLUB);
    assert.equal(normaliseClub({ booking: { windowDays: 9999 } }).booking.windowDays, 365);
  });
  it('writes opening hours in as few lines as possible', () => {
    assert.deepEqual(openingHoursLines(DEFAULT_CLUB), ['Every day · 7:00 am – 6:00 pm']);
    const mondaysOff = { ...DEFAULT_CLUB, hours: DEFAULT_CLUB.hours.map((h, i) => (i === 0 ? { ...h, closed: true } : h)) };
    assert.deepEqual(openingHoursLines(mondaysOff), ['Mon · Closed', 'Tue – Sun · 7:00 am – 6:00 pm']);
  });
  it('makes web-safe names', () => {
    assert.equal(slugify('Pro Day with Cédric!'), 'pro-day-with-cedric');
  });
});
