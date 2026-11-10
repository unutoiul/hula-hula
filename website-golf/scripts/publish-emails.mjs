// Uploads the emails in emails/ to Resend as templates (creating each the
// first time, updating it after) and publishes them, which the api/ functions
// need before they can send. Same Resend account as the resort, so every
// alias starts with "golf-":
//   golf-booking-confirmation → the guest, their tee time
//   golf-booking-notification → the club inbox: a new online tee time
//   golf-event-confirmation   → the guest, their paid event places
//   golf-event-notification   → the club inbox: a new paid event order
// Run `npm run email:publish` after every edit; it reads RESEND_API_KEY from
// .env.local or the shell. Variables with a fallback are optional — the API
// leaves them out when there's nothing to say.
import { readFile } from 'node:fs/promises';

const HIDDEN = 'none;mso-hide:all';
const SITE_URL = { key: 'SITE_URL', type: 'string', fallback_value: process.env.SITE_URL || 'https://hulahula-golf.vercel.app' };
const CLUB = [
  { key: 'CLUB_AREA', type: 'string', fallback_value: 'near Krabi International Airport, Krabi, Thailand' },
  { key: 'CLUB_EMAIL', type: 'string' },
  SITE_URL,
];
const CLUB_CONTACT = [
  { key: 'CLUB_PHONE', type: 'string' },
  { key: 'CLUB_TEL', type: 'string' },
  { key: 'WHATSAPP_URL', type: 'string' },
];
const TEE_TIME = [
  { key: 'BOOKING_REF', type: 'string' },
  { key: 'PREVIEW', type: 'string' },
  { key: 'TEE_TIME', type: 'string' },
  { key: 'TEE_DAY', type: 'string' },
  { key: 'ACTIVITY', type: 'string' },
  { key: 'GROUP', type: 'string' },
  { key: 'LINES_HTML', type: 'string' },
  { key: 'TOTAL', type: 'string' },
  { key: 'PAID_LABEL', type: 'string', fallback_value: 'Paid online' },
  { key: 'PAID_AMOUNT', type: 'string', fallback_value: '' },
  { key: 'BALANCE', type: 'string', fallback_value: '' },
  { key: 'BALANCE_DISPLAY', type: 'string', fallback_value: HIDDEN },
];
const ORDER = [
  { key: 'ORDER_REF', type: 'string' },
  { key: 'PREVIEW', type: 'string' },
  { key: 'EVENT_TITLE', type: 'string' },
  { key: 'EVENT_WHEN', type: 'string' },
  { key: 'PACKAGE_NAME', type: 'string' },
  { key: 'PACKAGE_DETAIL', type: 'string' },
  { key: 'TOTAL', type: 'string' },
  { key: 'PAID_LABEL', type: 'string', fallback_value: 'Paid online' },
];

