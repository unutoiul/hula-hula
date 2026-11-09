-- Hula Hula Golf Club: tee times paid online through Payso. Run once, after
-- golf.sql, settings.sql and events.sql, in the golf club's Supabase project
-- (axazsljvxwdusntcnrev): SQL Editor → New query → paste → Run.
-- It only adds to what's there, and the current website keeps working with it,
-- so run it before deploying the code that needs it.
--
-- A website booking now starts as 'pending', holding its place until
-- expires_at while the guest pays. Payso's confirmation turns it into 'booked'.
-- One that's never paid becomes 'expired'. Staff don't see pending or expired
-- bookings; phone and walk-in bookings are 'booked' straight away, as before.

alter table public.golf_bookings
  -- The payment reference sent to Payso (null for bookings with nothing to pay online).
  add column invoice_no text unique,
  -- Only the browser that made the booking can read its status (sha256 of its key).
  add column access_key_hash text,
  add column expires_at timestamptz,
  add column payment_token text,
  add column paid_amount numeric(12, 2),
  add column paid_at timestamptz,
  add column tran_ref text,
  add column channel_code text,
  add column resp_code text,
  add column resp_desc text,
  -- Paid on a test or demo payment account: no real money moved.
  add column test_payment boolean not null default false,
  -- e.g. paid_after_expiry (the time may have gone to someone else meanwhile)
  add column flags text[] not null default '{}',
  add column last_inquiry_at timestamptz,
  add column emails_claimed_at timestamptz,
  add column emailed_at timestamptz;

alter table public.golf_bookings drop constraint golf_bookings_status_check;
alter table public.golf_bookings add constraint golf_bookings_status_check
  check (status in ('pending', 'booked', 'checked_in', 'no_show', 'cancelled', 'expired'));

create index golf_bookings_pending on public.golf_bookings (expires_at) where status = 'pending';

-- The same as in golf.sql, with two changes: the website's server can save a
-- booking as 'pending' until a given time, and a booking only takes up room
-- while it's live (a pending one whose time has run out is expired first).
create or replace function public.golf_book(p_booking jsonb, p_capacity int, p_units int, p_private boolean, p_force boolean default false)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_activity text := p_booking ->> 'activity';
  v_date date := (p_booking ->> 'play_date')::date;
  v_start time := (p_booking ->> 'start_time')::time;
  v_minutes int := (p_booking ->> 'minutes')::int;
  v_players int := (p_booking ->> 'players')::int;
  v_staff boolean := public.is_golf_staff();
  v_pending boolean := coalesce(auth.role(), '') = 'service_role' and p_booking ->> 'status' = 'pending';
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

  update golf_bookings set status = 'expired'
    where activity = v_activity and play_date = v_date and status = 'pending' and expires_at <= now();

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
          where g.activity = v_activity and g.play_date = v_date and g.status not in ('cancelled', 'expired')
            and g.start_time <= v_hour and v_hour < g.start_time + make_interval(mins => g.minutes);
        if v_used >= p_units then raise exception 'taken: no bay'; end if;
      end loop;
    else
      select coalesce(sum(g.players), 0), count(*) into v_used, v_groups from golf_bookings g
        where g.activity = v_activity and g.play_date = v_date and g.start_time = v_start and g.status not in ('cancelled', 'expired');
      if (p_private and v_groups > 0) or v_used + v_players > p_capacity then raise exception 'taken: full'; end if;
    end if;
  end if;

  -- HHG- and six characters with no 0/O or 1/I, so it reads well over the phone.
  loop
    select 'HHG-' || string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '') into v_ref from generate_series(1, 6);
    exit when not exists (select 1 from golf_bookings where ref = v_ref);
  end loop;

  insert into golf_bookings (ref, activity, option, play_date, start_time, minutes, players, rentals, transfer, pickup_from, experience,
    first_name, last_name, email, phone, country, handicap, notes, lines, total, source, status, expires_at)
  values (v_ref, v_activity, p_booking ->> 'option', v_date, v_start, v_minutes, v_players, coalesce(p_booking -> 'rentals', '{}'),
    nullif(p_booking ->> 'transfer', '')::time, coalesce(p_booking ->> 'pickup_from', ''), coalesce(p_booking ->> 'experience', ''),
    p_booking ->> 'first_name', coalesce(p_booking ->> 'last_name', ''), coalesce(p_booking ->> 'email', ''), coalesce(p_booking ->> 'phone', ''),
    coalesce(p_booking ->> 'country', ''), coalesce(p_booking ->> 'handicap', ''), coalesce(p_booking ->> 'notes', ''),
    coalesce(p_booking -> 'lines', '[]'), (p_booking ->> 'total')::int, coalesce(p_booking ->> 'source', 'online'),
    case when v_pending then 'pending' else 'booked' end,
    case when v_pending then (p_booking ->> 'expires_at')::timestamptz else null end);
  return v_ref;
end $$;
