import type { BookingItem, BookingRow } from './bookings.js';
import { clip, escape, whatsappLink } from './escape.js';
import { formatMoney } from './money.js';
import { nightsBetween } from './search.js';

// Template variables for the two booking emails in emails/:
//   booking-notification → the reservations team, laid out in the order the
//                          booking is keyed into SiteMinder
//   booking-confirmation → the guest
// Everything is escaped here because Resend inserts variables unescaped.

export const NOTIFICATION_TEMPLATE = process.env.RESEND_BOOKING_NOTIFICATION_TEMPLATE_ID || 'booking-notification';
export const CONFIRMATION_TEMPLATE = process.env.RESEND_BOOKING_CONFIRMATION_TEMPLATE_ID || 'booking-confirmation';

const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const shortDayFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const stampFmt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' });
const regions = new Intl.DisplayNames(['en'], { type: 'region' });

export const formatDay = (iso: string) => dayFmt.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const countryName = (code: string | null) => { if (!code) return 'Not given'; try { return regions.of(code) ?? code; } catch { return code; } };

export const FLAG_TEXT: Record<string, string> = {
  paid_after_expiry: 'Paid after the hold on the room ran out. Check the room is still free in SiteMinder before entering it; if it isn’t, refund the guest in the 2C2P portal and let them know.',
  amount_mismatch: '2C2P reports a different amount from what this booking expected. Check the payment in the 2C2P portal before confirming.',
  guest_email_failed: 'The guest’s confirmation email could not be sent. Please forward them their booking details.',
  details_deleted: 'The guest’s details had already been deleted when this payment arrived. Find the payer in the 2C2P portal using the references above.',
};

export function siteUrlForEmail(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://hulahularesort.com';
}

export const guestCount = (items: BookingItem[]) => {
  const adults = items.reduce((sum, item) => sum + item.adults * item.quantity, 0);
  const children = items.reduce((sum, item) => sum + item.children * item.quantity, 0);
  return `${plural(adults, 'adult')}${children ? ` · ${plural(children, 'child', 'children')}` : ''}`;
};

// "Room with Breakfast · Includes breakfast", but not "Room Only · Room only".
const mealText = (item: BookingItem) => {
  const meals = [item.meals.breakfast && 'breakfast', item.meals.lunch && 'lunch', item.meals.dinner && 'dinner'].filter(Boolean);
  const text = meals.length ? `Includes ${meals.join(', ')}` : 'Room only';
  return text.toLowerCase() === item.rateName.toLowerCase() ? '' : ` · ${text}`;
};

// Consecutive nights at the same price read as one line: "27–29 Nov · THB 8,450 × 3".
function nightlyText(item: BookingItem, currency: string): string {
  const runs: { from: string; to: string; amount: number; count: number }[] = [];
  for (const night of item.nightly) {
    const last = runs.at(-1);
    if (last && last.amount === night.amount) { last.to = night.date; last.count += 1; } else runs.push({ from: night.date, to: night.date, amount: night.amount, count: 1 });
  }
  return runs.map((run) => {
    const label = run.from === run.to ? shortDayFmt.format(new Date(`${run.from}T00:00:00Z`)) : `${shortDayFmt.format(new Date(`${run.from}T00:00:00Z`))} – ${shortDayFmt.format(new Date(`${run.to}T00:00:00Z`))}`;
    return `${label} · ${formatMoney(run.amount, currency)}${run.count > 1 ? ` × ${run.count}` : ''}`;
  }).join('<br>');
}

// "Celebrate in Krabi −10% · saves THB 2,535" and, under it, what's included.
function offerHtml(item: BookingItem, currency: string): string {
  if (!item.offer) return '';
  const { title, percent, perks, savings } = item.offer;
  const saving = percent > 0 ? ` −${percent}%${savings > 0 ? ` · saves ${formatMoney(savings * item.quantity, currency)}` : ''}` : '';
  return `<br><span style="color:#50830d;font-weight:700;">${escape(title)}${escape(saving)}</span>`
    + (perks.length ? `<br><span style="color:#4b6457;">Includes: ${escape(perks.join(', '))}</span>` : '');
}

function roomsHtml(row: BookingRow, { forTeam }: { forTeam: boolean }): string {
  const cell = 'padding:12px 0;border-top:1px solid #d6e1ce;font:400 14px/1.6 \'Trebuchet MS\', \'Segoe UI\', Arial, sans-serif;color:#173c2c;vertical-align:top;';
  return clip(row.items.map((item) => {
    const guests = `${plural(item.adults, 'adult')}${item.children ? `, ${plural(item.children, 'child', 'children')}` : ''} per room`;
    const team = forTeam ? `<br><span style="color:#4b6457;font-size:12px;">${nightlyText(item, row.currency)}</span>` : '';
    return `<tr><td style="${cell}"><strong>${item.quantity} × ${escape(item.roomTypeName)}</strong><br>${escape(item.rateName)}${mealText(item)}<br><span style="color:#4b6457;">${guests}</span>${offerHtml(item, row.currency)}${team}</td>`
      + `<td align="right" style="${cell}white-space:nowrap;padding-left:12px;">${escape(formatMoney(item.unitTotal * item.quantity, row.currency))}</td></tr>`;
  }).join(''));
}

