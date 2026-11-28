import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import CloseRounded from '@mui/icons-material/CloseRounded';
import PhotoLibraryOutlined from '@mui/icons-material/PhotoLibraryOutlined';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import ZoomOutRounded from '@mui/icons-material/ZoomOutRounded';
import { Box, Dialog, IconButton, Stack, Typography } from '@mui/material';
import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  type SetStateAction,
} from 'react';
import { ResortPhoto } from '../../components/common/ResortPhoto';

// Site colours: the viewer's backdrop, the scrim behind badges on a photo, and
// the light round controls (same as the gallery viewer's).
const BACKDROP = '#3a1830';
const SCRIM = 'rgba(58,24,48,.68)';
const CONTROL_BG = '#fffaf6';

const MAX_ZOOM = 4;
const TAP_ZOOM = 2.5;
const STEP_ZOOM = 1.5;

const controlSx = {
  width: 44,
  height: 44,
  bgcolor: CONTROL_BG,
  color: 'text.primary',
  boxShadow: '0 4px 14px rgba(0,0,0,.22)',
  transition: 'background-color .2s ease, opacity .2s ease',
  '&:hover': { bgcolor: 'secondary.main' },
} as const;
const ghostSx = {
  width: 40,
  height: 40,
  color: 'common.white',
  '&:hover': { bgcolor: 'rgba(255,255,255,.14)' },
  '&.Mui-disabled': { color: 'rgba(255,255,255,.3)' },
} as const;

// A room card's photo: tap it (or the zoom badge) for the full-screen viewer,
// arrows or a swipe to page through, and a badge saying how many photos there
// are. Fills its parent, which sets the size.
export function RoomPhotos({ images, title, sizes }: { images: string[]; title: string; sizes: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        bgcolor: 'divider',
        '@media (hover: hover)': {
          '&:hover .room-photo img': { transform: 'scale(1.04)' },
          '&:hover .room-photo-zoom': { bgcolor: 'secondary.main', color: 'text.primary' },
        },
      }}
    >
      <Box
        component="button"
        type="button"
        className="room-photo"
        aria-haspopup="dialog"
        aria-label={count > 1 ? `View all ${count} photos of ${title}` : `View the photo of ${title}`}
        onClick={() => {
          if (swiped.current) {
            swiped.current = false;
            return;
          }
          setOpen(true);
        }}
        onTouchStart={(e) => {
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          swiped.current = false;
        }}
        onTouchEnd={(e) => {
          const start = touch.current;
          touch.current = null;
          if (!start || count < 2) return;
          const dx = e.changedTouches[0].clientX - start.x,
            dy = e.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            swiped.current = true;
            go(dx < 0 ? 1 : -1);
          }
        }}
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          p: 0,
          m: 0,
          border: 0,
          bgcolor: 'transparent',
          cursor: 'zoom-in',
          touchAction: 'pan-y',
          '& img': { transition: 'transform .5s cubic-bezier(.2,.8,.2,1)' },
          '&:focus-visible': { outline: '3px solid', outlineColor: 'secondary.main', outlineOffset: '-3px' },
        }}
      >
        <ResortPhoto image={images[index]} alt="" sizes={sizes} sx={{ position: 'absolute', inset: 0 }} />
      </Box>

      <Box
        aria-hidden
        className="room-photo-zoom"
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 34,
          height: 34,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: SCRIM,
          color: 'common.white',
          backdropFilter: 'blur(6px)',
          pointerEvents: 'none',
          transition: 'background-color .2s ease, color .2s ease',
        }}
      >
        <ZoomInRounded sx={{ fontSize: 20 }} />
      </Box>
      {count > 1 && (
        <>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              left: 10,
              bottom: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              px: '10px',
              py: '5px',
              borderRadius: '999px',
              bgcolor: SCRIM,
              color: 'common.white',
              backdropFilter: 'blur(6px)',
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1.2,
              fontVariantNumeric: 'tabular-nums',
              pointerEvents: 'none',
            }}
          >
            <PhotoLibraryOutlined sx={{ fontSize: 15 }} />
            {index + 1} / {count}
          </Box>
          <IconButton
            aria-label={`Previous photo of ${title}`}
            onClick={() => go(-1)}
            sx={{
              position: 'absolute',
              left: 8,
              top: 'calc(50% - 20px)',
              bgcolor: CONTROL_BG,
              width: 40,
              height: 40,
              '&:hover': { bgcolor: 'secondary.main' },
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={`Next photo of ${title}`}
            onClick={() => go(1)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 'calc(50% - 20px)',
              bgcolor: CONTROL_BG,
              width: 40,
              height: 40,
              '&:hover': { bgcolor: 'secondary.main' },
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </>
      )}

      <PhotoViewer open={open} onClose={() => setOpen(false)} images={images} title={title} index={index} setIndex={setIndex} />
    </Box>
  );
}

