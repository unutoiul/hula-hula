-- Hula Hula Golf Club: events get more photos and videos than their cover —
-- uploaded photos, uploaded video files and YouTube links, in the order staff
-- set at /admin/events/<id>, shown as a gallery on the event's page. Runs
-- after events.sql. The website and /admin work before and after it runs.
alter table public.golf_events add column if not exists gallery text[] not null default '{}'
  check (cardinality(gallery) <= 30);

-- The "club-images" bucket now also takes video files, up to 50 MB each
-- (photos are still shrunk to a WebP in the browser before they're uploaded).
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
where id = 'club-images';
