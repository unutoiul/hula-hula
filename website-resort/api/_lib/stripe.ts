import type { InquiryResult } from './twoc2p.js';

// Stripe Checkout (https://docs.stripe.com/api/checkout/sessions), embedded:
// Stripe's payment form shows inside our own payment step (ui_mode
// "embedded_page"), and Stripe sends the guest to their confirmation when
// they've paid. Plain fetch with form-encoded bodies, like the rest of api/.
// Used for new bookings only when PAYMENT_PROVIDER=stripe (see payments.ts).
//
// Stripe's answers are translated into the reply codes the booking code
// already understands from 2C2P (shared/paymentStatus.ts): 0000 paid, 4120
// refunded, and 2001 "nothing final yet". So confirmPayment(), the guest's
// status page and the booking desk work the same for both providers.

const API = 'https://api.stripe.com/v1';

export const STRIPE_CODES = { paid: '0000', refunded: '4120', notFinal: '2001' } as const;

// A plain field rather than a constructor parameter property, so the unit
// tests can load this file with Node's own type stripping.
export class StripeError extends Error {
  readonly status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

const secretKey = () => process.env.STRIPE_SECRET_KEY ?? '';
/** A secret ("sk_") or restricted ("rk_") key is set. */
export const isStripeConfigured = () => /^(sk|rk)_(live|test)_/.test(secretKey());
/** Test keys: Stripe's test cards only, nothing is charged. */
export const isStripeTestMode = () => /^(sk|rk)_test_/.test(secretKey());
/** The public key the browser shows Stripe's form with (safe to hand out). */
export const stripePublishableKey = () => (/^pk_(live|test)_/.test(process.env.STRIPE_PUBLISHABLE_KEY ?? '') ? process.env.STRIPE_PUBLISHABLE_KEY! : '');

/** Stripe's form encoding: nested objects and arrays become key[sub][0]=value. */
export function formEncode(value: Record<string, unknown>, prefix = '', out = new URLSearchParams()): URLSearchParams {
  for (const [key, item] of Object.entries(value)) {
    if (item === undefined || item === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(item)) {
      item.forEach((entry, i) => {
        if (entry !== null && typeof entry === 'object') formEncode(entry as Record<string, unknown>, `${name}[${i}]`, out);
        else out.append(`${name}[${i}]`, String(entry));
      });
    } else if (typeof item === 'object') formEncode(item as Record<string, unknown>, name, out);
    else out.append(name, String(item));
  }
  return out;
}

async function call<T>(method: 'GET' | 'POST', path: string, body?: Record<string, unknown>, idempotencyKey?: string): Promise<T> {
  if (!isStripeConfigured()) throw new StripeError(500, 'Stripe is not configured on the server');
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      ...(body && { 'Content-Type': 'application/x-www-form-urlencoded' }),
      ...(idempotencyKey && { 'Idempotency-Key': idempotencyKey }),
    },
    body: body ? formEncode(body).toString() : undefined,
    signal: AbortSignal.timeout(15_000),
  });
  const data = await response.json().catch(() => ({})) as T & { error?: { message?: string } };
  if (!response.ok) throw new StripeError(response.status, `Stripe ${method} ${path.split('?')[0]} failed: ${response.status} ${data.error?.message ?? ''}`.trim());
  return data;
}

interface StripeCharge {
  id: string;
  amount_refunded: number;
  refunded: boolean;
  currency: string;
  payment_method_details?: { type?: string; card?: { brand?: string | null; wallet?: { type?: string } | null } | null } | null;
}

interface StripePaymentIntent { id: string; latest_charge?: StripeCharge | string | null }

export interface StripeCheckoutSession {
  id: string;
  /** What the browser mounts Stripe's embedded form with. */
  client_secret?: string | null;
  status: 'open' | 'complete' | 'expired' | null;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  amount_total: number | null;
  currency: string | null;
  metadata: Record<string, string> | null;
  payment_intent?: StripePaymentIntent | string | null;
}

export interface CheckoutRequest {
  invoiceNo: string;
  ref: string;
  description: string;
  /** In baht (two decimals); Stripe takes satang. */
  amount: number;
  currencyCode: string;
  /** Stripe needs at least 30 minutes and at most 24 hours from now. */
  expiresAt: Date;
  /** Where Stripe sends the guest once they've paid: their confirmation. */
  returnUrl: string;
  email: string;
}

