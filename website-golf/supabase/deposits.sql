-- Hula Hula Golf Club: deposits on tee times. Run once, after tee-payments.sql,
-- in the golf club's Supabase project (axazsljvxwdusntcnrev): SQL Editor → New
-- query → paste → Run. Run it BEFORE deploying the code that needs it. It only
-- adds to what's there, and the current website keeps working with it.
--
-- A website booking now pays a deposit online and the rest at the club:
--   deposit         → what the group was asked to pay online when they booked:
--                     the activity's per-person deposit × the number of people
--                     (the full price if the activity takes no deposit; 0 for
--                     phone and walk-in bookings, and when there's nothing to pay)
--   paid_amount     → what Payso reports was actually paid
--   balance_paid_at → when staff took what was left at the club
-- The amount still owed is worked out from these by balanceDue() in
-- src/booking/pricing.ts.

alter table public.golf_bookings
  add column deposit int not null default 0,
  add column balance_paid_at timestamptz;

-- Everything sent to Payso before this was charged in full.
update public.golf_bookings set deposit = total where invoice_no is not null;

alter table public.golf_bookings add constraint golf_bookings_deposit_check check (deposit between 0 and total);

-- Each activity's deposit per person is staff's to change in /admin → Activities & prices.
update public.golf_activities set data = data || '{"deposit": 500}'::jsonb where not (data ? 'deposit');

-- The same as in tee-payments.sql, and it also saves the deposit. Only the
-- website's server can set one; a pending booking that doesn't say is paying
-- in full, which is what the website did before deposits.
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
    first_name, last_name, email, phone, country, handicap, notes, lines, total, source, status, expires_at, deposit)
  values (v_ref, v_activity, p_booking ->> 'option', v_date, v_start, v_minutes, v_players, coalesce(p_booking -> 'rentals', '{}'),
    nullif(p_booking ->> 'transfer', '')::time, coalesce(p_booking ->> 'pickup_from', ''), coalesce(p_booking ->> 'experience', ''),
    p_booking ->> 'first_name', coalesce(p_booking ->> 'last_name', ''), coalesce(p_booking ->> 'email', ''), coalesce(p_booking ->> 'phone', ''),
    coalesce(p_booking ->> 'country', ''), coalesce(p_booking ->> 'handicap', ''), coalesce(p_booking ->> 'notes', ''),
    coalesce(p_booking -> 'lines', '[]'), (p_booking ->> 'total')::int, coalesce(p_booking ->> 'source', 'online'),
    case when v_pending then 'pending' else 'booked' end,
    case when v_pending then (p_booking ->> 'expires_at')::timestamptz else null end,
    case when v_pending then coalesce((p_booking ->> 'deposit')::int, (p_booking ->> 'total')::int) else 0 end);
  return v_ref;
end $$;
