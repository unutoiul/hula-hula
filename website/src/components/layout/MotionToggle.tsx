import { Box } from '@mui/material';
import { useMotionPreference } from '../../context/MotionPreferenceContext';

// One quiet control for everything that moves (cards drifting and sections
// rising on scroll, the hero video and the rotating headline), in the footer. When the device
// itself asks for reduced motion everything already holds still, so there's
// nothing to offer. Starts with its own " · " separator, so it can sit at
// the end of a line of small print.
export function MotionToggleLink() {
  const { reduced, systemReduced, toggle } = useMotionPreference();
  if (systemReduced) return null;
  return <>{' · '}<Box component="button" type="button" onClick={toggle} aria-pressed={reduced} sx={{
    p: 0, border: 0, bgcolor: 'transparent', color: 'inherit', font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', cursor: 'pointer',
    textDecoration: 'underline', textUnderlineOffset: 3, '&:hover': { textDecorationThickness: 2 },
  }}>{reduced ? 'Turn animations on' : 'Pause animations'}</Box></>;
}
