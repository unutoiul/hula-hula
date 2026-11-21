// Creates the two Hula Hula Golf Club /admin logins, admin@hulahulagolfclub.com and staff@hulahulagolfclub.com,
// in this site's Supabase project: a Supabase Auth user with a freshly
// generated password, plus a row on public.golf_staff with its role. Run
// supabase/roles.sql first so the table has its role column.
//
//   npm run staff:create            → creates whichever of the two is missing
//   npm run staff:create -- --reset → also gives existing ones a new password
//
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local or the
// shell. Passwords are printed once, here, and stored nowhere else: copy them
// into the password manager straight away. Run with --reset to replace a lost one.
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const DOMAIN = 'hulahulagolfclub.com';
const TABLE = 'golf_staff';
const ACCOUNTS = [
  { email: `admin@${DOMAIN}`, role: 'admin' },
  { email: `staff@${DOMAIN}`, role: 'staff' },
];

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (in .env.local or the shell) first.');
  process.exit(1);
}
const reset = process.argv.includes('--reset');
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

// 20 random characters from an alphabet without look-alikes (0/O, 1/l/I), ~115 bits.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
function generatePassword(length = 20) {
  const bytes = randomBytes(length * 2);
  let out = '';
  for (const b of bytes) {
    if (b >= 256 - (256 % ALPHABET.length)) continue; // no modulo bias
    out += ALPHABET[b % ALPHABET.length];
    if (out.length === length) return out;
  }
  return generatePassword(length);
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
for (const { email, role } of ACCOUNTS) {
  const existing = await findUser(email);
  let password = null;
  if (!existing) {
    password = generatePassword();
    const { error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw new Error(`${email}: ${error.message}`);
  } else if (reset) {
    password = generatePassword();
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
