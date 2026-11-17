import { Box, Breadcrumbs, Container, Link, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { navItems } from '../data/content';
import { linkClick } from '../router';
import { brand } from '../theme';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { ResortPhoto } from '../components/common/ResortPhoto';
import { RisingSun, SectionSeam, SEAM } from '../components/common/SectionSeam';
import { PostcardFrame } from '../components/common/PostcardFrame';

// The room, meeting and experience pages: the same header and footer as the
// homepage, a page intro, then the page.
export function PageShell({ children, footerFrom = SEAM.cream }: { children: ReactNode; footerFrom?: string }) {
  return <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflowX: 'hidden', '@supports (overflow: clip)': { overflowX: 'clip' } }}>
    <Link href="#main-content" sx={{
      position: 'absolute', top: 16, left: 16, zIndex: 1400, px: 2, py: 1.5, bgcolor: 'secondary.main', color: 'text.primary', borderRadius: 2, fontWeight: 700,
      transform: 'translateY(calc(-100% - 24px))', '&:focus': { transform: 'none' },
    }}>Skip to content</Link>
    <Header navItems={navItems} />
    {/* Clears the fixed header at its full (unscrolled) height. */}
    <Box aria-hidden sx={{ height: { xs: 110, md: 126 }, flexShrink: 0 }} />
    <Box component="main" id="main-content" tabIndex={-1} sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    <SectionSeam from={footerFrom} to={SEAM.plum} mirror behind={<RisingSun left="78%" />} />
    <Footer />
  </Box>;
}

export function PageIntro({ eyebrow, title, description, image, imageAlt, crumbs, children }: {
  eyebrow: string; title: string; description: string; image: string; imageAlt: string; crumbs: { label: string; href?: string }[]; children?: ReactNode;
}) {
  return <Box sx={{ backgroundImage: `linear-gradient(135deg, ${brand.blush}, ${brand.cream} 70%)`, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 5, md: 7 } }}>
      <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: { xs: 3, md: 4 }, fontSize: 12.5, color: 'text.secondary', '& a': { display: 'inline-flex', alignItems: 'center', minHeight: 44 } }}>
        <Link href="/" onClick={linkClick('/')} color="inherit" underline="hover">Royal Pineapple</Link>
        {crumbs.map((crumb) => crumb.href
          ? <Link key={crumb.label} href={crumb.href} onClick={linkClick(crumb.href)} color="inherit" underline="hover">{crumb.label}</Link>
          : <Typography key={crumb.label} aria-current="page" sx={{ fontSize: 'inherit' }}>{crumb.label}</Typography>)}
      </Breadcrumbs>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.05fr) minmax(0,1fr)' }, alignItems: 'center', gap: { xs: 4, md: 7 } }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" color="primary.main">{eyebrow}</Typography>
          <Typography variant="h1" sx={{ mt: 1.5, fontSize: { xs: 'clamp(2rem, 8.5vw, 3rem)', md: 'clamp(2.5rem, 4.2vw, 3.75rem)' }, lineHeight: 1.08 }}>{title}</Typography>
          <Typography sx={{ mt: 2.5, maxWidth: 560, fontSize: { xs: 16, md: 17.5 }, lineHeight: 1.8, color: 'text.secondary' }}>{description}</Typography>
          {children && <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" useFlexGap gap={1.5} sx={{ mt: 3.5, alignItems: { xs: 'stretch', sm: 'center' } }}>{children}</Stack>}
        </Box>
        <PostcardFrame sx={{ aspectRatio: '4 / 3', width: '100%', maxWidth: { xs: 680, md: 'none' }, mx: 'auto' }}>
          <ResortPhoto image={image} alt={imageAlt} eager sizes="(max-width: 900px) 92vw, 46vw" />
        </PostcardFrame>
      </Box>
    </Container>
  </Box>;
}
