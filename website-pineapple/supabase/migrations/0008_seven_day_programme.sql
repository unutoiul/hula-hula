-- Royal Pineapple: the CMS "activities" are the hotel's 7-day programme.
-- Each day keeps the card fields (kicker, title, detail, images) and gains
-- what the hotel's poster says about it: the weekday, the place, the times,
-- how guests get there, the price and whether the hotel bus is free.
alter table public.activities
  add column weekday smallint check (weekday between 1 and 7),
  add column place text check (char_length(place) <= 80),
  add column time_label text check (char_length(time_label) <= 40),
  add column transport text check (char_length(transport) <= 80),
  add column price_note text check (char_length(price_note) <= 80),
  add column free_bus boolean not null default false;
