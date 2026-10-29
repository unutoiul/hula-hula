import { activityById, clubRules, RENTALS } from '../../src/booking/config.ts';
import type { Guest, Reservation } from '../../src/booking/contract.ts';
import { countryName } from '../../src/booking/countries.ts';
import { dayLabel, durationLabel, timeLabel } from '../../src/booking/dates.ts';
import { money, plural } from '../../src/booking/pricing.ts';
import { CONTACT } from '../../src/data/contact.ts';
import { escape, whatsappLink } from './escape.ts';

// The two booking emails, as plain inline-styled HTML (plus a text version):
// the guest's confirmation and the club's "new booking" alert. Brand colours
// from the website; tables, because that's what every email client renders.

const C = { cream: '#fffdf3', paper: '#fffef8', sea: '#006d8a', ink: '#173c2c', muted: '#4b6457', lime: '#e7f4cc', sun: '#f9f70c', line: '#d6e1ce' };
const FONT = `font-family: 'DM Sans', Arial, sans-serif;`;

function shell(preheader: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:${C.cream};${FONT}color:${C.ink}">
<span style="display:none;max-height:0;overflow:hidden">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.paper};border:1px solid ${C.line};border-radius:20px;overflow:hidden">
<tr><td style="background:${C.sea};padding:18px 28px;color:#fff;font-size:20px;font-weight:700;letter-spacing:.02em">Hula Hula Golf Club <span style="display:inline-block;margin-left:6px;padding:2px 10px;border-radius:99px;background:${C.sun};color:${C.ink};font-size:11px;letter-spacing:.12em;vertical-align:middle">TEE TIME</span></td></tr>
<tr><td style="padding:28px">${body}</td></tr>
</table>
<p style="${FONT}font-size:12px;color:${C.muted};margin:16px 0 0">Hula Hula Golf Club · ${escape(CONTACT.area)}<br>WhatsApp ${CONTACT.phone} · Line ${CONTACT.lineId} · ${CONTACT.email}</p>
</td></tr></table></body></html>`;
}

const row = (label: string, value: string) => `<tr><td style="padding:6px 0;color:${C.muted};font-size:14px;width:38%;vertical-align:top">${label}</td><td style="padding:6px 0;font-size:14px;font-weight:600">${value}</td></tr>`;

function summary(r: Reservation) {
  const activity = activityById(r.activity)!;
  const option = activity.options.find((o) => o.id === r.option)!;
  const people = plural(r.players, activity.id === 'lesson' ? 'person' : 'player', activity.id === 'lesson' ? 'people' : 'players');
  return { activity, option, people, when: `${timeLabel(r.time)} · ${dayLabel(r.date)}` };
}

function priceTable(r: Reservation) {
  const lines = r.lines.map((line) => `<tr><td style="padding:4px 0;font-size:14px">${escape(line.label)}${line.detail ? `<span style="color:${C.muted};font-size:12px"> · ${escape(line.detail)}</span>` : ''}</td><td align="right" style="padding:4px 0;font-size:14px">${money(line.amount)}</td></tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-top:1px solid ${C.line};padding-top:10px">${lines}
<tr><td style="padding:10px 0 0;font-weight:700">To pay at the club</td><td align="right" style="padding:10px 0 0;font-size:20px;font-weight:700;color:${C.sea}">${money(r.total)}</td></tr></table>`;
}

export function guestEmail(r: Reservation, guest: Guest, siteUrl: string) {
  const { activity, option, people, when } = summary(r);
  const first = escape(guest.firstName);
  const pickup = r.transfer ? `Free pick-up at ${timeLabel(r.transfer)} from ${escape(r.pickupFrom)} — we’ll confirm the spot on WhatsApp.` : '';
  const rules = clubRules(activity.wear).map((rule) => `<li style="margin:0 0 6px"><strong>${rule.title}.</strong> ${escape(rule.text)}</li>`).join('');
  const html = shell(`You’re on the tee sheet — ${when}`, `
