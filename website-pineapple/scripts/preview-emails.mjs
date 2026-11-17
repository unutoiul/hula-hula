// Generate safe, local previews. All guest details below are fictional.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const output = new URL('../public/email/previews/', import.meta.url);
await mkdir(output, { recursive: true });
const values = {
  SITE_URL: 'http://localhost:3004', GUEST_FIRST_NAME: 'Alex', GUEST_NAME: 'Alex Example',
  GUEST_EMAIL: 'alex@example.invalid', GUEST_PHONE: '+00 000 000 000',
  GUEST_COUNTRY: 'Thailand', TOPIC: 'A little holiday in Krabi',
  MESSAGE: 'Hello! Could you help us plan a quiet weekend and a little pool time?',
  PREVIEW: 'A little holiday at Royal Pineapple Hotel', STAY: '10–12 December 2026',
  SENT_AT: '17 November 2026, 14:30', PAGE: 'Hotel website', REPLY_SUBJECT: 'Your%20enquiry',
  BOOKING_REF: 'RP-PREVIEW', CHECK_IN: '10 December 2026', CHECK_OUT: '12 December 2026',
  CHECK_IN_TIME: '3:00 pm', CHECK_OUT_TIME: '12:00 noon', NIGHTS: '2 nights', GUESTS: '2 adults',
  ROOMS_HTML: '<tr><td style="padding:16px 0;font:14px/1.6 Arial, sans-serif;color:#5a2448;"><strong>1 × Deluxe Double Room</strong><br>Room with breakfast · 2 adults</td><td align="right" style="font:14px/1.6 Arial, sans-serif;color:#5a2448;">THB 6,000</td></tr>',
  TOTAL: 'THB 6,000', PAID_NOW: 'THB 3,000', PAID_AMOUNT: 'THB 3,000', BALANCE: 'THB 3,000',
  CANCELLATION: 'Preview only. The cancellation terms from the selected rate appear here.',
  ARRIVAL_TIME: '4:00 pm', SPECIAL_REQUESTS: 'A quiet room, please.', PAID_AT: '17 November 2026, 14:30',
  PAYMENT_CHANNEL: 'Card', PROMO_CODE: 'None', KEY_BLOCK: 'Guest: Alex Example<br>Booking: RP-PREVIEW<br>Preview only — no booking or payment has been made.',
  PROMO_DISPLAY: 'none;mso-hide:all', FLAGS_DISPLAY: 'none;mso-hide:all', WHATSAPP_DISPLAY: 'none;mso-hide:all',
  BALANCE_DISPLAY: 'table-row', STAY_DISPLAY: 'table-cell',
};
const names = ['contact-confirmation', 'booking-confirmation', 'contact-enquiry', 'booking-notification'];
for (const name of names) {
  let html = await readFile(new URL(`../emails/${name}.html`, import.meta.url), 'utf8');
  html = html.replace(/\{\{\{\s*(\w+)\s*\}\}\}/g, (_, key) => values[key] ?? '');
  html = html.replace(/cid:royal-pineapple-logo/g, '../royal-pineapple-logo.png')
    .replace(/cid:royal-pineapple-stationery/g, '../royal-pineapple-stationery.jpg')
    .replace(/cid:royal-pineapple-riviera/g, '../royal-pineapple-riviera.jpg');
  await writeFile(new URL(`${name}.html`, output), html);
}
await writeFile(new URL('index.html', output), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Royal Pineapple email previews</title><body style="background:#fff9f2;color:#5a2448;font:16px/1.8 Arial,sans-serif;padding:32px;max-width:700px;margin:auto"><h1 style="font:40px/1.1 Georgia,serif">A little sunshine in your inbox.</h1><p>Royal Pineapple transactional email previews. All guest details are fictional.</p><ul>${names.map(name => `<li><a style="color:#b52660" href="${name}.html">${name.replaceAll('-', ' ')}</a></li>`).join('')}</ul><p><a style="color:#b52660" href="/">Back to the hotel</a></p></body></html>`);
console.log('Generated four safe previews at /email/previews/');
