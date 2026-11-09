// Payso / Pay Solutions (https://api-docs.payso.co). There is only the live
// system, no sandbox: on a real merchant account every payment is real money.
//   createPayment  → starts a payment; returns the redirectUrl of Payso's own
//                    payment page, where the guest is sent
//   paymentInquiry → the authoritative answer to "was this reference paid?".
//                    Payso's postback isn't signed, so nothing else counts as
//                    proof of payment.
// The merchant and terminal IDs are in Payso's control panel, under Merchant
// Settings > Merchant Details and > TID.

const BASE = 'https://apis.paysolutions.asia';

/** The inquiry API's Status for a completed, successful payment. */
export const PAID = 'CP';

export class PaysoError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.code = code; }
}

const REQUIRED = ['PAYSO_API_KEY', 'PAYSO_SECRET_KEY', 'PAYSO_MERCHANT_ID', 'PAYSO_TERMINAL_ID'];

function config() {
  if (!isConfigured()) throw new PaysoError('CONFIG', 'Payso is not configured on the server');
  return { apiKey: process.env.PAYSO_API_KEY!, secretKey: process.env.PAYSO_SECRET_KEY!, merchantId: process.env.PAYSO_MERCHANT_ID!, terminalId: process.env.PAYSO_TERMINAL_ID! };
}

export const isConfigured = () => REQUIRED.every((name) => process.env[name]);

/** True only for a Payso Demo account (PAYSO_DEMO=true), where no real money
 * moves. Off by default so that a guest is never told a real charge was a test. */
export const isTestMode = () => process.env.PAYSO_DEMO === 'true';

/** Payso takes 50 characters at most; our own confirmation still goes to the guest's real address. */
export const customerEmailFor = (guestEmail: string, clubEmail: string) => (guestEmail.length <= 50 ? guestEmail : clubEmail);

export interface PaymentRequest {
  referenceNo: string;
  description: string;
  amount: number;
  email: string;
  returnUrl: string;
  postbackUrl: string;
}

// Payso refuses HTML special characters here, and anything over 100 characters.
const plainDescription = (text: string) => text.replace(/[<>&"'\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);

export async function createPayment(request: PaymentRequest): Promise<{ redirectUrl: string; transactionId: string }> {
  const { apiKey, secretKey, merchantId, terminalId } = config();
  const response = await fetch(`${BASE}/payment/gateway/v2/ui-payments`, {
    method: 'POST',
    headers: { apiKey, secretKey, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      merchantId, terminalId, keyVersion: 1,
      customerEmail: request.email,
      referenceNo: request.referenceNo,
      description: plainDescription(request.description),
      amount: Math.round(request.amount * 100) / 100,
      paymentChannel: 'ALL', paymentGateway: '', installmentTerm: '',
      currencyCode: '00', // Thai baht
      lang: 'EN',
      returnUrl: request.returnUrl,
      postbackUrl: request.postbackUrl,
    }),
  });
  const text = await response.text();
  let body: { status?: { statusCode?: string; message?: string }; redirectUrl?: string; transactionId?: string };
  try { body = JSON.parse(text); } catch { throw new PaysoError(String(response.status), `Payso create payment returned ${response.status}`); }
  const code = body.status?.statusCode;
  // Success codes start with 2A: the docs say 2A002, the live API also answers 2A001.
  if (!code?.startsWith('2A') || !body.redirectUrl || !body.transactionId) {
    throw new PaysoError(code ?? String(response.status), `Payso refused the payment: ${code ?? response.status} ${body.status?.message ?? ''}`.trim());
  }
  return { redirectUrl: body.redirectUrl, transactionId: body.transactionId };
}

export interface InquiryResult {
  status?: string;
  statusName?: string;
  referenceNo?: string;
  amount?: number;
  cardType?: string;
}

/** What a confirmed payment writes on its event order or tee time, flagging anything staff should check. */
export function paidFields(row: { total: number; flags: string[]; status: string; expires_at: string | null }, inquiry: InquiryResult) {
  const flags = new Set(row.flags);
  // Paid after its hold ran out: the place may have gone to someone else meanwhile.
  if (row.status === 'expired' || (row.expires_at && Date.now() > Date.parse(row.expires_at))) flags.add('paid_after_expiry');
  if (typeof inquiry.amount === 'number' && Math.round(inquiry.amount * 100) !== row.total * 100) flags.add('amount_mismatch');
  return {
    paid_at: new Date().toISOString(), paid_amount: inquiry.amount ?? row.total, tran_ref: inquiry.referenceNo ?? null, channel_code: inquiry.cardType ?? null,
    resp_code: inquiry.status, resp_desc: inquiry.statusName ?? null, test_payment: isTestMode(), flags: [...flags],
  };
}

interface InquiryRow { ReferenceNo?: unknown; Status?: string; StatusName?: string; Total?: unknown; CardType?: string }

/** Empty when Payso has no completed payment for this reference: its inquiry
 * API answers with nothing at all until a payment succeeds. */
export async function paymentInquiry(referenceNo: string): Promise<InquiryResult> {
  const { apiKey, secretKey, merchantId } = config();
  const shortMerchantId = merchantId.slice(-5); // this API takes only the last 5 digits
  const response = await fetch(`${BASE}/order/orderdetailpost`, {
    method: 'POST',
    headers: { merchantID: shortMerchantId, merchantSecretKey: secretKey, apikey: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchantID: shortMerchantId, orderNo: 'X', refno: referenceNo, productDetail: 'QWERTY' }),
  });
  const text = await response.text();
  if (response.status === 404 || (response.ok && !text.trim())) return {};
  if (!response.ok) throw new PaysoError(String(response.status), `Payso inquiry returned ${response.status}`);

  let body: unknown;
  try { body = JSON.parse(text); } catch { throw new PaysoError(String(response.status), 'Payso inquiry returned something unreadable'); }
  const row = ([body].flat() as (InquiryRow | null)[]).find((candidate) => String(candidate?.ReferenceNo) === referenceNo);
  if (!row) return {};
  const amount = Number(row.Total);
  return { status: row.Status, statusName: row.StatusName, referenceNo, amount: Number.isFinite(amount) ? amount : undefined, cardType: row.CardType };
}
