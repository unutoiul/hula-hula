-- Hula Hula Golf Club: what staff edit in /admin besides bookings — the
-- activities and their prices, rental clubs, and the club's settings
-- (opening hours, contact details, shuttle, booking rules). Runs after
-- golf.sql. The website reads these through api/site.ts (secret key), which
-- checks every field and falls back to the defaults in src/booking/config.ts.
--   golf_activities → one row per activity; `data` holds its whole set-up
--   golf_settings   → key "club" (ClubSettings) and key "rentals" (Rental[])

create table public.golf_activities (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(id) <= 40),
  sort_order int not null default 0,
  active boolean not null default true,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
create trigger golf_activities_touch before update on public.golf_activities for each row execute function public.golf_touch_updated_at();
alter table public.golf_activities enable row level security;
create policy golf_activities_staff on public.golf_activities for all to authenticated using (public.is_golf_staff()) with check (public.is_golf_staff());

create table public.golf_settings (
  key text primary key check (key in ('club', 'rentals')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create trigger golf_settings_touch before update on public.golf_settings for each row execute function public.golf_touch_updated_at();
alter table public.golf_settings enable row level security;
create policy golf_settings_staff on public.golf_settings for all to authenticated using (public.is_golf_staff()) with check (public.is_golf_staff());

-- Bookings and blocked times can now be for any activity staff create.
alter table public.golf_bookings drop constraint golf_bookings_activity_check;
alter table public.golf_bookings add constraint golf_bookings_activity_check check (activity ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table public.golf_blocks drop constraint golf_blocks_activity_check;
alter table public.golf_blocks add constraint golf_blocks_activity_check check (activity is null or activity ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
