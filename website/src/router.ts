import { useMemo, useSyncExternalStore } from 'react';

// Just enough routing for three areas — the homepage (/), the booking pages
// (/book/...) and the CMS (/admin) — without a router dependency. vercel.json
// already serves index.html for every non-/api path, so these are plain
// history.pushState navigations.

const NAVIGATE_EVENT = 'hh:navigate';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

const snapshot = () => `${window.location.pathname}${window.location.search}`;

export function navigate(to: string, { replace = false }: { replace?: boolean } = {}) {
  if (to === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
  window.history[replace ? 'replaceState' : 'pushState'](null, '', to);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

/** The current path and query, re-rendering on every navigation. */
export function useLocation(): { pathname: string; query: URLSearchParams } {
  const location = useSyncExternalStore(subscribe, snapshot);
  return useMemo(() => {
    const url = new URL(location, window.location.origin);
    return { pathname: url.pathname, query: url.searchParams };
  }, [location]);
}

/** onClick for an <a href> that should navigate in-app — but still lets ctrl/⌘-click open a new tab. */
export function linkClick(to: string) {
  return (event: { preventDefault: () => void; button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  };
}
