import { signHS256, verifyHS256 } from './jwt.ts';

// 2C2P's Payment Gateway API (https://developer.2c2p.com): every request and
// response body is { payload: <JWT signed with the merchant secret> }.
//   paymentToken   → starts a payment; returns the webPaymentUrl of
//                    2C2P's own payment page, where the guest is sent
//   paymentInquiry → the authoritative answer to "was invoice X paid?"
// TWOC2P_ENV picks sandbox or production; TWOC2P_API_VERSION must match what
// 2C2P enabled on the merchant account (4.3 unless they say otherwise).

const HOSTS = { sandbox: 'https://sandbox-pgw.2c2p.com', production: 'https://pgw.2c2p.com' } as const;

/** respCode for a completed, successful payment. Everything else is "not paid (yet)". */
export const PAID = '0000';

export class TwoC2PError extends Error {
  constructor(readonly respCode: string, message: string) { super(message); }
}

export interface InquiryResult {
  respCode: string;
  respDesc?: string;
  invoiceNo?: string;
  amount?: number;
  currencyCode?: string;
  tranRef?: string;
  referenceNo?: string;
  approvalCode?: string;
  channelCode?: string;
  transactionDateTime?: string;
}

function config() {
  const merchantID = process.env.TWOC2P_MERCHANT_ID;
  const secret = process.env.TWOC2P_SECRET_KEY;
  if (!merchantID || !secret) throw new TwoC2PError('CONFIG', '2C2P is not configured on the server');
  const host = process.env.TWOC2P_ENV === 'production' ? HOSTS.production : HOSTS.sandbox;
  return { merchantID, secret, base: `${host}/payment/${process.env.TWOC2P_API_VERSION || '4.3'}` };
}

export const isConfigured = () => Boolean(process.env.TWOC2P_MERCHANT_ID && process.env.TWOC2P_SECRET_KEY);

/** True while payments run on 2C2P's sandbox: no real money moves, so every
 * order is marked as a test payment. */
export const isTestMode = () => process.env.TWOC2P_ENV !== 'production';

async function call<T extends { respCode?: string }>(endpoint: string, payload: Record<string, unknown>): Promise<T> {
  const { secret, base } = config();
  const response = await fetch(`${base}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/*+json', Accept: 'text/plain' },
    body: JSON.stringify({ payload: signHS256(payload, secret) }),
  });
  const text = await response.text();
  let body: { payload?: string; respCode?: string; respDesc?: string };
  try { body = JSON.parse(text); } catch { throw new TwoC2PError(String(response.status), `2C2P ${endpoint} returned ${response.status}`); }
  // Errors come back unsigned ({ respCode, respDesc }); answers come signed.
  return (body.payload ? verifyHS256<T>(body.payload, secret) : body) as T;
}

export interface PaymentTokenRequest {
  invoiceNo: string;
  description: string;
  amount: number;
  currencyCode: string;
  paymentExpiry: Date;
  frontendReturnUrl: string;
  backendReturnUrl: string;
  ref: string;
  guest: { name: string; email: string; country: string };
}

export async function createPaymentToken(request: PaymentTokenRequest): Promise<{ webPaymentUrl: string; paymentToken: string }> {
  const { merchantID } = config();
  const result = await call<{ respCode?: string; respDesc?: string; webPaymentUrl?: string; paymentToken?: string }>('paymentToken', {
    merchantID,
    invoiceNo: request.invoiceNo,
    description: request.description.slice(0, 250),
    amount: request.amount,
    currencyCode: request.currencyCode,
    request3DS: 'Y',
    locale: 'en',
    paymentExpiry: expiryTimestamp(request.paymentExpiry),
    frontendReturnUrl: request.frontendReturnUrl,
    backendReturnUrl: request.backendReturnUrl,
    userDefined1: request.ref,
    idempotencyID: request.invoiceNo,
    uiParams: { userInfo: { name: request.guest.name.slice(0, 50), email: request.guest.email, countryCode: request.guest.country } },
  });
  if (result.respCode !== PAID || !result.webPaymentUrl || !result.paymentToken) {
    throw new TwoC2PError(result.respCode ?? 'UNKNOWN', `2C2P refused the payment token: ${result.respCode} ${result.respDesc ?? ''}`.trim());
  }
  return { webPaymentUrl: result.webPaymentUrl, paymentToken: result.paymentToken };
}

export function paymentInquiry(invoiceNo: string): Promise<InquiryResult> {
  return call<InquiryResult>('paymentInquiry', { merchantID: config().merchantID, invoiceNo, locale: 'en' });
}

/** The server-to-server notification 2C2P posts to backendReturnUrl. Throws unless it carries our signature. */
export function verifyNotification(body: unknown): InquiryResult {
  const payload = (body as { payload?: unknown } | null)?.payload;
  if (typeof payload !== 'string') throw new Error('Notification has no payload');
  return verifyHS256<InquiryResult>(payload, config().secret);
}

/** The browser's form post to frontendReturnUrl: base64 JSON, unsigned — only ever used to pick where to send the guest. */
export function decodeFrontendResponse(value: unknown): { invoiceNo?: string; respCode?: string } {
  if (typeof value !== 'string') return {};
  try { return JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as { invoiceNo?: string; respCode?: string }; } catch { return {}; }
}

// paymentExpiry is "yyyy-MM-dd HH:mm:ss" in 2C2P's own time zone — Singapore
// (UTC+8), not Bangkok: a Bangkok clock time reads to 2C2P as an hour earlier,
// so a 15-minute hold is refused as already expired (9008).
export function expiryTimestamp(date: Date): string {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}
