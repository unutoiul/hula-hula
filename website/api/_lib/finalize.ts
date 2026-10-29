import { type BookingRow, getByInvoice, PII_WIPE, updateWhere } from './bookings.js';
import { CONFIRMATION_TEMPLATE, confirmationVariables, formatDay } from './bookingEmails.js';
import { bookingAdminBcc, bookingAdminTo, bookingFrom, deliverReservation } from './deliver.js';
import { formatMoney, toSatang } from './money.js';
import { sendTemplate, sendText } from './resend.js';
import { getCatalog } from './siteminder.js';
import { isTestMode, PAID, paymentInquiry } from './twoc2p.js';

// The single path from "this might be paid" to "the resort has it and the
// guest's details are gone". Three things call it — 2C2P's notification, the
// confirmation page polling /api/booking/status, and the nightly cron — and
// they may overlap, so every step is a conditional update that only one of
// them can win, and the emails carry idempotency keys. It always asks 2C2P
// itself: a notification or a browser redirect only says "go and look".

const DELIVERY_STALE_MS = 5 * 60_000;
export const MAX_DELIVERY_ATTEMPTS = 5;

export type ConfirmSource = 'webhook' | 'status' | 'cron';

export async function confirmPayment(invoiceNo: string, source: ConfirmSource): Promise<BookingRow | null> {
  const row = await getByInvoice(invoiceNo);
  if (row?.status === 'delivered') return row;
  if (row?.status === 'paid') return deliver(row);

  const inquiry = await paymentInquiry(invoiceNo);
  if (!row) {
    if (inquiry.respCode === PAID) {
      console.error('Paid invoice with no booking on file', invoiceNo, source);
      await alertTeam(`Payment with no booking: ${invoiceNo}`, `2C2P reports a successful payment for invoice ${invoiceNo} (${inquiry.amount ?? '?'} ${inquiry.currencyCode ?? ''}, reference ${inquiry.tranRef ?? inquiry.referenceNo ?? 'unknown'}), but the website has no booking for it. Please check the 2C2P portal.`);
    }
    return null;
  }

  if (inquiry.respCode !== PAID) {
    if (row.status === 'pending' && inquiry.respCode !== row.resp_code) {
      await updateWhere(`id=eq.${row.id}&status=eq.pending`, { resp_code: inquiry.respCode, resp_desc: inquiry.respDesc ?? null });
    }
    return row;
  }

  const flags = new Set(row.flags);
  if (row.status === 'expired' || Date.now() > Date.parse(row.expires_at)) flags.add('paid_after_expiry');
  if (typeof inquiry.amount === 'number' && toSatang(inquiry.amount) !== toSatang(row.deposit_amount)) flags.add('amount_mismatch');
  if (row.pii_wiped_at) flags.add('details_deleted');
  if (isTestMode()) flags.add('test_payment');
  const [paid] = await updateWhere(`id=eq.${row.id}&status=in.(pending,expired)`, {
    status: 'paid',
    paid_amount: typeof inquiry.amount === 'number' ? inquiry.amount : row.deposit_amount,
    tran_ref: inquiry.tranRef ?? null,
    reference_no: inquiry.referenceNo ?? null,
    approval_code: inquiry.approvalCode ?? null,
    channel_code: inquiry.channelCode ?? null,
    resp_code: inquiry.respCode,
    resp_desc: inquiry.respDesc ?? null,
    paid_at: new Date().toISOString(),
    flags: [...flags],
  });
  if (paid) console.info('Booking paid', paid.ref, source);
  const current = paid ?? await getByInvoice(invoiceNo);
  return current?.status === 'paid' ? deliver(current) : current;
}

/** Claim the hand-off, send it, then wipe the guest's details. Exported for the cron's retries. */
export async function deliver(row: BookingRow): Promise<BookingRow> {
  const staleBefore = new Date(Date.now() - DELIVERY_STALE_MS).toISOString();
  const [claimed] = await updateWhere(`id=eq.${row.id}&status=eq.paid&or=(delivery_claimed_at.is.null,delivery_claimed_at.lt.${staleBefore})`, {
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
    const [done] = await updateWhere(`id=eq.${claimed.id}&status=eq.paid`, {
      status: 'delivered', delivered_at: now, delivery_method: result.method, delivery_error: null,
      guest_emailed_at: guestEmailedAt, flags: [...flags], ...PII_WIPE, pii_wiped_at: now,
    });
    console.info('Booking handed off and details wiped', claimed.ref, result.method);
    return done ?? withFlags;
  } catch (error) {
    console.error('Booking hand-off failed', claimed.ref, error);
    await updateWhere(`id=eq.${claimed.id}`, { delivery_claimed_at: null, delivery_error: String(error).slice(0, 500) }).catch(() => {});
    if (claimed.delivery_attempts >= MAX_DELIVERY_ATTEMPTS) {
      await alertTeam(`Booking ${claimed.ref} could not be handed off`, `Booking ${claimed.ref} (${formatDay(claimed.check_in)} – ${formatDay(claimed.check_out)}) is paid (${formatMoney(claimed.paid_amount ?? claimed.deposit_amount, claimed.currency)}, 2C2P ${claimed.tran_ref ?? claimed.invoice_no}) but its notification email keeps failing: ${String(error).slice(0, 300)}. The guest's details are still stored; open the Bookings tab in /admin or check the server logs.`);
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