// The full-screen viewer: room name and "Photo 2 of 5" up top with zoom
// controls, the photo in the middle (click, double-tap, pinch or scroll to
// zoom; drag to look around), thumbnails of every photo below. Arrow keys
// page, + / − / 0 zoom, Esc closes.
function PhotoViewer({
  open,
  onClose,
  images,
  title,
  index,
  setIndex,
}: {
  open: boolean;
  onClose: () => void;
  images: string[];
  title: string;
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
}) {
  const count = images.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const stage = useRef<ZoomHandle>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const titleId = useId();
  const zoomed = zoom > 1.01;

  // Keep the current thumbnail in view.
  useEffect(() => {
    if (!open) return;
    const el = strip.current?.children[index] as HTMLElement | undefined;
    if (el && strip.current)
      strip.current.scrollTo({ left: el.offsetLeft - strip.current.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
  }, [open, index]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      aria-labelledby={titleId}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        else if (e.key === 'ArrowLeft') go(-1);
        else if (e.key === '+' || e.key === '=') stage.current?.zoomIn();
        else if (e.key === '-') stage.current?.zoomOut();
        else if (e.key === '0') stage.current?.reset();
      }}
      slotProps={{ paper: { sx: { bgcolor: BACKDROP, color: 'common.white', backgroundImage: 'none' } } }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr) auto',
          gap: { xs: '12px', md: '16px' },
          py: { xs: '12px', md: '20px' },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap="12px" sx={{ px: { xs: '16px', md: '24px' } }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id={titleId}
              variant="h3"
              sx={{
                fontSize: { xs: 20, md: 26 },
                lineHeight: 1.15,
                color: 'common.white',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>
            <Typography
              aria-live="polite"
              sx={{ mt: '2px', fontSize: 13, color: 'rgba(255,255,255,.7)', fontVariantNumeric: 'tabular-nums' }}
            >
              Photo {index + 1} of {count}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" gap="10px" sx={{ flexShrink: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                p: '2px',
                borderRadius: '999px',
                bgcolor: 'rgba(255,255,255,.08)',
                border: '1px solid rgba(255,255,255,.12)',
              }}
            >
              <IconButton aria-label="Zoom out" disabled={!zoomed} onClick={() => stage.current?.zoomOut()} sx={ghostSx}>
                <ZoomOutRounded />
              </IconButton>
              <Box
                component="button"
                type="button"
                aria-label="Reset zoom"
                disabled={!zoomed}
                onClick={() => stage.current?.reset()}
                sx={{
                  minWidth: 52,
                  p: 0,
                  border: 0,
                  bgcolor: 'transparent',
                  color: 'common.white',
                  font: 'inherit',
                  fontSize: 13,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  cursor: zoomed ? 'pointer' : 'default',
                }}
              >
                {Math.round(zoom * 100)}%
              </Box>
              <IconButton aria-label="Zoom in" disabled={zoom >= MAX_ZOOM - 0.01} onClick={() => stage.current?.zoomIn()} sx={ghostSx}>
                <ZoomInRounded />
              </IconButton>
            </Stack>
            <IconButton aria-label="Close photos" onClick={onClose} sx={controlSx}>
              <CloseRounded />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ position: 'relative', minHeight: 0 }}>
          <ZoomStage
            key={images[index]}
            ref={stage}
            image={images[index]}
            alt={`${title}, photo ${index + 1} of ${count}`}
            onZoomChange={setZoom}
            onSwipe={count > 1 ? go : undefined}
          />
          {count > 1 &&
            [-1, 1].map((step) => (
              <IconButton
                key={step}
                aria-label={step < 0 ? 'Previous photo' : 'Next photo'}
                onClick={() => go(step)}
                sx={{
                  ...controlSx,
                  width: 48,
                  height: 48,
                  display: { xs: 'none', sm: 'inline-flex' },
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  ...(step < 0 ? { left: { sm: 12, md: 24 } } : { right: { sm: 12, md: 24 } }),
                  opacity: zoomed ? 0 : 1,
                  pointerEvents: zoomed ? 'none' : 'auto',
                }}
              >
                {step < 0 ? <ChevronLeft /> : <ChevronRight />}
              </IconButton>
            ))}
        </Box>

        <Stack alignItems="center" gap="10px" sx={{ minWidth: 0 }}>
          {count > 1 && (
            <Box
              ref={strip}
              sx={{
                position: 'relative',
                display: 'flex',
                gap: '8px',
                maxWidth: '100%',
                overflowX: 'auto',
                px: '16px',
                py: '4px',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                '& > :first-of-type': { ml: 'auto' },
                '& > :last-of-type': { mr: 'auto' },
              }}
            >
              {images.map((src, i) => (
                <Box
                  key={src}
                  component="button"
                  type="button"
                  aria-label={`Show photo ${i + 1} of ${count}`}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => setIndex(i)}
                  sx={{
                    position: 'relative',
                    flexShrink: 0,
                    width: { xs: 64, md: 84 },
                    height: { xs: 46, md: 58 },
                    p: 0,
                    border: 0,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    bgcolor: 'rgba(255,255,255,.08)',
                    opacity: i === index ? 1 : 0.5,
                    transition: 'opacity .2s ease',
                    outline: i === index ? '2px solid' : 'none',
                    outlineColor: 'secondary.main',
                    outlineOffset: '2px',
                    '&:hover': { opacity: 1 },
                    '&:focus-visible': { opacity: 1, outline: '2px solid', outlineColor: 'common.white' },
                  }}
                >
                  <ResortPhoto image={src} alt="" sizes="96px" sx={{ position: 'absolute', inset: 0 }} />
                </Box>
              ))}
            </Box>
          )}
          <Typography sx={{ px: '16px', fontSize: 12, color: 'rgba(255,255,255,.6)', textAlign: 'center' }}>
            <Box component="span" sx={{ display: 'none', '@media (hover: hover)': { display: 'inline' } }}>
              Click or scroll to zoom · drag to look around{count > 1 ? ' · ← → for more photos' : ''}
            </Box>
            <Box component="span" sx={{ '@media (hover: hover)': { display: 'none' } }}>
              Pinch or double-tap to zoom{count > 1 ? ' · swipe for more photos' : ''}
            </Box>
          </Typography>
        </Stack>
      </Box>
    </Dialog>
  );
}

