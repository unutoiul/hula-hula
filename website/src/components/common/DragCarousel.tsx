import { Box, Stack, Typography } from '@mui/material';
import { animate, useMotionTemplate, useScroll, useSpring, useTransform, type AnimationPlaybackControls } from 'motion/react';
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { CarouselArrow } from './CarouselArrow';
import { MetaLabel } from './MetaLabel';
import { MotionBox } from './motionPrimitives';
import { Reveal } from './ScrollMotion';

interface DragCarouselProps<T> {
  sectionKicker: string; heading: ReactNode; items: T[]; itemLabel: string;
  slotWidth?: { xs: number; sm: number; md: number }; onDark?: boolean;
  renderCard: (item: T, active: boolean, onClick: () => void) => ReactNode;
}

interface MouseDrag { startX: number; startLeft: number; moved: boolean; lastX: number; lastT: number; velocity: number }

// A horizontally scrolling card row built on the browser's own scrolling, so
// touch swipes, trackpad two-finger swipes and Shift+wheel all feel native,
// with snapping to each card. On top of that: no visible scrollbar, mouse
// grab-and-drag (with a little fling) on desktop, arrows and ← → keys that
// step card by card, and two Motion touches driven by the row's scroll
// position — soft edge fades that only appear where more cards are hiding,
// and a progress bar that fills as you go. The row itself never moves when
// the page scrolls.
export function DragCarousel<T extends { id: string }>({ sectionKicker, heading, items, itemLabel, onDark = true, renderCard }: DragCarouselProps<T>) {
  const { reduced } = useMotionPreference();
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<MouseDrag | null>(null);
  const lastDragEnd = useRef(0);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0); // the card a glide is heading to
  const [edges, setEdges] = useState({ start: true, end: false });

  // Where the row's scroll position rests for each card: its left edge, or —
  // on phones, where cards snap to the centre — the point that centres it.
  const cardStarts = () => {
    const row = viewport.current;
    if (!row) return [];
    const max = row.scrollWidth - row.clientWidth;
    return Array.from(row.children).map((child) => {
      const card = child as HTMLElement;
      const left = getComputedStyle(card).scrollSnapAlign.includes('center') ? card.offsetLeft + card.offsetWidth / 2 - row.clientWidth / 2 : card.offsetLeft;
      return Math.max(0, Math.min(max, left));
    });
  };
  const nearestCard = (left: number) => cardStarts().reduce((best, start, i, all) => Math.abs(start - left) < Math.abs(all[best] - left) ? i : best, 0);

  const update = () => {
    const node = viewport.current;
    if (!node) return;
    const nearest = nearestCard(node.scrollLeft);
    setActive(nearest);
    if (!glide.current) activeRef.current = nearest;
    setEdges({ start: node.scrollLeft <= 2, end: node.scrollLeft >= node.scrollWidth - node.clientWidth - 2 });
  };
  useEffect(() => {
    update();
    const observer = new ResizeObserver(update);
    if (viewport.current) observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [items.length]);

  // Every programmatic move (arrows, keys, drag release, sideways swipes)
  // glides the row's scroll position with a Motion spring. Snapping is paused
  // for the glide: the browser's own smooth scroll gets cut short by the next
  // wheel event and mandatory snapping then pulls it back to where it started.
  const glide = useRef<AnimationPlaybackControls | null>(null);
  const stopGlide = () => { glide.current?.stop(); glide.current = null; if (viewport.current) viewport.current.style.scrollSnapType = ''; };
  const glideTo = (left: number) => {
    const node = viewport.current;
    if (!node) return;
    stopGlide();
    if (reduced) { node.scrollLeft = left; return; }
    node.style.scrollSnapType = 'none';
    glide.current = animate(node.scrollLeft, left, {
      type: 'spring', stiffness: 170, damping: 26, restDelta: 0.5,
      onUpdate: (value) => { node.scrollLeft = value; },
      onComplete: () => { node.style.scrollSnapType = ''; glide.current = null; },
    });
  };
  const scrollToCard = (index: number) => {
    const starts = cardStarts();
    glideTo(starts[Math.max(0, Math.min(items.length - 1, index))] ?? 0);
  };

  // Sideways trackpad swipes and Shift+wheel: with mandatory snapping, small
  // wheel steps just snap back, so a slow swipe felt stuck. Instead each
  // sideways gesture moves exactly one card; the rest of that gesture (its
  // inertia tail) is ignored until it pauses, so one swipe never skips two.
  // Vertical wheel/trackpad movement is left alone and scrolls the page.
  // The listener is attached once; it reaches the latest render's helpers
  // through `latest`, and keeps the gesture state across re-renders.
  const latest = useRef({ scrollToCard, nearestCard, count: items.length });
  latest.current = { scrollToCard, nearestCard, count: items.length };
  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    let travelled = 0, lockedUntil = 0;
    const onWheel = (event: WheelEvent) => {
      const { scrollToCard, nearestCard, count } = latest.current;
      const dx = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.shiftKey ? event.deltaY : 0;
      if (!dx) return;
      event.preventDefault();
      const now = performance.now();
      if (now < lockedUntil) { lockedUntil = now + 220; return; }
      travelled += dx;
      if (Math.abs(travelled) < 24) return;
      // Step from where the row is heading (mid-glide) or resting.
      const from = glide.current ? activeRef.current : nearestCard(node.scrollLeft);
      activeRef.current = Math.max(0, Math.min(count - 1, from + Math.sign(travelled)));
      scrollToCard(activeRef.current);
      travelled = 0;
      lockedUntil = now + 420;
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, []);

  // Mouse only — touch and trackpads already scroll natively. Any touch or
  // click on the row hands control back to the hand from a running glide.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    stopGlide();
    if (event.pointerType !== 'mouse' || event.button !== 0 || !viewport.current) return;
    drag.current = { startX: event.clientX, startLeft: viewport.current.scrollLeft, moved: false, lastX: event.clientX, lastT: event.timeStamp, velocity: 0 };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current, node = viewport.current;
    if (!d || !node) return;
    const dx = event.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < 5) return;
      d.moved = true;
      node.setPointerCapture(event.pointerId);
      node.style.scrollSnapType = 'none'; // snapping would fight the hand-driven scroll
      node.style.cursor = 'grabbing';
    }
    node.scrollLeft = d.startLeft - dx;
    const dt = event.timeStamp - d.lastT;
    if (dt > 0) d.velocity = (event.clientX - d.lastX) / dt;
    d.lastX = event.clientX; d.lastT = event.timeStamp;
  };
  const endDrag = () => {
    const d = drag.current, node = viewport.current;
    drag.current = null;
    if (!d?.moved || !node) return;
    lastDragEnd.current = performance.now();
    node.style.scrollSnapType = '';
    node.style.cursor = '';
    // Settle on the nearest card; a quick flick carries on to the next one.
    const nearest = nearestCard(node.scrollLeft);
    const flick = Math.abs(d.velocity) > 0.45 ? -Math.sign(d.velocity) : 0;
    const passed = flick && Math.sign(cardStarts()[nearest] - node.scrollLeft) === flick;
    scrollToCard(passed ? nearest : nearest + flick);
  };

  const { scrollXProgress } = useScroll({ container: viewport });
  const progress = useSpring(scrollXProgress, { stiffness: 220, damping: 32 });
  const leftEdge = useTransform(scrollXProgress, [0, 0.05], [1, 0]);
  const rightEdge = useTransform(scrollXProgress, [0.95, 1], [0, 1]);
  const mask = useMotionTemplate`linear-gradient(90deg, rgba(0,0,0,${leftEdge}) 0, #000 56px, #000 calc(100% - 56px), rgba(0,0,0,${rightEdge}) 100%)`;
  const scrolls = !(edges.start && edges.end);

  return <>
    <Reveal><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'center', sm: 'flex-end' }} gap={3} sx={{ mb: 5, textAlign: { xs: 'center', sm: 'left' } }}>
      <Box>{onDark && <MetaLabel>{sectionKicker}</MetaLabel>}<Typography variant="h2" sx={{ fontSize: { xs: 40, md: 62 }, lineHeight: 1.04, mt: 1.5 }}>{heading}</Typography></Box>
      <Stack direction="row" spacing={1.2}>
        <CarouselArrow direction="prev" onDark={onDark} disabled={edges.start} label={`Previous ${itemLabel}`} onClick={() => scrollToCard(active - 1)} />
        <CarouselArrow direction="next" onDark={onDark} disabled={edges.end} label={`Next ${itemLabel}`} onClick={() => scrollToCard(active + 1)} />
      </Stack>
    </Stack></Reveal>
    <MotionBox ref={viewport} role="region" aria-label={`${itemLabel} gallery`} tabIndex={0}
      onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === 'ArrowRight') { event.preventDefault(); scrollToCard(active + 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); scrollToCard(active - 1); } }}
      onScroll={update}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}
      // No native image/link drag ghosts, and no click on a card's link or
      // photo arrows right after a mouse drag.
      onDragStart={(event) => event.preventDefault()}
      onClickCapture={(event) => { if (performance.now() - lastDragEnd.current < 250) { event.preventDefault(); event.stopPropagation(); } }}
      style={scrolls ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
      sx={{
        // On phones the current card sits centred with a peek either side; the
        // side padding lets the first and last cards centre too.
        position: 'relative', display: 'flex', alignItems: 'stretch', gap: { xs: 2, sm: 3 }, pb: 1, px: { xs: '8%', sm: 0 },
        // Sideways only: overflowY must be hidden, or the cards waiting to
        // rise in make the row a few px vertically scrollable and it swallows
        // the page's vertical wheel/trackpad scrolling.
        overflowX: 'auto', overflowY: 'hidden', overscrollBehaviorX: 'contain', scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        '@media (pointer: fine)': { cursor: 'grab', userSelect: 'none' },
        '&:focus-visible': { outlineOffset: 6 },
      }}>
      {items.map((item, i) => <Box key={item.id} sx={{ flex: { xs: '0 0 84%', sm: '0 0 calc(50% - 12px)', lg: '0 0 calc(33.333% - 16px)' }, scrollSnapAlign: { xs: 'center', sm: 'start' }, minWidth: 0, display: 'flex' }}>
        <Reveal delay={Math.min(i, 3) * 0.1} sx={{ display: 'flex', width: '100%' }}>{renderCard(item, i === active, () => scrollToCard(i))}</Reveal>
      </Box>)}
    </MotionBox>
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" gap={{ xs: 1.5, sm: 2 }} sx={{ mt: 3, textAlign: { xs: 'center', sm: 'left' } }}>
      <Typography sx={{ fontSize: 12, opacity: .7 }}>Drag, swipe, or use the arrows to explore {items.length} {itemLabel === 'room' ? 'places to stay' : 'ways to enjoy your holiday'}.</Typography>
      {scrolls && <Box aria-hidden sx={{ flex: '0 0 auto', width: { xs: 96, sm: 120 }, height: 4, ml: { xs: 0, sm: 'auto' }, borderRadius: 2, overflow: 'hidden', bgcolor: onDark ? 'rgba(255,255,255,.22)' : 'rgba(23,60,44,.12)' }}>
        <MotionBox style={{ scaleX: progress, originX: 0 }} sx={{ height: '100%', bgcolor: onDark ? 'secondary.main' : 'primary.main' }} />
      </Box>}
    </Stack>
  </>;
}
