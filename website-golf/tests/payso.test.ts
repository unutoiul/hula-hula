// Payso's side of event payments: what we send it, how its answers are read,
// and that its unsigned postback can never mark an order paid by itself.
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { invoiceNoFor, PAYMENT_REF_PATTERN } from '../api/_lib/ids.ts';
import { createPayment, isConfigured, isTestMode, PAID, paymentInquiry, PaysoError } from '../api/_lib/payso.ts';
import postback from '../api/payment/payso-postback.ts';

const REF = invoiceNoFor('HE7K3M9Q');
const realFetch = globalThis.fetch;
const ENV = { PAYSO_API_KEY: 'the-api-key', PAYSO_SECRET_KEY: 'the-secret', PAYSO_MERCHANT_ID: '12345678', PAYSO_TERMINAL_ID: 'TID00001', SUPABASE_URL: 'https://db.test', SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_x' };
let sent: { url: string; init?: RequestInit }[];

const answerWith = (body: string, status = 200) => {
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    sent.push({ url: String(url), init });
    return new Response(body, { status });
  }) as typeof fetch;
};
const paidRow = (overrides = {}) => ({ ReferenceNo: REF, OrderNo: '1', MerchantID: '12345678', Total: 3000.0, CardType: 'V', Status: 'CP', StatusName: 'COMPLETE', ...overrides });

beforeEach(() => {
  sent = [];
  Object.assign(process.env, ENV);
  delete process.env.PAYSO_DEMO;
  delete process.env.RESEND_API_KEY;
});
afterEach(() => { globalThis.fetch = realFetch; });

describe('payment reference', () => {
  it('fits Payso: 12 digits, no leading zero, the same for the same order', () => {
    for (const ref of ['HE000000', 'HEZZZZZZ', 'HE7K3M9Q', 'HE1A2B3C']) assert.match(invoiceNoFor(ref), PAYMENT_REF_PATTERN);
    assert.equal(invoiceNoFor('HE7K3M9Q'), REF);
    assert.notEqual(invoiceNoFor('HE7K3M9R'), REF);
  });
});

describe('settings', () => {
  it('needs all four values before payments switch on', () => {
    assert.ok(isConfigured());
    delete process.env.PAYSO_TERMINAL_ID;
    assert.ok(!isConfigured());
  });
  it('treats every payment as real money unless this is a demo account', () => {
    assert.equal(isTestMode(), false);
    process.env.PAYSO_DEMO = 'true';
    assert.equal(isTestMode(), true);
  });
});

describe('createPayment', () => {
  const request = { referenceNo: REF, description: 'Pro <Day> & "dinner"', amount: 3000, email: 'bo@example.com', returnUrl: 'https://site/return', postbackUrl: 'https://site/postback?refno=1' };
  const ok = JSON.stringify({ status: { statusCode: '2A002', message: 'request successful.' }, transactionId: 'T1', redirectUrl: 'https://apis.paysolutions.asia/landing/view/redirect/T1' });

  it('sends what Payso asks for and returns its payment page', async () => {
    answerWith(ok);
    assert.deepEqual(await createPayment(request), { redirectUrl: 'https://apis.paysolutions.asia/landing/view/redirect/T1', transactionId: 'T1' });
    const [{ url, init }] = sent;
    assert.equal(url, 'https://apis.paysolutions.asia/payment/gateway/v2/ui-payments');
    const headers = new Headers(init!.headers);
    assert.equal(headers.get('apiKey'), 'the-api-key');
    assert.equal(headers.get('secretKey'), 'the-secret');
    assert.deepEqual(JSON.parse(String(init!.body)), {
      merchantId: '12345678', terminalId: 'TID00001', keyVersion: 1, customerEmail: 'bo@example.com', referenceNo: REF, description: 'Pro Day dinner',
      amount: 3000, paymentChannel: 'ALL', paymentGateway: '', installmentTerm: '', currencyCode: '00', lang: 'EN', returnUrl: 'https://site/return', postbackUrl: 'https://site/postback?refno=1',
    });
  });

  it('accepts either of Payso’s success codes', async () => {
    answerWith(ok.replace('2A002', '2A001'));
    assert.equal((await createPayment(request)).transactionId, 'T1');
  });

  it('keeps the description within Payso’s 100 characters', async () => {
    answerWith(ok);
    await createPayment({ ...request, description: 'x'.repeat(300) });
    assert.equal(JSON.parse(String(sent[0].init!.body)).description.length, 100);
  });

  it('reports Payso’s own refusal code', async () => {
    answerWith(JSON.stringify({ status: { statusCode: '4A003', message: 'invalid secretKey.' } }), 400);
    await assert.rejects(createPayment(request), (error: PaysoError) => error.code === '4A003');
  });

  it('fails cleanly when the answer isn’t JSON', async () => {
    answerWith('<html>Bad gateway</html>', 502);
    await assert.rejects(createPayment(request), (error: PaysoError) => error.code === '502');
  });
});

