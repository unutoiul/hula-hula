-- Offers no longer have date windows: an offer is live while it's switched
-- on (active) and stops when it's switched off. Run AFTER deploying the code
-- that no longer reads these columns.

drop policy offers_public on public.offers;

alter table public.offers
  drop column valid_from,
  drop column valid_to,
  drop column stay_from,
  drop column stay_to;

-- Visitors see switched-on offers meant for the homepage; secret-code offers
-- stay hidden (the booking functions read every active offer with the secret key).
create policy offers_public on public.offers for select to anon, authenticated
  using (active and show_on_homepage);
