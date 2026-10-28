import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clip, escape, whatsappLink } from './_lib/escape.js';
import { allowMethods, readJsonBody } from './_lib/http.js';
import { sendTemplate, splitAddresses } from './_lib/resend.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: 80, email: 120, phone: 40, topic: 80, message: 2000, stay: 120, page: 80 } as const;
const TEMPLATE = process.env.RESEND_CONTACT_ENQUIRY_TEMPLATE_ID || 'contact-enquiry';
const CONFIRMATION_TEMPLATE = process.env.RESEND_CONTACT_CONFIRMATION_TEMPLATE_ID || 'contact-confirmation';
const krabiTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' });

// Receives the site's contact form and emails it to the resort inbox through
// Resend (https://resend.com), using the "contact-enquiry" template from
// emails/contact-enquiry.html, then thanks the guest with the
// "contact-confirmation" template (publish both with `npm run email:publish`).
// On the enquiry the guest is the reply-to, so a plain "Reply" answers them;
// on the confirmation it's the resort inbox. Needs
// RESEND_API_KEY; RESEND_CONTACT_ENQUIRY_TEMPLATE_ID and
// RESEND_CONTACT_CONFIRMATION_TEMPLATE_ID default to the template aliases.
// CONTACT_TO (default reservation@hulahularesort.com), CONTACT_BCC (default
// contact@bluetrendy.com, blind-copied so the resort doesn't see it; comma-separated, or empty for none), CONTACT_FROM
// (an address on a domain verified in Resend) and SITE_URL are optional
// overrides. Bots that fill the hidden "hp_ref" field, or submit faster than
// a person could, get a quiet success and no email.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['POST'])) return;
  res.setHeader('Cache-Control', 'no-store');

  const body = readJsonBody(req);
  if (body.hp_ref) {
    console.info('Contact submission ignored: honeypot filled');
    return res.status(200).json({ ok: true });
  }
  // Measure elapsed time in the browser; comparing its wall clock with the
  // server clock can silently discard legitimate guests whose clock is ahead.
  if (typeof body.elapsedMs === 'number' && Number.isFinite(body.elapsedMs) && body.elapsedMs < 2500) {
    console.info('Contact submission rejected: submitted too quickly');
    return res.status(429).json({ error: 'Please wait a few seconds and try again.' });
  }

  const field = (key: keyof typeof LIMITS) => (typeof body[key] === 'string' ? (body[key] as string).trim().slice(0, LIMITS[key]) : '');
  const name = field('name');
  const email = field('email');
  const phone = field('phone');
  const topic = field('topic') || 'General question';
  const message = field('message');
  const stay = field('stay');
  const page = field('page');
  if (!name || !EMAIL.test(email) || message.length < 2) {
    return res.status(400).json({ error: 'Please add your name, a valid email address and a message.' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Contact email is not configured: RESEND_API_KEY missing');
    return res.status(500).json({ error: 'Email is not configured on the server' });
  }
  const to = process.env.CONTACT_TO || 'reservation@hulahularesort.com';
  const bcc = splitAddresses(process.env.CONTACT_BCC ?? 'contact@bluetrendy.com');
  const from = process.env.CONTACT_FROM || 'Hula Hula Resort <reservation@hulahularesort.com>';
  const siteUrl = process.env.SITE_URL || `https://${req.headers['x-forwarded-host'] ?? req.headers.host}`;
  const whatsapp = whatsappLink(phone);

  // Optional details are left undefined (and so out of the JSON) when the
  // guest skipped them; the template's fallbacks fill those in.
  const variables = {
    GUEST_NAME: escape(name),
    GUEST_EMAIL: escape(email),
    GUEST_PHONE: phone ? escape(phone) : undefined,
    TOPIC: escape(topic),
    MESSAGE: clip(escape(message)),
    PREVIEW: escape(message.slice(0, 120)),
    STAY: stay ? escape(stay) : undefined,
    SENT_AT: krabiTime.format(new Date()),
    PAGE: page ? `“${escape(page)}”` : undefined,
    REPLY_SUBJECT: encodeURIComponent(`Re: ${topic} — Hula Hula Resort`),
    WHATSAPP_URL: whatsapp,
    WHATSAPP_DISPLAY: whatsapp ? 'inline-block' : undefined,
    SITE_URL: escape(siteUrl),
  };

  try {
    const upstream = await sendTemplate({ from, to: [to], bcc, replyTo: email, subject: `New enquiry: ${topic} — ${name}`, template: TEMPLATE, variables });
    if (!upstream.ok) {
      console.error('Resend refused the enquiry', upstream.status, upstream.body);
      return res.status(502).json({ error: 'The email service refused the message' });
    }
    console.info('Resend accepted the contact enquiry');
  } catch (error) {
    console.error('Could not reach Resend for the contact enquiry', error);
    return res.status(502).json({ error: 'Could not reach the email service' });
  }

  // Only once the resort has the message: a thank-you to the guest. It never
  // fails the request — the enquiry itself is already delivered.
  try {
    const confirmation = await sendTemplate({
      from, to: [email], replyTo: to, subject: 'We’ve got your message — Hula Hula Resort', template: CONFIRMATION_TEMPLATE,
      variables: {
        GUEST_FIRST_NAME: escape(name.split(/\s+/)[0]),
        TOPIC: escape(topic),
        STAY: stay ? escape(stay) : undefined,
        STAY_DISPLAY: stay ? 'block' : undefined,
        SITE_URL: escape(siteUrl),
      },
    });
    if (!confirmation.ok) console.error('Resend refused the guest confirmation', confirmation.status, confirmation.body);
    else console.info('Resend accepted the guest confirmation');
  } catch (error) {
    console.error('Could not send the guest confirmation', error);
  }
  return res.status(200).json({ ok: true });
}
