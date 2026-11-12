import { type BookingRow, getByInvoice, updateWhere } from './bookings.js';
import { CONFIRMATION_TEMPLATE, confirmationVariables, formatDay } from './bookingEmails.js';
import { bookingAdminBcc, bookingAdminTo, bookingFrom, deliverReservation } from './deliver.js';
import { isWebsiteInvoice } from './ids.js';
import { formatMoney, toSatang } from './money.js';
import { sendTemplate, sendText } from './resend.js';
import { getCatalog } from './siteminder.js';
import { inquire, isTestPayment, providerLabel } from './payments.js';
import { PAID } from './twoc2p.js';
import { isReversedPayment, isSuccessfulPayment } from '../../shared/paymentStatus.js';

// The single path for payment confirmation and subsequent portal changes.
// Called by the provider's notification, the guest's status page, staff and
// the cron; they may overlap, so every step is a conditional update that only
// one of them can win, and the emails carry idempotency keys. It always asks
// the provider itself (2C2P, or Stripe for a booking paid there): a
// notification or a browser redirect only says "go and look".

const DELIVERY_STALE_MS = 5 * 60_000;
export const MAX_DELIVERY_ATTEMPTS = 5;

export type ConfirmSource = 'webhook' | 'status' | 'cron' | 'admin';

// Optimistic concurrency: an older inquiry cannot overwrite a reversal that
// another request has already saved. Booking status tracks the hand-off;
// resp_code tracks the payment independently, using the existing schema.
const samePayment = (row: BookingRow) => `id=eq.${row.id}&resp_code=${row.resp_code === null ? 'is.null' : `eq.${encodeURIComponent(row.resp_code)}`}`;

export async function confirmPayment(invoiceNo: string, source: ConfirmSource): Promise<BookingRow | null> {
  const row = await getByInvoice(invoiceNo);
  if (row && isReversedPayment(row.resp_code) && source !== 'admin') return row;

  const inquiry = await inquire(invoiceNo, row);
  if (!row) {
    // Only invoices this site issued: the same merchant account also takes
    // QuickPay links and test payments made from the 2C2P portal, which never
    // had a booking here.
    if (isSuccessfulPayment(inquiry.respCode) && !isWebsiteInvoice(invoiceNo)) {
      console.info('Paid invoice from outside the website ignored', invoiceNo, source);
    } else if (isSuccessfulPayment(inquiry.respCode)) {
      console.error('Paid invoice with no booking on file', invoiceNo, source);
      await alertTeam(`Payment with no booking: ${invoiceNo}`, `2C2P reports a successful payment for invoice ${invoiceNo} (${inquiry.amount ?? '?'} ${inquiry.currencyCode ?? ''}, reference ${inquiry.tranRef ?? inquiry.referenceNo ?? 'unknown'}), but the website has no booking for it. Please check the 2C2P portal.`);
    }
    return null;
  }

  const checkedAt = new Date().toISOString();
  if (inquiry.currencyCode && inquiry.currencyCode !== row.currency) throw new Error(`${providerLabel(row)} inquiry currency does not match the booking`);
  if (isReversedPayment(row.resp_code)) {
    const [updated] = await updateWhere(samePayment(row), { last_inquiry_at: checkedAt });
    return updated ?? await getByInvoice(invoiceNo);
  }

  if (isReversedPayment(inquiry.respCode)) {
    const flags = new Set(row.flags);
    if (isTestPayment(row)) flags.add('test_payment');
    // Reversals take precedence over a concurrent Approved → Settled update.
    // For a previously paid booking, keep its hand-off status as it is now.
    const reversalFilter = row.status === 'paid' || row.status === 'delivered'
      ? `id=eq.${row.id}&or=(resp_code.is.null,resp_code.not.in.(4047,4120))`
      : samePayment(row);
    const [updated] = await updateWhere(reversalFilter, {
      resp_code: inquiry.respCode, resp_desc: inquiry.respDesc ?? null, last_inquiry_at: checkedAt, flags: [...flags],
      // A reversal can be the first inquiry we receive after a payment. Keep
      // this history out of unpaid-attempt expiry/deletion, without emailing
      // a new confirmation. The original amount is not a refund amount.
      ...((row.status === 'pending' || row.status === 'expired' || row.status === 'failed') && {
        status: 'paid', paid_amount: inquiry.amount ?? null, paid_at: checkedAt,
        tran_ref: inquiry.tranRef ?? null, reference_no: inquiry.referenceNo ?? null,
        channel_code: inquiry.channelCode ?? null, approval_code: inquiry.approvalCode ?? null,
      }),
    });
    const current = updated ?? await getByInvoice(invoiceNo);
    if (current && !isReversedPayment(current.resp_code)) throw new Error('Payment changed during reversal reconciliation; retry the check');
    return current;
  }

  if (!isSuccessfulPayment(inquiry.respCode)) {
    const [updated] = await updateWhere(`${samePayment(row)}&status=eq.${row.status}`, {
      last_inquiry_at: checkedAt,
      ...(row.status === 'pending' && { resp_code: inquiry.respCode, resp_desc: inquiry.respDesc ?? null }),
    });
    return updated ?? await getByInvoice(invoiceNo);
  }

  if (row.status === 'paid' || row.status === 'delivered') {
    const [updated] = await updateWhere(samePayment(row), {
      last_inquiry_at: checkedAt,
      // A delayed Approved result must not regress a recorded settlement.
      ...(!(row.resp_code === '4110' && inquiry.respCode === PAID) && { resp_code: inquiry.respCode, resp_desc: inquiry.respDesc ?? null }),
    });
    const current = updated ?? await getByInvoice(invoiceNo);
    return current?.status === 'paid' ? deliver(current) : current;
  }

  const flags = new Set(row.flags);
  if (row.status === 'expired' || Date.now() > Date.parse(row.expires_at)) flags.add('paid_after_expiry');
  if (typeof inquiry.amount === 'number' && toSatang(inquiry.amount) !== toSatang(row.deposit_amount)) flags.add('amount_mismatch');
  if (row.pii_wiped_at) flags.add('details_deleted');
  if (isTestPayment(row)) flags.add('test_payment');
  // Preview deployments and the Stripe test site (PREVIEW_SITE=true) share the
  // live database and inboxes: say so loudly.
  if (process.env.VERCEL_ENV === 'preview' || process.env.PREVIEW_SITE === 'true') flags.add('preview_site');
  const [paid] = await updateWhere(`${samePayment(row)}&status=in.(pending,expired)`, {
    status: 'paid',
    paid_amount: typeof inquiry.amount === 'number' ? inquiry.amount : row.deposit_amount,
    tran_ref: inquiry.tranRef ?? null,
    reference_no: inquiry.referenceNo ?? null,
    approval_code: inquiry.approvalCode ?? null,
    channel_code: inquiry.channelCode ?? null,
    resp_code: inquiry.respCode,
    resp_desc: inquiry.respDesc ?? null,
    last_inquiry_at: checkedAt,
    paid_at: new Date().toISOString(),
    flags: [...flags],
  });
  if (paid) console.info('Booking paid', paid.ref, source);
  const current = paid ?? await getByInvoice(invoiceNo);
  return current?.status === 'paid' ? deliver(current) : current;
}

