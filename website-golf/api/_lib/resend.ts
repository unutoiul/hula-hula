// Sending through Resend's REST API (https://resend.com/docs/api-reference) —
// the same account the resort uses. Network failures throw; a refusal comes
// back as ok: false so the caller decides whether it's fatal.

export interface SendResult { ok: boolean; status: number; body: string }

export const emailConfigured = () => !!process.env.RESEND_API_KEY;

export async function sendEmail({ from, to, bcc, replyTo, subject, html, text }: { from: string; to: string[]; bcc?: string[]; replyTo?: string; subject: string; html: string; text: string }): Promise<SendResult> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, ...(bcc?.length && { bcc }), ...(replyTo && { reply_to: replyTo }), subject, html, text }),
  });
  return { ok: response.ok, status: response.status, body: response.ok ? '' : await response.text() };
}

export const splitAddresses = (value: string) => value.split(',').map((address) => address.trim()).filter(Boolean);
