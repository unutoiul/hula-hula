import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { it } from 'node:test';
import { sendTemplate } from '../api/_lib/resend.ts';

// Each template's email carries exactly the CID pictures its HTML shows, as
// real inline file content (an extra one would show up as an attachment).
for (const name of ['contact-confirmation', 'contact-enquiry', 'booking-confirmation', 'booking-notification']) {
  it(`${name} receives exactly its CID images as real inline file content`, async (t) => {
    const previous = process.env.RESEND_API_KEY;
    process.env.RESEND_API_KEY = 'synthetic-key-never-sent';
    t.after(() => {
      if (previous === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = previous;
    });
    let payload: Record<string, any> = {};
    t.mock.method(globalThis, 'fetch', async (_url: string, init?: RequestInit) => {
      payload = JSON.parse(String(init?.body));
      return Response.json({ id: 'synthetic-email' });
    });
    await sendTemplate({
      from: 'sender@example.invalid',
      to: ['guest@example.invalid'],
      subject: 'Synthetic test',
      template: `rp-${name}`,
      variables: {},
      replyTo: 'hotel@example.invalid',
      idempotencyKey: `test-email-artwork-${name}`,
    });
    const attachments = payload.attachments as { content_id: string; content: string; content_type: string; filename: string }[];
    const html = await readFile(new URL(`../emails/${name}.html`, import.meta.url), 'utf8');
    const used = [...new Set([...html.matchAll(/src="cid:([^"]+)"/g)].map(([, id]) => id))].sort();
    assert.deepEqual(attachments.map((image) => image.content_id).sort(), used);
    for (const attachment of attachments) {
      const content = Buffer.from(attachment.content, 'base64');
      assert.deepEqual(content, await readFile(new URL(`../public/email/${attachment.filename}`, import.meta.url)));
      assert.ok(content.length < 300_000, `${attachment.filename} should remain small enough for email`);
    }
    assert.doesNotMatch(html, /Hula Hula|hula-hula-logo|hulahulaholiday|#50830d/i);
    assert.equal(payload.reply_to, 'hotel@example.invalid');
    assert.equal(payload.template.id, `rp-${name}`);
  });
}
