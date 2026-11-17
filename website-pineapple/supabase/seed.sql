-- Starting content for Royal Pineapple's CMS: the 7-day programme from the
-- hotel's poster (the same as src/data/content.ts, so the homepage looks
-- the same the day the CMS goes live), and the three direct-booking offers
-- from the hotel's brief as switched-off drafts — staff add the discount or
-- perks and switch them on in /admin. Run after the migrations.
--
-- Then add the staff who may use /admin (they also need a Supabase Auth user,
-- created under Authentication → Users with a password):
--   insert into public.admins (email) values ('reservation@thepineapplehotel.com');

insert into public.activities (weekday, kicker, title, place, detail, time_label, transport, price_note, free_bus, images, cta_label, published, sort_order) values
  (1, 'Eco-tourism island', 'Koh Klang & the twin mountains', 'Koh Klang',
    'Cross the Krabi river mouth past Khao Khanap Nam, the twin limestone peaks, to the fishing village on Koh Klang: its floating restaurant and farm, rice fields, honeybees and batik painting.',
    '10:00 – 12:00', 'Longtail boat, with a local guide', '150 THB per person, min. 2', false,
    array['/images/pineapple/dayMonday-1600.webp', '/images/pineapple/longtail-1600.webp'], null, true, 10),
  (2, 'Sport day', 'FootGolf at Hula Hula Golf Club', 'Hula Hula Golf Club',
    'A morning on our sister golf club’s fairways: FootGolf or Crolf, then a cold drink at the clubhouse café. No golf skills needed.',
    '08:30 – 12:30', 'Hotel bus, with the golf club’s chauffeur', 'Free bus · FootGolf 850 THB, Crolf 100 THB', true,
    array['/images/pineapple/dayTuesday-1600.webp'], null, true, 20),
  (3, 'Thai kitchen', 'Maharaj Market & a cooking class', 'Maharaj Morning Market',
    'Shop Krabi’s morning market with our chef, then cook what you bought: sweet and sour, the Thai way.',
    '09:30 – 12:50', 'Hotel bus, with our chef', 'Free bus', true,
    array['/images/pineapple/dayWednesday-1600.webp'], null, true, 30),
  (4, 'Temple & forest', 'Tiger Cave Temple', 'Wat Tham Suea',
    'One of Krabi’s best-known temples, in the forest outside town. Climb to the golden Buddha on the peak, or stay below among the caves and old trees.',
    '09:00 – 12:30', 'Hotel bus', '300 THB per person, min. 2', false,
    array['/images/pineapple/dayThursday-1600.webp', '/images/pineapple/tigerCave-1600.webp'], null, true, 40),
  (5, 'Shopping day', 'Central Krabi', 'Central Krabi',
    'Krabi’s new mall, billed as the first sustainable living mall, full of trees and shade. Shopping, cafés and an air-conditioned lunch.',
    '11:30 – 14:35', 'Hotel bus', 'Free bus', true,
    array['/images/pineapple/dayFriday-1600.webp'], null, true, 50),
  (6, 'Beach fun', 'Ao Nang & Railay Bay', 'Ao Nang, Nopparat Thara, Railay',
    'A day at the coast: Ao Nang Beach, Nopparat Thara Bay and a longtail across to the cliffs and caves of Railay.',
    '11:30 – 17:10', 'Hotel bus', 'Free bus', true,
    array['/images/pineapple/daySaturday-1600.webp', '/images/pineapple/railay-1600.webp'], null, true, 60),
  (7, 'Culture of Buddhism', 'Panurat Temple Community', 'Panurat Temple',
    'A morning with the temple community: Dharma talk, meditation, offering food to the monks and sharing a meal with the neighbours.',
    '09:30 – 11:30', 'A short trip from the hotel', '50 THB per person, min. 2', false,
    array['/images/pineapple/daySunday-1600.webp'], null, true, 70);

insert into public.offers (kicker, title, description, discount_percent, perks, badge, active, sort_order) values
  ('Book direct', 'Pineapple Welcome Offer', 'Exclusive benefits when you book on our own website.', 0, array[]::text[], 'Direct only', false, 10),
  ('More nights, more savings', 'Stay Longer, Save More', 'The longer you stay, the less each night costs.', 0, array[]::text[], null, false, 20),
  ('Stay · Explore · Experience', 'Experience Krabi Package', 'Your room with a taste of the 7-day programme.', 0, array[]::text[], null, false, 30);