type ZoomHandle = { zoomIn: () => void; zoomOut: () => void; reset: () => void };
type View = { s: number; x: number; y: number };
const REST: View = { s: 1, x: 0, y: 0 };
type Gesture = { x: number; y: number; view: View; moved: boolean; swipe: boolean; pinch?: { dist: number; mx: number; my: number } };

// One photo, fitted to the space, that zooms (1×–4×) about the pointer and pans
// within its edges. Mouse: click toggles zoom, wheel zooms, drag pans. Touch:
// pinch, double-tap, drag; a sideways swipe at 1× asks for the next photo.
function ZoomStage({
  ref,
  image,
  alt,
  onZoomChange,
  onSwipe,
}: {
  ref: Ref<ZoomHandle>;
  image: string;
  alt: string;
  onZoomChange: (scale: number) => void;
  onSwipe?: (step: number) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(REST);
  const viewRef = useRef(view);
  const [live, setLive] = useState(false); // a finger or the mouse is moving the photo, so no easing
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const lastTap = useRef<{ x: number; y: number; t: number } | null>(null);

  const apply = (next: View) => {
    viewRef.current = next;
    setView(next);
  };
  const measure = () => {
    const el = stageRef.current,
      img = el?.querySelector('img');
    if (!el || !img) return null;
    const r = el.getBoundingClientRect();
    return {
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      width: r.width,
      height: r.height,
      w: img.offsetWidth,
      h: img.offsetHeight,
    };
  };
  // Keep the zoom in range and the photo's edges from coming inside the stage.
  const clamp = (v: View): View => {
    const m = measure(),
      s = Math.min(MAX_ZOOM, Math.max(1, v.s));
    if (!m || s === 1) return REST;
    const mx = Math.max(0, (m.w * s - m.width) / 2),
      my = Math.max(0, (m.h * s - m.height) / 2);
    return { s, x: Math.min(mx, Math.max(-mx, v.x)), y: Math.min(my, Math.max(-my, v.y)) };
  };
  // Zoom to `scale`, keeping the point under (px, py) where it is.
  const zoomAt = (scale: number, px?: number, py?: number) => {
    const m = measure();
    if (!m) return;
    const from = viewRef.current,
      s = Math.min(MAX_ZOOM, Math.max(1, scale)),
      k = s / from.s;
    const ox = (px ?? m.cx) - m.cx,
      oy = (py ?? m.cy) - m.cy;
    apply(clamp({ s, x: ox - (ox - from.x) * k, y: oy - (oy - from.y) * k }));
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => zoomAt(viewRef.current.s * STEP_ZOOM),
    zoomOut: () => zoomAt(viewRef.current.s / STEP_ZOOM),
    reset: () => apply(REST),
  }));

  useEffect(() => {
    onZoomChange(view.s);
  }, [view.s, onZoomChange]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(viewRef.current.s * Math.exp(-delta * (e.ctrlKey ? 0.01 : 0.002)), e.clientX, e.clientY);
    };
    const onResize = () => apply(clamp(viewRef.current));
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
    };
    // zoomAt and clamp only read refs, so the first render's copies stay right.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start (or restart, when a finger lifts mid-pinch) a gesture from the
  // pointers down now and the photo's current view.
  const begin = (moved: boolean) => {
    const pts = [...pointers.current.values()],
      v = viewRef.current;
    if (pts.length >= 2) {
      const [a, b] = pts;
      gesture.current = {
        x: 0,
        y: 0,
        view: v,
        moved: true,
        swipe: false,
        pinch: { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 },
      };
    } else if (pts.length === 1) {
      gesture.current = { x: pts[0].x, y: pts[0].y, view: v, moved, swipe: !moved && v.s <= 1 };
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* the pointer already went away */
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    begin(pointers.current.size > 1);
    setLive(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    const pts = [...pointers.current.values()];
    if (g.pinch && pts.length >= 2) {
      const m = measure();
      if (!m) return;
      const [a, b] = pts;
      // A little give past the limits, settled on release.
      const s = Math.min(MAX_ZOOM * 1.15, Math.max(0.85, (g.view.s * Math.hypot(a.x - b.x, a.y - b.y)) / g.pinch.dist)),
        k = s / g.view.s;
      const ox = g.pinch.mx - m.cx,
        oy = g.pinch.my - m.cy;
      apply({ s, x: (a.x + b.x) / 2 - m.cx - (ox - g.view.x) * k, y: (a.y + b.y) / 2 - m.cy - (oy - g.view.y) * k });
      return;
    }
    const dx = e.clientX - g.x,
      dy = e.clientY - g.y;
    if (!g.moved && Math.hypot(dx, dy) > 6) g.moved = true;
    if (!g.moved) return;
    if (g.view.s > 1) apply(clamp({ s: g.view.s, x: g.view.x + dx, y: g.view.y + dy }));
    else if (g.swipe && onSwipe) apply({ s: 1, x: dx * 0.6, y: 0 });
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(e.pointerId)) return;
    if (pointers.current.size > 0) {
      begin(true);
      return;
    }
    const g = gesture.current;
    gesture.current = null;
    setLive(false);
    if (!g) return;
    if (e.type === 'pointerup' && !g.moved) {
      tap(e);
      return;
    }
    const dx = e.clientX - g.x;
    if (e.type === 'pointerup' && g.swipe && onSwipe && Math.abs(dx) > 60) {
      onSwipe(dx < 0 ? 1 : -1);
      return;
    }
    const v = viewRef.current;
    apply(v.s < 1.05 ? REST : clamp(v));
  };

  const tap = (e: ReactPointerEvent<HTMLDivElement>) => {
    const toggle = () => {
      if (viewRef.current.s > 1) apply(REST);
      else zoomAt(TAP_ZOOM, e.clientX, e.clientY);
    };
    if (e.pointerType === 'mouse') {
      toggle();
      return;
    }
    const now = Date.now(),
      last = lastTap.current;
    if (last && now - last.t < 320 && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 30) {
      lastTap.current = null;
      toggle();
    } else lastTap.current = { x: e.clientX, y: e.clientY, t: now };
  };

  return (
    <Box
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDragStart={(e) => e.preventDefault()}
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        px: { xs: '0px', sm: '80px', md: '96px' },
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: view.s > 1 ? (live ? 'grabbing' : 'grab') : 'zoom-in',
      }}
    >
      <ResortPhoto
        image={image}
        alt={alt}
        eager
        sizes="1600px"
        sx={{
          width: 'auto',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          borderRadius: { xs: '0px', sm: '14px' },
          pointerEvents: 'none',
          transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`,
          transition: live ? 'none' : 'transform .3s cubic-bezier(.2,.8,.2,1)',
          willChange: 'transform',
        }}
      />
    </Box>
  );
}
