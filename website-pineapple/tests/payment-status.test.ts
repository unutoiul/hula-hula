// Real Stripe handlers and persistence, with all external HTTP intercepted.
import assert from 'node:assert/strict';
import { it, type TestContext } from 'node:test';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { BookingRow } from '../api/_lib/bookings.ts';
import { confirmPayment, deliver } from '../api/_lib/finalize.ts';
import { sha256Hex } from '../api/_lib/ids.ts';
import { canInquire, inquire, isPaymentConfigured, isTestMode, paymentProvider } from '../api/_lib/payments.ts';
import { confirmationVariables, notificationVariables } from '../api/_lib/bookingEmails.ts';
import type { StripeCheckoutSession, StripeEvent } from '../api/_lib/stripe.ts';
import refreshPayment from '../api/booking/refresh-payment.ts';
import bookingStatus from '../api/booking/status.ts';
import reconcile from '../api/cron/reconcile.ts';
import webhook from '../api/payment/stripe-webhook.ts';
import { isReversedPayment, paymentStatus } from '../shared/paymentStatus.ts';
import { inView, isPaid, needsAction, paymentBadge, siteMinderText, type DeskBooking } from '../src/admin/bookingModel.ts';

const KEY = 'a'.repeat(43);

function setup(t: TestContext, patch: Partial<BookingRow> = {}) {
  const settings = {
    SUPABASE_URL: 'https://database.example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'fake-service-key', SUPABASE_ANON_KEY: 'fake-public-key',
    RESEND_API_KEY: 'fake-email-key', BOOKING_ADMIN_TO: 'team@example.invalid', BOOKING_ADMIN_BCC: '', CRON_SECRET: 'fake-cron-secret',
    STRIPE_SECRET_KEY: 'rk_live_synthetic', STRIPE_PUBLISHABLE_KEY: 'pk_live_synthetic', PREVIEW_SITE: '', VERCEL_ENV: '',
  };
  const previous = Object.fromEntries(Object.keys(settings).map(key => [key, process.env[key]]));
  Object.assign(process.env, settings);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  t.mock.method(console, 'info', () => {});
  t.mock.method(console, 'error', () => {});
  t.mock.method(console, 'warn', () => {});
  const row = {
    id: 'test-id', ref: 'HH123ABC', invoice_no: 'WEBHH123ABC', access_key_hash: sha256Hex(KEY),
    status: 'delivered', check_in: '2027-02-01', check_out: '2027-02-02', items: [],
    currency: 'THB', total_amount: 6000, deposit_amount: 3000, balance_amount: 3000, paid_amount: 3000,
    guest_first_name: 'Synthetic', guest_last_name: 'Test', guest_email: null, guest_phone: null, guest_country: null,
    arrival_time: null, special_requests: null, pii_wiped_at: null, promo_code: null,
    payment_token: 'cs_live_synthetic', tran_ref: 'pi_original', reference_no: null, approval_code: null, channel_code: 'Stripe Visa',
    resp_code: '0000', resp_desc: 'Paid', paid_at: '2026-11-10T00:00:00Z', last_inquiry_at: null,
    delivery_method: 'email', delivery_attempts: 1, delivery_claimed_at: null, delivery_error: null,
    delivered_at: '2026-11-10T00:01:00Z', guest_emailed_at: null, keyed_at: null, flags: [],
    expires_at: new Date(Date.now() + 900_000).toISOString(), created_at: '2026-11-10T00:00:00Z',
    ...patch,
  } as BookingRow;
  const charge = { id: 'ch_synthetic', refunded: true, amount_refunded: 300000, currency: 'thb', payment_method_details: { type: 'card', card: { brand: 'visa' } } };
  const plan = {
    session: {
      id: row.payment_token!, status: 'complete', payment_status: 'paid', amount_total: 300000, currency: 'thb',
      metadata: { invoice_no: row.invoice_no },
      payment_intent: { id: 'pi_synthetic', latest_charge: charge },
    } as StripeCheckoutSession,
    charge,
    event: { id: 'evt_synthetic_event', type: 'charge.refunded', data: { object: { metadata: { invoice_no: row.invoice_no } } } } as StripeEvent,
    httpStatus: 200, eventStatus: 200, admin: true, adminStatus: 200,
    beforeInquiryReturn: undefined as (() => void) | undefined,
  };
  const requests: { url: URL; method: string; body: Record<string, unknown>; headers: Headers }[] = [];
  t.mock.method(globalThis, 'fetch', async (input: string | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = init?.method ?? 'GET';
    const body = init?.body ? JSON.parse(String(init.body)) : {};
    requests.push({ url, method, body, headers: new Headers(init?.headers) });
    if (url.href === 'https://database.example.invalid/rest/v1/rpc/is_admin') return Response.json(plan.admin, { status: plan.adminStatus });
    if (url.pathname === '/rest/v1/bookings' && url.hostname === 'database.example.invalid') {
      if (method === 'DELETE') return Response.json([]);
      const q = url.searchParams;
      const status = q.get('status');
      const token = q.get('payment_token');
      const matches = (!status || (status.startsWith('eq.') ? row.status === status.slice(3) : status.slice(4, -1).split(',').includes(row.status)))
        && (!q.has('resp_code') || q.get('resp_code') === (row.resp_code === null ? 'is.null' : 'eq.' + row.resp_code))
        && (!token || row.payment_token?.startsWith(token.slice(5, -1)));
      if (!matches) return Response.json([]);
      if (method === 'GET') {
        if (q.get('or')?.includes('resp_code.not.in') && isReversedPayment(row.resp_code)) return Response.json([]);
        return Response.json([row]);
      }
      if (q.get('and')?.includes('resp_code.not.in') && isReversedPayment(row.resp_code)) return Response.json([]);
      Object.assign(row, body);
      return Response.json([row]);
    }
    if (url.hostname === 'api.stripe.com' && url.pathname === '/v1/checkout/sessions/' + row.payment_token) {
      assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer ' + process.env.STRIPE_SECRET_KEY);
      assert.equal(url.searchParams.get('expand[]'), 'payment_intent.latest_charge');
      plan.beforeInquiryReturn?.();
      return Response.json(plan.session, { status: plan.httpStatus });
    }
    if (url.hostname === 'api.stripe.com' && url.pathname === '/v1/events/evt_synthetic_event') {
      return Response.json(plan.event, { status: plan.eventStatus });
    }
    if (url.href === 'https://api.resend.com/emails') return Response.json({ id: 'fake-email' });
    throw new Error('Unexpected external request: ' + method + ' ' + url.origin + url.pathname);
  });
  const inquiries = () => requests.filter(r => r.url.pathname.startsWith('/v1/checkout/sessions/'));
  const emails = () => requests.filter(r => r.url.hostname === 'api.resend.com');
  const paid = () => { plan.charge.refunded = false; plan.charge.amount_refunded = 0; };
  return { row, plan, requests, inquiries, emails, paid };
}

