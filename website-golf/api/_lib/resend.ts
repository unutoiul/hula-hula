// Sending through Resend's REST API (https://resend.com/docs/api-reference) —
// the same account the resort uses — with the published templates in emails/
// (`npm run email:publish`). Network failures throw; a refusal comes back as
// ok: false so the caller decides whether it's fatal.

export interface TemplateEmail {
  from: string;
  to: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  template: string;
  variables: Record<string, string | undefined>;
  /** Resend ignores a repeat send with the same key, so a retry can't email twice. */
  idempotencyKey?: string;
}

export interface SendResult { ok: boolean; status: number; body: string }

export const emailConfigured = () => !!process.env.RESEND_API_KEY;

export async function sendTemplate({ from, to, bcc, replyTo, subject, template, variables, idempotencyKey }: TemplateEmail): Promise<SendResult> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', ...(idempotencyKey && { 'Idempotency-Key': idempotencyKey }) },
    body: JSON.stringify({ from, to, ...(bcc?.length && { bcc }), ...(replyTo && { reply_to: replyTo }), subject, template: { id: template, variables } }),
  });
  return { ok: response.ok, status: response.status, body: response.ok ? '' : await response.text() };
}

export const splitAddresses = (value: string) => value.split(',').map((address) => address.trim()).filter(Boolean);
