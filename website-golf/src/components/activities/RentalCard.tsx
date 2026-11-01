import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { Rental } from '../../booking/config';
import { money } from '../../booking/pricing';

/** A neutral equipment illustration, not a photograph of the actual inventory. */
export function RentalVisual({ rental }: { rental: Rental }) {
  return <Box sx={{ bgcolor: rental.id === 'premium' ? '#f4edc9' : '#e5efdf', borderRadius: '18px', height: 140, display: 'grid', placeItems: 'center', overflow: 'hidden', color: 'primary.dark' }}>
    {rental.image ? <Box component="img" src={rental.image} alt={rental.label} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      : <svg width="110" height="110" viewBox="0 0 110 110" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M39 40 31 91Q52 102 73 91L65 40Z" fill="currentColor" fillOpacity=".08"/><path d="M40 40 35 18Q35 11 24 14Q17 18 26 23L35 22M51 40 52 11Q54 6 65 8Q73 11 65 17L53 17M61 40 72 24Q76 20 84 25Q90 31 82 33L70 29M39 50H65M37 63H68M34 91 27 99M70 91 77 99M44 49 40 85"/><path d="M65 54Q84 51 80 78L73 86"/></g>{rental.id === 'premium' && <path d="m86 45 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#bf951f"/>}</svg>}
  </Box>;
}

export function RentalCard({ rental, children }: { rental: Rental; children?: ReactNode }) {
  return <Box sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '24px', p: 2, minWidth: 0 }}>
    <RentalVisual rental={rental} />
    <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 2 }}><Typography sx={{ fontWeight: 700 }}>{rental.label}</Typography><Typography sx={{ fontWeight: 800, color: 'primary.main', whiteSpace: 'nowrap' }}>{money(rental.price)}</Typography></Stack>
    <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: .5 }}>{rental.description || (rental.id === 'premium' ? 'Newer clubs & more variety.' : 'A standard set for your round.')} Priced per set.</Typography>
    {children && <Box sx={{ mt: 2 }}>{children}</Box>}
  </Box>;
}
