import type { PaymentProvider } from '../../shared/bookingContract.js';
import type { BookingRow } from './bookings.js';
import { isStripeConfigured, isStripeTestMode, stripeInquiry, stripePublishableKey } from './stripe.js';
import { type InquiryResult, isTestMode as isTwoC2PTestMode, paymentInquiry } from './twoc2p.js';

// New website bookings always use Stripe. Keep inquiries for existing 2C2P
// bookings working: they share the database and can still be refunded or settled.

export const paymentProvider = (): PaymentProvider => 'stripe';
/** Stripe needs both keys: the secret one here, the publishable one for its form in the browser. */
export const isPaymentConfigured = () => isStripeConfigured() && stripePublishableKey().startsWith(isStripeTestMode() ? 'pk_test_' : 'pk_live_');
/** No real money moves for new bookings using Stripe test keys. */
export const isTestMode = () => isStripeTestMode();

type WithToken = Pick<BookingRow, 'payment_token'> | null;
export const isStripeBooking = (row: WithToken) => !!row?.payment_token?.startsWith('cs_');
export const providerLabel = (row: WithToken) => (isStripeBooking(row) ? 'Stripe' : '2C2P');
/** Whether this booking's payment is a test one, judged by the provider it went through. */
export const isTestPayment = (row: WithToken) => (isStripeBooking(row) ? isStripeTestMode() : isTwoC2PTestMode());

/** The provider's own answer to "was this booking paid?". */
export function inquire(invoiceNo: string, row: BookingRow | null): Promise<InquiryResult> {
  return row && isStripeBooking(row) ? stripeInquiry(row.payment_token!, invoiceNo) : paymentInquiry(invoiceNo);
}
