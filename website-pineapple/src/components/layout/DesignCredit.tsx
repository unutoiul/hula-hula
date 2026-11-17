import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import { Box, Link, Typography } from '@mui/material';

// The studio's signature, the last line of the footer: set apart by a hairline,
// quieter than the small print above it, and in sentence case so the web
// address reads as one. Keep in step with the golf site's copy.
export function DesignCredit({ light = false }: { light?: boolean }) {
  return <Box sx={{ width: '100%', maxWidth: 420, pt: light ? 0 : 2.5, borderTop: light ? 0 : '1px solid rgba(90,36,72,.2)' }}>
    <Typography sx={{ fontSize: 12, lineHeight: 1.6, color: light ? 'rgba(255,249,242,.8)' : 'text.secondary', textWrap: 'balance' }}>
      Designed with <FavoriteRounded titleAccess="love" sx={{ fontSize: 13, color: '#d32f45', verticalAlign: '-1.5px', mx: '1px' }} /> by{' '}
      <Link href="https://bluetrendy.com" target="_blank" rel="noopener" color={light ? 'inherit' : 'text.primary'} underline="always" sx={{
        // The padding only widens the tap area; it doesn't move the line.
        py: 1, fontWeight: 600, textUnderlineOffset: 3, textDecorationColor: light ? 'rgba(255,249,242,.5)' : 'rgba(90,36,72,.35)', transition: 'text-decoration-color .2s ease',
        '&:hover': { textDecorationColor: 'currentColor' },
      }}>bluetrendy.com</Link> in London
    </Typography>
  </Box>;
}
