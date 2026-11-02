-- Hula Hula website: the small CMS (activities, events, offers + images) and
-- the short-lived booking records behind on-site booking with 2C2P.
-- Run once in the Supabase SQL editor (or via the Management API), then
-- supabase/seed.sql. Safe to read top to bottom:
--   admins      → who may sign in to /admin (an allowlist of staff emails)
--   activities, events, offers → public read of published rows, admin write
--   storage bucket "content"   → images uploaded from /admin
--   bookings    → server-only; guest details are wiped once handed off

-- ── Staff allowlist ──────────────────────────────────────────────────────
create table public.admins (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security; -- no policies: nobody reads it directly

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create or replace function public.today_bkk() returns date language sql stable as $$
  select (now() at time zone 'Asia/Bangkok')::date
$$;

-- ── CMS ──────────────────────────────────────────────────────────────────
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  kicker text not null default '' check (length(kicker) <= 40),
  title text not null check (length(title) between 1 and 120),
  detail text not null default '' check (length(detail) <= 600),
  images text[] not null default '{}',
  cta_label text check (length(cta_label) <= 40),
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 120),
  summary text not null default '' check (length(summary) <= 600),
  image_url text,
  starts_on date,           -- both dates empty = ongoing ("Every Friday", "On request")
  ends_on date,
  time_label text check (length(time_label) <= 60),
  cta_type text not null default 'contact' check (cta_type in ('contact', 'book', 'link', 'none')),
  cta_label text check (length(cta_label) <= 40),
  cta_url text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  kicker text check (length(kicker) <= 40),
  title text not null check (length(title) between 1 and 120),
  description text not null default '' check (length(description) <= 600),
  image_url text,
  promo_code text check (promo_code ~ '^[A-Za-z0-9_-]{1,40}$'), -- a SiteMinder promo code
  valid_from date,
  valid_to date,
  cta_label text check (length(cta_label) <= 40),
  active boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_to is null or valid_from is null or valid_to >= valid_from)
);

create trigger activities_touch before update on public.activities for each row execute function public.touch_updated_at();
create trigger events_touch before update on public.events for each row execute function public.touch_updated_at();
create trigger offers_touch before update on public.offers for each row execute function public.touch_updated_at();

alter table public.activities enable row level security;
alter table public.events enable row level security;
alter table public.offers enable row level security;

-- Everyone may read what's published (and, for events and offers, still in date in Krabi)...
create policy activities_public on public.activities for select to anon, authenticated using (published);
create policy events_public on public.events for select to anon, authenticated
  using (published and (coalesce(ends_on, starts_on) is null or coalesce(ends_on, starts_on) >= public.today_bkk()));
create policy offers_public on public.offers for select to anon, authenticated
  using (active and (valid_from is null or valid_from <= public.today_bkk()) and (valid_to is null or valid_to >= public.today_bkk()));
-- ...and staff on the allowlist may see and change everything.
create policy activities_admin on public.activities for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy events_admin on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy offers_admin on public.offers for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Images uploaded from /admin (public to read, staff to write) ───────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('content', 'content', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do nothing;

create policy content_admin_read on storage.objects for select to authenticated using (bucket_id = 'content' and public.is_admin());
create policy content_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'content' and public.is_admin());
create policy content_admin_update on storage.objects for update to authenticated using (bucket_id = 'content' and public.is_admin());
create policy content_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'content' and public.is_admin());

-- ── Bookings (server only) ───────────────────────────────────────────────
-- Written by the api/ functions with the secret key. Guest details live here
-- only from "Continue to payment" until the booking is handed to the resort,
-- then they are set to null; what stays is enough for refunds and
-- reconciliation. Unpaid rows are deleted after 30 days.
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  invoice_no text not null unique,
  access_key_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'delivered', 'failed', 'expired')),
  check_in date not null,
  check_out date not null,
  promo_code text,
  items jsonb not null,
  currency char(3) not null default 'THB',
  total_amount numeric(12, 2) not null,
  deposit_amount numeric(12, 2) not null,
  balance_amount numeric(12, 2) generated always as (total_amount - deposit_amount) stored,
  -- guest details (wiped at hand-off)
  guest_first_name text,
  guest_last_name text,
  guest_email text,
  guest_phone text,
  guest_country char(2),
  arrival_time text,
  special_requests text,
  pii_wiped_at timestamptz,
  -- payment (2C2P)
  payment_token text,
  paid_amount numeric(12, 2),
  tran_ref text,
  reference_no text,
  approval_code text,
  channel_code text,
  resp_code text,
  resp_desc text,
  paid_at timestamptz,
  last_inquiry_at timestamptz,
  -- hand-off to the resort
  delivery_method text,
  delivery_claimed_at timestamptz,
  delivery_attempts int not null default 0,
  delivery_error text,
  delivered_at timestamptz,
  guest_emailed_at timestamptz,
  siteminder_res_id text,   -- set by the SiteConnect hand-off (phase 2)
  keyed_at timestamptz,     -- staff pressed "Entered in SiteMinder" in /admin
  flags text[] not null default '{}',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in)
);
create trigger bookings_touch before update on public.bookings for each row execute function public.touch_updated_at();
create index bookings_status_expiry on public.bookings (status, expires_at);
create index bookings_holds on public.bookings (check_in, check_out) where status in ('pending', 'paid', 'delivered');
alter table public.bookings enable row level security; -- no policies: browsers get nothing

-- What /admin's Bookings tab may see: paid bookings, never guest details.
create or replace function public.admin_bookings(since date default (now()::date - 60))
returns table (
  ref text, status text, check_in date, check_out date, items jsonb, currency char(3),
  total_amount numeric, deposit_amount numeric, paid_amount numeric, tran_ref text, flags text[],
  created_at timestamptz, paid_at timestamptz, delivered_at timestamptz, keyed_at timestamptz, delivery_error text
)
language sql stable security definer set search_path = public as $$
  select ref, status, check_in, check_out, items, currency, total_amount, deposit_amount, paid_amount, tran_ref, flags,
         created_at, paid_at, delivered_at, keyed_at, delivery_error
  from public.bookings
  where public.is_admin() and created_at >= since and status in ('paid', 'delivered')
  order by created_at desc
$$;

-- "Entered in SiteMinder": SiteMinder now counts the room, so the site stops holding it back.
create or replace function public.admin_mark_keyed(p_ref text) returns void
language sql security definer set search_path = public as $$
  update public.bookings set keyed_at = now() where ref = p_ref and keyed_at is null and public.is_admin()
$$;

revoke execute on function public.admin_bookings(date), public.admin_mark_keyed(text) from public, anon;
grant execute on function public.admin_bookings(date), public.admin_mark_keyed(text) to authenticated;
