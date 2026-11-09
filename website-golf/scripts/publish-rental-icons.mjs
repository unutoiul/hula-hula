import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

// Upload generated icons without overwriting existing storage objects.
// Run: node --env-file=.env.local scripts/publish-rental-icons.mjs
// Optional arguments select specific icon basenames from public/images/rentals/.
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || new URL(url).hostname !== 'axazsljvxwdusntcnrev.supabase.co') throw new Error('Expected the golf club Supabase project.');
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const names = process.argv.length > 2 ? process.argv.slice(2) : ['premium-set-a', 'premium-set-b', 'normal-set-a', 'normal-set-b'];
if (names.some(name => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))) throw new Error('Expected simple icon basenames.');
const images = {};
for (const name of names) {
  const data = await readFile(new URL(`../public/images/rentals/${name}.webp`, import.meta.url));
  const hash = createHash('sha256').update(data).digest('hex').slice(0, 12);
  const path = `rentals/${name}-${hash}.webp`;
  const { error } = await client.storage.from('club-images').upload(path, data, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
  if (error && String(error.statusCode) !== '409' && !/already exists/i.test(error.message)) throw error;
  const publicUrl = client.storage.from('club-images').getPublicUrl(path).data.publicUrl;
  const response = await fetch(publicUrl);
  if (!response.ok || !Buffer.from(await response.arrayBuffer()).equals(data)) throw new Error(`Could not verify uploaded icon: ${name}`);
  images[name] = publicUrl;
}
console.log(JSON.stringify(images, null, 2));
