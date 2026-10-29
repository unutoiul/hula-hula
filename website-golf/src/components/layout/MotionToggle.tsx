import WavesRounded from '@mui/icons-material/WavesRounded';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { useMotionPreference } from '../../context/MotionPreferenceContext';

// One control for everything that moves: cards drifting and sections rising
// on scroll, the rotating headline. When the device itself
// asks for reduced motion it stays off and the tooltip says why.
function useMotionLabel() {
  const { reduced, systemReduced, toggle } = useMotionPreference();
  const tooltip = systemReduced
    ? 'Motion is off because your device prefers reduced motion'
    : reduced ? 'Motion is off. Turn scroll animations back on' : 'Motion is on. Pause scroll animations';
  return { reduced, systemReduced, toggle, tooltip };
}

// Round header button (sm and up), next to "Book a tee time".
export function MotionToggleButton() {
  const { reduced, systemReduced, toggle, tooltip } = useMotionLabel();
  return <Tooltip title={tooltip} arrow>
    {/* The span keeps the tooltip working while the button is disabled. */}
    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
      <IconButton onClick={toggle} disabled={systemReduced} aria-pressed={!reduced} aria-label={tooltip} sx={{
        width: 48, height: 48, border: '1px solid', borderColor: reduced ? 'divider' : 'primary.main',
        color: reduced ? 'text.secondary' : 'primary.main', bgcolor: reduced ? 'transparent' : 'primary.light',
        '&:hover': { bgcolor: reduced ? 'secondary.light' : 'primary.light' },
      }}><WavesRounded sx={{ opacity: reduced ? .55 : 1 }} /></IconButton>
    </Box>
  </Tooltip>;
}

// Full-width version for the mobile menu, where a tooltip can't be hovered.
export function MotionToggleMenuButton() {
  const { reduced, systemReduced, toggle } = useMotionLabel();
  return <Button onClick={toggle} disabled={systemReduced} aria-pressed={!reduced} variant="outlined" color="inherit" startIcon={<WavesRounded />} sx={{ mt: 3, borderColor: 'divider' }}>
    {systemReduced ? 'Motion off (device setting)' : reduced ? 'Turn motion on' : 'Pause motion'}
  </Button>;
}
