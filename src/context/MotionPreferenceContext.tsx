import { useMediaQuery } from '@mui/material';
import { createContext, useContext, useState, type ReactNode } from 'react';

const MotionPreferenceContext = createContext({ reduced: false, toggle: () => {} });

export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const systemReduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem('hula-motion') === 'off'; } catch { return false; }
  });
  const toggle = () => setPaused(current => {
    const next = !current;
    try { localStorage.setItem('hula-motion', next ? 'off' : 'on'); } catch { /* Preference still works for this visit. */ }
    return next;
  });
  return <MotionPreferenceContext.Provider value={{ reduced: systemReduced || paused, toggle }}>{children}</MotionPreferenceContext.Provider>;
}

export const useMotionPreference = () => useContext(MotionPreferenceContext);
