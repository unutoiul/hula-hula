-- Hula Hula Golf Club: events (a pro day, a tournament…) with packages sold
-- online through 2C2P. Runs after golf.sql, in the golf club's Supabase
-- project. Safe to read top to bottom:
--   golf_events          → the event page: date, story, schedule, cover photo
--   golf_event_packages  → what's on sale: price, how many, what's included
--   golf_event_orders    → each purchase, from "pay" through to paid
--   golf_event_reserve() → holds places only while there are some left
--   storage "club-images" → event covers and activity photos uploaded from /admin

-- ── Events ───────────────────────────────────────────────────────────────
create table public.golf_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  title text not null check (length(title) between 1 and 120),
  tagline text not null default '' check (length(tagline) <= 200),
  starts_on date not null,
  ends_on date check (ends_on is null or ends_on >= starts_on),
  start_time time,
  end_time time,
  description text not null default '' check (length(description) <= 5000),
  highlights text[] not null default '{}',
  -- [{ "time": "09:00", "text": "Registration & coffee" }, …]
  schedule jsonb not null default '[]',
  cover_image text check (length(cover_image) <= 500),
  published boolean not null default false,
  sales_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger golf_events_touch before update on public.golf_events for each row execute function public.golf_touch_updated_at();
alter table public.golf_events enable row level security;
-- The website reads events through api/ with the secret key; staff edit them from /admin.
create policy golf_events_staff on public.golf_events for all to authenticated using (public.is_golf_staff()) with check (public.is_golf_staff());

create table public.golf_event_packages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.golf_events (id) on delete cascade,
  name text not null check (length(name) between 1 and 80),
  description text not null default '' check (length(description) <= 400),
  includes text[] not null default '{}',
  price int not null check (price >= 0),
  -- How many can be sold in total, and per order.
  capacity int not null check (capacity >= 0),
  max_per_order int not null default 4 check (max_per_order between 1 and 50),
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index golf_event_packages_event on public.golf_event_packages (event_id, sort_order);
alter table public.golf_event_packages enable row level security;
create policy golf_event_packages_staff on public.golf_event_packages for all to authenticated using (public.is_golf_staff()) with check (public.is_golf_staff());

