-- Hula Hula Resort: every /admin login now has a role, 'admin' or 'staff'. Both
-- still pass public.is_admin(), so both can sign in to /admin and use it
-- exactly as before; the role is there so the app can keep some screens
-- for admins later. Existing rows become 'staff'; promote someone with
--   update public.admins set role = 'admin' where email = 'someone@example.com';
-- Run once in Supabase → SQL Editor, then `npm run staff:create` to make
-- the admin@ and staff@ logins.

alter table public.admins
  add column if not exists role text not null default 'staff'
  check (role in ('admin', 'staff'));
