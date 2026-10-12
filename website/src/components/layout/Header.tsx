import ArrowOutward from '@mui/icons-material/ArrowOutward';
import CloseRounded from '@mui/icons-material/CloseRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import { Box, Button, Container, Drawer, IconButton, Link, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { NavItem } from '../../types';
import { ClubMark } from '../common/ClubMark';
import { SunDoodle } from '../common/VacationDecor';
import { MotionToggleButton, MotionToggleMenuButton } from './MotionToggle';
import { NavLink } from './NavLink';

export function Header({ navItems }: { navItems: NavItem[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 40);
    scroll(); window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach(entry => { if (entry.isIntersecting) setActive(`#${entry.target.id}`); }), { rootMargin: '-25% 0px -65% 0px' });
    navItems.forEach(([, href]) => { const node = document.getElementById(href.slice(1)); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [navItems]);
  // Tall with a big logo at the top of the page; once scrolled it slims to a
  // compact bar (and smaller logo) so it takes as little room as possible.
  return <Box component="header" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, bgcolor: 'rgba(251,253,244,.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid', borderColor: scrolled ? 'divider' : 'transparent', boxShadow: scrolled ? '0 3px 18px rgba(23,60,44,.06)' : 'none', transition: 'border-color .35s ease, box-shadow .35s ease' }}>
    <Container maxWidth="xl">
      <Box sx={{ minHeight: scrolled ? { xs: 72, md: 80 } : { xs: 100, md: 136 }, transition: 'min-height .35s ease', display: 'grid', gridTemplateColumns: { xs: 'auto 1fr', lg: '1fr auto 1fr' }, alignItems: 'center', gap: { xs: 1.5, md: 3 }, py: 1 }}>
        <Stack component="nav" aria-label="Main navigation" direction="row" spacing={4} sx={{ display: { xs: 'none', lg: 'flex' } }}>{navItems.slice(0, 3).map(([label, href]) => <NavLink key={href} href={href} active={active === href}>{label}</NavLink>)}</Stack>
        <Box sx={{ gridColumn: { xs: 1, lg: 2 } }}><ClubMark size={scrolled ? 'small' : 'header'} /></Box>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={{ xs: 1.5, lg: 3 }} sx={{ gridColumn: { xs: 2, lg: 3 } }}>
          <Stack component="nav" aria-label="More navigation" direction="row" spacing={4} sx={{ display: { xs: 'none', lg: 'flex' } }}>{navItems.filter(([, href]) => href === '#events' || href === '#contact').map(([label, href]) => <NavLink key={href} href={href} active={active === href}>{label}</NavLink>)}</Stack>
          <Button href="#arrival" variant="contained" color="secondary" endIcon={<ArrowOutward sx={{ fontSize: 17 }} />} sx={{ whiteSpace: 'nowrap', flexShrink: 0, '@media (max-width: 359px)': { px: 2, '& .MuiButton-endIcon': { display: 'none' } } }}>Book happy</Button>
          <MotionToggleButton />
          <IconButton aria-label="Open menu" onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', lg: 'none' }, width: 48, height: 48, color: 'text.primary', border: '1px solid', borderColor: 'divider' }}><MenuRounded /></IconButton>
        </Stack>
      </Box>
    </Container>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 380 }, bgcolor: 'background.default', p: 3 } } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between"><ClubMark size="compact" /><IconButton aria-label="Close menu" onClick={() => setOpen(false)} sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider' }}><CloseRounded /></IconButton></Stack>
      <Stack component="nav" aria-label="Mobile navigation" spacing={1} sx={{ mt: 5 }}>{navItems.map(([label, href]) => <Link key={href} href={href} color="text.primary" underline="none" onClick={() => setOpen(false)} sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}><Typography variant="h3" sx={{ fontSize: 32 }}>{label}</Typography></Link>)}</Stack>
      <SunDoodle color="#50830d" sx={{ mt: 5 }} />
      <Typography variant="h3" sx={{ mt: 2 }}>Your next happy chapter.</Typography>
      <MotionToggleMenuButton />
      <Button href="#arrival" onClick={() => setOpen(false)} variant="contained" sx={{ mt: 1.5 }}>Let’s plan it</Button>
    </Drawer>
  </Box>;
}
