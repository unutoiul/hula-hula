import { Link, type LinkProps } from '@mui/material';
import type { ReactNode } from 'react';

interface NavLinkProps extends Omit<LinkProps, 'href' | 'children'> {
  href: string;
  active: boolean;
  children: ReactNode;
}

export function NavLink({ href, active, children, ...rest }: NavLinkProps) {
  return <Link href={href} underline="none" variant="button" {...rest} sx={{
    position: 'relative', whiteSpace: 'nowrap', pb: .6,
    color: active ? 'primary.main' : 'text.primary', fontSize: 15,
    transition: 'color .25s ease',
    '&:hover': { color: 'primary.main' },
    '&::after': { content: '""', position: 'absolute', left: 0, bottom: 0, height: 2, width: active ? '100%' : 0, bgcolor: 'info.main', transition: 'width .3s ease' },
    '&:hover::after': { width: '100%' },
  }}>{children}</Link>;
}
