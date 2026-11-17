import { useMemo, useSyncExternalStore } from 'react';

// Just enough routing for the homepage (/), the room pages (/rooms/<id>),
// /meetings, /experiences, the booking pages (/book/...) and the CMS
// (/admin) — without a router dependency. vercel.json serves the booking
// HTML for /book and the main HTML for other app paths, so these are plain
// history.pushState navigations.

const NAVIGATE_EVENT = 'rp:navigate';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener('hashchange', onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

const snapshot = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

export function navigate(to: string, { replace = false }: { replace?: boolean } = {}) {
  if (to === snapshot()) {
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    return;
  }
  window.history[replace ? 'replaceState' : 'pushState'](null, '', to);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

/** The current path and query, re-rendering on every navigation. */
export function useLocation(): { pathname: string; query: URLSearchParams; hash: string } {
  const location = useSyncExternalStore(subscribe, snapshot);
  return useMemo(() => {
    const url = new URL(location, window.location.origin);
    return { pathname: url.pathname, query: url.searchParams, hash: url.hash };
  }, [location]);
}

/** onClick for an <a href> that should navigate in-app — but still lets ctrl/⌘-click open a new tab. */
export function linkClick(to: string) {
  return (event: { preventDefault: () => void; button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Home again from the homepage itself: back to the top.
    if (to === '/' && window.location.pathname === '/') { window.history.replaceState(null, '', '/'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    navigate(to);
  };
}

/**
 * A link to a homepage section ("#rooms") or a page ("/meetings") that works
 * from every page: on the homepage a section is a plain anchor, elsewhere it
 * goes home first and lands on the section.
 */
export function sectionLink(target: string, pathname: string): { href: string; onClick?: ReturnType<typeof linkClick> } {
  if (target.startsWith('#')) return pathname === '/' ? { href: target } : { href: `/${target}`, onClick: linkClick(`/${target}`) };
  if (target.startsWith('/')) return { href: target, onClick: linkClick(target) };
  return { href: target };
}
