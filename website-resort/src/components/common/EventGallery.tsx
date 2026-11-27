import { Box } from '@mui/material';
import { useState } from 'react';
import { fonts } from '../../theme';
import { MediaThumb, MediaViewer, mediaKind } from './EventMedia';

const SHOWN = 8;

/**
 * An event's photos and videos as a grid (the first eight, the last tile
 * saying how many more) that opens them full screen. Nothing when there are none.
 */
export function EventGallery({ title, media }: { title: string; media: string[] }) {
  const [viewing, setViewing] = useState<number | null>(null);
  if (!media.length) return null;
  const videos = media.filter((src) => mediaKind(src) !== 'image').length;
  const shown = media.slice(0, SHOWN);
  const more = media.length - shown.length;

  return <>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.25, md: 2 } }}>
      {shown.map((src, i) => {
        const last = i === shown.length - 1 && more > 0;
        return <Box key={`${src}-${i}`} component="button" type="button" onClick={() => setViewing(i)}
          aria-label={last ? `See all ${media.length} photos${videos ? ' and videos' : ''}` : `Open ${mediaKind(src) === 'image' ? 'photo' : 'video'} ${i + 1} of ${media.length}`}
          sx={{
            position: 'relative', display: 'block', width: '100%', aspectRatio: '4 / 3', p: 0, border: '5px solid white', borderRadius: '18px', overflow: 'hidden', cursor: 'pointer',
            bgcolor: 'white', boxShadow: '0 8px 22px rgba(23,60,44,.08)',
            '& img, & video': { transition: 'transform .4s ease' }, '@media (hover: hover)': { '&:hover img, &:hover video': { transform: 'scale(1.05)' } },
            '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 3 },
          }}>
          <MediaThumb src={src} alt={`${title} — ${i + 1}`} sizes="(max-width: 600px) 45vw, (max-width: 900px) 30vw, 22vw" sx={{ borderRadius: '13px' }} />
          {last && <Box aria-hidden sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', bgcolor: 'rgba(16,41,31,.62)', color: '#fffef8', fontFamily: fonts.playful, fontSize: { xs: 26, md: 32 } }}>+{more + 1}</Box>}
        </Box>;
      })}
    </Box>
    <MediaViewer items={media} title={title} index={viewing} onIndex={setViewing} />
  </>;
}
