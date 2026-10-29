import East from '@mui/icons-material/East';
import West from '@mui/icons-material/West';
import { IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface CarouselArrowProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled?: boolean;
  label: string;
  /** Light border/text for a dark or photo background (default); dark for a light background. */
  onDark?: boolean;
}

export function CarouselArrow({ direction, onClick, disabled, label, onDark = true }: CarouselArrowProps) {
  const Icon = direction === 'prev' ? West : East;
  return <IconButton aria-label={label} onClick={onClick} disabled={disabled} sx={(theme) => ({
    width: 52, height: 52, borderRadius: '50%', color: 'inherit',
    border: '1px solid', borderColor: onDark ? 'rgba(255,255,255,.35)' : alpha(theme.palette.text.primary, .3),
    transition: 'border-color .25s ease, color .25s ease, background-color .25s ease, opacity .25s ease',
    '&:hover': { borderColor: 'info.main', color: onDark ? 'info.main' : 'info.dark', bgcolor: alpha(theme.palette.info.main, .1) },
    '&.Mui-disabled': { color: onDark ? 'rgba(255,255,255,.3)' : alpha(theme.palette.text.primary, .3), borderColor: onDark ? 'rgba(255,255,255,.15)' : alpha(theme.palette.text.primary, .12) },
  })}><Icon sx={{ fontSize: 19 }} /></IconButton>;
}