-- ── Orders ───────────────────────────────────────────────────────────────
create table public.golf_event_orders (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  -- 2C2P's invoice number for online orders (null for sales at the desk).
  invoice_no text unique,
  -- Only the browser that started the order can read its status (sha256 of its key).
  access_key_hash text,
  event_id uuid not null references public.golf_events (id),
  package_id uuid not null references public.golf_event_packages (id),
  event_title text not null,
  package_name text not null,
  quantity int not null check (quantity between 1 and 50),
  unit_price int not null check (unit_price >= 0),
  total int not null check (total >= 0),
  first_name text not null check (length(first_name) between 1 and 80),
  last_name text not null default '' check (length(last_name) <= 80),
  email text not null default '' check (length(email) <= 120),
  phone text not null default '' check (length(phone) <= 40),
  country text not null default '' check (length(country) <= 2),
  notes text not null default '' check (length(notes) <= 1000),
  source text not null default 'online' check (source in ('online', 'desk')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired', 'cancelled', 'refunded')),
  -- Paid on 2C2P's sandbox: no real money moved.
  test_payment boolean not null default false,
  -- e.g. paid_after_expiry (the places may have gone to someone else meanwhile)
  flags text[] not null default '{}',
  expires_at timestamptz,
  payment_token text,
  paid_amount numeric(12, 2),
  tran_ref text,
  channel_code text,
  resp_code text,
  resp_desc text,
  last_inquiry_at timestamptz,
  paid_at timestamptz,
  emails_claimed_at timestamptz,
  emailed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index golf_event_orders_package on public.golf_event_orders (package_id, status);
create index golf_event_orders_event on public.golf_event_orders (event_id, created_at);
create trigger golf_event_orders_touch before update on public.golf_event_orders for each row execute function public.golf_touch_updated_at();
alter table public.golf_event_orders enable row level security;
create policy golf_event_orders_staff_read on public.golf_event_orders for select to authenticated using (public.is_golf_staff());
create policy golf_event_orders_staff_update on public.golf_event_orders for update to authenticated using (public.is_golf_staff()) with check (public.is_golf_staff());

-- Places taken in a package: everything paid, plus orders still inside their
-- payment window.
create or replace function public.golf_event_taken(p_package uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(quantity), 0)::int from golf_event_orders
  where package_id = p_package and (status = 'paid' or (status = 'pending' and expires_at > now()));
$$;
revoke execute on function public.golf_event_taken(uuid) from public, anon;
grant execute on function public.golf_event_taken(uuid) to authenticated, service_role;

-- Saves an order only if the package still has the places — one order at a
-- time per package, so two guests can never both get the last place. The
-- website's server calls it for online orders (pending, held until
-- p_order.expires_at); staff call it for sales at the desk (paid straight
-- away). Returns the new order's id.
create or replace function public.golf_event_reserve(p_order jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_package golf_event_packages;
  v_event golf_events;
  v_qty int := (p_order ->> 'quantity')::int;
  v_desk boolean := coalesce(p_order ->> 'source', 'online') = 'desk';
  v_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' and not public.is_golf_staff() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if v_desk and not public.is_golf_staff() and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext('golf-event:' || (p_order ->> 'package_id')));
  select * into v_package from golf_event_packages where id = (p_order ->> 'package_id')::uuid;
  select * into v_event from golf_events where id = v_package.event_id;
  if v_package.id is null or not v_package.active then raise exception 'sold out: package unavailable'; end if;
  if not v_desk and (not v_event.published or not v_event.sales_open) then raise exception 'sold out: sales closed'; end if;
  if v_qty < 1 or (not v_desk and v_qty > v_package.max_per_order) then raise exception 'invalid quantity'; end if;
  if public.golf_event_taken(v_package.id) + v_qty > v_package.capacity then raise exception 'sold out: not enough places'; end if;

  insert into golf_event_orders (ref, invoice_no, access_key_hash, event_id, package_id, event_title, package_name, quantity, unit_price, total,
    first_name, last_name, email, phone, country, notes, source, status, test_payment, expires_at, paid_at)
  values (p_order ->> 'ref', nullif(p_order ->> 'invoice_no', ''), nullif(p_order ->> 'access_key_hash', ''), v_event.id, v_package.id,
    v_event.title, v_package.name, v_qty, v_package.price, v_package.price * v_qty,
    p_order ->> 'first_name', coalesce(p_order ->> 'last_name', ''), coalesce(p_order ->> 'email', ''), coalesce(p_order ->> 'phone', ''),
    coalesce(p_order ->> 'country', ''), coalesce(p_order ->> 'notes', ''),
    case when v_desk then 'desk' else 'online' end, case when v_desk then 'paid' else 'pending' end,
    coalesce((p_order ->> 'test_payment')::boolean, false),
    case when v_desk then null else (p_order ->> 'expires_at')::timestamptz end,
    case when v_desk then now() else null end)
  returning id into v_id;
  return v_id;
end $$;
revoke execute on function public.golf_event_reserve(jsonb) from public, anon;
grant execute on function public.golf_event_reserve(jsonb) to authenticated, service_role;

-- ── Photos uploaded from /admin (event covers, activity cards) ───────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('club-images', 'club-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy club_images_staff_insert on storage.objects for insert to authenticated with check (bucket_id = 'club-images' and public.is_golf_staff());
create policy club_images_staff_update on storage.objects for update to authenticated using (bucket_id = 'club-images' and public.is_golf_staff());
create policy club_images_staff_delete on storage.objects for delete to authenticated using (bucket_id = 'club-images' and public.is_golf_staff());
