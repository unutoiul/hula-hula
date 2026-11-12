import type { PaymentProvider } from '../../shared/bookingContract.js';
import type { BookingRow } from './bookings.js';
import { isStripeConfigured, isStripeTestMode, stripeInquiry } from './stripe.js';
import { type InquiryResult, isConfigured as isTwoC2PConfigured, isTestMode as isTwoC2PTestMode, paymentInquiry } from './twoc2p.js';

// Which payment provider takes new website bookings: 2C2P (the default) or
// Stripe Checkout (PAYMENT_PROVIDER=stripe). A booking keeps the provider it
// started with, because its payment_token is either a Stripe Checkout session
// ("cs_…") or a 2C2P payment token, so every later check asks the right one.

export const paymentProvider = (): PaymentProvider => (process.env.PAYMENT_PROVIDER === 'stripe' ? 'stripe' : '2c2p');
export const isPaymentConfigured = () => (paymentProvider() === 'stripe' ? isStripeConfigured() : isTwoC2PConfigured());
/** No real money moves for new bookings: 2C2P's sandbox, or Stripe test keys. */
export const isTestMode = () => (paymentProvider() === 'stripe' ? isStripeTestMode() : isTwoC2PTestMode());

type WithToken = Pick<BookingRow, 'payment_token'> | null;
export const isStripeBooking = (row: WithToken) => !!row?.payment_token?.startsWith('cs_');
export const providerLabel = (row: WithToken) => (isStripeBooking(row) ? 'Stripe' : '2C2P');
/** Whether this booking's payment is a test one, judged by the provider it went through. */
export const isTestPayment = (row: WithToken) => (isStripeBooking(row) ? isStripeTestMode() : isTwoC2PTestMode());

/** The provider's own answer to "was this booking paid?". */
export function inquire(invoiceNo: string, row: BookingRow | null): Promise<InquiryResult> {
  return row && isStripeBooking(row) ? stripeInquiry(row.payment_token!, invoiceNo) : paymentInquiry(invoiceNo);
}
