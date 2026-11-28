import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { it } from 'node:test';

// On Vercel the function runs from /var/task with this site's files under
// /var/task/website-pineapple/, so the pictures aren't beside process.cwd().
// Looking only there made every Royal Pineapple email fail (ENOENT) before
// it reached Resend. They must be found from wherever the function runs.
it('finds the email pictures when the function runs from another folder', async (t) => {
  const elsewhere = await mkdtemp(join(tmpdir(), 'rp-artwork-'));
  const previous = process.cwd();
  process.chdir(elsewhere);
  t.after(async () => {
    process.chdir(previous);
    await rm(elsewhere, { recursive: true, force: true });
  });
  // Nothing may come from the network: the files must be found on disk.
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('no network in this test');
  });
  const { inlineEmailArtwork } = await import('../api/_lib/emailArtwork.ts');
  const pictures = await inlineEmailArtwork('rp-booking-notification');
  assert.deepEqual(pictures.map((p) => p.content_id).sort(), ['royal-pineapple-logo', 'royal-pineapple-stationery']);
  assert.ok(pictures.every((p) => p.content.length > 1000));
});
