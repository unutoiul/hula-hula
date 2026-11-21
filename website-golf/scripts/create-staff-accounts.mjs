// Creates the two Hula Hula Golf Club /admin logins, admin@hulahulagolfclub.com and staff@hulahulagolfclub.com,
// in this site's Supabase project: a Supabase Auth user with a freshly
// generated password, plus a row on public.golf_staff with its role. Run
// supabase/roles.sql first so the table has its role column.
//
//   npm run staff:create            → creates whichever of the two is missing
//   npm run staff:create -- --reset → also gives existing ones a new password
//
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local or the
// shell. Set ADMIN_PASSWORD and/or STAFF_PASSWORD to choose the passwords;
// otherwise each gets an easy-to-remember one like "Mango-Lagoon-Turtle-47".
// Passwords are printed once, here, and stored nowhere else: copy them into
// the password manager straight away. Run with --reset to replace a lost one.
import { randomInt } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const DOMAIN = 'hulahulagolfclub.com';
const TABLE = 'golf_staff';
const ACCOUNTS = [
  { email: `admin@${DOMAIN}`, role: 'admin', chosen: process.env.ADMIN_PASSWORD },
  { email: `staff@${DOMAIN}`, role: 'staff', chosen: process.env.STAFF_PASSWORD },
];

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (in .env.local or the shell) first.');
  process.exit(1);
}
const reset = process.argv.includes('--reset');
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

// Three capitalised words and a two-digit number, e.g. "Mango-Lagoon-Turtle-47":
// easy to say over the phone and type at the desk.
const WORDS = [
  'Mango', 'Papaya', 'Coconut', 'Banana', 'Lychee', 'Guava', 'Lime', 'Ginger', 'Pepper', 'Basil',
  'Lagoon', 'Island', 'Beach', 'Coral', 'Reef', 'Ocean', 'Wave', 'Tide', 'Harbor', 'River',
  'Sunset', 'Sunrise', 'Rainbow', 'Breeze', 'Cloud', 'Thunder', 'Monsoon', 'Summer', 'Starry', 'Moon',
  'Turtle', 'Dolphin', 'Parrot', 'Toucan', 'Gecko', 'Monkey', 'Tiger', 'Panda', 'Otter', 'Pelican',
  'Orchid', 'Lotus', 'Jasmine', 'Hibiscus', 'Palm', 'Bamboo', 'Fern', 'Jungle', 'Garden', 'Meadow',
  'Golden', 'Silver', 'Purple', 'Orange', 'Yellow', 'Green', 'Blue', 'Scarlet', 'Amber', 'Indigo',
  'Happy', 'Lucky', 'Sunny', 'Jolly', 'Brave', 'Gentle', 'Swift', 'Clever', 'Calm', 'Bright',
  'Hammock', 'Lantern', 'Compass', 'Anchor', 'Canoe', 'Paddle', 'Sail', 'Kite', 'Drum', 'Ukulele',
  'Pineapple', 'Hula', 'Fairway', 'Birdie', 'Eagle', 'Putter', 'Caddie', 'Pebble', 'Shell', 'Pearl',
  'Volcano', 'Cliff', 'Cave', 'Valley', 'Canyon', 'Glacier', 'Desert', 'Prairie', 'Forest', 'Waterfall',
];
function generatePassword() {
  const words = Array.from({ length: 3 }, () => WORDS[randomInt(WORDS.length)]);
  return `${words.join('-')}-${randomInt(10, 100)}`;
}

async function findUser(email) {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 1000) return null;
  }
}

const results = [];
for (const { email, role, chosen } of ACCOUNTS) {
  const existing = await findUser(email);
  let password = null;
  if (!existing) {
    password = chosen || generatePassword();
    const { error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw new Error(`${email}: ${error.message}`);
  } else if (reset) {
    password = chosen || generatePassword();
    const { error } = await supabase.auth.admin.updateUserById(existing.id, { password });
    if (error) throw new Error(`${email}: ${error.message}`);
  }
  const { error } = await supabase.from(TABLE).upsert({ email, role }, { onConflict: 'email' });
  if (error) throw new Error(`${email} on ${TABLE}: ${error.message}`);
  results.push({ email, role, password: password ?? '(unchanged, already existed)' });
}

console.log('\nHula Hula Golf Club /admin logins:\n');
for (const r of results) console.log(`  ${r.role.padEnd(5)}  ${r.email.padEnd(32)}  ${r.password}`);
console.log('\nCopy the passwords now: they are not saved anywhere.\n');