describe('paymentInquiry', () => {
  it('reads a completed payment, sending only the last 5 merchant digits', async () => {
    answerWith(JSON.stringify(paidRow()));
    assert.deepEqual(await paymentInquiry(REF), { status: PAID, statusName: 'COMPLETE', referenceNo: REF, amount: 3000, cardType: 'V' });
    const [{ url, init }] = sent;
    assert.equal(url, 'https://apis.paysolutions.asia/order/orderdetailpost');
    assert.equal(new Headers(init!.headers).get('merchantID'), '45678');
    assert.deepEqual(JSON.parse(String(init!.body)), { merchantID: '45678', orderNo: 'X', refno: REF, productDetail: 'QWERTY' });
  });

  it('also reads an answer wrapped in a list', async () => {
    answerWith(JSON.stringify([paidRow({ ReferenceNo: 'other', Status: 'XX' }), paidRow()]));
    assert.equal((await paymentInquiry(REF)).status, PAID);
  });

  it('counts an empty answer or a 404 as "not paid"', async () => {
    answerWith('');
    assert.deepEqual(await paymentInquiry(REF), {});
    answerWith('{"status":{"statusCode":"4A008"}}', 404);
    assert.deepEqual(await paymentInquiry(REF), {});
  });

  it('ignores an answer about a different payment', async () => {
    answerWith(JSON.stringify(paidRow({ ReferenceNo: '999999999999' })));
    assert.deepEqual(await paymentInquiry(REF), {});
  });

  it('throws on server and credential errors, so nothing is decided on them', async () => {
    answerWith('oops', 500);
    await assert.rejects(paymentInquiry(REF), PaysoError);
    answerWith('{"message":"Invalid authentication credentials"}', 401);
    await assert.rejects(paymentInquiry(REF), PaysoError);
  });
});

describe('postback', () => {
  const pendingOrder = { id: 'o1', ref: 'HE7K3M9Q', invoice_no: REF, status: 'pending', flags: [], total: 3000, expires_at: new Date(Date.now() + 600_000).toISOString(), resp_code: null, emailed_at: null };
  let patches: Record<string, unknown>[];

  // Supabase holds one pending order; Payso answers the inquiry with `inquiry`.
  const world = (inquiry: string) => {
    patches = [];
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      sent.push({ url: String(url), init });
      if (String(url).includes('orderdetailpost')) return new Response(inquiry);
      if (init?.method === 'PATCH') {
        const patch = JSON.parse(String(init.body)) as Record<string, unknown>;
        patches.push(patch);
        return Response.json([{ ...pendingOrder, ...patch }]);
      }
      return Response.json([pendingOrder]);
    }) as typeof fetch;
  };
  const deliver = async (request: Partial<VercelRequest>) => {
    const result = { status: 0 };
    const res = { setHeader() { return res; }, status(code: number) { result.status = code; return res; }, json() { return res; }, end() { return res; } };
    await postback({ method: 'GET', query: {}, headers: {}, ...request } as VercelRequest, res as unknown as VercelResponse);
    return result.status;
  };

  it('marks the order paid once Payso’s inquiry confirms it', async () => {
    world(JSON.stringify(paidRow()));
    assert.equal(await deliver({ query: { refno: REF } }), 200);
    assert.equal(patches.length, 1);
    assert.equal(patches[0].status, 'paid');
    assert.equal(patches[0].tran_ref, REF);
    assert.equal(patches[0].test_payment, false);
    assert.deepEqual(patches[0].flags, []);
  });

  it('accepts the control panel’s form POST too', async () => {
    world(JSON.stringify(paidRow()));
    assert.equal(await deliver({ method: 'POST', body: { refno: REF, total: '3000' } }), 200);
    assert.equal(patches[0].status, 'paid');
  });

  it('changes nothing on a forged postback for an unpaid order', async () => {
    world('');
    assert.equal(await deliver({ query: { refno: REF, total: '3000' } }), 200);
    assert.deepEqual(patches, []);
  });

  it('flags a payment for the wrong amount', async () => {
    world(JSON.stringify(paidRow({ Total: 1 })));
    await deliver({ query: { refno: REF } });
    assert.deepEqual(patches[0].flags, ['amount_mismatch']);
  });

  it('turns away anything that isn’t one of our references, without touching the database', async () => {
    world('');
    for (const refno of ['', 'GEVHE7K3M9Q', '012345678901', `${REF}&status=eq.paid`]) assert.equal(await deliver({ query: { refno } }), 400);
    assert.deepEqual(sent, []);
  });

  it('asks Payso to retry when the inquiry can’t be made', async () => {
    globalThis.fetch = (async (url: string) => (String(url).includes('orderdetailpost') ? new Response('oops', { status: 500 }) : Response.json([pendingOrder]))) as typeof fetch;
    const error = console.error;
    console.error = () => {};
    try { assert.equal(await deliver({ query: { refno: REF } }), 500); } finally { console.error = error; }
  });
});
