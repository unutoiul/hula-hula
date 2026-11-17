import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
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
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
} as const;

// The offer card's words scale with the card itself (container query units).
const clampLines = (lines: number) => ({ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: lines, overflow: 'hidden' }) as const;
const offerWordsSx = {
  position: 'absolute', inset: '13% 17% 27%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: 'clamp(4px, 1.8cqw, 8px)', textAlign: 'center', color: '#fff7e8', textShadow: '0 1px 7px #32102c80',
  '& .kicker, & small': { ...clampLines(2), maxWidth: '100%', fontSize: 'clamp(5px, 2.4cqw, 9px)', textWrap: 'balance' },
  '& .kicker': { lineHeight: 1.35, letterSpacing: '.13em', fontWeight: 600, textTransform: 'uppercase' },
  '& small': { lineHeight: 1.4, fontWeight: 400, letterSpacing: '.01em' },
  '& strong': { fontFamily: fonts.serif, fontWeight: 400 },
} as const;

/**
 * The words on the hero's offer badge, for whatever the homepage's offers
 * section shows (a published offer or event, or a sample): the kicker, then
 * the discount, date or name big, then the name or a detail underneath.
 */
function OfferBadgeWords({ item }: { item: Highlight }) {
  const big = item.tag ?? item.title;
  const percent = big.match(/^(.*\d)%$/);
  const detail = item.note?.split(' · ').find(part => part !== item.tag);
  const small = item.preview ? 'Offer preview' : big === item.title ? detail ?? 'Book direct' : item.title;
  return <Box sx={offerWordsSx}>
    <span className="kicker">{item.label}</span>
    {percent
      ? <Box component="strong" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: '.025em', m: 0, fontSize: 'clamp(24px, 16.5cqw, 64px)', lineHeight: .95, letterSpacing: '-.055em', fontVariantNumeric: 'lining-nums', whiteSpace: 'nowrap', '& > span': { fontSize: '.5em', letterSpacing: '-.02em' } }}>{percent[1]}<span>%</span></Box>
      : big.length <= 7
        ? <Box component="strong" sx={{ fontSize: 'clamp(20px, 12cqw, 48px)', lineHeight: 1, letterSpacing: '-.04em', whiteSpace: 'nowrap' }}>{big}</Box>
        : <Box component="strong" sx={{ ...clampLines(3), maxWidth: '100%', fontStyle: 'italic', fontSize: 'clamp(13px, 9cqw, 34px)', lineHeight: 1.02, letterSpacing: '-.03em', textWrap: 'balance' }}>{big}</Box>}
    <small>{small}</small>
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
  const photoIndex = wrapReelIndex(index, postcardScenes.length);
  const photo = postcardScenes[photoIndex];
  const offer = highlights[wrapReelIndex(index, highlights.length)];
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
      position: 'relative', width: '100%', minWidth: 0, outline: 'none', p: { xs: '0 3px', sm: '0 8px', md: '6px 0 0' }, maxWidth: { xs: 640, md: 'none' }, mx: { xs: 'auto', md: 0 },
      '&:focus-visible': { outline: '2px solid #c83b74', outlineOffset: 10, borderRadius: '12px' },
    }}>
    <Box sx={{ position: 'relative', width: '100%', aspectRatio: { xs: '.96', sm: '1.1', md: '1.05', lg: '1.1' }, isolation: 'isolate', touchAction: 'pan-y', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
      onPointerDown={event => { if (event.button === 0 && !busy) { pointer.current = { x: event.clientX, y: event.clientY, dragged: false }; suppressClick.current = false; setPressed(true); } }}
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

      {/* The postcard and the offer badge only overlap at the corner, so the pool photo's pink flamingo stays in view. */}
      <Box sx={{ position: 'absolute', zIndex: 1, top: 12, left: 0, width: { xs: '94%', sm: '92%' }, transform: { xs: 'rotate(-3deg)', sm: 'rotate(-4deg)' } }}>
        <BadgePicture frameName="riviera-postcard" label={photo.alt} eager shadow="0 16px 20px #5a244821">
          <PostcardReel key={`photo-${index}-${target}`} sequence={sequence} moving={busy} direction={direction} onSettled={settle}>
            {item => { const scene = postcardScenes[wrapReelIndex(item, postcardScenes.length)]; return <img src={scene.image} alt="" width={1600} height={1067} fetchPriority={item === 0 ? 'high' : 'auto'} decoding="async" draggable={false} />; }}
          </PostcardReel>
        </BadgePicture>
        <Box component="span" aria-hidden="true" sx={{
          position: 'absolute', left: { xs: 10, sm: 18, lg: 25 }, top: { xs: 'calc(100% + 10px)', sm: 'calc(100% + 12px)' }, maxWidth: { xs: 145, sm: 'none' },
          fontFamily: fonts.serif, fontStyle: 'italic', fontWeight: 400, fontSize: { xs: 19, sm: 22, lg: 25 }, lineHeight: 1.2, color: '#c12e68', transform: 'rotate(2deg)',
        }}>Wish you were here…</Box>
      </Box>

      <Box component="a" href="#offers" aria-label={`${offer.label}: ${offer.title.replace(/[.!?]$/, '')}.${offer.preview ? ' Offer preview.' : ''} See the details.`}
        data-cta={offer.preview ? 'View this offer preview ↗' : offer.kind === 'event' ? 'See what’s on ↗' : 'See this offer ↗'} sx={{
        position: 'absolute', zIndex: 3, right: '3%', bottom: { xs: 26, sm: 34 }, width: { xs: '49%', sm: '41%', md: '45%', lg: '41%' },
        transform: { xs: 'rotate(7deg)', sm: 'rotate(8deg)' }, containerType: 'inline-size', textDecoration: 'none', color: '#fff5e4', cursor: 'grab',
        '&:focus-visible': { borderRadius: '32px' },
        '&::after': {
          content: 'attr(data-cta)', position: 'absolute', top: { xs: 'calc(100% + 5px)', sm: 'calc(100% + 8px)' }, right: { xs: 0, sm: 15 },
          color: '#8c4868', fontSize: { xs: 8, sm: 10 }, lineHeight: 1.5, whiteSpace: 'nowrap',
        },
      }}>
        <BadgePicture frameName="grand-arrival" eager shadow="0 12px 14px #5a24482c">
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
    </Box>
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'space-between' }, flexWrap: 'wrap', gap: { xs: '15px', sm: '14px', lg: '12px' }, p: '20px 3px 0' }}>
      <Box aria-live={focused ? 'polite' : 'off'} sx={{
        display: 'flex', flexDirection: 'column', gap: { xs: '4px', sm: '8px' }, color: '#8a6479', width: { xs: '100%', sm: 'auto' }, textAlign: { xs: 'center', sm: 'left' },
        '& > span': { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: { xs: 18, lg: 20 }, lineHeight: 1.3, color: '#a42d5c' },
        '& > small': { fontSize: { xs: 8, sm: 9 }, lineHeight: 1.6 },
      }}><span>{photo.title}</span><small>Swipe, scroll sideways, or use the arrows.</small></Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: '10px', sm: '5px' }, flexShrink: 0 }}>
        <Box component="button" type="button" onClick={() => request(-1)} aria-disabled={busy} aria-label="Previous hotel photo and offer" sx={reelButtonSx}><ArrowBackRounded /></Box>
        <Box component="span" aria-hidden="true" sx={{ minWidth: 42, fontSize: { xs: 9, sm: 10 }, color: '#69354f', textAlign: 'center', fontVariantNumeric: 'tabular-nums', '& > span': { color: '#a88998' } }}>0{photoIndex + 1}<span> / 0{postcardScenes.length}</span></Box>
        <Box component="button" type="button" onClick={() => request(1)} aria-disabled={busy} aria-label="Next hotel photo and offer" sx={reelButtonSx}><ArrowForwardRounded /></Box>
        {!systemReduced && <Box component="button" type="button" onClick={toggle} aria-pressed={reduced} aria-label={reduced ? 'Play all animations' : 'Pause all animations'} sx={reelButtonSx}>{reduced ? <PlayArrowRounded /> : <PauseRounded />}</Box>}
      </Box>
    </Box>
  </MotionBox>;
}
