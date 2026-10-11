import { Link } from '@mui/material';
import type { ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  active: boolean;
  children: ReactNode;
  onClick?: () => void;
}

export function NavLink({ href, active, children, onClick }: NavLinkProps) {
  return <Link href={href} onClick={onClick} underline="none" variant="button" sx={{
    position: 'relative', whiteSpace: 'nowrap', pb: .6,
    color: active ? 'primary.main' : 'text.primary', fontSize: 14,
    transition: 'color .25s ease',
    '&:hover': { color: 'primary.main' },
    '&::after': { content: '""', position: 'absolute', left: 0, bottom: 0, height: 2, width: active ? '100%' : 0, bgcolor: 'info.main', transition: 'width .3s ease' },
    '&:hover::after': { width: '100%' },
  }}>{children}</Link>;
}