function request(overrides: Record<string, unknown> = {}) {
  return { method: 'POST', headers: {}, query: {}, ...overrides } as VercelRequest;
}
function response() {
  const state = { code: 200, body: {} as Record<string, unknown>, headers: {} as Record<string, unknown> };
  const res = {
    status(code: number) { state.code = code; return this; },
    json(body: Record<string, unknown>) { state.body = body; return this; },
    setHeader(key: string, value: unknown) { state.headers[key] = value; return this; },
  } as unknown as VercelResponse;
  return { state, res };
}

it('a Stripe refund updates payment history without resending booking emails', async t => {
  const h = setup(t);
  const after = await confirmPayment(h.row.invoice_no, 'webhook');
  assert.equal(after?.resp_code, '4120');
  assert.equal(after?.status, 'delivered');
  assert.equal(after?.paid_amount, 3000);
  assert.equal(after?.tran_ref, 'pi_original');
  const desk = after as unknown as DeskBooking;
  assert.equal(isPaid(desk), false);
  assert.equal(paymentBadge(desk).label, 'Refunded');
  assert.equal(needsAction(desk), true);
  assert.equal(inView(desk, 'unfinished'), false);
  assert.doesNotMatch(siteMinderText(desk), /paid .* online|to pay at the hotel/);
  await confirmPayment(h.row.invoice_no, 'webhook');
  await deliver(h.row);
  assert.equal(h.inquiries().length, 1);
  assert.equal(h.emails().length, 0);
});

