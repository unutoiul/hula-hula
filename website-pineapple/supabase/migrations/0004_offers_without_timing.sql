-- Offers no longer have "early bird" (book at least N days ahead) or "last
-- minute" (book within N days of arrival) rules. Run AFTER deploying the code
-- that no longer reads these columns.

alter table public.offers
  drop column min_days_before_arrival,
  drop column max_days_before_arrival;
