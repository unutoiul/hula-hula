import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { contactLinks, DEFAULT_SITE, normaliseActivity, normaliseClub, normaliseRentals, type SiteData } from '../booking/config';

// The activities, prices, rental clubs and club settings staff edit in
// /admin, for every page. Pages draw straight away from what this browser saw
// last time (or the built-in defaults), then switch to the live values from
// /api/site; `ready` says the live values are in, for pages that must not act
// on stale ones (the booking pages wait for it).

const CACHE = 'hhg-site';

interface SiteDataValue { site: SiteData; ready: boolean; reload: () => Promise<void> }

const SiteDataContext = createContext<SiteDataValue>({ site: DEFAULT_SITE, ready: false, reload: async () => {} });

function fromJson(raw: unknown): SiteData | null {
  const data = raw as Partial<SiteData> | null;
  if (!data || !Array.isArray(data.activities)) return null;
  return {
    activities: data.activities.map((a) => normaliseActivity(a as unknown as Record<string, unknown>, String((a as { id?: unknown }).id ?? ''))).filter((a) => a.id),
    rentals: normaliseRentals(data.rentals),
    club: normaliseClub(data.club),
  };
}

function cached(): SiteData | null {
  try { return fromJson(JSON.parse(localStorage.getItem(CACHE) ?? 'null')); } catch { return null; }
}

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteData>(() => cached() ?? DEFAULT_SITE);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    try {
      const response = await fetch('/api/site', { cache: 'no-store' });
      const live = response.ok ? fromJson(await response.json()) : null;
      if (live) {
        setSite(live);
        try { localStorage.setItem(CACHE, JSON.stringify(live)); } catch { /* still fine for this visit */ }
      }
    } catch { /* keep what we have */ }
    setReady(true);
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const value = useMemo(() => ({ site, ready, reload }), [site, ready, reload]);
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export const useSiteData = () => useContext(SiteDataContext);
export const useSite = () => useContext(SiteDataContext).site;
/** The club's contact details with their tel:, WhatsApp, Line and map links. */
export const useContact = () => {
  const { club } = useSite();
  return useMemo(() => contactLinks(club.contact), [club.contact]);
};