it('a guest sees a Stripe refund without an assumed remaining balance or personal details', async t => {
  const h = setup(t);
  const { state, res } = response();
  await bookingStatus(request({ method: 'GET', query: { ref: h.row.ref, key: KEY } }), res);
  assert.equal(state.code, 200);
  assert.equal(state.body.status, 'refunded');
  assert.equal(state.body.balance, null);
  assert.equal(state.body.guest_email, undefined);
  assert.equal(h.emails().length, 0);
});

it('a paid Stripe checkout completes once and repeated inquiries do not resend emails', async t => {
  const h = setup(t, { status: 'pending', resp_code: null, paid_amount: null, paid_at: null, delivered_at: null, delivery_attempts: 0 });
  h.paid();
  assert.equal((await confirmPayment(h.row.invoice_no, 'webhook'))?.status, 'delivered');
  await confirmPayment(h.row.invoice_no, 'webhook');
  assert.equal(h.row.resp_code, '0000');
  assert.equal(h.emails().length, 1);
});

it('a refund arriving before a successful callback is retained without a confirmation', async t => {
  const h = setup(t, { status: 'pending', resp_code: null, paid_amount: null, paid_at: null });
  await confirmPayment(h.row.invoice_no, 'cron');
  assert.equal(h.row.status, 'paid');
  assert.equal(h.row.resp_code, '4120');
  assert.equal(h.emails().length, 0);
});

it('an older successful inquiry cannot overwrite a concurrent refund', async t => {
  const h = setup(t, { status: 'paid' });
  h.paid();
  h.plan.beforeInquiryReturn = () => { h.row.resp_code = '4120'; };
  assert.equal((await confirmPayment(h.row.invoice_no, 'webhook'))?.resp_code, '4120');
  assert.equal(h.emails().length, 0);
});

it('an unpaid Stripe session remains pending without confirmation emails', async t => {
  const h = setup(t, { status: 'pending', resp_code: null });
  h.plan.session.payment_status = 'unpaid';
  const { state, res } = response();
  await bookingStatus(request({ method: 'GET', query: { ref: h.row.ref, key: KEY } }), res);
  assert.equal(state.body.status, 'pending');
  assert.equal(h.row.resp_code, '2001');
  assert.equal(h.emails().length, 0);
});

for (const scenario of ['wrong-invoice', 'wrong-currency', 'http-error']) {
  it('rejects ' + scenario + ' Stripe results before changing payment history', async t => {
    const h = setup(t);
    if (scenario === 'wrong-invoice') h.plan.session.metadata = { invoice_no: 'WEBHH999999' };
    if (scenario === 'wrong-currency') h.plan.session.currency = 'usd';
    if (scenario === 'http-error') h.plan.httpStatus = 503;
    await assert.rejects(confirmPayment(h.row.invoice_no, 'webhook'));
    assert.equal(h.row.resp_code, '0000');
    assert.equal(h.emails().length, 0);
  });
}

it('fetches a webhook event from Stripe and verifies the checkout instead of trusting its body', async t => {
  const h = setup(t);
  const { state, res } = response();
  await webhook(request({ body: { id: h.plan.event.id, type: 'checkout.session.completed' } }), res);
  assert.equal(state.code, 200);
  assert.equal(h.row.resp_code, '4120');
  assert.equal(h.inquiries().length, 1);
});

