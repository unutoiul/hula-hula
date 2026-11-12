// Real handlers and persistence calls, with all external HTTP intercepted.
// No live booking, credentials, payment mutation, database write or email.
import assert from 'node:assert/strict';
import { it, type TestContext } from 'node:test';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { BookingRow } from '../api/_lib/bookings.ts';
import { confirmPayment, deliver } from '../api/_lib/finalize.ts';
import { sha256Hex } from '../api/_lib/ids.ts';
import { signHS256, verifyHS256 } from '../api/_lib/jwt.ts';
import { paymentInquiry, type InquiryResult } from '../api/_lib/twoc2p.ts';
import { isPaymentConfigured, isTestMode, paymentProvider } from '../api/_lib/payments.ts';
import { confirmationVariables, notificationVariables } from '../api/_lib/bookingEmails.ts';
import refreshPayment from '../api/booking/refresh-payment.ts';
import bookingStatus from '../api/booking/status.ts';
import reconcile from '../api/cron/reconcile.ts';
import backend from '../api/payment/2c2p-backend.ts';
import { isReversedPayment, paymentStatus } from '../shared/paymentStatus.ts';
import { inView, isPaid, needsAction, paymentBadge, siteMinderText, type DeskBooking } from '../src/admin/bookingModel.ts';

const KEY = 'a'.repeat(43);
const SECRET = 'fake-secret-for-intercepted-tests-only';

function setup(t: TestContext, patch: Partial<BookingRow> = {}) {
  const settings = {
    SUPABASE_URL: 'https://database.example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'fake-service-key', SUPABASE_ANON_KEY: 'fake-public-key',
    TWOC2P_MERCHANT_ID: 'FAKE', TWOC2P_SECRET_KEY: SECRET, TWOC2P_ENV: 'sandbox', TWOC2P_API_VERSION: '4.3',
    RESEND_API_KEY: 'fake-email-key', BOOKING_ADMIN_TO: 'team@example.invalid', BOOKING_ADMIN_BCC: '',
    RESERVATION_DELIVERY: 'email', CRON_SECRET: 'fake-cron-secret',
    STRIPE_SECRET_KEY: '', STRIPE_PUBLISHABLE_KEY: '', PAYMENT_PROVIDER: '', PREVIEW_SITE: '', VERCEL_ENV: '',
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
    tran_ref: 'original-reference', reference_no: null, approval_code: null, channel_code: 'VI',
    resp_code: '0000', resp_desc: 'Successful', paid_at: '2026-11-10T00:00:00Z', last_inquiry_at: null,
    delivery_method: 'email', delivery_attempts: 1, delivery_claimed_at: null, delivery_error: null,
    delivered_at: '2026-11-10T00:01:00Z', guest_emailed_at: null, keyed_at: null, flags: [],
    expires_at: new Date(Date.now() + 900_000).toISOString(), created_at: '2026-11-10T00:00:00Z',
    ...patch,
  } as BookingRow;
  const plan = {
    result: { merchantID: 'FAKE', invoiceNo: row.invoice_no, respCode: '4120', respDesc: 'Refunded', amount: 3000, currencyCode: 'THB' } as InquiryResult,
    signed: true, httpStatus: 200, admin: true, adminStatus: 200,
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
      const matches = (!status || (status.startsWith('eq.') ? row.status === status.slice(3) : status.slice(4, -1).split(',').includes(row.status)))
        && (!q.has('resp_code') || q.get('resp_code') === (row.resp_code === null ? 'is.null' : `eq.${row.resp_code}`));
      if (!matches) return Response.json([]);
      if (method === 'GET') {
        if (q.get('or')?.includes('resp_code.not.in') && isReversedPayment(row.resp_code)) return Response.json([]);
        return Response.json([row]);
      }
      if (q.get('and')?.includes('resp_code.not.in') && isReversedPayment(row.resp_code)) return Response.json([]);
      Object.assign(row, body);
      return Response.json([row]);
    }
    if (url.href === 'https://sandbox-pgw.2c2p.com/payment/4.3/paymentInquiry') {
      assert.equal(verifyHS256<{ invoiceNo: string }>(body.payload, SECRET).invoiceNo, row.invoice_no);
      plan.beforeInquiryReturn?.();
      return Response.json(plan.signed ? { payload: signHS256(plan.result, SECRET) } : plan.result, { status: plan.httpStatus });
    }
    if (url.hostname === 'api.stripe.com' && url.pathname === `/v1/checkout/sessions/${row.payment_token}`) {
      return Response.json({
        id: row.payment_token, status: 'complete', payment_status: plan.result.respCode === '2001' ? 'unpaid' : 'paid',
        amount_total: Math.round((plan.result.amount ?? 0) * 100), currency: plan.result.currencyCode?.toLowerCase(),
        metadata: { invoice_no: row.invoice_no },
        payment_intent: { id: 'pi_synthetic', latest_charge: {
          id: 'ch_synthetic', refunded: plan.result.respCode === '4120',
          amount_refunded: plan.result.respCode === '4120' ? 300000 : 0, currency: 'thb',
          payment_method_details: { type: 'card', card: { brand: 'visa' } },
        } },
      }, { status: plan.httpStatus });
    }
    if (url.href === 'https://api.resend.com/emails') return Response.json({ id: 'fake-email' });
    throw new Error(`Unexpected external request: ${method} ${url.origin}${url.pathname}`);
  });
  return { row, plan, requests, inquiries: () => requests.filter(r => r.url.pathname.endsWith('/paymentInquiry')), emails: () => requests.filter(r => r.url.hostname === 'api.resend.com') };
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

