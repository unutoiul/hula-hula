// Unit tests for the pure booking helpers: `npm run test:unit` (Node's own
// test runner, which strips the TypeScript types itself).
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { describe, it } from 'node:test';
import { depositFor } from '../api/_lib/deposit.ts';
import { invoiceNoFor, newAccessKey, newRef, REF_PATTERN, ACCESS_KEY_PATTERN } from '../api/_lib/ids.ts';
import { signHS256, verifyHS256 } from '../api/_lib/jwt.ts';
import { distributeGuests, fits } from '../shared/occupancy.ts';

const SECRET = 'CD229682D3297390B9F66FF4020B758F4A5E625AF4992E5D75D311D6458B38E2';

describe('HS256 tokens', () => {
  it('round-trips a payload', () => {
    const token = signHS256({ merchantID: 'JT01', invoiceNo: 'WEBHH7K3M9Q', amount: 1000.5 }, SECRET);
    assert.deepEqual(verifyHS256(token, SECRET), { merchantID: 'JT01', invoiceNo: 'WEBHH7K3M9Q', amount: 1000.5 });
  });

  it('matches an independently built token', () => {
    const head = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from('{"a":1}').toString('base64url')}`;
    const expected = `${head}.${createHmac('sha256', SECRET).update(head).digest('base64url')}`;
    assert.equal(signHS256({ a: 1 }, SECRET), expected);
  });

  it('rejects a tampered payload or the wrong secret', () => {
    const [h, , s] = signHS256({ amount: 10 }, SECRET).split('.');
    const forged = `${h}.${Buffer.from('{"amount":1}').toString('base64url')}.${s}`;
    assert.throws(() => verifyHS256(forged, SECRET), /signature/);
    assert.throws(() => verifyHS256(signHS256({ amount: 10 }, 'other'), SECRET), /signature/);
  });

  it('rejects alg "none"', () => {
    const none = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from('{"a":1}').toString('base64url')}.`;
    assert.throws(() => verifyHS256(none, SECRET), /algorithm/);
  });
});

describe('deposits (satang)', () => {
  const stay = { total: 2535000, nights: [845000, 845000, 845000].map((gross) => ({ gross, discount: 0, promoDiscount: 0 })) };

  it('follows each SiteMinder deposit type', () => {
    assert.equal(depositFor(stay, { depositType: 'full-amount', depositAmount: null }, 'full').dueNow, 2535000);
    assert.equal(depositFor(stay, { depositType: 'first-night', depositAmount: null }, 'full').dueNow, 845000);
    assert.equal(depositFor(stay, { depositType: 'percentage', depositAmount: 30 }, 'full').dueNow, 760500);
    assert.equal(depositFor(stay, { depositType: 'fixed-amount', depositAmount: 2000 }, 'full').dueNow, 200000);
  });

  it('never asks for more than the stay costs', () => {
    assert.equal(depositFor(stay, { depositType: 'fixed-amount', depositAmount: 99999 }, 'full').dueNow, 2535000);
    assert.equal(depositFor(stay, { depositType: 'percentage', depositAmount: 150 }, 'full').dueNow, 2535000);
  });

  it('falls back when the rate has no deposit', () => {
    assert.deepEqual(depositFor(stay, { depositType: null, depositAmount: null }, 'full'), { type: null, dueNow: 2535000 });
    assert.equal(depositFor(stay, { depositType: null, depositAmount: null }, 'first-night').dueNow, 845000);
    assert.equal(depositFor(stay, { depositType: 'fixed-amount', depositAmount: 0 }, 'full').dueNow, 2535000);
  });

  it('takes the first night after discounts when that is what adds up', () => {
    const promo = { total: 2281500, nights: [845000, 845000, 845000].map((gross) => ({ gross, discount: 0, promoDiscount: 84500 })) };
    assert.equal(depositFor(promo, { depositType: 'first-night', depositAmount: null }, 'full').dueNow, 760500);
  });
});

describe('references', () => {
  it('makes refs and invoice numbers 2C2P accepts for every channel', () => {
    for (let i = 0; i < 200; i++) {
      const ref = newRef();
      assert.match(ref, REF_PATTERN);
      assert.match(invoiceNoFor(ref), /^[A-Z0-9]{1,20}$/);
    }
    assert.match(newAccessKey(), ACCESS_KEY_PATTERN);
  });
});

describe('who sleeps where', () => {
  const double = { guests: 2, adults: 2, children: 0 };
  const family = { guests: 4, adults: 4, children: 0 };

  it('counts children against adult places when a room has none of its own', () => {
    assert.ok(fits(double, 1, 1));
    assert.ok(!fits(double, 2, 1));
    assert.ok(!fits(double, 0, 2));
    assert.ok(fits({ guests: 3, adults: 2, children: 1 }, 2, 1));
  });

  it('spreads a party across rooms, one adult in each', () => {
    assert.deepEqual(distributeGuests([double, double], 3, 1), [{ adults: 2, children: 0 }, { adults: 1, children: 1 }]);
    assert.deepEqual(distributeGuests([family, double], 4, 2), [{ adults: 3, children: 1 }, { adults: 1, children: 1 }]);
    assert.equal(distributeGuests([double], 2, 1), null);
    assert.equal(distributeGuests([double, double], 1, 0), null);
  });
});

describe('special offers', async () => {
  const { bestDeal, isEligible, nightlyDiscounts } = await import('../api/_lib/dealRules.ts');
  const base = {
    id: 'a', title: 'Book direct', badge: 'Special offer', discountPercent: 10, perks: [], promoCode: null,
    minNights: null, roomTypeUuids: [], sortOrder: 0,
  };
  const ctx = { nightDates: ['2026-12-10', '2026-12-11', '2026-12-12'], roomTypeUuid: 'deluxe' };

  it('applies automatically, or only with its code', () => {
    assert.ok(isEligible(base, ctx));
    const coded = { ...base, promoCode: 'HONEY' };
    assert.ok(!isEligible(coded, ctx));
    assert.ok(isEligible(coded, { ...ctx, promo: ' honey ' }));
  });

  it('checks minimum nights and rooms', () => {
    assert.ok(!isEligible({ ...base, minNights: 4 }, ctx));
    assert.ok(isEligible({ ...base, minNights: 3 }, ctx));
    assert.ok(!isEligible({ ...base, roomTypeUuids: ['villa'] }, ctx));
    assert.ok(!isEligible({ ...base, discountPercent: 0 }, ctx)); // nothing to give
    assert.ok(isEligible({ ...base, discountPercent: 0, perks: ['Welcome drink'] }, ctx)); // a package
  });

  it('picks the single best offer — biggest discount, then most perks', () => {
    const offers = [{ ...base, id: 'small', discountPercent: 5 }, { ...base, id: 'big', discountPercent: 15 }, { ...base, id: 'perks', discountPercent: 15, perks: ['Welcome drink'] }];
    assert.equal(bestDeal(offers, ctx)?.id, 'perks');
    assert.equal(bestDeal([], ctx), null);
  });

  it('discounts every night, in whole baht', () => {
    const nights = ctx.nightDates.map((date) => ({ date, amount: 845000 }));
    assert.deepEqual(nightlyDiscounts({ ...base, discountPercent: 10 }, nights), [84500, 84500, 84500]);
    // 75% of ฿8,450 is ฿6,337.50 — rounded to ฿6,338 so prices stay in whole baht.
    assert.deepEqual(nightlyDiscounts({ ...base, discountPercent: 75 }, [{ date: '2026-12-10', amount: 845000 }]), [633800]);
  });
});
