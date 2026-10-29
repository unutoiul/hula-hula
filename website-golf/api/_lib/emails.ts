import { clubRules, contactLinks, findActivity, type SiteData } from '../../src/booking/config.ts';
import type { EventOrderView, Guest, Reservation } from '../../src/booking/contract.ts';
import { countryName } from '../../src/booking/countries.ts';
import { dayLabel, durationLabel, timeLabel } from '../../src/booking/dates.ts';
import { money, plural, type PriceLine } from '../../src/booking/pricing.ts';
import { escape, whatsappLink } from './escape.ts';

// The booking emails, as plain inline-styled HTML (plus a text version): the
// guest's confirmation and the club's "new booking" alert, for tee times and
// for event packages. Brand colours from the website; tables, because that's
// what every email client renders.

const C = { cream: '#fffdf3', paper: '#fffef8', sea: '#006d8a', ink: '#173c2c', muted: '#4b6457', lime: '#e7f4cc', sun: '#f9f70c', line: '#d6e1ce' };
const FONT = `font-family: 'DM Sans', Arial, sans-serif;`;

function shell(preheader: string, badge: string, body: string, site: SiteData) {
  const contact = contactLinks(site.club.contact);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:${C.cream};${FONT}color:${C.ink}">
<span style="display:none;max-height:0;overflow:hidden">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.paper};border:1px solid ${C.line};border-radius:20px;overflow:hidden">
<tr><td style="background:${C.sea};padding:18px 28px;color:#fff;font-size:20px;font-weight:700;letter-spacing:.02em">Hula Hula Golf Club <span style="display:inline-block;margin-left:6px;padding:2px 10px;border-radius:99px;background:${C.sun};color:${C.ink};font-size:11px;letter-spacing:.12em;vertical-align:middle">${badge}</span></td></tr>
<tr><td style="padding:28px">${body}</td></tr>
</table>
<p style="${FONT}font-size:12px;color:${C.muted};margin:16px 0 0">Hula Hula Golf Club · ${escape(contact.area)}<br>WhatsApp ${escape(contact.phone)}${contact.lineId ? ` · Line ${escape(contact.lineId)}` : ''} · ${escape(contact.email)}</p>
</td></tr></table></body></html>`;
}

const row = (label: string, value: string) => `<tr><td style="padding:6px 0;color:${C.muted};font-size:14px;width:38%;vertical-align:top">${label}</td><td style="padding:6px 0;font-size:14px;font-weight:600">${value}</td></tr>`;

function priceTable(lines: PriceLine[], total: number, totalLabel: string) {
  const rows = lines.map((line) => `<tr><td style="padding:4px 0;font-size:14px">${escape(line.label)}${line.detail ? `<span style="color:${C.muted};font-size:12px"> · ${escape(line.detail)}</span>` : ''}</td><td align="right" style="padding:4px 0;font-size:14px">${money(line.amount)}</td></tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-top:1px solid ${C.line};padding-top:10px">${rows}
<tr><td style="padding:10px 0 0;font-weight:700">${totalLabel}</td><td align="right" style="padding:10px 0 0;font-size:20px;font-weight:700;color:${C.sea}">${money(total)}</td></tr></table>`;
}

const button = (href: string, label: string) => `<a href="${href}" style="display:inline-block;background:${C.sea};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:99px">${label}</a>`;

function summary(r: Reservation, site: SiteData) {
  const activity = findActivity(site, r.activity);
  const people = plural(r.players, activity?.peopleNoun ?? 'player', activity?.peopleNoun === 'person' ? 'people' : 'players');
  return { wear: activity?.wear ?? '', people, when: `${timeLabel(r.time)} · ${dayLabel(r.date)}` };
}

export function guestEmail(r: Reservation, guest: Guest, siteUrl: string, site: SiteData) {
  const { wear, people, when } = summary(r, site);
  const contact = contactLinks(site.club.contact);
  const pickup = r.transfer ? `Free pick-up at ${timeLabel(r.transfer)} from ${escape(r.pickupFrom)} — we’ll confirm the spot on WhatsApp.` : '';
  const rules = clubRules(wear, site.club);
  const html = shell(`You’re on the tee sheet — ${when}`, 'TEE TIME', `
