import { Box, Stack, Typography } from '@mui/material';
import { animate, motion, useMotionValue } from 'motion/react';
import type { PanInfo } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CarouselArrow } from './CarouselArrow';
import { MetaLabel } from './MetaLabel';

interface SlotWidth { xs: number; sm: number; md: number }

interface DragCarouselProps<T extends { id: string }> {
  sectionKicker: string;
  heading: ReactNode;
  items: T[];
  itemLabel: string; // e.g. "activity" / "room" — used in the arrows'/dots' aria-labels
  /** Each item's fixed layout slot. Defaults to the Activities size; pass a wider set for a bigger row. */
  slotWidth?: SlotWidth;
  /** True (default) for a dark/photo section background; false for a light one — affects the heading/arrow/dot colors only, never the cards themselves. */
  onDark?: boolean;
  /** Renders one card's content — the carousel only owns which index is active. */
  renderCard: (item: T, active: boolean, onClick: () => void) => ReactNode;
}

const DEFAULT_SLOT_WIDTH: SlotWidth = { xs: 230, sm: 300, md: 340 };
const SLOT_GAP = 24; // px, matches the gap below
const REPEAT = 3; // how many copies of the item list we lay end-to-end for the loop

// Drag left/right (or use the arrows) to bring a card into focus — it's
// always recentered in the middle of the row and grows there (via the card's
// own scale), while its neighbors shrink back and peek in from the sides.
// Fixed-width slots keep the centering math simple; the active card visually
// overflows its slot via `scale`, which doesn't affect layout, so the peek
// effect falls out naturally. Shared by Activities and Rooms & villas — same
// drag/center/loop mechanism, completely different card content (supplied
// via `renderCard`).
//
// Looping: the strip renders three back-to-back copies of the item list
// (REPEAT = 3) so there's always a real card to scroll into on either side —
// arrows never disable and dragging past the last item just continues into
// the first. Once the active slot settles in the outer copies, we silently
// fold `active` back by one copy-width (a whole number of items) and jump
// the strip's x by the exact same distance in the same instant. Because
// every copy renders identical content, the jump lands on a pixel-identical
// frame — nothing visibly moves, but the index is now back in a safe middle
// band with room to keep going indefinitely in either direction.
export function DragCarousel<T extends { id: string }>({ sectionKicker, heading, items, itemLabel, slotWidth: slotWidthProp = DEFAULT_SLOT_WIDTH, onDark = true, renderCard }: DragCarouselProps<T>) {
  const n = items.length;
  const loopedItems = useMemo(() => Array.from({ length: REPEAT }, () => items).flat(), [items]);
  const total = loopedItems.length;

  const [active, setActive] = useState(n); // start in the middle copy, at logical item 0
  const [slotWidth, setSlotWidth] = useState(340);
  const viewportRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    const measure = () => {
      const slot = viewportRef.current?.querySelector<HTMLElement>('[data-slot]');
      if (slot) setSlotWidth(slot.offsetWidth + SLOT_GAP);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [items.length]);

  const targetFor = (index: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return 0;
    return viewport.offsetWidth / 2 - (index * slotWidth + slotWidth / 2);
  };

  // If the settled slot has drifted into the first or last copy, fold it back
  // into the middle copy and jump x by exactly one copy-width so nothing
  // visibly moves (see comment above). Runs on every `active` change — not
  // gated behind the previous spring finishing — so rapid clicks or drags
  // can never outrun the fold and get stuck against the strip's outer edges.
  useEffect(() => {
    if (active < n) {
      x.set(x.get() - n * slotWidth);
      setActive(active + n);
      return;
    }
    if (active >= 2 * n) {
      x.set(x.get() + n * slotWidth);
      setActive(active - n);
      return;
    }
    const controls = animate(x, targetFor(active), { type: 'spring', stiffness: 260, damping: 30 });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, slotWidth]);

  // Unclamped — the effect above folds any out-of-band value back on its very next
  // run, so arrows never need to freeze at the strip's hard edges to stay in bounds.
  const go = (dir: number) => setActive((i) => i + dir);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const nudged = x.get() + info.velocity.x * 0.15; // carry a little momentum into the snap target
    const rawIndex = (viewport.offsetWidth / 2 - slotWidth / 2 - nudged) / slotWidth;
    setActive(Math.min(total - 1, Math.max(0, Math.round(rawIndex))));
  };

  const viewportWidth = viewportRef.current?.offsetWidth ?? 0;
  const maxDrag = viewportWidth / 2 - slotWidth / 2;
  const minDrag = viewportWidth / 2 - ((total - 1) * slotWidth + slotWidth / 2);

  const logicalActive = ((active - n) % n + n) % n; // which item (0..n-1) is on screen, regardless of which copy

  return <>
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} sx={{ mb: { xs: 6, md: 8 } }}>
      <Box><MetaLabel>{sectionKicker}</MetaLabel><Typography variant="h2" sx={{ fontSize: { xs: 42, md: 74 }, lineHeight: .87, mt: { xs: 3, md: -1 } }}>{heading}</Typography></Box>
      <Stack direction="row" spacing={1.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
        <CarouselArrow direction="prev" onDark={onDark} label={`Previous ${itemLabel}`} onClick={() => go(-1)} />
        <CarouselArrow direction="next" onDark={onDark} label={`Next ${itemLabel}`} onClick={() => go(1)} />
      </Stack>
    </Stack>
    <Box ref={viewportRef} sx={{ overflow: 'hidden', py: 2 }}>
      <motion.div
        drag="x"
        dragConstraints={{ left: minDrag, right: maxDrag }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        style={{ x, display: 'flex', gap: SLOT_GAP, cursor: 'grab', touchAction: 'pan-y' }}
        whileTap={{ cursor: 'grabbing' }}
      >
        {loopedItems.map((item, i) => <Box key={`${item.id}-${Math.floor(i / n)}`} data-slot sx={{ flexShrink: 0, width: { xs: slotWidthProp.xs, sm: slotWidthProp.sm, md: slotWidthProp.md } }}>
          {renderCard(item, i === active, () => setActive(i))}
        </Box>)}
      </motion.div>
    </Box>
    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 4 }}>
      {items.map((item, i) => <Box key={item.id} component="button" type="button" aria-label={`Go to ${itemLabel} ${i + 1}`} aria-current={i === logicalActive} onClick={() => setActive(n + i)} sx={{
        width: i === logicalActive ? 22 : 7, height: 7, p: 0, border: 'none', borderRadius: 4, cursor: 'pointer',
        bgcolor: i === logicalActive ? 'info.main' : (onDark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.2)'),
        transition: 'width .3s ease, background-color .3s ease',
      }} />)}
    </Stack>
  </>;
}
