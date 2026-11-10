import { clubRules, contactLinks, findActivity, rentalName, type SiteData } from '../../src/booking/config.ts';
import type { EventOrderView, Guest, Reservation } from '../../src/booking/contract.ts';
import { countryName } from '../../src/booking/countries.ts';
import { dayLabel, durationLabel, timeLabel } from '../../src/booking/dates.ts';
import { bookingDepositTerms, depositDetail, money, plural, type PriceLine } from '../../src/booking/pricing.ts';
import { clip, escape, whatsappLink } from './escape.ts';

// What goes into the four Resend templates in emails/ (published with
// `npm run email:publish`), in the same look as the resort's:
//   golf-booking-confirmation → the guest, their tee time
//   golf-booking-notification → the club, a new online tee time
//   golf-event-confirmation   → the guest, their paid event places
//   golf-event-notification   → the club, a new paid event order
// Each builder returns the subject, the template and its variables. Every
// variable is escaped here, because Resend inserts them as they are; one
// left undefined falls back to the template's default ("Not given", hidden).

export const TEMPLATES = {
  bookingConfirmation: 'golf-booking-confirmation',
  bookingNotification: 'golf-booking-notification',
  eventConfirmation: 'golf-event-confirmation',
  eventNotification: 'golf-event-notification',
} as const;

export interface TemplateMessage { subject: string; template: string; variables: Record<string, string | undefined> }

const CELL = 'padding:12px 0;border-top:1px solid #d6e1ce;font:400 14px/1.6 \'Trebuchet MS\', \'Segoe UI\', Arial, sans-serif;color:#173c2c;vertical-align:top;';

// The price lines as table rows: "Golf · 9 holes / 2 players × ฿1,600 ……… ฿3,200".
const linesHtml = (lines: PriceLine[]) => clip(lines.map((line) =>
  `<tr><td style="${CELL}"><strong>${escape(line.label)}</strong>${line.detail ? `<br><span style="color:#4b6457;">${escape(line.detail)}</span>` : ''}</td>`
  + `<td align="right" style="${CELL}white-space:nowrap;padding-left:12px;">${escape(money(line.amount))}</td></tr>`).join(''));

function clubDetails(site: SiteData, siteUrl: string) {
  const contact = contactLinks(site.club.contact);
  return { contact, vars: { CLUB_AREA: escape(contact.area), CLUB_EMAIL: escape(contact.email), SITE_URL: escape(siteUrl) } };
}

// The "please check" box in the club's emails.
const flagVars = (flags: string[]) => ({
  FLAGS_HTML: flags.length ? flags.map((flag) => `• ${escape(flag)}`).join('<br>') : undefined,
  FLAGS_DISPLAY: flags.length ? 'block' : undefined,
});

const BOOKING_FLAG_TEXT: Record<string, string> = {
  paid_after_expiry: 'Paid after the hold on this time ran out. Check the tee sheet isn’t overbooked; if it is, refund the guest in the Payso control panel and let them know.',
  amount_mismatch: 'Payso reports a different amount from the one the guest was asked to pay. Check the payment in the Payso control panel.',
};

function bookingPaidLabel(r: Reservation, depositBreakdown: string) {
  if (r.total === 0) return 'Nothing to pay';
  const paid = r.balance > 0 ? 'Deposit paid' : 'Paid';
  return r.testPayment ? `${paid} (test — nothing was charged)` : `${paid} online${depositBreakdown ? ` · ${depositBreakdown}` : ''}`;
}

/** How the guest is getting to the club, for the confirmation; undefined when they're making their own way. */
function pickupLine(r: Reservation) {
  if (r.privateTransfer) return `Private transfer from ${r.pickupFrom} — we’ll confirm the price and pick-up time on WhatsApp.`;
  return r.transfer ? `Free shuttle pick-up at ${timeLabel(r.transfer)} from ${r.pickupFrom} — we’ll confirm the spot on WhatsApp.` : undefined;
}