it('rejects an invalid webhook before any external request', async t => {
  const h = setup(t);
  const { state, res } = response();
  await webhook(request({ body: { id: 'invalid' } }), res);
  assert.equal(state.code, 400);
  assert.equal(h.requests.length, 0);
});

it('an event that Stripe does not recognize cannot update a booking', async t => {
  const h = setup(t);
  h.plan.eventStatus = 404;
  const { state, res } = response();
  await webhook(request({ body: { id: h.plan.event.id } }), res);
  assert.equal(state.code, 400);
  assert.equal(h.inquiries().length, 0);
  assert.equal(h.row.resp_code, '0000');
});

it('an admin can refresh Stripe status using the verified caller JWT', async t => {
  const h = setup(t);
  const { state, res } = response();
  await refreshPayment(request({ headers: { authorization: 'Bearer fake-user-jwt' }, body: { ref: h.row.ref } }), res);
  assert.equal(state.code, 200);
  assert.equal(h.row.resp_code, '4120');
  const permission = h.requests[0];
  assert.equal(permission.url.pathname, '/rest/v1/rpc/is_admin');
  assert.equal(permission.headers.get('apikey'), 'fake-public-key');
  assert.equal(permission.headers.get('authorization'), 'Bearer fake-user-jwt');
});

for (const permission of ['missing', 'nonadmin', 'expired']) {
  it('denies ' + permission + ' admin credentials before looking up a booking', async t => {
    const h = setup(t);
    h.plan.admin = false;
    if (permission === 'expired') h.plan.adminStatus = 401;
    const { state, res } = response();
    await refreshPayment(request({ headers: permission === 'missing' ? {} : { authorization: 'Bearer fake-user-jwt' }, body: { ref: h.row.ref } }), res);
    assert.equal(state.code, permission === 'nonadmin' ? 403 : 401);
    assert.equal(h.inquiries().length, 0);
    assert.equal(h.requests.some(r => r.url.pathname === '/rest/v1/bookings'), false);
  });
}

it('nightly reconciliation checks Stripe refunds and filters to the configured mode', async t => {
  const h = setup(t);
  const { state, res } = response();
  await reconcile(request({ method: 'GET', headers: { authorization: 'Bearer fake-cron-secret' } }), res);
  assert.equal(state.code, 200);
  assert.equal(state.body.reversed, 1);
  assert.equal(h.row.resp_code, '4120');
  assert.equal(h.emails().length, 0);
  const sweep = h.requests.find(r => r.url.searchParams.get('status') === 'in.(paid,delivered)');
  assert.equal(sweep?.url.searchParams.get('payment_token'), 'like.cs_live_*');
});

it('saved historical outcomes stay readable', () => {
  assert.equal(paymentStatus('4047'), 'voided');
  assert.equal(paymentStatus('4110'), 'settled');
});

it('nightly checks leave historical paid records unchanged without contacting a retired gateway', async t => {
  const h = setup(t, { payment_token: 'retired-checkout' });
  const { state, res } = response();
  await reconcile(request({ method: 'GET', headers: { authorization: 'Bearer fake-cron-secret' } }), res);
  assert.equal(state.code, 200);
  assert.equal(state.body.checked, 0);
  assert.equal(h.row.status, 'delivered');
  assert.equal(h.row.resp_code, '0000');
  assert.equal(h.inquiries().length, 0);
});

it('an old unsupported unpaid attempt expires without contacting another gateway', async t => {
  const h = setup(t, { payment_token: 'retired-checkout', status: 'pending', expires_at: new Date(Date.now() - 3 * 3600_000).toISOString() });
  const { state, res } = response();
  await reconcile(request({ method: 'GET', headers: { authorization: 'Bearer fake-cron-secret' } }), res);
  assert.equal(state.code, 200);
  assert.equal(state.body.expired, 1);
  assert.equal(h.row.status, 'expired');
  assert.equal(h.inquiries().length, 0);
  assert.equal(h.emails().length, 0);
});

