import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import { Box, Link, Typography } from '@mui/material';

// The studio's signature, the last line of the footer: set apart by a hairline,
// quieter than the small print above it, and in sentence case so the web
// address reads as one. Keep in step with the golf site's copy.
export function DesignCredit() {
  return <Box sx={{ width: '100%', maxWidth: 420, pt: 2.5, borderTop: '1px solid rgba(23,60,44,.2)' }}>
    <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.secondary', textWrap: 'balance' }}>
      Designed with <FavoriteRounded titleAccess="love" sx={{ fontSize: 13, color: '#d32f45', verticalAlign: '-1.5px', mx: '1px' }} /> by{' '}
      <Link href="https://bluetrendy.com" target="_blank" rel="noopener" color="text.primary" underline="always" sx={{
        // The padding only widens the tap area; it doesn't move the line.
        py: 1, fontWeight: 600, textUnderlineOffset: 3, textDecorationColor: 'rgba(23,60,44,.35)', transition: 'text-decoration-color .2s ease',
        '&:hover': { textDecorationColor: 'currentColor' },
      }}>bluetrendy.com</Link> in London
    </Typography>
  </Box>;
}