function summary(r: Reservation, site: SiteData) {
  const activity = findActivity(site, r.activity);
  const people = plural(r.players, activity?.peopleNoun ?? 'player', activity?.peopleNoun === 'person' ? 'people' : 'players');
  const depositBreakdown = activity && r.balance > 0 ? depositDetail(activity, r.players, r.deposit) : '';
  return {
    wear: activity?.wear ?? '', people, depositBreakdown, when: `${timeLabel(r.time)} · ${dayLabel(r.date)}`,
    vars: { BOOKING_REF: escape(r.ref), TEE_TIME: timeLabel(r.time), TEE_DAY: dayLabel(r.date), ACTIVITY: escape(`${r.activityName} · ${r.optionLabel}`), GROUP: escape(`${people} · about ${durationLabel(r.minutes)}`), LINES_HTML: linesHtml(r.lines), TOTAL: escape(money(r.total)), PAID_LABEL: escape(bookingPaidLabel(r, depositBreakdown)), PAID_AMOUNT: escape(money(r.deposit)),
      BALANCE: r.balance > 0 ? escape(money(r.balance)) : undefined, BALANCE_DISPLAY: r.balance > 0 ? 'table-cell' : undefined },
  };
}

export function bookingConfirmation(r: Reservation, guest: Guest, siteUrl: string, site: SiteData): TemplateMessage {
  const { wear, when, vars, depositBreakdown } = summary(r, site);
  const { contact, vars: club } = clubDetails(site, siteUrl);
  const rules = clubRules(wear, site.club, r.balance > 0 ? bookingDepositTerms(r.deposit, depositBreakdown) : '').filter((rule) => rule.text);
  const pickup = pickupLine(r);
  return {
    subject: `Booked: ${r.activityName} ${when} — ${r.ref}`,
    template: TEMPLATES.bookingConfirmation,
    variables: {
      ...vars, ...club,
      PREVIEW: escape(`You’re on the tee sheet — ${when} · booking ${r.ref}`),
      GUEST_FIRST_NAME: guest.firstName ? escape(guest.firstName) : undefined,
      PICKUP_LINE: pickup ? escape(pickup) : undefined,
      PICKUP_DISPLAY: pickup ? 'block' : undefined,
      RULES_HTML: clip(rules.map((rule) => `<strong style="color:#173c2c;">${escape(rule.title)}.</strong> ${escape(rule.text)}`).join('<br>')),
      WHATSAPP_URL: escape(`${contact.whatsapp}?text=${encodeURIComponent(`Hi! About my booking ${r.ref}: `)}`),
      CLUB_PHONE: escape(contact.phone),
      CLUB_TEL: escape(contact.tel),
    },
  };
}

export function bookingNotification(r: Reservation, guest: Guest, experience: string, siteUrl: string, site: SiteData, flags: string[] = []): TemplateMessage {
  const { people, when, vars } = summary(r, site);
  const { vars: club } = clubDetails(site, siteUrl);
  const name = `${guest.firstName} ${guest.lastName}`.trim();
  const whatsapp = whatsappLink(guest.phone);
  const checks = [...(r.testPayment ? ['TEST payment on a Payso demo account — no money was taken.'] : []), ...flags.map((flag) => BOOKING_FLAG_TEXT[flag]).filter(Boolean)];
  const rentals = site.rentals.filter((rent) => (r.rentals[rent.id] ?? 0) > 0).map((rent) => `${r.rentals[rent.id]} × ${rentalName(rent)}`).join(', ');
  return {
    subject: `New booking: ${r.activityName} ${when} — ${name} (${r.players})`,
    template: TEMPLATES.bookingNotification,
    variables: {
      ...vars, ...club, ...flagVars(checks),
      PREVIEW: escape(`${name} · ${r.activityName} · ${when} · ${people}`),
      GUEST_NAME: escape(name),
      GUEST_EMAIL: escape(guest.email),
      GUEST_PHONE: escape(guest.phone),
      GUEST_COUNTRY: escape(countryName(guest.country)),
      HANDICAP: guest.handicap ? escape(guest.handicap) : undefined,
      EXPERIENCE: experience ? escape(experience) : undefined,
      RENTALS: rentals ? escape(rentals) : undefined,
      SHUTTLE: r.privateTransfer ? escape(`Private transfer from ${r.pickupFrom}. Please agree the price and pick-up time with the guest.`) : r.transfer ? escape(`Free shuttle: ${timeLabel(r.transfer)} pick-up from ${r.pickupFrom}`) : undefined,
      NOTES: guest.notes ? clip(escape(guest.notes).replace(/\n/g, '<br>')) : undefined,
      WHATSAPP_URL: whatsapp,
      WHATSAPP_DISPLAY: whatsapp ? 'inline-block' : undefined,
    },
  };
}

