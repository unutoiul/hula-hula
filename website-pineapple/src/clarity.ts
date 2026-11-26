// Microsoft Clarity: heatmaps and session recordings (clarity.microsoft.com).
//
// - Runs only on the live domain, never on /admin or on a link carrying a
//   private booking key (?key=…, from emails and payment returns).
// - Until a visitor clicks "Accept all cookies", Clarity is told consent is
//   denied, so it records without cookies; accepting switches cookies on.
// - Typed values are masked by Clarity's default "Balanced" setting, and the
//   confirmation pages (guest name, email, reference) carry data-clarity-mask.
//
// The project ID comes from Clarity → Settings → Overview. Empty = off.
export const CLARITY_PROJECT_ID = '';
const LIVE_HOSTS = ['www.royalpineapplehotel.com', 'royalpineapplehotel.com'];
export const COOKIE_CONSENT_KEY = 'rp-cookie-consent';

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] };
declare global { interface Window { clarity?: ClarityFn } }

const consentChoice = () => { try { return window.localStorage.getItem(COOKIE_CONSENT_KEY); } catch { return null; } };

/** Tells Clarity whether the visitor accepted cookies. Safe to call when Clarity is off. */
export function setClarityConsent(granted: boolean) {
  const value = granted ? 'granted' : 'denied';
  window.clarity?.('consentv2', { ad_Storage: value, analytics_Storage: value });
}

/** Loads Clarity once, from main.tsx. */
export function startClarity() {
  const { hostname, pathname, search } = window.location;
  if (!CLARITY_PROJECT_ID || window.clarity || !LIVE_HOSTS.includes(hostname)) return;
  if (pathname.startsWith('/admin') || new URLSearchParams(search).has('key')) return;
  // Clarity's own loader: calls made before the script arrives wait in a queue.
  window.clarity = function () { (window.clarity!.q = window.clarity!.q || []).push(arguments); } as ClarityFn; // eslint-disable-line prefer-rest-params
  setClarityConsent(consentChoice() === 'accepted');
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
  document.head.appendChild(script);
}
