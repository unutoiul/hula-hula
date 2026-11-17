// Exercise the real delivery function with an intercepted network boundary.
// No live key, booking, payment, database connection or email is used.
// Run: node --import tsx --test tests/siteminder-delivery.test.ts
import assert from 'node:assert/strict';
import { it, type TestContext } from 'node:test';
import type { BookingRow } from '../api/_lib/bookings.ts';
import { deliverReservation } from '../api/_lib/deliver.ts';

const booking = {
  ref: 'HH-TEST-ONLY', check_in: '2026-12-10', check_out: '2026-12-11',
  items: [{
    roomTypeUuid: 'test-room', roomTypeName: 'Test room', roomRateUuid: 'test-rate', rateName: 'Room only',
    meals: { breakfast: false, lunch: false, dinner: false }, cancellation: 'Test only', depositType: null,
    adults: 2, children: 0, quantity: 1, unitTotal: 3000, unitDeposit: 3000,
    nightly: [{ date: '2026-12-10', amount: 3000 }], promoDiscount: 0,
  }],
  currency: 'THB', total_amount: 3000, deposit_amount: 3000, paid_amount: 3000,
  guest_first_name: 'Synthetic', guest_last_name: 'Test', guest_email: 'guest@example.invalid',
  guest_phone: null, guest_country: 'TH', arrival_time: null, special_requests: 'TEST ONLY',
  flags: [], paid_at: null, channel_code: null, tran_ref: null, invoice_no: 'TESTONLY',
  approval_code: null, promo_code: null,
} as BookingRow;

function configure(t: TestContext) {
  const settings = {
    RESEND_API_KEY: 'fake-key-never-sent',
    BOOKING_ADMIN_TO: 'reservations@example.invalid',
    BOOKING_ADMIN_BCC: '',
  };
  const previous = Object.fromEntries(Object.keys(settings).map(key => [key, process.env[key]]));
  for (const [key, value] of Object.entries(settings)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

it('the default handoff requests manual SiteMinder entry by email; no reservation is pushed', async t => {
  configure(t);
  const requests: { url: string; init?: RequestInit }[] = [];
  t.mock.method(globalThis, 'fetch', async (url: string, init?: RequestInit) => {
    requests.push({ url, init });
    return new Response('{}', { status: 200 });
  });
  const result = await deliverReservation(booking);
  assert.deepEqual(result, { method: 'email' });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://api.resend.com/emails');
  const payload = JSON.parse(String(requests[0].init?.body));
  assert.match(payload.subject, /ACTION: enter in SiteMinder/);
  assert.deepEqual(payload.to, ['reservations@example.invalid']);
  assert.equal(payload.template.variables.BOOKING_REF, booking.ref);
  assert.equal(payload.template.variables.INVOICE_NO, booking.invoice_no);
  assert.match(payload.template.variables.KEY_BLOCK, /Synthetic Test/);
  assert.equal(new Headers(requests[0].init?.headers).get('Idempotency-Key'), `booking-${booking.ref}-team`);
});

it('satisfies a legacy published template that still requires an invoice number', async t => {
  configure(t);
  t.mock.method(globalThis, 'fetch', async (_url: string, init?: RequestInit) => {
    const payload = JSON.parse(String(init?.body));
    if (!payload.template.variables.INVOICE_NO) {
      return Response.json({ message: 'Missing required variable "INVOICE_NO"', name: 'validation_error', statusCode: 422 }, { status: 422 });
    }
    return Response.json({ id: 'synthetic-email' });
  });
  assert.deepEqual(await deliverReservation(booking), { method: 'email' });
});

it('a failed email handoff rejects instead of reporting successful delivery', async t => {
  configure(t);
  t.mock.method(globalThis, 'fetch', async () => new Response('Simulated failure', { status: 503 }));
  await assert.rejects(deliverReservation(booking), /Resend refused the booking notification \(503\)/);
});
