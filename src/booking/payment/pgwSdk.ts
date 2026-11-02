// 2C2P's Drop-in UI (https://developer.2c2p.com/docs/web-sdk-drop-in-ui): their
// payment form rendered inside our page, so the guest never leaves the site
// to pay. It's served from the same 2C2P host as the payment URL — sandbox or
// production — so it follows TWOC2P_ENV without any setting here.

export const PGW_SDK_VERSION = '4.2.1';

export interface PgwResult { paymentToken?: string; responseCode: string; responseDescription?: string }

interface PgwSdk {
  paymentUI: (request: { url: string; mode?: 'Fullscreen' | 'DropIn' | 'Dialog' | 'Tab'; cancelConfirmation?: boolean; appBar?: boolean }, callback: (result: PgwResult) => void) => void;
}

declare global {
  interface Window { PGWSDK?: PgwSdk }
}

/** "Payment completed" — still confirmed with 2C2P by the server before the booking counts. */
export const PGW_COMPLETED = '2000';
/** The guest closed or cancelled the payment form. */
export const PGW_CANCELLED = '0003';

let loading: Promise<PgwSdk> | null = null;

export function loadPgwSdk(webPaymentUrl: string): Promise<PgwSdk> {
  if (window.PGWSDK) return Promise.resolve(window.PGWSDK);
  if (loading) return loading;
  const origin = new URL(webPaymentUrl).origin;
  loading = new Promise<PgwSdk>((resolve, reject) => {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = `${origin}/sdk/css/pgw-sdk-style-${PGW_SDK_VERSION}.css`;
    document.head.appendChild(style);
    const script = document.createElement('script');
    script.src = `${origin}/sdk/js/pgw-sdk-${PGW_SDK_VERSION}.js`;
    script.async = true;
    script.onload = () => (window.PGWSDK ? resolve(window.PGWSDK) : reject(new Error('2C2P SDK missing')));
    script.onerror = () => reject(new Error('2C2P SDK failed to load'));
    document.head.appendChild(script);
  });
  loading.catch(() => { loading = null; });
  return loading;
}