<p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.12em;color:#50830d">BOOKED · ${r.ref}</p>
<h1 style="margin:8px 0 6px;font-size:28px;line-height:1.15">You’re on the tee sheet, ${first}!</h1>
<p style="margin:0;color:${C.muted};font-size:15px">Here’s your booking. Quote <strong>${r.ref}</strong> if you need to change anything.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background:#d9f5fc;border-radius:14px"><tr><td style="padding:16px 18px">
<p style="margin:0;font-size:20px;font-weight:700;color:#124e39">${when}</p>
<p style="margin:4px 0 0;font-size:14px">${activity.name} · ${escape(option.label)} · ${people} · about ${durationLabel(r.minutes)}</p>
${pickup ? `<p style="margin:8px 0 0;font-size:13px">${pickup}</p>` : ''}
</td></tr></table>
${priceTable(r)}
<h2 style="margin:24px 0 8px;font-size:18px">Before you come</h2>
<ul style="margin:0;padding-left:18px;font-size:14px;color:${C.ink}">${rules}</ul>
<p style="margin:22px 0 0"><a href="${CONTACT.whatsapp}?text=${encodeURIComponent(`Hi! About my booking ${r.ref}: `)}" style="display:inline-block;background:${C.sea};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:99px">WhatsApp us</a>
&nbsp; <a href="${siteUrl}" style="color:${C.sea};font-weight:700">Visit the website</a></p>`);
  const text = [`You're on the tee sheet, ${guest.firstName}! Booking ${r.ref}`, when, `${activity.name} · ${option.label} · ${people}`,
    r.transfer ? `Free pick-up at ${timeLabel(r.transfer)} from ${r.pickupFrom}` : '', '',
    ...r.lines.map((l) => `${l.label}${l.detail ? ` (${l.detail})` : ''}: ${money(l.amount)}`), `To pay at the club: ${money(r.total)}`, '',
    ...clubRules(activity.wear).map((rule) => `- ${rule.title}. ${rule.text}`), '', `Questions? WhatsApp ${CONTACT.phone} or ${CONTACT.email}`].filter((l, i, all) => l || all[i - 1]).join('\n');
  return { subject: `Booked: ${activity.name} ${when} — ${r.ref}`, html, text };
}

export function clubEmail(r: Reservation, guest: Guest, experience: string, siteUrl: string) {
  const { activity, option, people, when } = summary(r);
  const name = `${guest.firstName} ${guest.lastName}`.trim();
  const whatsapp = whatsappLink(guest.phone);
  const rentals = RENTALS.filter((rent) => (r.rentals[rent.id] ?? 0) > 0).map((rent) => `${r.rentals[rent.id]} × ${rent.label}`).join(', ');
  const html = shell(`${name} · ${activity.name} ${when}`, `
<p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.12em;color:#50830d">NEW ONLINE BOOKING · ${r.ref}</p>
<h1 style="margin:8px 0 16px;font-size:24px;line-height:1.2">${activity.name} · ${escape(option.label)}<br>${when}</h1>
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
${priceTable(r)}
<p style="margin:22px 0 0"><a href="${siteUrl}/admin" style="display:inline-block;background:${C.sea};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:99px">Open the tee sheet</a></p>`);
  const text = [`New online booking ${r.ref}`, `${activity.name} · ${option.label} · ${when}`, `${name} · ${people}`, `Phone: ${guest.phone}`, `Email: ${guest.email}`,
    experience && `Experience: ${experience}`, rentals && `Rental clubs: ${rentals}`, r.transfer && `Shuttle: ${timeLabel(r.transfer)} pick-up from ${r.pickupFrom}`, guest.notes && `Notes: ${guest.notes}`,
    `To pay at the club: ${money(r.total)}`, `${siteUrl}/admin`].filter(Boolean).join('\n');
  return { subject: `New booking: ${activity.name} ${when} — ${name} (${r.players})`, html, text };
}
