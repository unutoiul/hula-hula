import type { BookingRow } from './bookings.js';
import { NOTIFICATION_TEMPLATE, notificationVariables } from './bookingEmails.js';
import { formatMoney } from './money.js';
import { sendTemplate, splitAddresses } from './resend.js';

// Handing a paid booking to the resort — the one place that changes when
// SiteMinder's SiteConnect API is approved. Until then, SiteMinder's Direct
// Booking API can't create reservations, so the booking goes to the
// reservations inbox as an "ACTION: enter in SiteMinder" email, laid out in
// the order it's keyed in. RESERVATION_DELIVERY=siteconnect|both will add the
// automatic push here (Phase 2); for now anything but "email" falls back to it.

export interface DeliveryResult { method: 'email' | 'siteconnect'; externalId?: string }

export const bookingFrom = () => process.env.BOOKING_FROM || process.env.CONTACT_FROM || 'Hula Hula Resort <reservation@hulahularesort.com>';
export const bookingAdminTo = () => splitAddresses(process.env.BOOKING_ADMIN_TO || process.env.CONTACT_TO || 'reservation@hulahularesort.com');
export const bookingAdminBcc = () => splitAddresses(process.env.BOOKING_ADMIN_BCC ?? process.env.CONTACT_BCC ?? 'contact@bluetrendy.com');

export async function deliverReservation(row: BookingRow): Promise<DeliveryResult> {
  const mode = process.env.RESERVATION_DELIVERY || 'email';
  if (mode !== 'email') console.warn(`RESERVATION_DELIVERY=${mode} isn’t built yet — sending the email handoff instead`);
  const rooms = row.items.reduce((sum, item) => sum + item.quantity, 0);
  const result = await sendTemplate({
    from: bookingFrom(),
    to: bookingAdminTo(),
    bcc: bookingAdminBcc(),
    replyTo: row.guest_email ?? undefined,
    subject: `ACTION: enter in SiteMinder · ${row.ref} · ${row.check_in} → ${row.check_out} · ${rooms} room${rooms === 1 ? '' : 's'} · paid ${formatMoney(row.paid_amount ?? row.deposit_amount, row.currency)}${row.flags.length ? ' · CHECK' : ''}`,
    template: NOTIFICATION_TEMPLATE,
    variables: notificationVariables(row),
    idempotencyKey: `booking-${row.ref}-team`,
  });
  if (!result.ok) throw new Error(`Resend refused the booking notification (${result.status}): ${result.body.slice(0, 200)}`);
  return { method: 'email' };
}
