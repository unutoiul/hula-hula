import type { BookingRow } from './bookings.js';
import { NOTIFICATION_TEMPLATE, notificationVariables } from './bookingEmails.js';
import { formatMoney } from './money.js';
import { sendTemplate, splitAddresses } from './resend.js';

// Reservations enters each paid website booking in SiteMinder manually.
// This function only emails the booking details to the reservations inbox;
// it does not create or update a reservation in SiteMinder.

export interface DeliveryResult { method: 'email' }

// Mail is sent from hulahularesort.com (the domain verified in Resend) and
// goes to, and is answered at, the reservations inbox on hulahulaholiday.com.
export const bookingFrom = () => process.env.BOOKING_FROM || process.env.CONTACT_FROM || 'Hula Hula Resort <reservation@hulahularesort.com>';
export const bookingAdminTo = () => splitAddresses(process.env.BOOKING_ADMIN_TO || process.env.CONTACT_TO || 'reservation@hulahulaholiday.com');
export const bookingAdminBcc = () => splitAddresses(process.env.BOOKING_ADMIN_BCC ?? process.env.CONTACT_BCC ?? 'contact@bluetrendy.com');

export async function deliverReservation(row: BookingRow): Promise<DeliveryResult> {
  const rooms = row.items.reduce((sum, item) => sum + item.quantity, 0);
  const result = await sendTemplate({
    from: bookingFrom(),
    to: bookingAdminTo(),
    bcc: bookingAdminBcc(),
    replyTo: row.guest_email ?? undefined,
    subject: `${row.flags.includes('test_payment') ? 'TEST PAYMENT · ' : ''}ACTION: enter in SiteMinder · ${row.ref} · ${row.check_in} → ${row.check_out} · ${rooms} room${rooms === 1 ? '' : 's'} · ${row.flags.includes('test_payment') ? 'nothing charged' : `paid ${formatMoney(row.paid_amount ?? row.deposit_amount, row.currency)}`}${row.flags.some((f) => f !== 'test_payment' && f !== 'preview_site') ? ' · CHECK' : ''}`,
    template: NOTIFICATION_TEMPLATE,
    variables: notificationVariables(row),
    idempotencyKey: `booking-${row.ref}-team`,
  });
  if (!result.ok) throw new Error(`Resend refused the booking notification (${result.status}): ${result.body.slice(0, 200)}`);
  return { method: 'email' };
}