const TEMPLATES = [
  {
    alias: 'golf-booking-confirmation',
    name: 'Golf club tee time confirmation (to the guest)',
    subject: 'You’re on the tee sheet — Hula Hula Golf Club',
    file: 'golf-booking-confirmation.html',
    variables: [
      ...TEE_TIME, ...CLUB, ...CLUB_CONTACT,
      { key: 'GUEST_FIRST_NAME', type: 'string', fallback_value: 'there' },
      { key: 'PICKUP_LINE', type: 'string', fallback_value: '' },
      { key: 'PICKUP_DISPLAY', type: 'string', fallback_value: HIDDEN },
      { key: 'RULES_HTML', type: 'string' },
    ],
  },
  {
    alias: 'golf-booking-notification',
    name: 'Golf club tee time (to the club)',
    subject: 'New online tee time',
    file: 'golf-booking-notification.html',
    variables: [
      ...TEE_TIME, ...CLUB,
      { key: 'GUEST_NAME', type: 'string' },
      { key: 'GUEST_EMAIL', type: 'string' },
      { key: 'GUEST_PHONE', type: 'string' },
      { key: 'GUEST_COUNTRY', type: 'string' },
      { key: 'HANDICAP', type: 'string', fallback_value: 'Not given' },
      { key: 'EXPERIENCE', type: 'string', fallback_value: 'Not asked' },
      { key: 'RENTALS', type: 'string', fallback_value: 'None' },
      { key: 'SHUTTLE', type: 'string', fallback_value: 'Making their own way' },
      { key: 'NOTES', type: 'string', fallback_value: 'None' },
      { key: 'WHATSAPP_URL', type: 'string', fallback_value: 'https://wa.me/' },
      { key: 'WHATSAPP_DISPLAY', type: 'string', fallback_value: HIDDEN },
      { key: 'FLAGS_HTML', type: 'string', fallback_value: '' },
      { key: 'FLAGS_DISPLAY', type: 'string', fallback_value: HIDDEN },
    ],
  },
  {
    alias: 'golf-event-confirmation',
    name: 'Golf club event order confirmation (to the guest)',
    subject: 'You’re in! — Hula Hula Golf Club',
    file: 'golf-event-confirmation.html',
    variables: [
      ...ORDER, ...CLUB, ...CLUB_CONTACT,
      { key: 'GUEST_FIRST_NAME', type: 'string', fallback_value: 'there' },
      { key: 'PLACES_TEXT', type: 'string', fallback_value: 'your place is booked and paid' },
      { key: 'EVENT_URL', type: 'string' },
    ],
  },
  {
    alias: 'golf-event-notification',
    name: 'Golf club event order (to the club)',
    subject: 'New event order',
    file: 'golf-event-notification.html',
    variables: [
      ...ORDER, ...CLUB,
      { key: 'GUEST_NAME', type: 'string' },
      { key: 'GUEST_EMAIL', type: 'string', fallback_value: 'Not given' },
      { key: 'GUEST_PHONE', type: 'string' },
      { key: 'GUEST_COUNTRY', type: 'string' },
      { key: 'NOTES', type: 'string', fallback_value: 'None' },
      { key: 'FLAGS_HTML', type: 'string', fallback_value: '' },
      { key: 'FLAGS_DISPLAY', type: 'string', fallback_value: HIDDEN },
      { key: 'WHATSAPP_URL', type: 'string', fallback_value: 'https://wa.me/' },
      { key: 'WHATSAPP_DISPLAY', type: 'string', fallback_value: HIDDEN },
    ],
  },
];

// A placeholder without a declared variable would go out as literal text, so
// check every template against its list before touching Resend.
for (const template of TEMPLATES) {
  template.html = await readFile(new URL(`../emails/${template.file}`, import.meta.url), 'utf8');
  const used = new Set([...template.html.matchAll(/\{\{\{\s*(\w+)\s*\}\}\}/g)].map((match) => match[1]));
  const declared = new Set(template.variables.map((variable) => variable.key));
  const undeclared = [...used].filter((key) => !declared.has(key));
  const unused = [...declared].filter((key) => !used.has(key));
  if (undeclared.length || unused.length || declared.size !== template.variables.length) {
    console.error(`${template.file}: template and variables don't match.${undeclared.length ? ` Undeclared: ${undeclared.join(', ')}.` : ''}${unused.length ? ` Unused: ${unused.join(', ')}.` : ''}${declared.size !== template.variables.length ? ' A variable is declared twice.' : ''}`);
    process.exit(1);
  }
}

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('Templates look good. Set RESEND_API_KEY (e.g. in .env.local) to upload them.');
  process.exit(1);
}

async function resend(method, path, body) {
  const response = await fetch(`https://api.resend.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  return { status: response.status, ok: response.ok, data: await response.json().catch(() => ({})) };
}

for (const { alias, name, subject, html, variables } of TEMPLATES) {
  const template = { name, alias, subject, html, variables };
  let saved = await resend('PATCH', `/templates/${alias}`, template);
  const created = saved.status === 404;
  if (created) saved = await resend('POST', '/templates', template);
  if (!saved.ok) {
    console.error(`Resend refused "${alias}" (${saved.status}):`, saved.data);
    process.exit(1);
  }
  const published = await resend('POST', `/templates/${saved.data.id}/publish`);
  if (!published.ok) {
    console.error(`Saved "${alias}" but Resend refused to publish it (${published.status}):`, published.data);
    process.exit(1);
  }
  console.log(`${created ? 'Created' : 'Updated'} and published "${alias}" (${saved.data.id}).`);
}
