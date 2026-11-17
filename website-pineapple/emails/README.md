These four transactional emails belong to Royal Pineapple Hotel. The HTML and plain-text versions are the source of truth for the published `rp-` templates in Resend (the resort's templates are separate).

Guest confirmations reuse the retired postcard invitation and the text-free Riviera artwork. The original PNG artwork remains in `assets/`; optimized PNG/JPEG email versions live in `public/email/`.

Images use `cid:royal-pineapple-logo`, `cid:royal-pineapple-stationery`, and `cid:royal-pineapple-riviera`. `api/_lib/resend.ts` attaches the corresponding files inline on every template send, and `vercel.json` includes the files in API bundles. No external image hosting or website deployment is required for images in sent emails. A manual send from another integration must include the same CID attachments; Resend's template-only dashboard preview cannot display CID files by itself.

After editing a file here, update the matching template in Resend (alias `rp-<name>`) and publish it; the API always passes `SITE_URL`, so the template's fallback only matters for manual sends. Sender and destination settings come from the project's environment; use the verified sending domain and the hotel's reservation inbox.

Booking amounts, optional rows, payment checks, cancellation terms, escaping and idempotency are handled by the existing API flow.