export function notificationVariables(row: BookingRow) {
  const nights = nightsBetween(row.check_in, row.check_out);
  const name = [row.guest_first_name, row.guest_last_name].filter(Boolean).join(' ') || 'Guest details deleted';
  const whatsapp = row.guest_phone ? whatsappLink(row.guest_phone) : undefined;
  const flags = row.flags.filter((flag) => FLAG_TEXT[flag]);
  const balance = row.total_amount - (row.paid_amount ?? row.deposit_amount);
  const keyLines: [string, string | null | undefined][] = [
    ['Guest', name], ['Email', row.guest_email], ['Phone', row.guest_phone], ['Country', countryName(row.guest_country)],
    ['Check-in', formatDay(row.check_in)], ['Check-out', formatDay(row.check_out)], ['Nights', String(nights)],
    ...row.items.map((item, i): [string, string] => [`Room ${i + 1}`, `${item.quantity} × ${item.roomTypeName} — ${item.rateName} — ${item.adults}A${item.children ? `+${item.children}C` : ''} — ${formatMoney(item.unitTotal * item.quantity, row.currency)}`
      + (item.offer?.percent ? ` (offer “${item.offer.title}” −${item.offer.percent}%, list price ${formatMoney((item.unitOriginalTotal ?? item.unitTotal) * item.quantity, row.currency)})` : item.offer ? ` (package “${item.offer.title}”)` : '')]),
    ['Perks to arrange', [...new Set(row.items.flatMap((item) => item.offer?.perks ?? []))].join(', ') || null],
    ['Total', formatMoney(row.total_amount, row.currency)],
    ['Paid online', `${formatMoney(row.paid_amount ?? row.deposit_amount, row.currency)} (2C2P ${row.tran_ref ?? row.invoice_no})`],
    ['Balance at hotel', formatMoney(balance, row.currency)],
    ['Arrival time', row.arrival_time], ['Promo code', row.promo_code], ['Requests', row.special_requests],
    ['Booking ref', row.ref],
  ];
  return {
    BOOKING_REF: row.ref,
    PREVIEW: escape(`${name} · ${formatDay(row.check_in)} – ${formatDay(row.check_out)} · ${plural(row.items.reduce((s, i) => s + i.quantity, 0), 'room')} · paid ${formatMoney(row.paid_amount ?? row.deposit_amount, row.currency)}`),
    GUEST_NAME: escape(name),
    GUEST_EMAIL: row.guest_email ? escape(row.guest_email) : undefined,
    GUEST_PHONE: row.guest_phone ? escape(row.guest_phone) : undefined,
    GUEST_COUNTRY: escape(countryName(row.guest_country)),
    ARRIVAL_TIME: row.arrival_time ? escape(row.arrival_time) : undefined,
    SPECIAL_REQUESTS: row.special_requests ? clip(escape(row.special_requests)) : undefined,
    CHECK_IN: formatDay(row.check_in),
    CHECK_OUT: formatDay(row.check_out),
    NIGHTS: plural(nights, 'night'),
    GUESTS: guestCount(row.items),
    ROOMS_HTML: roomsHtml(row, { forTeam: true }),
    TOTAL: escape(formatMoney(row.total_amount, row.currency)),
    PAID_AMOUNT: escape(formatMoney(row.paid_amount ?? row.deposit_amount, row.currency)),
    BALANCE: escape(formatMoney(balance, row.currency)),
    PAID_AT: row.paid_at ? stampFmt.format(new Date(row.paid_at)) : undefined,
    PAYMENT_CHANNEL: row.channel_code ? escape(row.channel_code) : undefined,
    INVOICE_NO: row.invoice_no,
    TRAN_REF: row.tran_ref ? escape(row.tran_ref) : undefined,
    APPROVAL_CODE: row.approval_code ? escape(row.approval_code) : undefined,
    PROMO_CODE: row.promo_code ? escape(row.promo_code) : undefined,
    FLAGS_HTML: flags.length ? flags.map((flag) => `• ${escape(FLAG_TEXT[flag])}`).join('<br>') : undefined,
    FLAGS_DISPLAY: flags.length ? 'block' : undefined,
    KEY_BLOCK: clip(keyLines.filter(([, value]) => value).map(([label, value]) => `${escape(label)}: ${escape(value!)}`).join('<br>')),
    WHATSAPP_URL: whatsapp,
    WHATSAPP_DISPLAY: whatsapp ? 'inline-block' : undefined,
    SITE_URL: escape(siteUrlForEmail()),
  };
}

export function confirmationVariables(row: BookingRow, checkInTime: string | null, checkOutTime: string | null) {
  const nights = nightsBetween(row.check_in, row.check_out);
  const paid = row.paid_amount ?? row.deposit_amount;
  const balance = row.total_amount - paid;
  const cancellation = [...new Set(row.items.map((item) => item.cancellation))].join(' ');
  return {
    GUEST_FIRST_NAME: escape(row.guest_first_name ?? 'there'),
    BOOKING_REF: row.ref,
    PREVIEW: escape(`You’re booked! ${formatDay(row.check_in)} – ${formatDay(row.check_out)} · booking ${row.ref}`),
    CHECK_IN: formatDay(row.check_in),
    CHECK_OUT: formatDay(row.check_out),
    CHECK_IN_TIME: checkInTime ? escape(checkInTime) : undefined,
    CHECK_OUT_TIME: checkOutTime ? escape(checkOutTime) : undefined,
    NIGHTS: plural(nights, 'night'),
    GUESTS: guestCount(row.items),
    ROOMS_HTML: roomsHtml(row, { forTeam: false }),
    TOTAL: escape(formatMoney(row.total_amount, row.currency)),
    PAID_NOW: escape(formatMoney(paid, row.currency)),
    BALANCE: escape(formatMoney(balance, row.currency)),
    BALANCE_DISPLAY: balance > 0.005 ? 'table-row' : undefined,
    CANCELLATION: escape(cancellation),
    PAYMENT_REF: escape(row.tran_ref ?? row.invoice_no),
    PROMO_LINE: row.promo_code ? escape(`Promo code ${row.promo_code} applied`) : undefined,
    PROMO_DISPLAY: row.promo_code ? 'block' : undefined,
    SITE_URL: escape(siteUrlForEmail()),
  };
}