for (const [code, label] of [['4047', 'Voided'], ['4120', 'Refunded']]) {
  it(`a portal ${label.toLowerCase()} payment updates an already delivered booking without resending it`, async t => {
    const h = setup(t);
    h.plan.result.respCode = code;
    const after = await confirmPayment(h.row.invoice_no, 'webhook');
    assert.equal(after?.resp_code, code);
    assert.equal(after?.status, 'delivered');
    assert.equal(after?.paid_amount, 3000); // Original history; not an invented refund amount.
    assert.equal(after?.tran_ref, 'original-reference');
    const desk = after as unknown as DeskBooking;
    assert.equal(isPaid(desk), false);
    assert.equal(paymentBadge(desk).label, label);
    assert.equal(needsAction(desk), true);
    assert.equal(inView(desk, 'unfinished'), false);
    assert.doesNotMatch(siteMinderText(desk), /paid .* online|to pay at the hotel/);
    await confirmPayment(h.row.invoice_no, 'webhook');
    await deliver(h.row);
    assert.equal(h.inquiries().length, 1);
    assert.equal(h.emails().length, 0);
  });

  it(`the guest status endpoint reports ${label.toLowerCase()} with no assumed remaining balance`, async t => {
    const h = setup(t);
    h.plan.result.respCode = code;
    const { state, res } = response();
    await bookingStatus(request({ method: 'GET', query: { ref: h.row.ref, key: KEY } }), res);
    assert.equal(state.code, 200);
    assert.equal(state.body.status, label.toLowerCase());
    assert.equal(state.body.balance, null);
    assert.equal(state.body.guest_email, undefined);
    assert.equal(h.emails().length, 0);
  });
}

for (const code of ['0000', '4110']) {
  it(`${code} completes a pending booking and repeat inquiries do not resend confirmation`, async t => {
    const h = setup(t, { status: 'pending', resp_code: null, paid_amount: null, paid_at: null, delivered_at: null, delivery_attempts: 0 });
    h.plan.result.respCode = code;
    const after = await confirmPayment(h.row.invoice_no, 'webhook');
    assert.equal(after?.status, 'delivered');
    assert.equal(after?.resp_code, code);
    await confirmPayment(h.row.invoice_no, 'webhook');
    assert.equal(h.emails().length, 1);
    assert.equal(isPaid(after as unknown as DeskBooking), true);
    if (code === '4110') assert.equal(paymentBadge(after as unknown as DeskBooking).label, 'Settled');
  });
}

