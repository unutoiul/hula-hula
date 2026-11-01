import { Box, Link } from '@mui/material';
import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { PageHeader } from './PageHeader';

/** Shared public shell, including loading and empty states. */
export function PublicPageLayout({ children, footerFrom, mobileActionSpace = false }: { children: ReactNode; footerFrom?: string; mobileActionSpace?: boolean }) {
  return <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', bgcolor: 'background.default', overflowX: 'clip' }}>
    <Link href="#main-content" sx={{
      position: 'absolute', top: 16, left: 16, zIndex: 1400, px: 2, py: 1.5,
      bgcolor: 'secondary.main', color: 'text.primary', borderRadius: 2, fontWeight: 700,
      transform: 'translateY(calc(-100% - 24px))', '&:focus': { transform: 'none' },
    }}>Skip to content</Link>
    <PageHeader />
    <Box component="main" id="main-content" tabIndex={-1} sx={{ flex: 1, minWidth: 0 }}>
      {children}
    </Box>
    <Footer from={footerFrom} mobileActionSpace={mobileActionSpace} />
  </Box>;
}
