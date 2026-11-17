These four transactional emails belong to Royal Pineapple Hotel. The HTML and plain-text versions are the source of truth; `scripts/publish-contact-email.mjs` validates placeholders and publishes only the `rp-` aliases, preserving the resort's separate templates.

Guest confirmations reuse the retired postcard invitation and the text-free Riviera artwork. The original PNG artwork remains in `assets/`; optimized PNG/JPEG email versions live in `public/email/`.

Images use `cid:royal-pineapple-logo`, `cid:royal-pineapple-stationery`, and `cid:royal-pineapple-riviera`. `api/_lib/resend.ts` attaches the corresponding files inline on every template send, and `vercel.json` includes the files in API bundles. No external image hosting or website deployment is required for images in sent emails. A manual send from another integration must include the same CID attachments; Resend's template-only dashboard preview cannot display CID files by itself.

Run `node scripts/publish-contact-email.mjs --check` to validate without network access. Publish with `npm run email:publish`; set `SITE_URL` to the production website when publishing rather than a local preview address. Sender and destination settings come from the project's environment; use the verified sending domain and the hotel's reservation inbox.

No guest email is sent by the publishing script. Booking amounts, optional rows, payment checks, cancellation terms, escaping and idempotency are handled by the existing API flow.
