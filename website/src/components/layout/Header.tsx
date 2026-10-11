import ArrowOutward from '@mui/icons-material/ArrowOutward';
import CloseRounded from '@mui/icons-material/CloseRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import WavesRounded from '@mui/icons-material/WavesRounded';
import { Box, Button, Container, Drawer, IconButton, Link, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { NavItem } from '../../types';
import { ClubMark } from '../common/ClubMark';
import { SunDoodle } from '../common/VacationDecor';
import { NavLink } from './NavLink';
import { useMotionPreference } from '../../context/MotionPreferenceContext';

export function Header({ navItems }: { navItems: NavItem[] }) {
  const { reduced, toggle } = useMotionPreference();
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
  return <Box component="header" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, bgcolor: 'rgba(251,253,244,.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid', borderColor: scrolled ? 'divider' : 'transparent', boxShadow: scrolled ? '0 3px 18px rgba(23,60,44,.04)' : 'none' }}>
    <Container maxWidth="xl">
      <Box sx={{ minHeight: { xs: 90, md: 106 }, display: 'grid', gridTemplateColumns: { xs: 'auto 1fr', lg: '1fr auto 1fr' }, alignItems: 'center', gap: { xs: 1.5, md: 3 }, py: 1 }}>
        <Stack component="nav" aria-label="Main navigation" direction="row" spacing={3.5} sx={{ display: { xs: 'none', lg: 'flex' } }}>{navItems.slice(0, 3).map(([label, href]) => <NavLink key={href} href={href} active={active === href}>{label}</NavLink>)}</Stack>
        <Box sx={{ gridColumn: { xs: 1, lg: 2 } }}><ClubMark size="compact" /></Box>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={{ xs: 1.5, lg: 3 }} sx={{ gridColumn: { xs: 2, lg: 3 } }}>
          <Stack component="nav" aria-label="More navigation" direction="row" spacing={2.5} sx={{ display: { xs: 'none', lg: 'flex' } }}>{navItems.filter(([, href]) => href === '#events' || href === '#contact').map(([label, href]) => <NavLink key={href} href={href} active={active === href}>{label}</NavLink>)}</Stack>
          <Button href="#arrival" variant="contained" color="secondary" endIcon={<ArrowOutward sx={{ fontSize: 17 }} />} sx={{ fontSize: { xs: 12, sm: 14 }, px: { xs: 2, sm: 2.5 }, py: 1.2 }}>Book happy</Button>
          <IconButton onClick={toggle} aria-label={reduced ? 'Enable decorative motion' : 'Pause decorative motion'} aria-pressed={reduced} title={reduced ? 'Motion paused' : 'Pause motion'} sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'primary.main', border: '1px solid', borderColor: 'divider' }}><WavesRounded /></IconButton>
          <IconButton aria-label="Open menu" onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', lg: 'none' }, color: 'text.primary', border: '1px solid', borderColor: 'divider' }}><MenuRounded /></IconButton>
        </Stack>
      </Box>
    </Container>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 380 }, bgcolor: 'background.default', p: 3 } } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between"><ClubMark size="compact" /><IconButton aria-label="Close menu" onClick={() => setOpen(false)}><CloseRounded /></IconButton></Stack>
      <Stack component="nav" aria-label="Mobile navigation" spacing={1} sx={{ mt: 5 }}>{navItems.map(([label, href]) => <Link key={href} href={href} color="text.primary" underline="none" onClick={() => setOpen(false)} sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}><Typography variant="h3" sx={{ fontSize: 32 }}>{label}</Typography></Link>)}</Stack>
      <SunDoodle color="#50830d" sx={{ mt: 5 }} />
      <Typography variant="h3" sx={{ mt: 2 }}>Your next happy chapter.</Typography>
      <Button onClick={toggle} color="inherit" startIcon={<WavesRounded />} aria-pressed={reduced} sx={{ mt: 2 }}>{reduced ? 'Enable decorative motion' : 'Pause decorative motion'}</Button>
      <Button href="#arrival" onClick={() => setOpen(false)} variant="contained" sx={{ mt: 3 }}>Let’s plan it</Button>
    </Drawer>
  </Box>;
}
