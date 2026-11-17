import { Alert, Box, Button, Skeleton } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useRef, useState } from 'react';
import type { StripeCheckout } from '../../../shared/bookingContract';

// Stripe's own payment form (embedded Checkout), shown inside our payment
// step. Stripe.js is loaded from js.stripe.com, as Stripe requires, and the
// form runs in Stripe's iframe, so card details never touch this site. Once
// the guest has paid, Stripe sends them on to their confirmation page.

// Only one embedded form may exist at a time, so a new one waits until the
// previous one (e.g. from a quick remount) has been created and torn down.
let queue: Promise<void> = Promise.resolve();

export function StripeEmbeddedCheckout({ checkout }: { checkout: StripeCheckout }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    let form: { mount: (el: HTMLElement) => void; destroy: () => void } | null = null;
    setState('loading');
    queue = queue.then(async () => {
      if (cancelled) return;
      try {
        const stripe = await loadStripe(checkout.publishableKey);
        if (!stripe) throw new Error('Stripe.js did not load');
        if (cancelled) return;
        const created = await stripe.createEmbeddedCheckoutPage({ fetchClientSecret: async () => checkout.clientSecret });
        if (cancelled || !host.current) { created.destroy(); return; }
        form = created;
        created.mount(host.current);
        setState('ready');
      } catch (error) {
        console.error('Stripe’s payment form could not load', error);
        if (!cancelled) setState('error');
      }
    });
    return () => { cancelled = true; form?.destroy(); form = null; };
  }, [checkout.clientSecret, checkout.publishableKey]);

  return <Box>
    {state === 'loading' && <Box aria-busy="true" aria-label="Loading the payment form">
      <Skeleton variant="rounded" height={48} sx={{ borderRadius: '12px', mb: 1.5 }} />
      <Skeleton variant="rounded" height={160} sx={{ borderRadius: '12px', mb: 1.5 }} />
      <Skeleton variant="rounded" height={48} sx={{ borderRadius: '12px' }} />
    </Box>}
    {state === 'error' && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => window.location.reload()}>Try again</Button>}>
      The payment form didn’t load. Check your connection and try again — your rooms are still held.
    </Alert>}
    <Box ref={host} />
  </Box>;
}
