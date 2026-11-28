import { Link } from '@mui/material';
import type { MouseEvent, ReactNode } from 'react';
import { brand } from '../../theme';

interface NavLinkProps {
  href: string;
  active: boolean;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function NavLink({ href, active, children, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      underline="none"
      variant="button"
      aria-current={active ? 'location' : undefined}
      sx={{
        position: 'relative',
        whiteSpace: 'nowrap',
        pb: 0.6,
        color: active ? 'primary.main' : 'text.primary',
        fontSize: 15,
        transition: 'color .25s ease',
        '&:hover': { color: 'primary.main' },
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: 2,
          width: active ? '100%' : 0,
          bgcolor: brand.pink,
          transition: 'width .3s ease',
        },
        '&:hover::after': { width: '100%' },
      }}
    >
      {children}
    </Link>
  );
}
