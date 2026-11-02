-- Special offers: the "Offers" managed at /admin become real room deals.
-- (The booking/stay date columns added here were dropped again in 0003, and
-- the early bird / last minute ones in 0004.)
-- An offer can take a percentage off the room price, add perks (welcome
-- drink, late check-out…), or both, and only applies when its rules match:
--   valid_from / valid_to       → when it can be BOOKED (also when it shows)
--   stay_from / stay_to         → which NIGHTS it discounts
--   min_nights                  → minimum length of stay
--   min_days_before_arrival     → early bird (book at least N days ahead)
--   max_days_before_arrival     → last minute (book within N days of arrival)
--   room_type_uuids             → SiteMinder room types it covers (empty = all)
--   promo_code                  → a code the guest must enter (empty = automatic)
-- The website applies the single best matching offer per room (no stacking),
-- prices it on the server, and tells the reservations team in the booking email.

alter table public.offers
  add column discount_percent numeric(5, 2) not null default 0 check (discount_percent >= 0 and discount_percent <= 90),
  add column badge text check (length(badge) <= 30),
  add column perks text[] not null default '{}',
  add column stay_from date,
  add column stay_to date,
  add column min_nights int check (min_nights is null or min_nights between 1 and 31),
  add column min_days_before_arrival int check (min_days_before_arrival is null or min_days_before_arrival between 0 and 365),
  add column max_days_before_arrival int check (max_days_before_arrival is null or max_days_before_arrival between 0 and 365),
  add column room_type_uuids text[] not null default '{}',
  add column show_on_homepage boolean not null default true,
  add constraint offers_stay_window check (stay_to is null or stay_from is null or stay_to >= stay_from);

-- Visitors only see offers meant for the homepage, so a secret code stays
-- secret; the booking functions read every active offer with the secret key.
drop policy offers_public on public.offers;
create policy offers_public on public.offers for select to anon, authenticated
  using (active and show_on_homepage
    and (valid_from is null or valid_from <= public.today_bkk())
    and (valid_to is null or valid_to >= public.today_bkk()));
