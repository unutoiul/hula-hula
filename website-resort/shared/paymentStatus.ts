// PGW paymentInquiry response codes, shared by the server and booking desk.
// https://developer.2c2p.com/docs/response-code-payment
export type PaymentStatus = 'approved' | 'settled' | 'voided' | 'refunded';

export function paymentStatus(code: string | null | undefined): PaymentStatus | null {
  switch (code) {
    case '0000': return 'approved';
    case '4110': return 'settled';
    case '4047': return 'voided';
    case '4120': return 'refunded';
    default: return null;
  }
}

export const isSuccessfulPayment = (code: string | null | undefined) => code === '0000' || code === '4110';
export const isReversedPayment = (code: string | null | undefined) => code === '4047' || code === '4120';
