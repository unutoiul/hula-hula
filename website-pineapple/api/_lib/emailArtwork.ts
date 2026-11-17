import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const files = [
  ['royal-pineapple-logo', 'royal-pineapple-logo.png', 'image/png'],
  ['royal-pineapple-stationery', 'royal-pineapple-stationery.jpg', 'image/jpeg'],
  ['royal-pineapple-riviera', 'royal-pineapple-riviera.jpg', 'image/jpeg'],
] as const;

async function loadArtwork() {
  return Promise.all(files.map(async ([content_id, filename, content_type]) => ({
    filename, content_id, content_type,
    content: (await readFile(resolve(process.cwd(), 'public/email', filename))).toString('base64'),
  })));
}

let cached: ReturnType<typeof loadArtwork> | undefined;
/** CID images travel with each transactional email; no external image host is required. */
export function inlineEmailArtwork() {
  cached ??= loadArtwork().catch(error => { cached = undefined; throw error; });
  return cached;
}
