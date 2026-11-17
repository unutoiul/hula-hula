import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const files = [
  ['royal-pineapple-logo', 'royal-pineapple-logo.png', 'image/png'],
  ['royal-pineapple-stationery', 'royal-pineapple-stationery.jpg', 'image/jpeg'],
  ['royal-pineapple-riviera', 'royal-pineapple-riviera.jpg', 'image/jpeg'],
] as const;

type ArtworkId = (typeof files)[number][0];

// Which pictures each template shows (its src="cid:…" images). Only those
// travel with the email: mail apps list an inline picture the email doesn't
// show as an attachment. A template not listed here gets all of them.
const USED_BY: Record<string, ArtworkId[]> = {
  'rp-contact-enquiry': ['royal-pineapple-logo', 'royal-pineapple-stationery'],
  'rp-contact-confirmation': ['royal-pineapple-logo', 'royal-pineapple-stationery'],
  'rp-booking-notification': ['royal-pineapple-logo', 'royal-pineapple-stationery'],
  'rp-booking-confirmation': ['royal-pineapple-logo', 'royal-pineapple-riviera'],
};

async function loadArtwork() {
  return Promise.all(files.map(async ([content_id, filename, content_type]) => ({
    filename, content_id, content_type,
    content: (await readFile(resolve(process.cwd(), 'public/email', filename))).toString('base64'),
  })));
}

let cached: ReturnType<typeof loadArtwork> | undefined;
/** CID images travel with each transactional email; no external image host is required. */
export async function inlineEmailArtwork(template?: string) {
  cached ??= loadArtwork().catch(error => { cached = undefined; throw error; });
  const all = await cached;
  const used = template ? USED_BY[template] : undefined;
  return used ? all.filter((image) => used.includes(image.content_id)) : all;
}
