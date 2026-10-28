import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Activity, SiteContent } from '../../shared/siteContent';
import { experiences } from '../data/content';

// The activities, events and offers staff edit at /admin, from /api/content.
// The page renders straight away with the built-in activities and swaps in
// the CMS's once they arrive; if the CMS can't be reached (or has none
// published) the built-in ones simply stay. Events and offers have no
// built-in fallback — their blocks only appear when there's something live.

const FALLBACK_ACTIVITIES: Activity[] = experiences.map((item) => ({ ...item, ctaLabel: null }));
const FALLBACK: SiteContent = { activities: FALLBACK_ACTIVITIES, events: [], offers: [] };

const SiteContentContext = createContext<SiteContent>(FALLBACK);

// One request per page load, shared if the provider mounts again.
let request: Promise<SiteContent | null> | null = null;
const loadContent = () => (request ??= fetch('/api/content').then((r) => (r.ok ? r.json() as Promise<SiteContent> : null)).catch(() => null));

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(FALLBACK);
  useEffect(() => {
    let active = true;
    void loadContent().then((loaded) => {
      if (!active || !loaded) return;
      setContent({ activities: loaded.activities.length ? loaded.activities : FALLBACK_ACTIVITIES, events: loaded.events, offers: loaded.offers });
    });
    return () => { active = false; };
  }, []);
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}

export const useSiteContent = () => useContext(SiteContentContext);
