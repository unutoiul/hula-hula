import LockOutlined from '@mui/icons-material/LockOutlined';
import { Box, Typography } from '@mui/material';

const METHODS = [
  { name: 'Visa', image: 'visa' },
  { name: 'Mastercard', image: 'mastercard' },
  { name: 'Apple Pay', image: 'apple-pay' },
  { name: 'Google Pay', image: 'google-pay' },
] as const;

/** Acceptance marks are informational; the hosted checkout offers eligible methods. */
export function PaymentMethods({ centered = false, compact = false }: { centered?: boolean; compact?: boolean }) {
  return <Box sx={{ textAlign: centered ? 'center' : 'left' }}>
    <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: centered ? 'center' : 'flex-start', gap: .6, color: 'text.secondary', fontSize: 12, fontWeight: 600 }}>
      <LockOutlined sx={{ fontSize: 15 }} /> Payments secured by Stripe
    </Typography>
    <Box component="ul" aria-label="Payment methods" sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: centered ? 'center' : 'flex-start', gap: .75, p: 0, m: 0, mt: 1.25, listStyle: 'none' }}>
      {METHODS.map(({ name, image }) => <Box component="li" key={image} sx={{ display: 'grid', placeItems: 'center', width: compact ? 52 : 62, height: compact ? 34 : 38, bgcolor: '#fff', border: '1px solid #dce3d8', borderRadius: '6px' }}>
        <Box component="img" src={`/payments/${image}.svg`} alt={name} width={compact ? 50 : 60} height={compact ? 32 : 36} loading="lazy" sx={{ display: 'block', objectFit: 'contain' }} />
      </Box>)}
    </Box>
    <Typography sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.5, mt: 1, maxWidth: 340, mx: centered ? 'auto' : 0 }}>
      Apple Pay and Google Pay appear when available at checkout.
    </Typography>
  </Box>;
}
