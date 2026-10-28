-- Starting content for the CMS: today's five activities from
-- src/data/content.ts, so the homepage looks the same the day the CMS goes
-- live. Images point at the site's own optimised photos (ResortPhoto keeps
-- their responsive versions). Events and offers start empty on purpose.
--
-- Then add the staff who may use /admin (they also need a Supabase Auth user,
-- created under Authentication → Users with a password):
--   insert into public.admins (email) values ('reservation@hulahularesort.com');

insert into public.activities (kicker, title, detail, images, cta_label, published, sort_order) values
  ('Splash', 'Pool days are the best days', 'Take a dip, find a lounger, and enjoy the tropical pool.',
    array['/images/hula-hula/poolOverview-1600.webp', '/images/hula-hula/poolBar-1600.webp'], 'Help me plan this', true, 10),
  ('Play', 'Tee up a little fun', 'Golf, footgolf, and good company at Hula Hula Golf Club.',
    array['/images/hula-hula/heroGolf-1600.webp', '/images/hula-hula/golfSwing-1600.webp', '/images/hula-hula/golfCourse-1600.webp'], 'Help me plan this', true, 20),
  ('Explore', 'Hello, beautiful Krabi', 'Longtail boats, turquoise water, and the limestone cliffs of Railay.',
    array['/images/hula-hula/longtail-1600.webp', '/images/hula-hula/railay-1600.webp'], 'Help me plan this', true, 30),
  ('Unwind', 'A little time for you', 'Slow down with tropical surroundings and a moment of me time. Ask about our wellness experiences.',
    array['/images/hula-hula/wellness-1600.webp', '/images/hula-hula/garden-1600.webp'], 'Help me plan this', true, 40),
  ('Move', 'Feel good, your way', 'Keep your holiday moving in our bright, garden-facing fitness centre.',
    array['/images/hula-hula/gym-1600.webp'], 'Help me plan this', true, 50);
