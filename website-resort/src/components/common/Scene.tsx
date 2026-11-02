import { Box, styled } from '@mui/material';
import { scrim } from '../../theme';

interface SceneOwnProps {
  image: string;
}

// A full-bleed photo card with a bottom gradient for legible overlaid text —
// used by the Activities cards and, formerly, the Restaurant showcase.
export const Scene = styled(Box, { shouldForwardProp: (prop) => prop !== 'image' })<SceneOwnProps>(({ theme, image }) => ({
  position: 'relative',
  minHeight: 505,
  display: 'flex',
  alignItems: 'flex-end',
  overflow: 'hidden',
  color: theme.palette.primary.contrastText,
  backgroundImage: `linear-gradient(0deg, ${scrim(.88)}, ${scrim(0)} 62%), url(${image})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  [theme.breakpoints.down('md')]: { minHeight: 390 },
}));
