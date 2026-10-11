import { useEffect, useState } from 'react';

// Cycles through the hero's rotating headline/text on an interval and keeps
// every consumer (headline, dots) in sync from one source of truth. Pauses
// for prefers-reduced-motion.
export function useHeroIndex(length: number, intervalMs = 7000): [number, (i: number) => void] {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setIndex((current) => (current + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs]);

  return [index, setIndex];
}
