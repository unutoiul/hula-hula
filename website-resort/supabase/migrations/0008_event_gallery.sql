-- Events get more photos and videos than their one cover picture: uploaded
-- photos, uploaded video files and YouTube links, in the order staff set at
-- /admin. The website reads them through /api/content (select=*, so it works
-- before and after this runs).
alter table public.events add column if not exists gallery text[] not null default '{}'
  check (cardinality(gallery) <= 30);

-- The "content" bucket now also takes video files, up to 50 MB each (photos
-- are still shrunk to a ~300 KB WebP in the browser before they're uploaded).
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime']
where id = 'content';
