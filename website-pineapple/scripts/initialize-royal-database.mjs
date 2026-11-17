import { readdir, readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { management, query } from './royal-database.mjs';

const tables = await query("select table_name from information_schema.tables where table_schema='public'");
if (tables.length) throw new Error('Database is not empty; inspect before applying initial migrations.');
const files = (await readdir('supabase/migrations')).filter(name => name.endsWith('.sql')).sort();
const sql = await Promise.all(files.map(name => readFile(`supabase/migrations/${name}`, 'utf8')));
sql.push(await readFile('supabase/seed.sql', 'utf8'));
await query(`begin;\n${sql.join('\n')}\ncommit;`, false);
console.log(JSON.stringify({ project:'nmenfmqgwqpmlfhccdok', applied:files, seeded:true }));

await management('/config/auth', 'PATCH', {
  site_url: 'https://hulahula-pineapple.vercel.app',
  uri_allow_list: 'https://hulahula-pineapple.vercel.app/admin,http://localhost:3004/admin,http://127.0.0.1:3004/admin',
  disable_signup: true,
  password_min_length: 12,
});
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{ persistSession:false, autoRefreshToken:false } });
const { error } = await client.auth.admin.createUser({ email:'lucas@bluetrendy.com', password:randomBytes(36).toString('base64url'), email_confirm:true, app_metadata:{role:'royal_pineapple_staff'} });
if (error && error.code !== 'email_exists') throw new Error(`Owner setup: ${error.message}`);
console.log('Owner account provisioned; no email sent. Owner chooses password using the admin reset form.');
console.log(JSON.stringify(await query("select (select count(*) from public.activities) as programme_days,(select count(*) from public.offers) as offers,(select count(*) from public.bookings) as bookings,(select count(*) from public.admins) as staff")));
