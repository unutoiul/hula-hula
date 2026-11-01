import { Box, Breadcrumbs, Container, Link, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { linkClick } from '../../router';
import { ClubPhoto } from '../common/ClubPhoto';

export function PageIntro({ title, description, image, eyebrow, parent, breadcrumbLabel = eyebrow, children }: { title: string; description: string; image: string; eyebrow: string; parent?: { label: string; href: string }; breadcrumbLabel?: string; children?: ReactNode }) {
  return <Box sx={{ bgcolor: 'background.default', backgroundImage: 'linear-gradient(135deg, #f1f4e8, #fffdf3 75%)', borderBottom: '1px solid', borderColor: 'divider' }}>
    <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 4, md: 6 } }}>
      <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: { xs: 3, md: 4 }, fontSize: 12, color: 'text.secondary', '& a': { display: 'inline-flex', alignItems: 'center', minHeight: 44 } }}>
        <Link href="/" onClick={linkClick('/')} color="inherit" underline="hover">Home</Link>
        {parent && <Link href={parent.href} onClick={linkClick(parent.href)} color="inherit" underline="hover">{parent.label}</Link>}
        <Typography aria-current="page" sx={{ fontSize: 'inherit', overflowWrap: 'anywhere' }}>{breadcrumbLabel}</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.1fr) minmax(0,1fr)' }, alignItems: 'center', gap: { xs: 4, md: 6 } }}>
        <Box sx={{ minWidth: 0, py: { md: 2 } }}>
          <Typography variant="overline" sx={{ color: 'success.dark' }}>{eyebrow} · Hula Hula</Typography>
          <Typography variant="h1" sx={{ mt: 1.5, fontSize: { xs: 'clamp(2.6rem, 8vw, 3.3rem)', md: 58 }, color: 'primary.dark', lineHeight: 1.06, textWrap: 'balance' }}>{title}</Typography>
          {description && <Typography sx={{ mt: 2.5, maxWidth: 580, fontSize: { xs: 16, md: 17 }, lineHeight: 1.8, color: 'text.secondary' }}>{description}</Typography>}
          {children && <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" useFlexGap gap={1.5} sx={{ mt: 3, alignItems: { xs: 'stretch', sm: 'center' } }}>{children}</Stack>}
        </Box>
        <Box sx={{ height: { xs: 240, sm: 330, md: 360 }, border: '6px solid', borderColor: 'background.paper', borderRadius: { xs: '24px 56px 24px 24px', md: '24px 72px 24px 24px' }, overflow: 'hidden', bgcolor: 'primary.dark', boxShadow: '0 12px 32px rgba(23,60,44,.08)' }}><ClubPhoto image={image} alt={`${eyebrow} at Hula Hula Golf Club`} eager sizes="(max-width: 900px) 92vw, 43vw" /></Box>
      </Box>
    </Container>
  </Box>;
}
