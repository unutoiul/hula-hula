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

/** Every email the site sends is also blind-copied to Bluetrendy, who look after the website. */
export const ALWAYS_BCC = 'contact@bluetrendy.com';

const isAlwaysBcc = (address: string) => address.trim().toLowerCase() === ALWAYS_BCC;

/**
 * Who an email visibly goes to: never Bluetrendy, who only ever get the hidden
 * copy, so no guest or member of staff sees it (unless it's the only address).
 */
export function visibleTo(to: string[]): string[] {
  const others = to.filter((address) => !isAlwaysBcc(address));
  return others.length ? others : to;
}

/** The blind copies for an email: any it asked for, plus ALWAYS_BCC, never repeating an address it's already sent to. */
export function withCopies(to: string[], bcc: string[] = []): string[] {
  const sentTo = new Set(to.map((address) => address.toLowerCase()));
  const copies = new Map([...bcc, ALWAYS_BCC].map((address) => [address.toLowerCase(), address] as const));
  return [...copies].filter(([key]) => !sentTo.has(key)).map(([, address]) => address);
}

export function sendTemplate({ from, to: recipients, bcc: asked, replyTo, subject, template, variables, idempotencyKey }: TemplateEmail): Promise<SendResult> {
  const to = visibleTo(recipients);
  const bcc = withCopies(to, asked);
  return post({ from, to, ...(bcc.length && { bcc }), ...(replyTo && { reply_to: replyTo }), subject, template: { id: template, variables } }, idempotencyKey);
}

/** A plain-text note for the team, for things that need a human (a payment we can't match, a handoff that keeps failing). */
export function sendText({ from, to: asked, subject, text }: { from: string; to: string[]; subject: string; text: string }): Promise<SendResult> {
  const to = visibleTo(asked);
  const bcc = withCopies(to);
  return post({ from, to, ...(bcc.length && { bcc }), subject, text });
}

export const splitAddresses = (value: string) => value.split(',').map((address) => address.trim()).filter(Boolean);
