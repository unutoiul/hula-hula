import CloseRounded from '@mui/icons-material/CloseRounded';
import GolfCourseRounded from '@mui/icons-material/GolfCourseRounded';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Container, Drawer, IconButton, Link, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useContact, useSite } from '../../context/SiteDataContext';
import { linkClick } from '../../router';
import type { NavItem } from '../../types';
import { ClubMark } from '../common/ClubMark';
import { LineIcon } from '../common/LineIcon';
import { TropicalBackdrop } from '../common/TropicalBackdrop';
import { SunDoodle } from '../common/VacationDecor';
import { MotionToggleButton, MotionToggleMenuButton } from './MotionToggle';
import { NavLink } from './NavLink';

export function Header({ navItems }: { navItems: NavItem[] }) {
  const CONTACT = useContact();
  const { club } = useSite();
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
  const bookButton = (onClick?: () => void) => <Button href="/book" onClick={(e) => { onClick?.(); linkClick('/book')(e); }} variant="contained" color="secondary" startIcon={<GolfCourseRounded sx={{ fontSize: 18 }} />}
    sx={{ whiteSpace: 'nowrap', flexShrink: 0, '@media (max-width: 380px)': { px: 2, '& .MuiButton-startIcon': { display: 'none' } } }}>Book a tee time</Button>;

  // Tall with a big logo at the top of the page; once scrolled it slims to a
  // compact bar (and smaller logo) so it takes as little room as possible.
  return <Box component="header" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, bgcolor: 'rgba(255,253,243,.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid', borderColor: scrolled ? 'divider' : 'transparent', boxShadow: scrolled ? '0 3px 18px rgba(23,60,44,.06)' : 'none', transition: 'border-color .35s ease, box-shadow .35s ease' }}>
    <TropicalBackdrop side="left" compact />
    {/* Contact strip: always-on details at the very top; folds away on scroll. */}
    <Box sx={{ position: 'relative', overflow: 'hidden', height: scrolled ? 0 : { xs: 34, md: 36 }, transition: 'height .35s ease', bgcolor: 'primary.main', color: 'white' }}>
      <Container maxWidth="xl" sx={{ height: '100%' }}>
        <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', md: 'space-between' }} sx={{ height: '100%' }}>
          <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: 13, fontWeight: 600, opacity: .9 }}>{club.announcement}</Typography>
          <Stack direction="row" alignItems="center" divider={<Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(255,255,255,.35)' }} />} spacing={{ xs: 1.5, sm: 2.5 }} sx={{ fontSize: { xs: 12, md: 13 }, fontWeight: 600, '& a': { color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: .75, whiteSpace: 'nowrap', minHeight: 32 }, '& a:hover': { textDecoration: 'underline' }, '& svg': { fontSize: 16 } }}>
            <Link href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${CONTACT.phone}`}><WhatsApp />{CONTACT.phone}</Link>
            <Link href={CONTACT.line} target="_blank" rel="noopener noreferrer" aria-label={`Line ${CONTACT.lineId}`} sx={{ display: { xs: 'none !important', sm: 'inline-flex !important' } }}><LineIcon />{CONTACT.lineId}</Link>
            <Link href={`mailto:${CONTACT.email}`} aria-label={`Email ${CONTACT.email}`}><MailOutlineRounded /><Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{CONTACT.email}</Box><Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Email us</Box></Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
    <Container maxWidth="xl">
      <Box sx={{ minHeight: scrolled ? { xs: 76, md: 84 } : { xs: 104, md: 150 }, transition: 'min-height .35s ease', display: 'grid', gridTemplateColumns: { xs: 'auto 1fr', lg: '1fr auto 1fr' }, alignItems: 'center', gap: { xs: 1.5, md: 3 }, py: 1 }}>
        <Stack component="nav" aria-label="Main navigation" direction="row" spacing={4} sx={{ display: { xs: 'none', lg: 'flex' } }}>{navItems.slice(0, 3).map(([label, href]) => <NavLink key={href} href={href} active={active === href}>{label}</NavLink>)}</Stack>
        <Box sx={{ gridColumn: { xs: 1, lg: 2 } }}><ClubMark size={scrolled ? 'small' : 'header'} /></Box>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={{ xs: 1.5, lg: 3 }} sx={{ gridColumn: { xs: 2, lg: 3 } }}>
          <Stack component="nav" aria-label="More navigation" direction="row" spacing={4} sx={{ display: { xs: 'none', lg: 'flex' } }}>{navItems.slice(3, 5).map(([label, href]) => <NavLink key={href} href={href} active={active === href}>{label}</NavLink>)}</Stack>
          {bookButton()}
          <MotionToggleButton />
          <IconButton aria-label="Open menu" onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', lg: 'none' }, width: 48, height: 48, color: 'text.primary', border: '1px solid', borderColor: 'divider' }}><MenuRounded /></IconButton>
        </Stack>
      </Box>
    </Container>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 380 }, bgcolor: 'background.default', p: 3 } } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between"><ClubMark size="compact" /><IconButton aria-label="Close menu" onClick={() => setOpen(false)} sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider' }}><CloseRounded /></IconButton></Stack>
      <Stack component="nav" aria-label="Mobile navigation" spacing={1} sx={{ mt: 4 }}>{navItems.map(([label, href]) => <Link key={href} href={href} color="text.primary" underline="none" onClick={() => setOpen(false)} sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}><Typography variant="h3" sx={{ fontSize: 32 }}>{label}</Typography></Link>)}</Stack>
      <SunDoodle color="#50830d" sx={{ mt: 5 }} />
      <Typography variant="h3" sx={{ mt: 2 }}>See you on the first tee.</Typography>
      <MotionToggleMenuButton />
      <Box sx={{ mt: 1.5, display: 'grid' }}>{bookButton(() => setOpen(false))}</Box>
    </Drawer>
  </Box>;
}