it('a refund received before any successful callback is retained without a confirmation', async t => {
  const h = setup(t, { status: 'pending', resp_code: null, paid_amount: null, paid_at: null });
  await confirmPayment(h.row.invoice_no, 'cron');
  assert.equal(h.row.status, 'paid');
  assert.equal(h.row.resp_code, '4120');
  assert.equal(isPaid(h.row as unknown as DeskBooking), false);
  assert.equal(h.emails().length, 0);
});

it('a stale successful inquiry cannot overwrite a concurrent portal refund', async t => {
  const h = setup(t, { status: 'paid' });
  h.plan.result.respCode = '0000';
  h.plan.beforeInquiryReturn = () => { h.row.resp_code = '4120'; };
  const after = await confirmPayment(h.row.invoice_no, 'webhook');
  assert.equal(after?.resp_code, '4120');
  assert.equal(h.emails().length, 0);
});

it('a delayed Approved response does not regress a Settled payment', async t => {
  const h = setup(t, { resp_code: '4110' });
  h.plan.result.respCode = '0000';
  assert.equal((await confirmPayment(h.row.invoice_no, 'webhook'))?.resp_code, '4110');
});

for (const code of ['0999', '4121', '4122', '4048']) {
  it(`${code} does not turn a paid booking into a refund or void`, async t => {
    const h = setup(t);
    h.plan.result.respCode = code;
    await confirmPayment(h.row.invoice_no, 'cron');
    assert.equal(h.row.resp_code, '0000');
    assert.equal(h.emails().length, 0);
  });
}

it('an inquiry decline is returned to the guest on the same status request', async t => {
  const h = setup(t, { status: 'pending', resp_code: null });
  h.plan.result.respCode = '4005';
  const { state, res } = response();
  await bookingStatus(request({ method: 'GET', query: { ref: h.row.ref, key: KEY } }), res);
  assert.equal(state.body.status, 'failed');
});

for (const scenario of ['unsigned', 'wrong-signature', 'wrong-invoice', 'wrong-merchant', 'wrong-currency', 'http-error']) {
  it(`rejects ${scenario} inquiry results before changing payment history`, async t => {
    const h = setup(t);
    if (scenario === 'unsigned') h.plan.signed = false;
    if (scenario === 'wrong-signature') process.env.TWOC2P_SECRET_KEY = 'different-fake-secret';
    if (scenario === 'wrong-invoice') h.plan.result.invoiceNo = 'WEBHH999999';
    if (scenario === 'wrong-merchant') h.plan.result.merchantID = 'OTHER';
    if (scenario === 'wrong-currency') h.plan.result.currencyCode = 'USD';
    if (scenario === 'http-error') h.plan.httpStatus = 503;
    await assert.rejects(confirmPayment(h.row.invoice_no, 'webhook'));
    assert.equal(h.row.resp_code, '0000');
    assert.equal(h.emails().length, 0);
  });
}

it('unsigned gateway errors remain errors rather than financial outcomes', async t => {
  const h = setup(t);
  h.plan.signed = false;
  h.plan.result = { respCode: '9007', respDesc: 'Invalid merchant' };
  assert.equal((await paymentInquiry(h.row.invoice_no)).respCode, '9007');
});

it('a signed webhook triggers inquiry, ignoring a conflicting notification status', async t => {
  const h = setup(t);
  const { state, res } = response();
  await backend(request({ body: { payload: signHS256({ invoiceNo: h.row.invoice_no, respCode: '0000' }, SECRET) } }), res);
  assert.equal(state.code, 200);
  assert.equal(h.row.resp_code, '4120');
});

it('an invalid webhook cannot trigger an inquiry or write', async t => {
  const h = setup(t);
  const { state, res } = response();
  await backend(request({ body: { payload: signHS256({ invoiceNo: h.row.invoice_no }, 'wrong-secret') } }), res);
  assert.equal(state.code, 400);
  assert.equal(h.requests.length, 0);
});

