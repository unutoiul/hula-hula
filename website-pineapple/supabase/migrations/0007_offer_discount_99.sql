-- Offers can take up to 99% off (was 90%), e.g. a near-free promo code for
-- trying real payments. Run in the Supabase SQL editor before saving an offer
-- above 90% in /admin. It drops whichever check limits discount_percent
-- (named automatically when 0002 added the column), then adds the new one.
do $$
declare c record;
begin
  for c in select conname from pg_constraint
    where conrelid = 'public.offers'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%discount_percent%'
  loop
    execute format('alter table public.offers drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.offers
  add constraint offers_discount_percent_check check (discount_percent >= 0 and discount_percent <= 99);