it('requires matching Stripe keys to enable checkout', t => {
  setup(t);
  assert.equal(paymentProvider(), 'stripe');
  process.env.STRIPE_SECRET_KEY = '';
  assert.equal(isPaymentConfigured(), false);
  process.env.STRIPE_SECRET_KEY = 'rk_test_synthetic';
  assert.equal(isPaymentConfigured(), false);
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_synthetic';
  assert.equal(isPaymentConfigured(), true);
  assert.equal(isTestMode(), true);
  process.env.STRIPE_SECRET_KEY = 'rk_live_synthetic';
  assert.equal(isPaymentConfigured(), false);
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_live_synthetic';
  assert.equal(isPaymentConfigured(), true);
  assert.equal(isTestMode(), false);
});

it('a test-mode checkout keeps the test warning without adding a site flag', async t => {
  const h = setup(t, { status: 'pending', payment_token: 'cs_test_synthetic', resp_code: null, paid_at: null });
  process.env.STRIPE_SECRET_KEY = 'rk_test_synthetic';
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_synthetic';
  process.env.PREVIEW_SITE = 'true';
  process.env.VERCEL_ENV = 'preview';
  h.paid();
  await confirmPayment(h.row.invoice_no, 'webhook');
  assert.deepEqual(h.row.flags, ['test_payment']);
  assert.equal(h.row.status, 'delivered');
  const variables = notificationVariables(h.row);
  assert.match(variables.PAID_AMOUNT, /0.*TEST payment/);
  assert.match(variables.BALANCE, /6,000/);
  assert.doesNotMatch(variables.FLAGS_HTML ?? '', /TEST SITE/);
});

for (const token of [null, 'retired-checkout', 'cs_test_othermode']) {
  it('keeps saved history without querying an unsupported checkout: ' + token, async t => {
    const h = setup(t, { payment_token: token });
    assert.equal(canInquire(h.row), false);
    assert.throws(() => inquire(h.row.invoice_no, h.row), /no checkout in the current Stripe mode/);
    const { state, res } = response();
    await refreshPayment(request({ headers: { authorization: 'Bearer fake-user-jwt' }, body: { ref: h.row.ref } }), res);
    assert.equal(state.code, 409);
    assert.equal(h.inquiries().length, 0);
    assert.equal(h.row.resp_code, '0000');
  });
}

it('guest status for saved history does not query an unsupported checkout', async t => {
  const h = setup(t, { payment_token: 'retired-checkout' });
  const { state, res } = response();
  await bookingStatus(request({ method: 'GET', query: { ref: h.row.ref, key: KEY } }), res);
  assert.equal(state.code, 200);
  assert.equal(state.body.status, 'confirmed');
  assert.equal(h.inquiries().length, 0);
});

it('ignores notifications without a matching booking without calling a payment provider', async t => {
  const h = setup(t);
  t.mock.method(globalThis, 'fetch', async () => Response.json([]));
  assert.equal(await confirmPayment('WEBHH999999', 'webhook'), null);
  assert.equal(h.requests.length, 0);
});

it('trimmed emails still supply required variables for older published template versions', async t => {
  const h = setup(t, { flags: ['preview_site'], status: 'paid' });
  const team = notificationVariables(h.row);
  const guest = confirmationVariables(h.row, null, null);
  assert.equal(team.FLAGS_HTML, undefined);
  assert.equal(team.INVOICE_NO, h.row.invoice_no);
  assert.equal(team.TRAN_REF, h.row.tran_ref);
  assert.equal(team.APPROVAL_CODE, '—');
  assert.equal(guest.PAYMENT_REF, h.row.tran_ref);
  assert.doesNotMatch(team.KEY_BLOCK, /pi_original|WEBHH123ABC/);
  await deliver(h.row);
  assert.equal(h.emails().length, 1);
  assert.doesNotMatch(String(h.emails()[0].body.subject), /CHECK|TEST SITE/);
});
