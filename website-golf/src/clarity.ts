import Clarity from '@microsoft/clarity';

// Microsoft Clarity (@microsoft/clarity): heatmaps and session recordings,
// clarity.microsoft.com.
//
// - Runs only on the live domain, never on /admin or on a link carrying a
//   private booking key (?key=…, from emails and payment returns).
// - Until a visitor clicks "Accept all cookies", Clarity is told consent is
//   denied, so it records without cookies; accepting switches cookies on.
// - Typed values are masked by Clarity's default "Balanced" setting, and the
//   confirmation pages (guest name, email, reference) carry data-clarity-mask.
//
// The project ID comes from Clarity → Settings → Overview. Empty = off.
export const CLARITY_PROJECT_ID = 'zjordwmzg2';
const LIVE_HOSTS = ['www.hulahulagolfclub.com', 'hulahulagolfclub.com'];
export const COOKIE_CONSENT_KEY = 'hulahula-golf-cookie-consent';

let started = false;

const consentChoice = () => {
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    return null;
  }
};

/** Tells Clarity whether the visitor accepted cookies. Safe to call when Clarity is off. */
export function setClarityConsent(granted: boolean) {
  if (!started) return;
  const value = granted ? 'granted' : 'denied';
  Clarity.consentV2({ ad_Storage: value, analytics_Storage: value });
}

/** Loads Clarity once, from main.tsx. */
export function startClarity() {
  const { hostname, pathname, search } = window.location;
  if (started || !CLARITY_PROJECT_ID || !LIVE_HOSTS.includes(hostname)) return;
  if (pathname.startsWith('/admin') || new URLSearchParams(search).has('key')) return;
  Clarity.init(CLARITY_PROJECT_ID);
  started = true;
  setClarityConsent(consentChoice() === 'accepted');
}
