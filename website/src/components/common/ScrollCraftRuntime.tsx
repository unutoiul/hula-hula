import { useEffect } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';

interface ScrollCraftInstance { layout: () => void; destroy: () => void }
declare global { interface Window { ScrollCraft?: { mount: (root: HTMLElement) => ScrollCraftInstance } } }

export function ScrollCraftRuntime() {
  const { reduced } = useMotionPreference();
  useEffect(() => {
    const root = document.getElementById('top');
    if (!root || reduced || !window.ScrollCraft) return;
    const runtime = window.ScrollCraft.mount(root);
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(runtime.layout);
    });
    observer.observe(root);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); runtime.destroy(); };
  }, [reduced]);
  return null;
}
