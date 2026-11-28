// Unit tests for the pure booking helpers: `npm run test:unit` (Node's own
// test runner, which strips the TypeScript types itself).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { depositFor } from '../api/_lib/deposit.ts';
import { invoiceNoFor, newAccessKey, newRef, REF_PATTERN, ACCESS_KEY_PATTERN } from '../api/_lib/ids.ts';
import { distributeGuests, fits } from '../shared/occupancy.ts';

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
  it('makes booking references, invoice numbers and private access keys', () => {
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
    assert.deepEqual(distributeGuests([double, double], 3, 1), [
      { adults: 2, children: 0 },
      { adults: 1, children: 1 },
    ]);
    assert.deepEqual(distributeGuests([family, double], 4, 2), [
      { adults: 3, children: 1 },
      { adults: 1, children: 1 },
    ]);
    assert.equal(distributeGuests([double], 2, 1), null);
    assert.equal(distributeGuests([double, double], 1, 0), null);
  });
});

describe('special offers', async () => {
  const { bestDeal, daysAhead, isEligible, nightlyDiscounts } = await import('../api/_lib/dealRules.ts');
  const base = {
    id: 'a',
    title: 'Book direct',
    badge: 'Special offer',
    discountPercent: 10,
    perks: [],
    promoCode: null,
    validFrom: null,
    validTo: null,
    stayFrom: null,
    stayTo: null,
    minNights: null,
    minAdvanceDays: null,
    roomTypeUuids: [],
    sortOrder: 0,
  };
  const ctx = { today: '2026-11-01', nightDates: ['2026-12-10', '2026-12-11', '2026-12-12'], roomTypeUuid: 'deluxe' };

  it('applies automatically, or only with its code', () => {
    assert.ok(isEligible(base, ctx));
    const coded = { ...base, promoCode: 'HONEY' };
    assert.ok(!isEligible(coded, ctx));
    assert.ok(isEligible(coded, { ...ctx, promo: ' honey ' }));
  });

  it('checks booking window, stay dates, minimum nights and rooms', () => {
    assert.ok(!isEligible({ ...base, validTo: '2026-10-31' }, ctx));
    assert.ok(!isEligible({ ...base, validFrom: '2026-11-02' }, ctx));
    assert.ok(isEligible({ ...base, validFrom: '2026-11-01', validTo: '2026-11-01' }, ctx)); // both days count
    assert.ok(!isEligible({ ...base, stayFrom: '2027-01-01' }, ctx));
    // Decided by the check-in day, not by any night of the stay.
    assert.ok(!isEligible({ ...base, stayFrom: '2026-12-12' }, ctx)); // arrives the day before
    assert.ok(isEligible({ ...base, stayFrom: '2026-12-10' }, ctx));
    assert.ok(isEligible({ ...base, stayTo: '2026-12-10' }, ctx)); // arrives on the last day: the whole stay counts
    assert.ok(!isEligible({ ...base, stayTo: '2026-12-09' }, ctx));
    assert.ok(!isEligible({ ...base, minNights: 4 }, ctx));
    assert.ok(isEligible({ ...base, minNights: 3 }, ctx));
    assert.ok(!isEligible({ ...base, roomTypeUuids: ['villa'] }, ctx));
    assert.ok(!isEligible({ ...base, discountPercent: 0 }, ctx)); // nothing to give
    assert.ok(isEligible({ ...base, discountPercent: 0, perks: ['Welcome drink'] }, ctx)); // a package
  });

  it('picks the single best offer — biggest discount, then most perks', () => {
    const offers = [
      { ...base, id: 'small', discountPercent: 5 },
      { ...base, id: 'big', discountPercent: 15 },
      { ...base, id: 'perks', discountPercent: 15, perks: ['Welcome drink'] },
    ];
    assert.equal(bestDeal(offers, ctx)?.id, 'perks');
    assert.equal(bestDeal([], ctx), null);
  });

  it('discounts every night of the stay alike, in whole baht', () => {
    const nights = ctx.nightDates.map((date) => ({ date, amount: 845000 }));
    assert.deepEqual(nightlyDiscounts({ ...base, discountPercent: 10 }, nights), [84500, 84500, 84500]);
    // Even past its last check-in day: the offer covers the stay it was chosen for.
    assert.deepEqual(nightlyDiscounts({ ...base, discountPercent: 10, stayTo: '2026-12-10' }, nights), [84500, 84500, 84500]);
    // 75% of ฿8,450 is ฿6,337.50 — rounded to ฿6,338 so prices stay in whole baht.
    assert.deepEqual(nightlyDiscounts({ ...base, discountPercent: 75 }, [{ date: '2026-12-10', amount: 845000 }]), [633800]);
  });

  it('counts days ahead from today to check-in', () => {
    assert.equal(daysAhead('2026-11-27', '2027-01-26'), 60);
    assert.equal(daysAhead('2026-11-27', '2026-11-28'), 1);
    assert.ok(isEligible({ ...base, minAdvanceDays: 60 }, { ...ctx, today: '2026-10-11' })); // 60 days before 10 Dec
    assert.ok(!isEligible({ ...base, minAdvanceDays: 60 }, { ...ctx, today: '2026-10-12' })); // 59
  });

  // The priority the hotel asked for: Early Bird 55% when booked 60+ days
  // ahead, else Minimum 4 Nights 53% for 4+ nights, else Direct 50% — one
  // only, on every night, and a bigger offer never blocks a smaller one.
  describe('Early Bird / Minimum 4 Nights / Direct Promotion', () => {
    const offers = [
      {
        ...base,
        id: 'direct',
        title: 'Direct Promotion',
        discountPercent: 50,
        minNights: 1,
        stayFrom: '2026-11-09',
        stayTo: '2027-04-01',
        sortOrder: 40,
      },
      {
        ...base,
        id: 'min4',
        title: 'Minimum 4 Nights',
        discountPercent: 53,
        minNights: 4,
        stayFrom: '2026-11-27',
        stayTo: '2027-04-30',
        sortOrder: 50,
      },
      { ...base, id: 'early', title: 'Early Bird', discountPercent: 55, minAdvanceDays: 60, stayTo: '2027-04-30', sortOrder: 60 },
    ];
    const stay = (checkIn: string, nights: number) =>
      Array.from({ length: nights }, (_, i) => {
        const d = new Date(`${checkIn}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() + i);
        return d.toISOString().slice(0, 10);
      });
    const pick = (today: string, checkIn: string, nights: number) =>
      bestDeal(offers, { today, nightDates: stay(checkIn, nights), roomTypeUuid: 'deluxe' });

    it('26–28 Jan booked on 27 Nov: Early Bird on both nights', () => {
      const deal = pick('2026-11-27', '2027-01-26', 2);
      assert.equal(deal?.id, 'early');
      assert.deepEqual(
        nightlyDiscounts(
          deal!,
          stay('2027-01-26', 2).map((date) => ({ date, amount: 400000 })),
        ),
        [220000, 220000],
      );
    });

    it('the same stay booked later: Direct 50% on both nights, not blocked', () => {
      const deal = pick('2026-12-01', '2027-01-26', 2);
      assert.equal(deal?.id, 'direct');
      assert.deepEqual(
        nightlyDiscounts(
          deal!,
          stay('2027-01-26', 2).map((date) => ({ date, amount: 400000 })),
        ),
        [200000, 200000],
      );
    });

    it('4+ nights without the 60 days: Minimum 4 Nights', () => {
      assert.equal(pick('2026-12-20', '2027-01-26', 4)?.id, 'min4');
      assert.equal(pick('2026-12-20', '2027-01-26', 3)?.id, 'direct');
    });

    it('4+ nights booked 60+ days ahead: Early Bird beats Minimum 4 Nights', () => {
      assert.equal(pick('2026-11-27', '2027-02-10', 5)?.id, 'early');
    });

    it('the old fixed-date Early Bird (from 27 Jan) no longer cuts a stay in two', () => {
      const fixed = offers.map((o) => (o.id === 'early' ? { ...o, minAdvanceDays: null, stayFrom: '2027-01-27' } : o));
      const deal = bestDeal(fixed, { today: '2026-11-27', nightDates: stay('2027-01-26', 2), roomTypeUuid: 'deluxe' });
      assert.equal(deal?.id, 'direct'); // arrives 26 Jan, before it starts: Direct 50% on both nights
    });
  });
});

describe('Stripe Checkout', async () => {
  const { formEncode, inquiryFromSession } = await import('../api/_lib/stripe.ts');
  const { isReversedPayment, isSuccessfulPayment } = await import('../shared/paymentStatus.ts');
  const card = (card: Record<string, unknown>) => ({ type: 'card', card });
  const session = (over: Record<string, unknown> = {}, charge: Record<string, unknown> = {}) => ({
    id: 'cs_test_1',
    client_secret: null,
    status: 'complete' as const,
    payment_status: 'paid' as const,
    amount_total: 1100050,
    currency: 'thb',
    metadata: { ref: 'RP7K3M9Q', invoice_no: 'WEBRP7K3M9Q' },
    payment_intent: {
      id: 'pi_1',
      latest_charge: {
        id: 'ch_1',
        amount_refunded: 0,
        refunded: false,
        currency: 'thb',
        payment_method_details: card({ brand: 'visa', wallet: null }),
        ...charge,
      },
    },
    ...over,
  });

  it('encodes nested params the way Stripe reads them', () => {
    const body = formEncode({
      mode: 'payment',
      line_items: [{ quantity: 1, price_data: { currency: 'thb', unit_amount: 1100050 } }],
      metadata: { ref: 'HH1' },
      skipped: undefined,
    });
    assert.equal(
      decodeURIComponent(body.toString()),
      'mode=payment&line_items[0][quantity]=1&line_items[0][price_data][currency]=thb&line_items[0][price_data][unit_amount]=1100050&metadata[ref]=HH1',
    );
  });

  it('reads a paid session as paid, in baht, with how it was paid', () => {
    const paid = inquiryFromSession(session(), 'WEBRP7K3M9Q');
    assert.ok(isSuccessfulPayment(paid.respCode));
    assert.equal(paid.amount, 11000.5);
    assert.equal(paid.currencyCode, 'THB');
    assert.equal(paid.tranRef, 'pi_1');
    assert.equal(paid.referenceNo, 'ch_1');
    assert.equal(paid.channelCode, 'Stripe · Visa');
    assert.equal(
      inquiryFromSession(
        session({}, { payment_method_details: card({ brand: 'mastercard', wallet: { type: 'apple_pay' } }) }),
        'WEBRP7K3M9Q',
      ).channelCode,
      'Stripe · Apple Pay (Mastercard)',
    );
    assert.equal(
      inquiryFromSession(session({}, { payment_method_details: { type: 'promptpay' } }), 'WEBRP7K3M9Q').channelCode,
      'Stripe · PromptPay',
    );
  });

  it('reads full and partial refunds as reversed', () => {
    assert.ok(isReversedPayment(inquiryFromSession(session({}, { amount_refunded: 1100050, refunded: true }), 'WEBRP7K3M9Q').respCode));
    const partly = inquiryFromSession(session({}, { amount_refunded: 50000 }), 'WEBRP7K3M9Q');
    assert.ok(isReversedPayment(partly.respCode));
    assert.match(partly.respDesc ?? '', /Partly refunded.*THB 500/);
  });

  it('treats an unpaid or expired page as nothing final yet', () => {
    for (const over of [
      { status: 'open', payment_status: 'unpaid', payment_intent: null },
      { status: 'expired', payment_status: 'unpaid', payment_intent: null },
      { status: 'complete', payment_status: 'unpaid' },
    ]) {
      const answer = inquiryFromSession(session(over), 'WEBRP7K3M9Q');
      assert.ok(!isSuccessfulPayment(answer.respCode) && !isReversedPayment(answer.respCode));
      assert.equal(answer.respCode, '2001');
    }
  });

  it('refuses a session that belongs to another booking', () => {
    assert.throws(() => inquiryFromSession(session(), 'WEBHHXXXXXX'), /does not belong/);
  });
});

describe('rate names guests can read', async () => {
  const { guestRate, isRateCode } = await import('../shared/rateNames.ts');
  const { buildAvailability } = await import('../api/_lib/rooms.ts');
  const none = { breakfast: false, lunch: false, dinner: false };

  it('turns SiteMinder codes into what the rate includes, and keeps real names', () => {
    assert.equal(isRateCode('OPN-OTA(L)'), true);
    assert.equal(isRateCode('Bed & Breakfast'), false);
    assert.deepEqual(guestRate('OPN-RO', none), { name: 'Room only', meals: none });
    assert.deepEqual(guestRate('TTSRB', none), { name: 'Room with breakfast', meals: { ...none, breakfast: true } });
    assert.deepEqual(guestRate('Flexible rate', none), { name: 'Flexible rate', meals: none });
  });

  it('shows one of two rates a guest cannot tell apart: the cheaper', () => {
    const roomType = {
      uuid: 'rt-1',
      name: 'Deluxe Twin Room',
      description: null,
      roomSize: 32,
      roomSizeUnit: 'm^2',
      maxOccupancy: 2,
      maxAdultOccupancy: 2,
      maxChildOccupancy: 0,
    };
    const rate = (uuid: string, name: string, total: number, breakfast = false) => ({
      roomType,
      capacity: { guests: 2, adults: 2, children: 0 },
      available: 3,
      total,
      originalTotal: total,
      offer: null,
      dueNow: total,
      depositType: 'full' as const,
      nightly: [],
      promoDiscount: 0,
      cancellation: { refundable: null, summary: 'Cancellation terms are confirmed by the hotel with your booking.' },
      rate: {
        uuid,
        roomTypeUuid: 'rt-1',
        ratePlanUuid: uuid,
        name,
        description: null,
        promotionOnly: false,
        breakfastIncluded: breakfast,
        lunchIncluded: false,
        dinnerIncluded: false,
        maxOccupancy: 2,
        maxAdultOccupancy: 2,
        maxChildOccupancy: 0,
        depositType: null,
        depositAmount: null,
        maxNumberOfRooms: null,
      },
    });
    const catalog = {
      property: { name: 'Royal Pineapple', currencyIsoCode: 'THB', bookingEngineUrl: null, termsAndConditions: null },
      roomTypes: new Map(),
      rates: new Map(),
    };
    const search = { checkIn: '2026-12-10', checkOut: '2026-12-12', nights: 2, adults: 2, children: 0 };
    const result = buildAvailability(
      [rate('ota', 'OPN-OTA(L)', 800000), rate('direct', 'OPN-RO', 700000), rate('bb', 'TTSRB', 900000)] as never,
      catalog as never,
      search,
    );
    assert.deepEqual(
      result.roomTypes[0].rates.map((r) => [r.roomRateUuid, r.name]),
      [
        ['direct', 'Room only'],
        ['bb', 'Room with breakfast'],
      ],
    );
  });
});

describe('room names', async () => {
  const { WEBSITE_ROOM_NAMES } = await import('../shared/roomNames.ts');
  const { rooms } = await import('../src/data/content.ts');
  it('match the room cards, so the booking record and emails use the same names', () => {
    assert.deepEqual(
      WEBSITE_ROOM_NAMES,
      Object.fromEntries(rooms.filter((room) => room.siteminderRoomTypeUuid).map((room) => [room.siteminderRoomTypeUuid, room.title])),
    );
  });
});

describe('room types without a name in SiteMinder', async () => {
  const { roomTypeName } = await import('../api/_lib/roomTypeName.ts');
  it('uses the name when there is one, else the room code in words, else "Room"', () => {
    assert.equal(roomTypeName({ name: ' Deluxe Twin Room ', code: 'DELUXE' }), 'Deluxe Twin Room');
    // Royal Pineapple's one-bedroom villa arrived as name: null on 28 Nov 2026 and crashed /book.
    assert.equal(roomTypeName({ name: null, code: 'ONE_BEDROOM_VILLA' }), 'One bedroom villa');
    assert.equal(roomTypeName({ name: '', code: null }), 'Room');
  });
});

describe('room types the website does not sell', async () => {
  const { isSoldOnline } = await import('../shared/roomNames.ts');
  it('sells both golf-club villas', () => {
    assert.equal(isSoldOnline({ code: 'ONE_BEDROOM_VILLA' }), true);
    assert.equal(isSoldOnline({ code: 'TWO_BEDROOM_VILLA' }), true);
    assert.equal(isSoldOnline({ code: null }), true);
  });
});
