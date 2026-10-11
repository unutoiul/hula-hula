import { Box, Stack, Typography } from '@mui/material';
import { animate, useMotionValue, useMotionValueEvent, type PanInfo } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
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

// A card row you grab and drag (mouse) or swipe (touch) — no native
// horizontal scrollbar. It snaps to the nearest card when you let go; the
// arrows and the keyboard (← →, with the row focused) step card by card.
// It stays put while the page scrolls.
export function DragCarousel<T extends { id: string }>({ sectionKicker, heading, items, itemLabel, onDark = true, renderCard }: DragCarouselProps<T>) {
  const { reduced } = useMotionPreference();
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  // min: how far left the track can go; step: distance between card starts.
  const [bounds, setBounds] = useState({ min: 0, step: 1 });
  const [position, setPosition] = useState(0);
  const dragging = useRef(false);
  const lastDragEnd = useRef(0);

  useEffect(() => {
    const measure = () => {
      const view = viewport.current, row = track.current;
      if (!view || !row) return;
      const [first, second] = Array.from(row.children) as HTMLElement[];
      const step = first ? (second ? second.offsetLeft - first.offsetLeft : first.offsetWidth) : 1;
      const min = Math.min(0, view.clientWidth - row.scrollWidth);
      setBounds({ min, step });
      if (x.get() < min) x.set(min);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (viewport.current) observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [items.length, x]);

  useMotionValueEvent(x, 'change', setPosition);
  const active = Math.min(items.length - 1, Math.max(0, Math.round(-position / bounds.step)));
  const atStart = position >= -2;
  const atEnd = position <= bounds.min + 2;

  const select = (index: number) => {
    const target = Math.max(bounds.min, Math.min(0, -Math.max(0, Math.min(items.length - 1, index)) * bounds.step));
    animate(x, target, reduced ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 32 });
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    dragging.current = false;
    lastDragEnd.current = performance.now();
    select(Math.round(-(x.get() + info.velocity.x * 0.25) / bounds.step));
  };

  return <>
    <Reveal><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} gap={3} sx={{ mb: 5 }}>
      <Box>{onDark && <MetaLabel>{sectionKicker}</MetaLabel>}<Typography variant="h2" sx={{ fontSize: { xs: 40, md: 62 }, lineHeight: 1.04, mt: 1.5 }}>{heading}</Typography></Box>
      <Stack direction="row" spacing={1.2}>
        <CarouselArrow direction="prev" onDark={onDark} disabled={atStart} label={`Previous ${itemLabel}`} onClick={() => select(active - 1)} />
        <CarouselArrow direction="next" onDark={onDark} disabled={atEnd} label={`Next ${itemLabel}`} onClick={() => select(active + 1)} />
      </Stack>
    </Stack></Reveal>
    <Box ref={viewport} role="region" aria-label={`${itemLabel} gallery`} tabIndex={0}
      onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === 'ArrowRight') { event.preventDefault(); select(active + 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); select(active - 1); } }}
      // No native image/link drag ghosts, and no click on a card's link or
      // photo arrows right after a drag.
      onDragStart={(event) => event.preventDefault()}
      onClickCapture={(event) => { if (dragging.current || performance.now() - lastDragEnd.current < 250) { event.preventDefault(); event.stopPropagation(); } }}
      sx={{ position: 'relative', overflow: 'hidden', '&:focus-visible': { outlineOffset: 6 } }}>
        <MotionBox ref={track} drag="x" dragConstraints={{ left: bounds.min, right: 0 }} dragElastic={0.14} dragMomentum={false}
          onDragStart={() => { dragging.current = true; }} onDragEnd={onDragEnd} style={{ x }}
          sx={{ display: 'flex', alignItems: 'stretch', gap: 3, cursor: 'grab', userSelect: 'none', '&:active': { cursor: 'grabbing' } }}>
          {items.map((item, i) => <Box key={item.id} sx={{ flex: { xs: '0 0 88%', sm: '0 0 calc(50% - 12px)', lg: '0 0 calc(33.333% - 16px)' }, minWidth: 0, display: 'flex' }}>
            <Reveal delay={Math.min(i, 3) * 0.1} sx={{ display: 'flex', width: '100%' }}>
              {renderCard(item, i === active, () => select(i))}
            </Reveal>
          </Box>)}
        </MotionBox>
    </Box>
    <Typography sx={{ mt: 4, fontSize: 12, opacity: .7 }}>Drag, swipe, or use the arrows to explore {items.length} {itemLabel === 'room' ? 'places to stay' : 'ways to enjoy your holiday'}.</Typography>
  </>;
}
