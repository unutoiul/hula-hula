import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import { motion, useInView } from 'motion/react';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { previewOffers } from '../sections/previewOffers';
import { BadgePicture } from './BadgePicture';
import { PostcardReel, postcardScenes, wrapReelIndex } from './PostcardReel';
import './home-postcard-stack.css';

export function PostcardCollage() {
  const { reduced, systemReduced, toggle } = useMotionPreference();
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
  const offer = previewOffers[wrapReelIndex(index, previewOffers.length)];

  const request = useCallback((next: -1 | 1) => {
    if (target !== null) return;
    if (reduced) setIndex(current => current + next);
    else setTarget(index + next);
  }, [index, target, reduced]);

  const settle = useCallback(() => {
    if (target !== null) { setIndex(target); setTarget(null); }
  }, [target]);

  useEffect(() => {
    let mounted = true;
    const images = [...postcardScenes.map(scene => scene.image), ...previewOffers.map(item => item.image)];
    void Promise.all(images.map(source => {
      const image = new Image(); image.src = source;
      return image.decode().catch(() => {});
    })).then(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

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

  return <motion.div className="story-postcards home-postcard-composition" ref={scope} role="region" aria-roledescription="carousel"
    aria-label="Hotel postcards and offers" aria-busy={busy} tabIndex={0}
    initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .8 }}
    onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); request(event.key === 'ArrowRight' ? 1 : -1); } }}>
    <div className="home-postcard-stage" data-dragging={dragging}
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

      <div className="home-postcard-back">
        <BadgePicture frameName="riviera-postcard" label={photo.alt} eager>
          <PostcardReel key={`photo-${index}-${target}`} sequence={sequence} moving={busy} direction={direction} onSettled={settle}>
            {item => { const scene = postcardScenes[wrapReelIndex(item, postcardScenes.length)]; return <img src={scene.image} alt="" width={1600} height={1067} fetchPriority={item === 0 ? 'high' : 'auto'} decoding="async" draggable={false} />; }}
          </PostcardReel>
        </BadgePicture>
        <span className="home-postcard-handwriting" aria-hidden="true">Wish you were here…</span>
      </div>

      <a className="home-offer-front" href="#offers" aria-label={`${offer.tag} ${offer.label}. Offer preview. View details.`}>
        <BadgePicture frameName="grand-arrival" eager>
          <PostcardReel key={`offer-${index}-${target}`} sequence={sequence} moving={busy} direction={direction}>
            {item => {
              const number = wrapReelIndex(item, previewOffers.length);
              const card = previewOffers[number];
              return <><img src={card.image} alt="" width={1600} height={1067} decoding="async" draggable={false} /><div className="home-offer-shade" />
                <div className="home-offer-words"><span className="home-offer-kicker">{number === 0 ? 'Your book-direct treat' : 'The slow-morning escape'}</span>
                  {number === 0 ? <strong className="home-offer-value">−45<span>%</span></strong> : <strong className="home-offer-breakfast">Breakfast<br />for two</strong>}
                  <small className="home-offer-note">{number === 0 ? 'Direct booking · Offer preview' : 'Three nights · Offer preview'}</small>
                </div></>;
            }}
          </PostcardReel>
        </BadgePicture>
      </a>
    </div>
    <div className="home-postcard-footer">
      <div className="home-postcard-caption" aria-live={focused ? 'polite' : 'off'}><span>{photo.title}</span><small>Swipe, scroll sideways, or use the arrows.</small></div>
      <div className="postcard-reel-controls">
        <button type="button" onClick={() => request(-1)} aria-disabled={busy} aria-label="Previous hotel photo and offer"><ArrowBackRounded /></button>
        <span className="postcard-reel-count" aria-hidden="true">0{photoIndex + 1}<span> / 0{postcardScenes.length}</span></span>
        <button type="button" onClick={() => request(1)} aria-disabled={busy} aria-label="Next hotel photo and offer"><ArrowForwardRounded /></button>
        {!systemReduced && <button type="button" onClick={toggle} aria-pressed={reduced} aria-label={reduced ? 'Play all animations' : 'Pause all animations'}>{reduced ? <PlayArrowRounded /> : <PauseRounded />}</button>}
      </div>
    </div>
  </motion.div>;
}