// ── Event packages ─────────────────────────────────────────────────────────

export interface PaidOrder extends EventOrderView { firstName: string; lastName: string; phone: string; country: string; notes: string; unitPrice: number; flags: string[] }

const FLAG_TEXT: Record<string, string> = {
  paid_after_expiry: 'Paid after the hold on these places ran out. Check the package isn’t oversold; if it is, refund the guest in the Payso control panel and let them know.',
  amount_mismatch: 'Payso reports a different amount from the order total. Check the payment in the Payso control panel.',
};

function orderSummary(o: PaidOrder, siteUrl: string, site: SiteData) {
  const time = o.startTime ? ` · ${timeLabel(o.startTime)}${o.endTime ? ` – ${timeLabel(o.endTime)}` : ''}` : '';
  const when = `${dayLabel(o.startsOn)}${time}`;
  const { contact, vars: club } = clubDetails(site, siteUrl);
  return {
    contact, when,
    vars: {
      ...club, ORDER_REF: escape(o.ref), EVENT_TITLE: escape(o.eventTitle), EVENT_WHEN: escape(when), PACKAGE_NAME: escape(o.packageName),
      PACKAGE_DETAIL: escape(`${plural(o.quantity, 'place')} × ${money(o.unitPrice)}`), TOTAL: escape(money(o.total)),
      PAID_LABEL: o.testPayment ? 'Paid (test — nothing was charged)' : 'Paid online',
    },
  };
}

export function eventConfirmation(o: PaidOrder, siteUrl: string, site: SiteData): TemplateMessage {
  const { contact, when, vars } = orderSummary(o, siteUrl, site);
  return {
    subject: `You’re in: ${o.eventTitle} — ${o.ref}`,
    template: TEMPLATES.eventConfirmation,
    variables: {
      ...vars,
      PREVIEW: escape(`You’re in! ${o.eventTitle} — ${when}`),
      GUEST_FIRST_NAME: o.firstName ? escape(o.firstName) : undefined,
      PLACES_TEXT: o.quantity > 1 ? 'your places are booked and paid' : 'your place is booked and paid',
      EVENT_URL: escape(`${siteUrl}/events/${o.eventSlug}`),
      WHATSAPP_URL: escape(`${contact.whatsapp}?text=${encodeURIComponent(`Hi! About my event order ${o.ref}: `)}`),
      CLUB_PHONE: escape(contact.phone),
      CLUB_TEL: escape(contact.tel),
    },
  };
}

export function eventNotification(o: PaidOrder, siteUrl: string, site: SiteData): TemplateMessage {
  const { vars } = orderSummary(o, siteUrl, site);
  const name = `${o.firstName} ${o.lastName}`.trim();
  const whatsapp = whatsappLink(o.phone);
  const flags = [...(o.testPayment ? ['TEST payment on a Payso demo account — no money was taken.'] : []), ...o.flags.map((flag) => FLAG_TEXT[flag]).filter(Boolean)];
  return {
    subject: `Event order: ${o.packageName} × ${o.quantity} — ${name}${o.testPayment ? ' (test)' : ''}`,
    template: TEMPLATES.eventNotification,
    variables: {
      ...vars,
      PREVIEW: escape(`${name} · ${o.eventTitle} · ${o.packageName} × ${o.quantity}`),
      GUEST_NAME: escape(name),
      GUEST_EMAIL: o.email ? escape(o.email) : undefined,
      GUEST_PHONE: escape(o.phone),
      GUEST_COUNTRY: escape(countryName(o.country)),
      NOTES: o.notes ? clip(escape(o.notes).replace(/\n/g, '<br>')) : undefined,
      ...flagVars(flags),
      WHATSAPP_URL: whatsapp,
      WHATSAPP_DISPLAY: whatsapp ? 'inline-block' : undefined,
    },
  };
}
