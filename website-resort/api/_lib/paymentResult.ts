/** Stripe's payment result in the booking database's existing status format. */
export interface PaymentInquiry {
  respCode: string;
  respDesc?: string;
  invoiceNo?: string;
  amount?: number;
  currencyCode?: string;
  tranRef?: string;
  referenceNo?: string;
  approvalCode?: string;
  channelCode?: string;
}
