-- The reservations desk at /admin → Bookings. Website bookings now keep the
-- guest's details (they're no longer wiped once the reservations email has
-- gone), so staff can look a booking up, follow it from payment to
-- SiteMinder, add notes and archive it. Unpaid attempts are still deleted
-- after 30 days by the nightly cron. Browsers still can't read the table:
-- staff go through the functions below, which check is_admin().
-- Run BEFORE deploying the code that calls them (nothing here changes what
-- the live code does).

alter table public.bookings
  add column keyed_by text,          -- who pressed "Entered in SiteMinder"
  add column archived_at timestamptz,
  add column archived_by text,
  add column staff_notes text check (length(staff_notes) <= 4000);

create index bookings_created on public.bookings (created_at desc);

create or replace function public.admin_email() returns text language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

-- Every website booking of the last 18 months, newest first: the whole row
-- except the secrets (the guest's access key and 2C2P's payment token).
create or replace function public.admin_booking_list() returns setof jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(b) - 'access_key_hash' - 'payment_token'
  from public.bookings b
  where public.is_admin() and b.created_at >= now() - interval '18 months'
  order by b.created_at desc
  limit 5000
$$;

-- "Entered in SiteMinder", with SiteMinder's own reservation number if staff
-- have it. Undoing it (p_keyed false) puts the room back on hold on the website.
create or replace function public.admin_set_keyed(p_ref text, p_keyed boolean, p_siteminder_id text default null) returns void
language sql security definer set search_path = public as $$
  update public.bookings set
    keyed_at = case when p_keyed then coalesce(keyed_at, now()) end,
    keyed_by = case when p_keyed then coalesce(keyed_by, public.admin_email()) end,
    siteminder_res_id = case when p_keyed then coalesce(nullif(trim(p_siteminder_id), ''), siteminder_res_id) else siteminder_res_id end
  where ref = p_ref and status in ('paid', 'delivered') and public.is_admin()
$$;

create or replace function public.admin_set_archived(p_ref text, p_archived boolean) returns void
language sql security definer set search_path = public as $$
  update public.bookings set
    archived_at = case when p_archived then now() end,
    archived_by = case when p_archived then public.admin_email() end
  where ref = p_ref and public.is_admin()
$$;

create or replace function public.admin_set_note(p_ref text, p_note text) returns void
language sql security definer set search_path = public as $$
  update public.bookings set staff_notes = nullif(trim(p_note), '') where ref = p_ref and public.is_admin()
$$;

revoke execute on function public.admin_email(), public.admin_booking_list(), public.admin_set_keyed(text, boolean, text),
  public.admin_set_archived(text, boolean), public.admin_set_note(text, text) from public, anon;
grant execute on function public.admin_booking_list(), public.admin_set_keyed(text, boolean, text),
  public.admin_set_archived(text, boolean), public.admin_set_note(text, text) to authenticated;
