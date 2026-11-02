-- Offers get their dates back (dropped in 0003):
--   valid_from / valid_to → when the offer shows on the website and can be BOOKED
--   stay_from / stay_to   → which NIGHTS it discounts
-- All optional: empty means no limit, so an offer with no dates is live while
-- it's switched on, as before. Run BEFORE deploying the code that reads them
-- (adding columns doesn't affect the code that's live now).

alter table public.offers
  add column valid_from date,
  add column valid_to date,
  add column stay_from date,
  add column stay_to date,
  add constraint offers_valid_window check (valid_to is null or valid_from is null or valid_to >= valid_from),
  add constraint offers_stay_window check (stay_to is null or stay_from is null or stay_to >= stay_from);

-- Visitors see switched-on homepage offers inside their dates; secret-code
-- offers stay hidden (the booking functions read every active offer with the secret key).
drop policy offers_public on public.offers;
create policy offers_public on public.offers for select to anon, authenticated
  using (active and show_on_homepage
    and (valid_from is null or valid_from <= public.today_bkk())
    and (valid_to is null or valid_to >= public.today_bkk()));
