import { useMediaQuery } from '@mui/material';
import { createContext, useContext, useState, type ReactNode } from 'react';

// `reduced` is what everything animated checks: true when the visitor turned
// motion off with the Motion switch, or their OS asks for reduced motion
// (`systemReduced`, which the switch can't override).
const MotionPreferenceContext = createContext({ reduced: false, systemReduced: false, toggle: () => {} });

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
  return <MotionPreferenceContext.Provider value={{ reduced: systemReduced || paused, systemReduced, toggle }}>{children}</MotionPreferenceContext.Provider>;
}

export const useMotionPreference = () => useContext(MotionPreferenceContext);
