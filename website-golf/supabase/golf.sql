-- Hula Hula Golf Club: tee time bookings, blocked times and the staff list,
-- in the golf club's own Supabase project ("Hula Hula Golf Club",
-- axazsljvxwdusntcnrev). Run once in Supabase → SQL Editor → New query →
-- paste → Run. Safe to read top to bottom:
--   golf_staff     → who may sign in to the golf club's /admin
--   golf_bookings  → every booking; the website writes through golf_book(),
--                    staff read and update them from /admin
--   golf_blocks    → times staff have closed (maintenance, a tournament…)
--   golf_book()    → saves a booking only if the time still has room

-- ── Staff ────────────────────────────────────────────────────────────────
create table public.golf_staff (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);
alter table public.golf_staff enable row level security; -- no policies: nobody reads it directly

create or replace function public.is_golf_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.golf_staff where email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke execute on function public.is_golf_staff() from public, anon;
grant execute on function public.is_golf_staff() to authenticated;

-- Adding someone to the staff app takes two steps: a login (Authentication →
-- Users → Add user, with a password) and their email on this list:
--   insert into public.golf_staff (email) values ('someone@example.com');

-- ── Bookings ─────────────────────────────────────────────────────────────
create table public.golf_bookings (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  activity text not null check (activity in ('golf', 'footgolf', 'puttgolf', 'range', 'lesson')),
  option text not null check (length(option) <= 10),
  play_date date not null,
  start_time time not null,
  minutes int not null check (minutes between 10 and 600),
  players int not null check (players between 1 and 40),
  rentals jsonb not null default '{}',
  transfer time,
  pickup_from text not null default '' check (length(pickup_from) <= 200),
  experience text not null default '' check (length(experience) <= 60),
  first_name text not null check (length(first_name) between 1 and 80),
  last_name text not null default '' check (length(last_name) <= 80),
  email text not null default '' check (length(email) <= 120),
  phone text not null default '' check (length(phone) <= 40),
  country text not null default '' check (length(country) <= 2),
  handicap text not null default '' check (length(handicap) <= 8),
  notes text not null default '' check (length(notes) <= 1000),
  lines jsonb not null default '[]',
  total int not null check (total >= 0),
  source text not null default 'online' check (source in ('online', 'phone', 'walk_in')),
  status text not null default 'booked' check (status in ('booked', 'checked_in', 'no_show', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index golf_bookings_day on public.golf_bookings (play_date, activity, start_time);
alter table public.golf_bookings enable row level security;
-- Staff see and update bookings (check-in, no-show, cancel); new ones only
-- come in through golf_book(), so nobody inserts or deletes directly.
create policy golf_bookings_staff_read on public.golf_bookings for select to authenticated using (public.is_golf_staff());
create policy golf_bookings_staff_update on public.golf_bookings for update to authenticated using (public.is_golf_staff()) with check (public.is_golf_staff());

create or replace function public.golf_touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger golf_bookings_touch before update on public.golf_bookings for each row execute function public.golf_touch_updated_at();

-- ── Blocked times ────────────────────────────────────────────────────────
create table public.golf_blocks (
  id uuid primary key default gen_random_uuid(),
  play_date date not null,
  activity text check (activity in ('golf', 'footgolf', 'puttgolf', 'range', 'lesson')), -- null = everything
  start_time time not null,
  end_time time not null check (end_time > start_time),
  reason text not null default '' check (length(reason) <= 120),
  created_at timestamptz not null default now()
);
create index golf_blocks_day on public.golf_blocks (play_date);
alter table public.golf_blocks enable row level security;
create policy golf_blocks_staff on public.golf_blocks for all to authenticated using (public.is_golf_staff()) with check (public.is_golf_staff());

-- ── Saving a booking ─────────────────────────────────────────────────────
-- Called by the website's server (with the secret key) and by staff from
-- /admin. The caller says how much room a start has (from the club's
-- settings in the website code); this checks what's already booked and
-- saves in one step, one booking at a time per activity and day, so two
-- people can never both get the last place. Staff can `p_force` a booking in
-- (squeezing in a walk-in, or over a blocked time). Returns the reference.
create or replace function public.golf_book(p_booking jsonb, p_capacity int, p_units int, p_private boolean, p_force boolean default false)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_activity text := p_booking ->> 'activity';
  v_date date := (p_booking ->> 'play_date')::date;
  v_start time := (p_booking ->> 'start_time')::time;
  v_minutes int := (p_booking ->> 'minutes')::int;
  v_players int := (p_booking ->> 'players')::int;
  v_staff boolean := public.is_golf_staff();
  v_used int;
  v_groups int;
  v_hour time;
  v_ref text;
begin
  -- The website's server comes in as service_role; any signed-in account must be staff.
  if coalesce(auth.role(), '') <> 'service_role' and not v_staff then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext('golf:' || v_activity || ':' || v_date::text));

  if not (p_force and v_staff) then
    if exists (select 1 from golf_blocks b where b.play_date = v_date and (b.activity is null or b.activity = v_activity)
               and b.start_time <= v_start and v_start < b.end_time) then
      raise exception 'taken: blocked';
    end if;
    if p_units > 1 then
      -- The range: a bay has to be free for every hour of the booking.
      for i in 0 .. greatest(ceil(v_minutes / 60.0)::int - 1, 0) loop
        v_hour := v_start + make_interval(hours => i);
        select count(*) into v_used from golf_bookings g
          where g.activity = v_activity and g.play_date = v_date and g.status <> 'cancelled'
            and g.start_time <= v_hour and v_hour < g.start_time + make_interval(mins => g.minutes);
        if v_used >= p_units then raise exception 'taken: no bay'; end if;
      end loop;
    else
      select coalesce(sum(g.players), 0), count(*) into v_used, v_groups from golf_bookings g
        where g.activity = v_activity and g.play_date = v_date and g.start_time = v_start and g.status <> 'cancelled';
      if (p_private and v_groups > 0) or v_used + v_players > p_capacity then raise exception 'taken: full'; end if;
    end if;
  end if;

  -- HHG- and six characters with no 0/O or 1/I, so it reads well over the phone.
  loop
    select 'HHG-' || string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '') into v_ref from generate_series(1, 6);
    exit when not exists (select 1 from golf_bookings where ref = v_ref);
  end loop;

  insert into golf_bookings (ref, activity, option, play_date, start_time, minutes, players, rentals, transfer, pickup_from, experience,
    first_name, last_name, email, phone, country, handicap, notes, lines, total, source)
  values (v_ref, v_activity, p_booking ->> 'option', v_date, v_start, v_minutes, v_players, coalesce(p_booking -> 'rentals', '{}'),
    nullif(p_booking ->> 'transfer', '')::time, coalesce(p_booking ->> 'pickup_from', ''), coalesce(p_booking ->> 'experience', ''),
    p_booking ->> 'first_name', coalesce(p_booking ->> 'last_name', ''), coalesce(p_booking ->> 'email', ''), coalesce(p_booking ->> 'phone', ''),
    coalesce(p_booking ->> 'country', ''), coalesce(p_booking ->> 'handicap', ''), coalesce(p_booking ->> 'notes', ''),
    coalesce(p_booking -> 'lines', '[]'), (p_booking ->> 'total')::int, coalesce(p_booking ->> 'source', 'online'));
  return v_ref;
end $$;
revoke execute on function public.golf_book(jsonb, int, int, boolean, boolean) from public, anon;
grant execute on function public.golf_book(jsonb, int, int, boolean, boolean) to authenticated, service_role;