/** Starts an embedded Stripe Checkout for exactly this amount; the session id and the browser's client secret come back. */
export async function createCheckoutSession(request: CheckoutRequest): Promise<{ id: string; clientSecret: string }> {
  const description = request.description.slice(0, 250);
  const metadata = { ref: request.ref, invoice_no: request.invoiceNo };
  const session = await call<StripeCheckoutSession>('POST', '/checkout/sessions', {
    mode: 'payment',
    ui_mode: 'embedded_page',
    line_items: [{ quantity: 1, price_data: { currency: request.currencyCode.toLowerCase(), unit_amount: Math.round(request.amount * 100), product_data: { name: description } } }],
    customer_email: request.email,
    client_reference_id: request.ref,
    metadata,
    payment_intent_data: { description, metadata },
    expires_at: Math.floor(request.expiresAt.getTime() / 1000),
    return_url: request.returnUrl,
    submit_type: 'book',
    locale: 'auto',
  }, `checkout-${request.invoiceNo}`);
  if (!session.client_secret) throw new StripeError(502, 'Stripe returned no payment form');
  return { id: session.id, clientSecret: session.client_secret };
}

const BRANDS: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', jcb: 'JCB', unionpay: 'UnionPay', diners: 'Diners Club', discover: 'Discover' };
const WALLETS: Record<string, string> = { apple_pay: 'Apple Pay', google_pay: 'Google Pay', samsung_pay: 'Samsung Pay' };

// Readable as it is wherever the payment channel shows: "Stripe · Visa",
// "Stripe · Apple Pay (Mastercard)", "Stripe · PromptPay".
function channelOf(charge: StripeCharge | null): string | undefined {
  const details = charge?.payment_method_details;
  if (!details?.type) return undefined;
  if (details.type === 'card') {
    const brand = details.card?.brand ? BRANDS[details.card.brand] ?? details.card.brand : 'Card';
    const wallet = details.card?.wallet?.type ? WALLETS[details.card.wallet.type] ?? details.card.wallet.type : null;
    return `Stripe · ${wallet ? `${wallet} (${brand})` : brand}`;
  }
  return `Stripe · ${details.type === 'promptpay' ? 'PromptPay' : details.type}`;
}

/** A Checkout session (with payment_intent.latest_charge expanded) as a 2C2P-style inquiry answer. */
export function inquiryFromSession(session: StripeCheckoutSession, invoiceNo: string): InquiryResult {
  if (session.metadata?.invoice_no !== invoiceNo) throw new StripeError(409, 'Stripe session does not belong to this booking');
  const intent = session.payment_intent && typeof session.payment_intent === 'object' ? session.payment_intent : null;
  const charge = intent?.latest_charge && typeof intent.latest_charge === 'object' ? intent.latest_charge : null;
  const base = {
    invoiceNo,
    amount: session.amount_total === null ? undefined : session.amount_total / 100,
    currencyCode: session.currency?.toUpperCase(),
    tranRef: intent?.id ?? (typeof session.payment_intent === 'string' ? session.payment_intent : undefined),
    referenceNo: charge?.id,
    channelCode: channelOf(charge),
  };
  if (session.payment_status === 'paid') {
    if (charge && charge.amount_refunded > 0) {
      return { ...base, respCode: STRIPE_CODES.refunded, respDesc: charge.refunded ? 'Refunded in Stripe' : `Partly refunded in Stripe (${charge.currency.toUpperCase()} ${charge.amount_refunded / 100})` };
    }
    return { ...base, respCode: STRIPE_CODES.paid, respDesc: 'Paid' };
  }
  // Stripe's page lets the guest retry a declined card there and then, so
  // there's no final "declined": only waiting, or a page that ran out.
  return { ...base, respCode: STRIPE_CODES.notFinal, respDesc: session.status === 'expired' ? 'The Stripe payment page expired unpaid' : 'Waiting for payment on Stripe' };
}

/** Stripe's own answer to "was this booking paid?", by its Checkout session. */
export async function stripeInquiry(sessionId: string, invoiceNo: string): Promise<InquiryResult> {
  const session = await call<StripeCheckoutSession>('GET', `/checkout/sessions/${encodeURIComponent(sessionId)}?expand%5B%5D=payment_intent.latest_charge`);
  return inquiryFromSession(session, invoiceNo);
}

export interface StripeEvent { id: string; type: string; data: { object: { metadata?: Record<string, string> | null } } }

/** Fetches an event back from Stripe with our own key, which proves it's real. */
export const retrieveEvent = (id: string) => call<StripeEvent>('GET', `/events/${encodeURIComponent(id)}`);
