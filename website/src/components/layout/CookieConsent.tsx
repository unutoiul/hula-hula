import { Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { scrim } from '../../theme';
import { ClubMark } from '../common/ClubMark';

const COOKIE_CONSENT_KEY = 'hulahula-cookie-consent';

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!window.localStorage.getItem(COOKIE_CONSENT_KEY)) setOpen(true);
  }, []);

  const resolve = (choice: string) => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    setOpen(false);
  };

  if (!open) return null;

  return <Box role="dialog" aria-modal="true" aria-label="Cookie preferences" sx={{
    position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
    bgcolor: scrim(.6), backdropFilter: 'blur(4px)', p: 3,
  }}>
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', maxWidth: 480, width: '100%', p: { xs: 4, md: 5 }, textAlign: 'center', boxShadow: `0 30px 90px ${scrim(.4)}` }}>
      <Stack alignItems="center"><ClubMark /></Stack>
      <Typography sx={{ mt: 3.5, fontSize: 14, lineHeight: 1.75, color: 'text.secondary' }}>
        By clicking &ldquo;Accept all cookies&rdquo;, you agree to the storing of cookies on your device to enhance site navigation, analyse site usage, and assist in our marketing efforts.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mt: 4.5 }}>
        <Button variant="outlined" color="inherit" onClick={() => resolve('settings')} sx={{ px: 3, py: 1.3, borderColor: 'text.primary', color: 'text.primary', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}>Cookie settings</Button>
        <Button variant="outlined" color="primary" onClick={() => resolve('accepted')} sx={{ px: 3, py: 1.3 }}>Accept all cookies</Button>
      </Stack>
    </Box>
  </Box>;
}
