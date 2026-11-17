-- Royal Pineapple uses its own project. RLS protects browser access; only
-- the server runtime key can read/write the bookings table directly.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter function public.is_admin() set schema private;
create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.admins where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;
create function public.is_admin() returns boolean
language sql stable security invoker set search_path = '' as $$ select private.is_admin() $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter function public.touch_updated_at() set search_path = '';
alter function public.today_bkk() set search_path = '';
alter function public.admin_email() set search_path = '';
grant execute on function public.admin_email() to authenticated;

-- Privileged implementation lives outside the exposed API schema.
alter function public.admin_booking_list() set schema private;
alter function public.admin_set_keyed(text,boolean,text) set schema private;
alter function public.admin_set_archived(text,boolean) set schema private;
alter function public.admin_set_note(text,text) set schema private;
alter function public.admin_bookings(date) set schema private;
alter function public.admin_mark_keyed(text) set schema private;
alter function private.admin_booking_list() set search_path = '';
alter function private.admin_set_keyed(text,boolean,text) set search_path = '';
alter function private.admin_set_archived(text,boolean) set search_path = '';
alter function private.admin_set_note(text,text) set search_path = '';
alter function private.admin_bookings(date) set search_path = '';
alter function private.admin_mark_keyed(text) set search_path = '';

create function public.admin_booking_list() returns setof jsonb
language sql stable security invoker set search_path = '' as $$ select * from private.admin_booking_list() $$;
create function public.admin_set_keyed(p_ref text, p_keyed boolean, p_siteminder_id text default null) returns void
language sql security invoker set search_path = '' as $$ select private.admin_set_keyed(p_ref,p_keyed,p_siteminder_id) $$;
create function public.admin_set_archived(p_ref text, p_archived boolean) returns void
language sql security invoker set search_path = '' as $$ select private.admin_set_archived(p_ref,p_archived) $$;
create function public.admin_set_note(p_ref text,p_note text) returns void
language sql security invoker set search_path = '' as $$ select private.admin_set_note(p_ref,p_note) $$;
create function public.admin_mark_keyed(p_ref text) returns void
language sql security invoker set search_path = '' as $$ select private.admin_mark_keyed(p_ref) $$;
create function public.admin_bookings(since date default (now()::date - 60))
returns table (
  ref text, status text, check_in date, check_out date, items jsonb, currency char(3),
  total_amount numeric, deposit_amount numeric, paid_amount numeric, tran_ref text, flags text[],
  created_at timestamptz, paid_at timestamptz, delivered_at timestamptz, keyed_at timestamptz, delivery_error text
)
language sql stable security invoker set search_path = '' as $$ select * from private.admin_bookings(since) $$;

revoke execute on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;
revoke execute on function public.admin_booking_list(), public.admin_set_keyed(text,boolean,text),
  public.admin_set_archived(text,boolean), public.admin_set_note(text,text), public.admin_mark_keyed(text),
  public.admin_bookings(date) from public, anon;
grant execute on function public.admin_booking_list(), public.admin_set_keyed(text,boolean,text),
  public.admin_set_archived(text,boolean), public.admin_set_note(text,text), public.admin_mark_keyed(text),
  public.admin_bookings(date) to authenticated;

-- Explicit grants are required on fresh Supabase projects.
revoke all on public.admins, public.bookings from anon, authenticated;
grant all on public.admins, public.bookings, public.activities, public.events, public.offers to service_role;
grant select on public.activities, public.events, public.offers to anon;
grant select, insert, update, delete on public.activities, public.events, public.offers to authenticated;
grant usage on schema public to anon, authenticated, service_role;

drop policy content_admin_update on storage.objects;
create policy content_admin_update on storage.objects for update to authenticated
using (bucket_id = 'content' and public.is_admin())
with check (bucket_id = 'content' and public.is_admin());

insert into public.admins(email) values ('lucas@bluetrendy.com') on conflict do nothing;
