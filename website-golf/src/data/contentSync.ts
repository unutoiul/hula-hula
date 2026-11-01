/** Admin saves notify this browser immediately; other visitors refresh every 30 seconds. */
export type ContentScope = 'site' | 'events';
export const CONTENT_REFRESH_MS = 30_000;
export const CONTENT_CHANGE_KEY = 'hhg-content-change-v1';
const CHANGE_EVENT = 'hhg:content-change';

interface RefreshEnvironment { window: Window; document: Document }
const isScope = (value: unknown): value is ContentScope => value === 'site' || value === 'events';

/** Only an invalidation marker is shared between tabs, never staff data or credentials. */
export function notifyContentChanged(scope: ContentScope, target = window): void {
  target.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: scope }));
  try {
    target.localStorage.setItem(CONTENT_CHANGE_KEY, JSON.stringify({ scope, nonce: `${Date.now()}-${Math.random()}` }));
  } catch { /* Private browsing can block storage; focus and polling still refresh. */ }
}

/** One in-flight refresh per subscriber, with a follow-up if a save arrives during it. */
export function watchContent(scope: ContentScope, refresh: () => Promise<void>, environment: RefreshEnvironment = { window, document }): () => void {
  const { window: target, document: page } = environment;
  let disposed = false;
  let running = false;
  let again = false;
  const run = async () => {
    if (disposed) return;
    if (running) { again = true; return; }
    running = true;
    do {
      again = false;
      try { await refresh(); } catch { /* Retain the last successful content and retry later. */ }
    } while (again && !disposed);
    running = false;
  };
  const visible = () => { if (page.visibilityState !== 'hidden') void run(); };
  const changed = (event: Event) => { if ((event as CustomEvent).detail === scope) void run(); };
  const storage = (event: StorageEvent) => {
    if (event.key !== CONTENT_CHANGE_KEY || !event.newValue) return;
    try {
      const value = JSON.parse(event.newValue) as { scope?: unknown };
      if (isScope(value.scope) && value.scope === scope) void run();
    } catch { /* Ignore unrelated or malformed storage. */ }
  };
  const timer = target.setInterval(visible, CONTENT_REFRESH_MS);
  target.addEventListener(CHANGE_EVENT, changed);
  target.addEventListener('storage', storage);
  target.addEventListener('focus', visible);
  target.addEventListener('online', visible);
  page.addEventListener('visibilitychange', visible);
  void run();
  return () => {
    disposed = true;
    target.clearInterval(timer);
    target.removeEventListener(CHANGE_EVENT, changed);
    target.removeEventListener('storage', storage);
    target.removeEventListener('focus', visible);
    target.removeEventListener('online', visible);
    page.removeEventListener('visibilitychange', visible);
  };
}
