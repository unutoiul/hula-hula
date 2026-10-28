// Sending through Resend's REST API (https://resend.com/docs/api-reference),
// with the published templates in emails/. Network failures throw; a refusal
// comes back as ok: false so the caller decides whether it's fatal.

export interface TemplateEmail {
  from: string;
  to: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  template: string;
  variables: Record<string, string | undefined>;
  /** Resend ignores a repeat send with the same key, so a retried webhook can't email twice. */
  idempotencyKey?: string;
}

export interface SendResult { ok: boolean; status: number; body: string }

function apiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  return key;
}

async function post(payload: Record<string, unknown>, idempotencyKey?: string): Promise<SendResult> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json', ...(idempotencyKey && { 'Idempotency-Key': idempotencyKey }) },
    body: JSON.stringify(payload),
  });
  return { ok: response.ok, status: response.status, body: response.ok ? '' : await response.text() };
}

export function sendTemplate({ from, to, bcc, replyTo, subject, template, variables, idempotencyKey }: TemplateEmail): Promise<SendResult> {
  return post({ from, to, ...(bcc?.length && { bcc }), ...(replyTo && { reply_to: replyTo }), subject, template: { id: template, variables } }, idempotencyKey);
}

/** A plain-text note for the team, for things that need a human (a payment we can't match, a handoff that keeps failing). */
export function sendText({ from, to, subject, text }: { from: string; to: string[]; subject: string; text: string }): Promise<SendResult> {
  return post({ from, to, subject, text });
}

export const splitAddresses = (value: string) => value.split(',').map((address) => address.trim()).filter(Boolean);
