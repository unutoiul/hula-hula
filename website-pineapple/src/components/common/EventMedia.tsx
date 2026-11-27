import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import CloseRounded from '@mui/icons-material/CloseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import { Box, Dialog, IconButton, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import { useRef } from 'react';
import { brand } from '../../theme';
import { ResortPhoto } from './ResortPhoto';

// An event's photos and videos from /admin: uploaded pictures (or the hotel's
// own photos), uploaded video files and YouTube links — one list of web
// addresses, where the address says which kind each one is.

export type MediaKind = 'image' | 'video' | 'youtube';

const VIDEO_FILE = /\.(mp4|m4v|webm|mov)(?:[?#]|$)/i;

/** The 11-character id in any YouTube link (watch, youtu.be, shorts, embed, live). */
export function youTubeId(url: string): string | null {
  const match = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i.exec(url);
  return match ? match[1] : null;
}

export const mediaKind = (url: string): MediaKind => (youTubeId(url) ? 'youtube' : VIDEO_FILE.test(url) ? 'video' : 'image');
export const isPicture = (url: string) => mediaKind(url) === 'image';
export const youTubeThumb = (url: string) => `https://i.ytimg.com/vi/${youTubeId(url)}/hqdefault.jpg`;

const fill = { display: 'block', width: '100%', height: '100%', objectFit: 'cover' } as const;

/** A preview tile: the photo, a video's first frame or YouTube's thumbnail; videos get a play badge. */
export function MediaThumb({ src, alt, sizes, badgeSize = 44, sx }: { src: string; alt: string; sizes?: string; badgeSize?: number; sx?: SxProps<Theme> }) {
  const kind = mediaKind(src);
  return <Box sx={[{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', bgcolor: brand.plum }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
    {kind === 'image' && <ResortPhoto image={src} alt={alt} sizes={sizes} />}
    {kind === 'youtube' && <Box component="img" src={youTubeThumb(src)} alt={alt} loading="lazy" decoding="async" sx={fill} />}
    {/* #t=0.1 makes iPhones paint the first frame instead of a blank box. */}
    {kind === 'video' && <Box component="video" src={`${src}#t=0.1`} muted playsInline preload="metadata" aria-label={alt} sx={{ ...fill, pointerEvents: 'none' }} />}
    {kind !== 'image' && <PlayBadge size={badgeSize} />}
  </Box>;
}

export function PlayBadge({ size = 44 }: { size?: number }) {
  return <Box aria-hidden sx={{
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: size, height: size, borderRadius: '50%',
    display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,.92)', color: brand.plum, boxShadow: '0 4px 14px rgba(0,0,0,.25)',
  }}><PlayArrowRounded sx={{ fontSize: size * .6 }} /></Box>;
}

// Light round controls that read clearly on the viewer's dark backdrop — same
// look as the photo gallery's viewer.
const viewerButtonSx = { width: 48, height: 48, bgcolor: '#fffaf6', color: 'text.primary', '&:hover': { bgcolor: 'secondary.main' } } as const;

/**
 * Full-screen viewer for an event's photos and videos: one at a time at its
 * natural shape, videos with their controls (YouTube in its own player).
 * Arrows, arrow keys and swiping page through; `index` null = closed.
 */
export function MediaViewer({ items, title, index, onIndex }: { items: string[]; title: string; index: number | null; onIndex: (index: number | null) => void }) {
  const touchStartX = useRef<number | null>(null);
  const count = items.length;
  const current = index === null || !count ? null : items[index % count];
  const move = (step: number) => { if (index !== null && count) onIndex((index + step + count) % count); };
  const close = () => onIndex(null);
  const kind = current ? mediaKind(current) : 'image';
  const arrows = count > 1;

  return <Dialog open={current !== null} onClose={close} fullScreen aria-label={`${title}: photos and videos`}
    onKeyDown={(event) => {
      // A focused video uses the arrow keys to seek.
      if ((event.target as HTMLElement).tagName === 'VIDEO') return;
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'ArrowLeft') move(-1);
    }}
    slotProps={{ paper: { sx: { bgcolor: brand.plum, color: 'common.white', backgroundImage: 'none' } } }}>
    {current && <Box
      onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const dx = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
      }}
      sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', gap: { xs: 2, md: 2.5 }, p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Typography variant="overline" noWrap sx={{ color: 'rgba(255,255,255,.75)', minWidth: 0 }}>{title}{count > 1 && ` · ${(index ?? 0) % count + 1} / ${count}`}</Typography>
        <IconButton onClick={close} aria-label="Close" sx={viewerButtonSx}><CloseRounded /></IconButton>
      </Stack>
      <Box sx={{ position: 'relative', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { md: arrows ? 10 : 0 } }}>
        {kind === 'image' && <ResortPhoto key={current} image={current} alt={title} eager sizes="(max-width: 900px) 100vw, 85vw"
          sx={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '20px' }} />}
        {kind === 'video' && <Box key={current} component="video" src={current} controls autoPlay playsInline
          sx={{ display: 'block', maxWidth: '100%', maxHeight: '100%', borderRadius: '20px', bgcolor: 'black' }} />}
        {kind === 'youtube' && <Box key={current} sx={{ width: 'min(100%, calc((100dvh - 190px) * 16 / 9))', aspectRatio: '16 / 9', borderRadius: '20px', overflow: 'hidden', bgcolor: 'black' }}>
          <Box component="iframe" src={`https://www.youtube-nocookie.com/embed/${youTubeId(current)}?autoplay=1&rel=0&playsinline=1`} title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen sx={{ display: 'block', width: '100%', height: '100%', border: 0 }} />
        </Box>}
        {arrows && <>
          <IconButton aria-label="Previous" onClick={() => move(-1)} sx={{ ...viewerButtonSx, display: { xs: 'none', md: 'inline-flex' }, position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}><ChevronLeft /></IconButton>
          <IconButton aria-label="Next" onClick={() => move(1)} sx={{ ...viewerButtonSx, display: { xs: 'none', md: 'inline-flex' }, position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}><ChevronRight /></IconButton>
        </>}
      </Box>
      {arrows ? <Stack direction="row" alignItems="center" spacing={1} sx={{ overflowX: 'auto', pb: .5, justifyContent: { md: 'center' } }}>
        <IconButton aria-label="Previous" onClick={() => move(-1)} sx={{ ...viewerButtonSx, display: { md: 'none' }, flexShrink: 0 }}><ChevronLeft /></IconButton>
        {/* Thumbnails to jump straight to one (from tablets up). */}
        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' }, flex: { xs: 1, md: 'none' }, minWidth: 0 }}>
          {items.map((src, i) => <Box key={`${src}-${i}`} component="button" type="button" onClick={() => onIndex(i)} aria-label={`Show ${i + 1} of ${count}`} aria-current={i === (index ?? 0) % count}
            sx={{ flexShrink: 0, width: 72, height: 52, p: 0, borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', bgcolor: 'transparent', border: '2px solid', borderColor: i === (index ?? 0) % count ? 'secondary.main' : 'transparent', opacity: i === (index ?? 0) % count ? 1 : .65, '&:hover': { opacity: 1 } }}>
            <MediaThumb src={src} alt="" sizes="72px" badgeSize={22} />
          </Box>)}
        </Stack>
        <Box sx={{ flex: 1, display: { xs: 'block', sm: 'none' } }} />
        <IconButton aria-label="Next" onClick={() => move(1)} sx={{ ...viewerButtonSx, display: { md: 'none' }, flexShrink: 0 }}><ChevronRight /></IconButton>
      </Stack> : <Box />}
    </Box>}
  </Dialog>;
}
