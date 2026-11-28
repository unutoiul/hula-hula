import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

// Where public/email ends up depends on how the function runs. On Vercel the
// repo's folders are kept, so with this site in website-pineapple/ the files
// (included by vercel.json) sit in /var/task/website-pineapple/public/email —
// not /var/task/public/email, which is what looking only beside process.cwd()
// found, and why every email failed with ENOENT. `vercel dev` and the tests run
// from the site's own folder. Each place is tried in turn, then the live website.
function folders(): string[] {
  const candidates = [resolve(process.cwd(), 'public/email'), resolve(process.cwd(), 'website-pineapple/public/email')];
  try {
    candidates.push(resolve(dirname(fileURLToPath(import.meta.url)), '../../public/email'));
  } catch {
    /* not a file URL once bundled */
  }
  return [...new Set(candidates)];
}

const siteUrl = () => (process.env.SITE_URL || 'https://www.royalpineapplehotel.com').replace(/\/$/, '');

async function readPicture(filename: string): Promise<Buffer> {
  for (const folder of folders()) {
    try {
      return await readFile(resolve(folder, filename));
    } catch {
      /* try the next place */
    }
  }
  // The same files are published with the website, at /email/<file>.
  const response = await fetch(`${siteUrl()}/email/${filename}`);
  if (!response.ok) throw new Error(`Email picture ${filename} not found on disk or at ${siteUrl()}/email/ (HTTP ${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

async function loadArtwork() {
  return Promise.all(
    files.map(async ([content_id, filename, content_type]) => ({
      filename,
      content_id,
      content_type,
      content: (await readPicture(filename)).toString('base64'),
    })),
  );
}

let cached: ReturnType<typeof loadArtwork> | undefined;
/** CID images travel with each transactional email; no external image host is required. */
export async function inlineEmailArtwork(template?: string) {
  cached ??= loadArtwork().catch((error) => {
    cached = undefined;
    throw error;
  });
  const all = await cached;
  const used = template ? USED_BY[template] : undefined;
  return used ? all.filter((image) => used.includes(image.content_id)) : all;
}
