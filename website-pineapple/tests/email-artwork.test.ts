import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { it } from 'node:test';
import { sendTemplate } from '../api/_lib/resend.ts';

it('transactional templates receive every CID image as real inline file content', async t => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 'synthetic-key-never-sent';
  t.after(() => { if (previous === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previous; });
  let payload: Record<string, any> = {};
  t.mock.method(globalThis, 'fetch', async (_url: string, init?: RequestInit) => {
    payload = JSON.parse(String(init?.body));
    return Response.json({ id: 'synthetic-email' });
  });
  await sendTemplate({
    from: 'sender@example.invalid', to: ['guest@example.invalid'],
    subject: 'Synthetic test', template: 'rp-contact-confirmation', variables: {},
    replyTo: 'hotel@example.invalid', idempotencyKey: 'test-email-artwork',
  });
  const attachments = payload.attachments as { content_id: string; content: string; content_type: string; filename: string }[];
  assert.equal(attachments.length, 3);
  for (const name of ['contact-confirmation', 'contact-enquiry', 'booking-confirmation', 'booking-notification']) {
    const html = await readFile(new URL(`../emails/${name}.html`, import.meta.url), 'utf8');
    for (const [, id] of html.matchAll(/src="cid:([^"]+)"/g)) {
      const attachment = attachments.find(image => image.content_id === id);
      assert.ok(attachment, `${name}: missing inline image ${id}`);
      const content = Buffer.from(attachment.content, 'base64');
      assert.deepEqual(content, await readFile(new URL(`../public/email/${attachment.filename}`, import.meta.url)));
      assert.ok(content.length < 300_000, `${attachment.filename} should remain small enough for email`);
    }
    assert.doesNotMatch(html, /Hula Hula|hula-hula-logo|hulahulaholiday|#50830d/i);
  }
  assert.equal(payload.reply_to, 'hotel@example.invalid');
  assert.equal(payload.template.id, 'rp-contact-confirmation');
});
