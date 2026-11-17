import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { management, query } from './royal-database.mjs';
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false,autoRefreshToken:false} });
const { data:existing, error:listError } = await client.auth.admin.listUsers({page:1,perPage:100});
if (listError) throw new Error(`Staff lookup failed: ${listError.message}`);
const existingOwner = existing.users.find(user => user.email === 'lucas@bluetrendy.com');
if (!existingOwner) {
  const {error} = await client.auth.admin.createUser({ email:'lucas@bluetrendy.com', password:randomBytes(36).toString('base64url'), email_confirm:true, app_metadata:{role:'royal_pineapple_staff'} });
  if(error) throw new Error(`Staff setup failed: ${error.message}`);
}
console.log('Lucas’s Royal Pineapple staff account is ready; no email sent.');
console.log(JSON.stringify(await query("select (select count(*) from public.activities) as programme_days,(select count(*) from public.offers) as offers,(select count(*) from public.bookings) as bookings,(select count(*) from public.admins) as staff")));
const config = await management('/config/auth');
console.log(JSON.stringify({site_url:config.site_url, signupDisabled:config.disable_signup, customSmtpConfigured:Boolean(config.smtp_host)}));
