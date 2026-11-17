import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import ArrowOutward from '@mui/icons-material/ArrowOutward';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import { Box } from '@mui/material';
import { useInView } from 'motion/react';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { brand, fonts } from '../../theme';
import { MotionBox } from '../common/motionPrimitives';
import { useHomepageHighlights, type Highlight } from '../sections/cmsCards';
import { BadgePicture } from './BadgePicture';
import { PostcardReel, postcardScenes, wrapReelIndex } from './PostcardReel';

const reelButtonSx = {
  display: 'grid', placeItems: 'center', width: 44, height: 44, p: 0, border: '1px solid #d8b5c5', borderRadius: '50%',
  bgcolor: brand.cream, color: '#782d51', cursor: 'pointer', transition: 'background-color .2s',
  '&:hover': { bgcolor: '#f7dce6' }, '&[aria-disabled="true"]': { opacity: .4, cursor: 'default' }, '& > svg': { fontSize: 18 },
  '@container (max-width: 300px)': { width: 40 },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
} as const;

const twoLines = { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', overflowWrap: 'anywhere', textWrap: 'balance' } as const;
// Keep copy in the clear centre of the frame, between the palms and above the pineapple.
const offerWordsSx = {
  position: 'absolute', inset: '12% 26% 35%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: '1.15cqw', textAlign: 'center', color: '#fff7e8', textShadow: '0 1px 7px #32102c80',
  '& .kicker, & small': { maxWidth: '100%', fontSize: 'clamp(5px, 2.85cqw, 8px)', lineHeight: 1.15 },
  '& .kicker': { ...twoLines, letterSpacing: '.09em', fontWeight: 600, textTransform: 'uppercase' },
  '& small': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  '& strong': { fontFamily: fonts.serif, fontWeight: 400 },
} as const;

function OfferBadgeWords({ item }: { item: Highlight }) {
  const big = item.tag ?? item.title;
  const percent = big.match(/^([+−-]?\d+(?:[.,]\d+)?)%$/);
  return <Box sx={offerWordsSx}>
    <span className="kicker">{item.label}</span>
    {percent
      ? <Box component="strong" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: '.025em', fontSize: 'clamp(20px, 14cqw, 40px)', lineHeight: 1, letterSpacing: '-.055em', fontVariantNumeric: 'lining-nums', whiteSpace: 'nowrap', '& > span': { fontSize: '.55em' } }}>{percent[1]}<span>%</span></Box>
      : <Box component="strong" sx={{ ...twoLines, maxWidth: '100%', fontStyle: 'italic', fontSize: 'clamp(12px, 7.7cqw, 23px)', lineHeight: 1.06, letterSpacing: '-.025em' }}>{big}</Box>}
    {percent && !item.preview && big !== item.title && <small>{item.title}</small>}
  </Box>;
}