it('an admin can refresh portal status using a verified caller JWT', async t => {
  const h = setup(t);
  const { state, res } = response();
  await refreshPayment(request({ headers: { authorization: 'Bearer fake-user-jwt' }, body: { ref: h.row.ref } }), res);
  assert.equal(state.code, 200);
  assert.equal(h.row.resp_code, '4120');
  const permission = h.requests[0];
  assert.equal(permission.url.pathname, '/rest/v1/rpc/is_admin');
  assert.equal(permission.headers.get('apikey'), 'fake-public-key');
  assert.equal(permission.headers.get('authorization'), 'Bearer fake-user-jwt');
  assert.deepEqual(state.body, { ok: true });
});

for (const permission of ['missing', 'nonadmin', 'expired']) {
  it(`denies ${permission} admin credentials before any booking lookup or inquiry`, async t => {
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

it('nightly reconciliation checks delivered bookings and discovers portal refunds without a callback', async t => {
  const h = setup(t);
  const { state, res } = response();
  await reconcile(request({ method: 'GET', headers: { authorization: 'Bearer fake-cron-secret' } }), res);
  assert.equal(state.code, 200);
  assert.equal(state.body.reversed, 1);
  assert.equal(h.row.resp_code, '4120');
  assert.equal(h.emails().length, 0);
  const sweep = h.requests.find(r => r.url.searchParams.get('status') === 'in.(paid,delivered)');
  assert.equal(sweep?.url.searchParams.get('order'), 'last_inquiry_at.asc.nullsfirst,created_at.asc');
});

it('a checkout cancellation is distinct from a portal void', () => {
  assert.equal(paymentStatus('0003'), null);
  assert.equal(paymentStatus('4047'), 'voided');
});

it('new bookings require matching Stripe keys regardless of an obsolete provider setting', t => {
  setup(t);
  process.env.PAYMENT_PROVIDER = '2c2p';
  assert.equal(paymentProvider(), 'stripe');
  // Configured legacy credentials cannot make a new checkout available.
  assert.equal(isPaymentConfigured(), false);
  process.env.STRIPE_SECRET_KEY = 'rk_test_synthetic';
  assert.equal(isPaymentConfigured(), false);
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_live_synthetic';
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

it('confirms Stripe payments without adding a test-site flag, retaining the actual test-payment warning', async t => {
  const h = setup(t, { status: 'pending', payment_token: 'cs_test_synthetic', resp_code: null, paid_at: null });
  process.env.STRIPE_SECRET_KEY = 'rk_test_synthetic';
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_synthetic';
  process.env.PREVIEW_SITE = 'true';
  process.env.VERCEL_ENV = 'preview';
  h.plan.result.respCode = '0000';
  await confirmPayment(h.row.invoice_no, 'webhook');
  assert.equal(h.row.status, 'delivered');
  assert.deepEqual(h.row.flags, ['test_payment']);
  assert.equal(h.row.tran_ref, 'pi_synthetic');
  assert.equal(h.inquiries().length, 0);
  assert.equal(h.emails().length, 1);
  const variables = notificationVariables(h.row);
  assert.match(variables.PAID_AMOUNT, /0.*TEST payment/);
  assert.match(variables.BALANCE, /6,000/);
  assert.doesNotMatch(variables.FLAGS_HTML ?? '', /TEST SITE|2C2P/);
});

it('trimmed booking emails ignore old site flags and omit internal payment references', async t => {
  const h = setup(t, { flags: ['preview_site'], status: 'paid' });
  const team = notificationVariables(h.row);
  const guest = confirmationVariables(h.row, null, null);
  assert.equal(team.FLAGS_HTML, undefined);
  for (const key of ['INVOICE_NO', 'TRAN_REF', 'APPROVAL_CODE']) assert.equal(key in team, false);
  assert.equal('PAYMENT_REF' in guest, false);
  assert.doesNotMatch(team.KEY_BLOCK, /original-reference|WEBHH123ABC|2C2P/);
  await deliver(h.row);
  assert.equal(h.emails().length, 1);
  assert.doesNotMatch(String(h.emails()[0].body.subject), /CHECK|TEST SITE/);
});
