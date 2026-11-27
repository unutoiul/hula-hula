-- Early bird offers: "book at least N days before check-in". Offers are now
-- decided by the check-in day (stay_from / stay_to = which arrival days) and
-- discount every night of the stay — see api/_lib/dealRules.ts. Empty = any
-- time. The website reads offers with select=*, so it works before and after
-- this runs.
alter table public.offers add column if not exists min_advance_days int
  check (min_advance_days between 1 and 365);