<p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.12em;color:#50830d">BOOKED · ${r.ref}</p>
<h1 style="margin:8px 0 6px;font-size:28px;line-height:1.15">You’re on the tee sheet, ${escape(guest.firstName)}!</h1>
<p style="margin:0;color:${C.muted};font-size:15px">Here’s your booking. Quote <strong>${r.ref}</strong> if you need to change anything.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background:#d9f5fc;border-radius:14px"><tr><td style="padding:16px 18px">
<p style="margin:0;font-size:20px;font-weight:700;color:#124e39">${when}</p>
<p style="margin:4px 0 0;font-size:14px">${escape(r.activityName)} · ${escape(r.optionLabel)} · ${people} · about ${durationLabel(r.minutes)}</p>
${pickup ? `<p style="margin:8px 0 0;font-size:13px">${pickup}</p>` : ''}
</td></tr></table>
${priceTable(r.lines, r.total, 'To pay at the club')}
<h2 style="margin:24px 0 8px;font-size:18px">Before you come</h2>
<ul style="margin:0;padding-left:18px;font-size:14px;color:${C.ink}">${rules.map((rule) => `<li style="margin:0 0 6px"><strong>${rule.title}.</strong> ${escape(rule.text)}</li>`).join('')}</ul>
<p style="margin:22px 0 0">${button(`${contact.whatsapp}?text=${encodeURIComponent(`Hi! About my booking ${r.ref}: `)}`, 'WhatsApp us')}
&nbsp; <a href="${siteUrl}" style="color:${C.sea};font-weight:700">Visit the website</a></p>`, site);
  const text = [`You're on the tee sheet, ${guest.firstName}! Booking ${r.ref}`, when, `${r.activityName} · ${r.optionLabel} · ${people}`,
    r.transfer ? `Free pick-up at ${timeLabel(r.transfer)} from ${r.pickupFrom}` : '', '',
    ...r.lines.map((l) => `${l.label}${l.detail ? ` (${l.detail})` : ''}: ${money(l.amount)}`), `To pay at the club: ${money(r.total)}`, '',
    ...rules.map((rule) => `- ${rule.title}. ${rule.text}`), '', `Questions? WhatsApp ${contact.phone} or ${contact.email}`].filter((l, i, all) => l || all[i - 1]).join('\n');
  return { subject: `Booked: ${r.activityName} ${when} — ${r.ref}`, html, text };
}

export function clubEmail(r: Reservation, guest: Guest, experience: string, siteUrl: string, site: SiteData) {
  const { people, when } = summary(r, site);
  const name = `${guest.firstName} ${guest.lastName}`.trim();
  const whatsapp = whatsappLink(guest.phone);
  const rentals = site.rentals.filter((rent) => (r.rentals[rent.id] ?? 0) > 0).map((rent) => `${r.rentals[rent.id]} × ${rent.label}`).join(', ');
  const html = shell(`${name} · ${r.activityName} ${when}`, 'TEE TIME', `
<p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.12em;color:#50830d">NEW ONLINE BOOKING · ${r.ref}</p>
<h1 style="margin:8px 0 16px;font-size:24px;line-height:1.2">${escape(r.activityName)} · ${escape(r.optionLabel)}<br>${when}</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row('Guest', escape(name))}
${row('Group', people)}
${row('Phone', `${escape(guest.phone)}${whatsapp ? ` · <a href="${whatsapp}" style="color:${C.sea}">WhatsApp</a>` : ''}`)}
${row('Email', `<a href="mailto:${escape(guest.email)}" style="color:${C.sea}">${escape(guest.email)}</a>`)}
${row('Country', escape(countryName(guest.country)))}
${guest.handicap ? row('Handicap', escape(guest.handicap)) : ''}
${experience ? row('Experience', escape(experience)) : ''}
${rentals ? row('Rental clubs', rentals) : ''}
${r.transfer ? row('Shuttle', `${timeLabel(r.transfer)} pick-up from ${escape(r.pickupFrom)}`) : ''}
${guest.notes ? row('Notes', escape(guest.notes).replace(/\n/g, '<br>')) : ''}
</table>
${priceTable(r.lines, r.total, 'To pay at the club')}
<p style="margin:22px 0 0">${button(`${siteUrl}/admin`, 'Open the tee sheet')}</p>`, site);
  const text = [`New online booking ${r.ref}`, `${r.activityName} · ${r.optionLabel} · ${when}`, `${name} · ${people}`, `Phone: ${guest.phone}`, `Email: ${guest.email}`,
    experience && `Experience: ${experience}`, rentals && `Rental clubs: ${rentals}`, r.transfer && `Shuttle: ${timeLabel(r.transfer)} pick-up from ${r.pickupFrom}`, guest.notes && `Notes: ${guest.notes}`,
    `To pay at the club: ${money(r.total)}`, `${siteUrl}/admin`].filter(Boolean).join('\n');
  return { subject: `New booking: ${r.activityName} ${when} — ${name} (${r.players})`, html, text };
}

