import PhotoLibraryRounded from '@mui/icons-material/PhotoLibraryRounded';
import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { MediaThumb, MediaViewer, mediaKind } from '../components/common/EventMedia';
import { fonts } from '../theme';

const SHOWN = 8;

// "Photos & videos" on an event's page: the extra photos, video files and
// YouTube links added at /admin, as a grid (the first eight, the last one
// saying how many more) that opens them full screen. Hidden when there are none.
export function EventGallery({ title, media }: { title: string; media: string[] }) {
  const [viewing, setViewing] = useState<number | null>(null);
  if (!media.length) return null;
  const videos = media.filter((src) => mediaKind(src) !== 'image').length;
  const shown = media.slice(0, SHOWN);
  const more = media.length - shown.length;

  return (
    <Box component="section" aria-labelledby="event-gallery" sx={{ mt: { xs: 6, md: 9 } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'success.dark', mb: 1 }}>
        <PhotoLibraryRounded sx={{ fontSize: 18 }} />
        <Typography variant="overline">A little look</Typography>
      </Stack>
      <Typography id="event-gallery" variant="h2" sx={{ fontSize: { xs: 34, md: 42 }, lineHeight: 1.12, mb: 3 }}>
        {videos ? 'Photos & videos' : 'Photos'}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
          gap: { xs: 1.25, md: 2 },
        }}
      >
        {shown.map((src, i) => {
          const last = i === shown.length - 1 && more > 0;
          return (
            <Box
              key={`${src}-${i}`}
              component="button"
              type="button"
              onClick={() => setViewing(i)}
              aria-label={
                last
                  ? `See all ${media.length} photos${videos ? ' and videos' : ''}`
                  : `Open ${mediaKind(src) === 'image' ? 'photo' : 'video'} ${i + 1} of ${media.length}`
              }
              sx={{
                position: 'relative',
                display: 'block',
                width: '100%',
                aspectRatio: '4 / 3',
                p: 0,
                border: 0,
                borderRadius: '18px',
                overflow: 'hidden',
                cursor: 'pointer',
                bgcolor: 'success.light',
                '& img, & video': { transition: 'transform .4s ease' },
                '@media (hover: hover)': { '&:hover img, &:hover video': { transform: 'scale(1.05)' } },
                '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 3 },
              }}
            >
              <MediaThumb src={src} alt={`${title} — ${i + 1}`} sizes="(max-width: 600px) 45vw, (max-width: 900px) 30vw, 22vw" />
              {last && (
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'rgba(16,41,31,.62)',
                    color: '#fffef8',
                    fontFamily: fonts.playful,
                    fontSize: { xs: 26, md: 32 },
                  }}
                >
                  +{more + 1}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      <MediaViewer items={media} title={title} index={viewing} onIndex={setViewing} />
    </Box>
  );
}
