import type { PaymentProvider } from '../../shared/bookingContract.js';
import type { BookingRow } from './bookings.js';
import type { PaymentInquiry } from './paymentResult.js';
import { isStripeConfigured, isStripeTestMode, stripeInquiry, stripePublishableKey } from './stripe.js';

// Stripe is the website's only payment integration.

export const paymentProvider = (): PaymentProvider => 'stripe';
/** Stripe needs both keys: the secret one here, the publishable one for its form in the browser. */
export const isPaymentConfigured = () => isStripeConfigured() && stripePublishableKey().startsWith(isStripeTestMode() ? 'pk_test_' : 'pk_live_');
/** No real money moves for new bookings using Stripe test keys. */
export const isTestMode = () => isStripeTestMode();

type WithToken = Pick<BookingRow, 'payment_token'> | null;
export const stripeCheckoutPrefix = () => isStripeTestMode() ? 'cs_test_' : 'cs_live_';
export const isStripeBooking = (row: WithToken) => /^cs_(live|test)_/.test(row?.payment_token ?? '');
export const canInquire = (row: WithToken) => isStripeBooking(row) && !!row?.payment_token?.startsWith(stripeCheckoutPrefix());
export const isTestPayment = (row: WithToken) => !!row?.payment_token?.startsWith('cs_test_');

export class PaymentLookupUnavailableError extends Error {
  constructor() { super('This booking has no checkout in the current Stripe mode. Its saved payment details are unchanged.'); }
}

/** The provider's own answer to "was this booking paid?". */
export function inquire(invoiceNo: string, row: BookingRow | null): Promise<PaymentInquiry> {
  const sessionId = row?.payment_token;
  if (!sessionId || !canInquire(row)) throw new PaymentLookupUnavailableError();
  return stripeInquiry(sessionId, invoiceNo);
}