export function PostcardCollage() {
  const { reduced, systemReduced, toggle } = useMotionPreference();
  const highlights = useHomepageHighlights();
  const scope = useRef<HTMLDivElement>(null);
  const inView = useInView(scope, { amount: .35 });
  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [pressed, setPressed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const pointer = useRef<{ x: number; y: number; dragged: boolean } | null>(null);
  const suppressClick = useRef(false);
  const wheelTravel = useRef(0);
  const busy = target !== null;
  const step = target !== null && target < index ? -1 : 1;
  const direction = step === 1 ? -1 : 1;
  const sequence = target === null ? [index] : [index, index + step, index + step * 2, index + step * 3, target];
  // The selected caption and counter respond on click while the pictures animate toward that selection.
  const selectedIndex = target ?? index;
  const photoIndex = wrapReelIndex(selectedIndex, postcardScenes.length);
  const photo = postcardScenes[photoIndex];
  const offer = highlights[wrapReelIndex(selectedIndex, highlights.length)];
  const offerAction = offer.preview ? 'Preview offer' : offer.kind === 'event' ? 'See the event' : 'View offer';
  const offerImages = highlights.map(item => item.image).join('|');

  const request = useCallback((next: -1 | 1) => {
    if (target !== null) return;
    if (reduced) setIndex(current => current + next);
    else setTarget(index + next);
  }, [index, target, reduced]);

  const settle = useCallback(() => {
    if (target !== null) { setIndex(target); setTarget(null); }
  }, [target]);

  // Decode every photo and offer image first, so the reel never lands on a blank card.
  useEffect(() => {
    let mounted = true;
    const images = [...postcardScenes.map(scene => scene.image), ...offerImages.split('|')];
    void Promise.all(images.map(source => {
      const image = new Image(); image.src = source;
      return image.decode().catch(() => {});
    })).then(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, [offerImages]);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (busy && (reduced || !visible || !inView)) settle();
  }, [busy, reduced, visible, inView, settle]);

  useEffect(() => {
    if (!ready || busy || reduced || !visible || !inView || hovered || focused || pressed) return;
    const timer = window.setTimeout(() => request(1), 7200);
    return () => window.clearTimeout(timer);
  }, [ready, busy, reduced, visible, inView, hovered, focused, pressed, request]);

  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const wheel = (event: WheelEvent) => {
      // Trackpad horizontal scrolling changes the cards; vertical scrolling keeps working.
      if (Math.abs(event.deltaX) < 5 || Math.abs(event.deltaY) >= Math.abs(event.deltaX)) return;
      event.preventDefault();
      if (busy) { wheelTravel.current = 0; return; }
      wheelTravel.current += event.deltaX;
      if (Math.abs(wheelTravel.current) >= 55) { request(wheelTravel.current > 0 ? 1 : -1); wheelTravel.current = 0; }
    };
    root.addEventListener('wheel', wheel, { passive: false });
    return () => root.removeEventListener('wheel', wheel);
  }, [busy, request]);

  const finishGesture = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    pointer.current = null;
    setPressed(false);
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!start) return;
    suppressClick.current = start.dragged;
    const x = event.clientX - start.x, y = event.clientY - start.y;
    if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.25) request(x < 0 ? 1 : -1);
  };

  const cancelGesture = () => {
    pointer.current = null;
    setPressed(false);
    setDragging(false);
  };

  return <MotionBox ref={scope} role="region" aria-roledescription="carousel"
    aria-label="Hotel postcards and offers" aria-busy={busy} tabIndex={0}
    initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .8 }}
    onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); request(event.key === 'ArrowRight' ? 1 : -1); } }}
    sx={{
      position: 'relative', width: { xs: '100%', md: 'calc(100% - 16px)' }, minWidth: 0, containerType: 'inline-size', outline: 'none',
      '&:focus-visible': { outline: '2px solid #c83b74', outlineOffset: 5, borderRadius: '12px' },
    }}>
    <Box sx={{
      display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) clamp(144px, 41cqw, 248px)', columnGap: '6px',
      pt: { xs: '8px', sm: '15px' }, pr: '2%', isolation: 'isolate', touchAction: 'pan-y', userSelect: 'none',
    }}
      onPointerDown={event => {
        if (event.button !== 0 || busy) return;
        suppressClick.current = false;
        if (event.target instanceof Element && event.target.closest('button')) return;
        pointer.current = { x: event.clientX, y: event.clientY, dragged: false };
        setPressed(true);
      }}
      onPointerMove={event => {
        const start = pointer.current;
        if (!start || start.dragged) return;
        if (Math.abs(event.clientX - start.x) > 12 && Math.abs(event.clientX - start.x) > Math.abs(event.clientY - start.y) * 1.25) {
          start.dragged = true; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId);
        }
      }} onPointerUp={finishGesture} onPointerCancel={cancelGesture}
      onLostPointerCapture={event => { if (event.target === event.currentTarget) cancelGesture(); }}
      onPointerLeave={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) cancelGesture(); }}
      onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}>

      <Box sx={{
        gridColumn: '1 / -1', gridRow: 1, width: 'calc(97.5% - clamp(12px, 3.4cqw, 24px))', ml: '2.5%',
        transform: { xs: 'rotate(-1.5deg)', sm: 'rotate(-2.5deg)' }, cursor: dragging ? 'grabbing' : 'grab',
      }}>
        <BadgePicture frameName="riviera-postcard" label={photo.alt} eager shadow="0 12px 18px #5a244821">
          <PostcardReel key={`photo-${index}-${target}`} sequence={sequence} moving={busy} direction={direction} onSettled={settle}>
            {item => {
              const scene = postcardScenes[wrapReelIndex(item, postcardScenes.length)];
              return <img src={scene.image} alt="" width={1600} height={1067} fetchPriority={item === 0 ? 'high' : 'auto'}
                decoding="async" draggable={false} style={scene.id === 'pool' ? { transform: 'scaleX(-1)' } : undefined} />;
            }}
          </PostcardReel>
        </BadgePicture>
      </Box>

      <Box component="a" href="#offers" aria-label={`${offerAction}: ${offer.title}`} sx={{
        position: 'relative', zIndex: 1, gridColumn: 2, gridRow: 2, alignSelf: 'start',
        mt: 'clamp(-112px, -16cqw, -68px)', containerType: 'inline-size', textDecoration: 'none', color: brand.plum,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', borderRadius: '12px',
        '&:hover > span': { bgcolor: '#f7dce6' },
      }}>
        <Box sx={{ width: '100%', transform: 'rotate(6deg)' }}>
          <BadgePicture frameName="grand-arrival" eager shadow="0 10px 16px #5a24483b">
            <PostcardReel key={`offer-${index}-${target}`} sequence={sequence} moving={busy} direction={direction}>
              {item => {
                const card = highlights[wrapReelIndex(item, highlights.length)];
                return <><img src={card.image} alt="" width={1600} height={1067} decoding="async" draggable={false} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #4a143be6, #4a143bc7 64%, #4a143b80)' }} />
                  <OfferBadgeWords item={card} /></>;
              }}
            </PostcardReel>
          </BadgePicture>
        </Box>
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px', px: '10px', py: '4px', border: '1px solid #dfb8ca', borderRadius: '20px', bgcolor: brand.cream, fontSize: 11, fontWeight: 700 }}>
          {offerAction} <ArrowOutward aria-hidden="true" sx={{ fontSize: 12 }} />
        </Box>
      </Box>
      <Box sx={{
        gridColumn: 1, gridRow: 2, alignSelf: 'start', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: '6px', pt: { xs: '12px', sm: '20px' },
        '@container (min-width: 540px)': { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: '20px', width: '100%' },
      }}>
        <Box aria-live={focused ? 'polite' : 'off'} sx={{ minWidth: 0, fontFamily: fonts.serif, fontStyle: 'italic', fontSize: { xs: 17, sm: 20 }, lineHeight: 1.15, color: brand.royal }}>{photo.title}</Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0, '@container (min-width: 348px)': { gap: '5px' } }}>
          <Box component="button" type="button" onClick={() => request(-1)} aria-disabled={busy} aria-label="Previous hotel photo and offer" sx={reelButtonSx}><ArrowBackRounded /></Box>
          <Box component="span" aria-hidden="true" sx={{ display: 'none', '@container (min-width: 348px)': { display: 'block' }, minWidth: 28, color: '#69354f', fontSize: 11, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{photoIndex + 1}/{postcardScenes.length}</Box>
          <Box component="button" type="button" onClick={() => request(1)} aria-disabled={busy} aria-label="Next hotel photo and offer" sx={reelButtonSx}><ArrowForwardRounded /></Box>
          {!systemReduced && <Box component="button" type="button" onClick={toggle} aria-label={reduced ? 'Play all animations' : 'Pause all animations'} sx={reelButtonSx}>{reduced ? <PlayArrowRounded /> : <PauseRounded />}</Box>}
        </Box>
      </Box>
    </Box>
  </MotionBox>;
}