// ── Event packages ─────────────────────────────────────────────────────────

export interface PaidOrder extends EventOrderView { firstName: string; lastName: string; phone: string; country: string; notes: string; unitPrice: number }

const eventWhen = (o: PaidOrder) => `${dayLabel(o.startsOn)}${o.startTime ? ` · ${timeLabel(o.startTime)}` : ''}`;
const orderLines = (o: PaidOrder): PriceLine[] => [{ label: o.packageName, detail: `${o.quantity} × ${money(o.unitPrice)}`, amount: o.total }];

export function eventGuestEmail(o: PaidOrder, siteUrl: string, site: SiteData) {
  const contact = contactLinks(site.club.contact);
  const when = eventWhen(o);
  const html = shell(`You’re in! ${o.eventTitle} — ${when}`, 'EVENT', `
<p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.12em;color:#50830d">CONFIRMED · ${o.ref}</p>
<h1 style="margin:8px 0 6px;font-size:28px;line-height:1.15">You’re in, ${escape(o.firstName)}!</h1>
<p style="margin:0;color:${C.muted};font-size:15px">Thank you — your place${o.quantity > 1 ? 's are' : ' is'} booked and paid. Quote <strong>${o.ref}</strong> if you get in touch.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background:#d9f5fc;border-radius:14px"><tr><td style="padding:16px 18px">
<p style="margin:0;font-size:20px;font-weight:700;color:#124e39">${escape(o.eventTitle)}</p>
<p style="margin:4px 0 0;font-size:14px">${when} · ${escape(o.packageName)} × ${o.quantity}</p>
</td></tr></table>
${priceTable(orderLines(o), o.total, o.testPayment ? 'Paid (test — nothing charged)' : 'Paid')}
<p style="margin:22px 0 0">${button(`${siteUrl}/events/${o.eventSlug}`, 'See the event')}
&nbsp; <a href="${contact.whatsapp}" style="color:${C.sea};font-weight:700">WhatsApp us</a></p>`, site);
  const text = [`You're in, ${o.firstName}! ${o.eventTitle}`, when, `${o.packageName} × ${o.quantity}`, `Paid: ${money(o.total)}${o.testPayment ? ' (test — nothing charged)' : ''}`, `Reference: ${o.ref}`,
    `${siteUrl}/events/${o.eventSlug}`, `Questions? WhatsApp ${contact.phone} or ${contact.email}`].join('\n');
  return { subject: `You’re in: ${o.eventTitle} — ${o.ref}`, html, text };
}

export function eventClubEmail(o: PaidOrder, siteUrl: string, site: SiteData) {
  const name = `${o.firstName} ${o.lastName}`.trim();
  const whatsapp = whatsappLink(o.phone);
  const html = shell(`${name} · ${o.packageName} × ${o.quantity}`, 'EVENT', `
<p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.12em;color:#50830d">NEW EVENT ORDER · ${o.ref}${o.testPayment ? ' · TEST PAYMENT' : ''}</p>
<h1 style="margin:8px 0 16px;font-size:24px;line-height:1.2">${escape(o.eventTitle)}<br>${escape(o.packageName)} × ${o.quantity}</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row('Guest', escape(name))}
${row('Phone', `${escape(o.phone)}${whatsapp ? ` · <a href="${whatsapp}" style="color:${C.sea}">WhatsApp</a>` : ''}`)}
${row('Email', `<a href="mailto:${escape(o.email)}" style="color:${C.sea}">${escape(o.email)}</a>`)}
${row('Country', escape(countryName(o.country)))}
${o.notes ? row('Notes', escape(o.notes).replace(/\n/g, '<br>')) : ''}
</table>
${priceTable(orderLines(o), o.total, o.testPayment ? 'Paid (test — nothing charged)' : 'Paid online')}
<p style="margin:22px 0 0">${button(`${siteUrl}/admin/events`, 'Open events in the admin')}</p>`, site);
  const text = [`New event order ${o.ref}${o.testPayment ? ' (TEST PAYMENT)' : ''}`, o.eventTitle, `${o.packageName} × ${o.quantity}`, name, `Phone: ${o.phone}`, `Email: ${o.email}`,
    o.notes && `Notes: ${o.notes}`, `Paid: ${money(o.total)}`, `${siteUrl}/admin/events`].filter(Boolean).join('\n');
  return { subject: `Event order: ${o.packageName} × ${o.quantity} — ${name}${o.testPayment ? ' (test)' : ''}`, html, text };
}
