import { Box, Stack, Typography } from '@mui/material';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CarouselArrow } from './CarouselArrow';
import { MetaLabel } from './MetaLabel';

interface DragCarouselProps<T> {
  sectionKicker: string; heading: ReactNode; items: T[]; itemLabel: string;
  slotWidth?: { xs: number; sm: number; md: number }; onDark?: boolean;
  renderCard: (item: T, active: boolean, onClick: () => void) => ReactNode;
}

export function DragCarousel<T extends { id: string }>({ sectionKicker, heading, items, itemLabel, onDark = true, renderCard }: DragCarouselProps<T>) {
  const viewport = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const reduceMotion = useReducedMotion();
  const updatePosition = () => {
    const node = viewport.current;
    const slot = node?.children[0] as HTMLElement | undefined;
    if (!node || !slot) return;
    setActive(Math.min(items.length - 1, Math.round(node.scrollLeft / (slot.offsetWidth + 24))));
    setAtEnd(node.scrollLeft >= node.scrollWidth - node.clientWidth - 2);
  };
  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const observer = new ResizeObserver(updatePosition);
    observer.observe(node);
    return () => observer.disconnect();
  }, [items.length]);
  const select = (index: number) => {
    const node = viewport.current;
    const slot = node?.children[index] as HTMLElement | undefined;
    if (node && slot) node.scrollTo({ left: slot.offsetLeft, behavior: reduceMotion ? 'instant' : 'smooth' });
  };
  return <>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} gap={3} sx={{ mb: 5 }}>
      <Box>{onDark && <MetaLabel>{sectionKicker}</MetaLabel>}<Typography variant="h2" sx={{ fontSize: { xs: 40, md: 62 }, lineHeight: 1.04, mt: 1.5 }}>{heading}</Typography></Box>
      <Stack direction="row" spacing={1.2}>
        <CarouselArrow direction="prev" onDark={onDark} disabled={active === 0} label={`Previous ${itemLabel}`} onClick={() => select(Math.max(0, active - 1))} />
        <CarouselArrow direction="next" onDark={onDark} disabled={atEnd} label={`Next ${itemLabel}`} onClick={() => select(Math.min(items.length - 1, active + 1))} />
      </Stack>
    </Stack>
    <Box ref={viewport} role="region" aria-label={`${itemLabel} gallery`} tabIndex={0}
      onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === 'ArrowRight') { event.preventDefault(); select(Math.min(items.length - 1, active + 1)); } if (event.key === 'ArrowLeft') { event.preventDefault(); select(Math.max(0, active - 1)); } }}
      onScroll={updatePosition}
      sx={{ position: 'relative', display: 'flex', alignItems: 'stretch', gap: 3, overflowX: 'auto', scrollSnapType: 'x mandatory', pb: 2, scrollbarWidth: 'thin', scrollbarColor: onDark ? '#f9f70c transparent' : '#006d8a #e9efde', WebkitOverflowScrolling: 'touch' }}>
      {items.map((item, i) => <Box key={item.id} sx={{ flex: { xs: '0 0 88%', sm: '0 0 calc(50% - 12px)', lg: '0 0 calc(33.333% - 16px)' }, scrollSnapAlign: 'start', minWidth: 0, display: 'flex' }}>{renderCard(item, i === active, () => select(i))}</Box>)}
    </Box>
    <Typography sx={{ mt: 2, fontSize: 12, opacity: .7 }}>Swipe, scroll, or use the arrows to explore {items.length} {itemLabel === 'room' ? 'places to stay' : 'ways to enjoy your holiday'}.</Typography>
  </>;
}