/** Claim the hand-off and send it. Exported for the cron's retries. */
export async function deliver(row: BookingRow): Promise<BookingRow> {
  if (isReversedPayment(row.resp_code)) return row;
  const staleBefore = new Date(Date.now() - DELIVERY_STALE_MS).toISOString();
  const notReversed = 'or(resp_code.is.null,resp_code.not.in.(4047,4120))';
  const [claimed] = await updateWhere(`id=eq.${row.id}&status=eq.paid&and=(or(delivery_claimed_at.is.null,delivery_claimed_at.lt.${staleBefore}),${notReversed})`, {
    delivery_claimed_at: new Date().toISOString(),
    delivery_attempts: row.delivery_attempts + 1,
  });
  if (!claimed) return row; // another caller is already on it

  try {
    // The guest first: if their email fails, the team's email says so.
    const flags = new Set(claimed.flags);
    let guestEmailedAt: string | null = claimed.guest_emailed_at;
    if (!guestEmailedAt && claimed.guest_email) {
      if (await sendGuestConfirmation(claimed)) guestEmailedAt = new Date().toISOString();
      else flags.add('guest_email_failed');
    }
    const withFlags = { ...claimed, flags: [...flags] };
    const result = await deliverReservation(withFlags);
    const now = new Date().toISOString();
    const [done] = await updateWhere(`id=eq.${claimed.id}&status=eq.paid&and=(${notReversed})`, {
      status: 'delivered', delivered_at: now, delivery_method: result.method, delivery_error: null,
      guest_emailed_at: guestEmailedAt, flags: [...flags],
    });
    console.info('Booking handed off', claimed.ref, result.method);
    return done ?? await getByInvoice(claimed.invoice_no) ?? withFlags;
  } catch (error) {
    console.error('Booking hand-off failed', claimed.ref, error);
    await updateWhere(`id=eq.${claimed.id}`, { delivery_claimed_at: null, delivery_error: String(error).slice(0, 500) }).catch(() => {});
    if (claimed.delivery_attempts >= MAX_DELIVERY_ATTEMPTS) {
      await alertTeam(`Booking ${claimed.ref} could not be handed off`, `Booking ${claimed.ref} (${formatDay(claimed.check_in)} – ${formatDay(claimed.check_out)}) is paid (${formatMoney(claimed.paid_amount ?? claimed.deposit_amount, claimed.currency)}, ${providerLabel(claimed)} ${claimed.tran_ref ?? claimed.invoice_no}) but its notification email keeps failing: ${String(error).slice(0, 300)}. The guest's details are still stored; open the Bookings tab in /admin or check the server logs.`);
    }
    return claimed;
  }
}

async function sendGuestConfirmation(row: BookingRow): Promise<boolean> {
  try {
    const times = await getCatalog().then((c) => c.property.policies?.checkInCheckOut).catch(() => undefined);
    const result = await sendTemplate({
      from: bookingFrom(),
      to: [row.guest_email!],
      replyTo: bookingAdminTo()[0],
      subject: `You’re booked! ${formatDay(row.check_in)} – ${formatDay(row.check_out)} · ${row.ref} — Hula Hula Resort`,
      template: CONFIRMATION_TEMPLATE,
      variables: confirmationVariables(row, times?.checkInStartTime ?? null, times?.checkOutEndTime ?? null),
      idempotencyKey: `booking-${row.ref}-guest`,
    });
    if (!result.ok) console.error('Resend refused the guest booking confirmation', row.ref, result.status, result.body);
    return result.ok;
  } catch (error) {
    console.error('Could not send the guest booking confirmation', row.ref, error);
    return false;
  }
}

export async function alertTeam(subject: string, text: string): Promise<void> {
  try {
    const result = await sendText({ from: bookingFrom(), to: [...bookingAdminTo(), ...bookingAdminBcc()], subject, text });
    if (!result.ok) console.error('Resend refused the team alert', result.status, result.body);
  } catch (error) {
    console.error('Could not send the team alert', error);
  }
}
