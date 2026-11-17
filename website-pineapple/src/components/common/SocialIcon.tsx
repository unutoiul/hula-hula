import { IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface SocialIconProps {
  href: string;
  label: string;
  children: ReactNode;
}

export function SocialIcon({ href, label, children }: SocialIconProps) {
  return <IconButton component="a" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} sx={(theme) => ({
    width: 56, height: 56, border: '1px solid', borderColor: alpha(theme.palette.text.primary, .18), borderRadius: '50%', color: 'text.primary',
    transition: 'border-color .25s ease, color .25s ease, background-color .25s ease, transform .25s ease',
    '&:hover': { borderColor: 'info.main', color: 'info.dark', bgcolor: alpha(theme.palette.info.main, .1), transform: 'translateY(-3px)' },
  })}>{children}</IconButton>;
}
