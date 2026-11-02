// Uploads the emails in emails/ to Resend as templates (creating each the
// first time, updating it after) and publishes them, which the api/ functions
// need before they can send:
//   contact-enquiry      → the resort inbox, with the guest's message
//   contact-confirmation → the guest, a thank-you saying we got it
//   booking-notification → the resort inbox: a paid website booking to enter in SiteMinder
//   booking-confirmation → the guest, their booking confirmation
// Run `npm run email:publish` after every edit; it reads RESEND_API_KEY from
// .env.local or the shell. Variables with a fallback are optional — the API
// leaves them out when the guest didn't give that detail.
import { readFile } from 'node:fs/promises';

const SITE_URL = { key: 'SITE_URL', type: 'string', ...(process.env.SITE_URL && { fallback_value: process.env.SITE_URL }) };

const TEMPLATES = [
  {
    alias: 'contact-enquiry',
    name: 'Website contact enquiry',
    subject: 'New enquiry from the Hula Hula website',
    file: 'contact-enquiry.html',
    variables: [
      { key: 'GUEST_NAME', type: 'string' },
      { key: 'GUEST_EMAIL', type: 'string' },
      { key: 'GUEST_PHONE', type: 'string', fallback_value: 'Not given' },
      { key: 'TOPIC', type: 'string' },
      { key: 'MESSAGE', type: 'string' },
      { key: 'PREVIEW', type: 'string' },
      { key: 'STAY', type: 'string', fallback_value: 'No dates given' },
      { key: 'SENT_AT', type: 'string' },
      { key: 'PAGE', type: 'string', fallback_value: 'the website' },
      { key: 'REPLY_SUBJECT', type: 'string', fallback_value: encodeURIComponent('Re: Your enquiry — Hula Hula Resort') },
      { key: 'WHATSAPP_URL', type: 'string', fallback_value: 'https://wa.me/' },
      { key: 'WHATSAPP_DISPLAY', type: 'string', fallback_value: 'none;mso-hide:all' },
      SITE_URL,
    ],
  },
  {
    alias: 'contact-confirmation',
    name: 'Website contact confirmation (to the guest)',
    subject: 'We’ve got your message — Hula Hula Resort',
    file: 'contact-confirmation.html',
    variables: [
      { key: 'GUEST_FIRST_NAME', type: 'string', fallback_value: 'there' },
      { key: 'TOPIC', type: 'string' },
      { key: 'STAY', type: 'string', fallback_value: '' },
      { key: 'STAY_DISPLAY', type: 'string', fallback_value: 'none;mso-hide:all' },
      SITE_URL,
    ],
  },
  {
    alias: 'booking-notification',
    name: 'Website booking (to the resort)',
    subject: 'New website booking',
    file: 'booking-notification.html',
    variables: [
      { key: 'BOOKING_REF', type: 'string' },
      { key: 'PREVIEW', type: 'string' },
      { key: 'GUEST_NAME', type: 'string' },
      { key: 'GUEST_EMAIL', type: 'string', fallback_value: 'Not given' },
      { key: 'GUEST_PHONE', type: 'string', fallback_value: 'Not given' },
      { key: 'GUEST_COUNTRY', type: 'string' },
      { key: 'ARRIVAL_TIME', type: 'string', fallback_value: 'Not given' },
      { key: 'SPECIAL_REQUESTS', type: 'string', fallback_value: 'None' },
      { key: 'CHECK_IN', type: 'string' },
      { key: 'CHECK_OUT', type: 'string' },
      { key: 'NIGHTS', type: 'string' },
      { key: 'GUESTS', type: 'string' },
      { key: 'ROOMS_HTML', type: 'string' },
      { key: 'TOTAL', type: 'string' },
      { key: 'PAID_AMOUNT', type: 'string' },
      { key: 'BALANCE', type: 'string' },
      { key: 'PAID_AT', type: 'string', fallback_value: '—' },
      { key: 'PAYMENT_CHANNEL', type: 'string', fallback_value: '—' },
      { key: 'INVOICE_NO', type: 'string' },
      { key: 'TRAN_REF', type: 'string', fallback_value: '—' },
      { key: 'APPROVAL_CODE', type: 'string', fallback_value: '—' },
      { key: 'PROMO_CODE', type: 'string', fallback_value: 'None' },
      { key: 'FLAGS_HTML', type: 'string', fallback_value: '' },
      { key: 'FLAGS_DISPLAY', type: 'string', fallback_value: 'none;mso-hide:all' },
      { key: 'KEY_BLOCK', type: 'string' },
      { key: 'WHATSAPP_URL', type: 'string', fallback_value: 'https://wa.me/' },
      { key: 'WHATSAPP_DISPLAY', type: 'string', fallback_value: 'none;mso-hide:all' },
      SITE_URL,
    ],
  },
  {
    alias: 'booking-confirmation',
    name: 'Website booking confirmation (to the guest)',
    subject: 'You’re booked! — Hula Hula Resort',
    file: 'booking-confirmation.html',
    variables: [
      { key: 'GUEST_FIRST_NAME', type: 'string', fallback_value: 'there' },
      { key: 'BOOKING_REF', type: 'string' },
      { key: 'PREVIEW', type: 'string' },
      { key: 'CHECK_IN', type: 'string' },
      { key: 'CHECK_OUT', type: 'string' },
      { key: 'CHECK_IN_TIME', type: 'string', fallback_value: '3:00 pm' },
      { key: 'CHECK_OUT_TIME', type: 'string', fallback_value: '12:00 noon' },
      { key: 'NIGHTS', type: 'string' },
      { key: 'GUESTS', type: 'string' },
      { key: 'ROOMS_HTML', type: 'string' },
      { key: 'TOTAL', type: 'string' },
      { key: 'PAID_NOW', type: 'string' },
      { key: 'BALANCE', type: 'string' },
      { key: 'BALANCE_DISPLAY', type: 'string', fallback_value: 'none;mso-hide:all' },
      { key: 'CANCELLATION', type: 'string' },
      { key: 'PAYMENT_REF', type: 'string' },
      { key: 'PROMO_LINE', type: 'string', fallback_value: '' },
      { key: 'PROMO_DISPLAY', type: 'string', fallback_value: 'none;mso-hide:all' },
      SITE_URL,
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
  if (undeclared.length || unused.length) {
    console.error(`${template.file}: template and variables don't match.${undeclared.length ? ` Undeclared: ${undeclared.join(', ')}.` : ''}${unused.length ? ` Unused: ${unused.join(', ')}.` : ''}`);
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
