import ArrowOutward from '@mui/icons-material/ArrowOutward';
import CloseRounded from '@mui/icons-material/CloseRounded';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import PhoneRounded from '@mui/icons-material/PhoneRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Container, Drawer, IconButton, Link, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { CONTACT } from '../../data/content';
import { sectionLink, useLocation } from '../../router';
import type { NavItem } from '../../types';
import { ClubMark } from '../common/ClubMark';
import { HomeLogo, SiteList, SiteTabs } from './SiteSwitcher';
import { NavLink } from './NavLink';

const desktopNavigation = '@media (min-width: 1300px)';

// The Hula Hula family header (the resort's layout): a pink contact strip
// with the family tabs, then three menu items, the logo in the middle and
// two more beside the booking button. One header on every page: section
// links go home first from the room, meeting and experience pages.
export function Header({ navItems }: { navItems: NavItem[] }) {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 40);
    scroll(); window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  useEffect(() => {
    if (pathname !== '/') { setActive(navItems.find(([, href]) => href === pathname)?.[1] ?? ''); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach(entry => { if (entry.isIntersecting) setActive(`#${entry.target.id}`); }), { rootMargin: '-25% 0px -65% 0px' });
    navItems.forEach(([, href]) => { const node = href.startsWith('#') ? document.getElementById(href.slice(1)) : null; if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [navItems, pathname]);
  const book = sectionLink(pathname === '/' ? '#booking-search' : '#arrival', pathname);
  // Tall with a big logo at the top of the page; once scrolled it slims to a
  // compact bar (and smaller logo) so it takes as little room as possible.
  return <Box component="header" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, bgcolor: 'rgba(255,249,242,.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid', borderColor: scrolled ? 'divider' : 'transparent', boxShadow: scrolled ? '0 3px 18px rgba(90,36,72,.07)' : 'none', transition: 'border-color .35s ease, box-shadow .35s ease' }}>
    {/* Contact strip: always-on details at the very top; folds away on scroll. */}
    <Box sx={{ position: 'relative', overflow: 'hidden', height: scrolled ? 0 : 30, transition: 'height .35s ease', bgcolor: 'primary.dark', color: 'white' }}>
      <Container maxWidth="xl" sx={{ height: '100%' }}>
        {/* The family tabs on the left (large screens), contact details on the right. */}
        <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-end', lg: 'space-between' }} sx={{ height: '100%' }}>
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}><SiteTabs /></Box>
          <Stack direction="row" alignItems="center" divider={<Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(255,255,255,.35)' }} />} spacing={{ xs: 1.5, sm: 2.5 }} sx={{ height: '100%', fontSize: { xs: 12, md: 13 }, fontWeight: 600, '& a': { color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: .75, whiteSpace: 'nowrap', minHeight: 32 }, '& a:hover': { textDecoration: 'underline' }, '& svg': { fontSize: 16 } }}>
            <Link href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${CONTACT.phone}`}><WhatsApp />{CONTACT.phone}</Link>
            <Link href={CONTACT.landlineTel} aria-label={`Call ${CONTACT.landline}`} sx={{ display: { xs: 'none !important', sm: 'inline-flex !important' } }}><PhoneRounded />{CONTACT.landline}</Link>
            <Link href={`mailto:${CONTACT.email}`} aria-label={`Email ${CONTACT.email}`}><MailOutlineRounded /><Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{CONTACT.email}</Box><Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Email us</Box></Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
    <Container maxWidth="xl">
      <Box sx={{ minHeight: scrolled ? { xs: 72, md: 80 } : { xs: 80, md: 96 }, transition: 'min-height .35s ease', display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', [desktopNavigation]: { gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)' }, alignItems: 'center', gap: { xs: 1.5, md: 3 }, py: 1 }}>
        <Stack component="nav" aria-label="Main navigation" direction="row" spacing={3} sx={{ display: 'none', [desktopNavigation]: { display: 'flex' }, minWidth: 0 }}>{navItems.slice(0, 3).map(([label, href]) => <NavLink key={href} {...sectionLink(href, pathname)} active={active === href}>{label}</NavLink>)}</Stack>
        <Box sx={{ gridColumn: 1, [desktopNavigation]: { gridColumn: 2 } }}><HomeLogo size={scrolled ? 'small' : 'compact'} /></Box>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={{ xs: 1.5, lg: 2 }} sx={{ gridColumn: 2, minWidth: 0, [desktopNavigation]: { gridColumn: 3 } }}>
          <Stack component="nav" aria-label="More navigation" direction="row" spacing={2} sx={{ display: 'none', [desktopNavigation]: { display: 'flex' } }}>{navItems.slice(3).filter(([, href]) => href !== '#contact').map(([label, href]) => <NavLink key={href} {...sectionLink(href, pathname)} active={active === href}>{label}</NavLink>)}</Stack>
          <Button {...book} variant="contained" endIcon={<ArrowOutward sx={{ fontSize: 17 }} />} sx={{ whiteSpace: 'nowrap', flexShrink: 0, '@media (max-width: 359px)': { px: 2, '& .MuiButton-endIcon': { display: 'none' } } }}>Book your stay</Button>
          <IconButton aria-label="Open menu" onClick={() => setOpen(true)} sx={{ display: 'inline-flex', [desktopNavigation]: { display: 'none' }, width: 48, height: 48, flexShrink: 0, color: 'text.primary', border: '1px solid', borderColor: 'divider' }}><MenuRounded /></IconButton>
        </Stack>
      </Box>
    </Container>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 380 }, bgcolor: 'background.default', p: 3 } } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between"><ClubMark size="compact" /><IconButton aria-label="Close menu" onClick={() => setOpen(false)} sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider' }}><CloseRounded /></IconButton></Stack>
      <Stack component="nav" aria-label="Mobile navigation" spacing={1} sx={{ mt: 4 }}>{navItems.map(([label, href]) => {
        const link = sectionLink(href, pathname);
        return <Link key={href} href={link.href} color="text.primary" underline="none" onClick={(e) => { link.onClick?.(e); setOpen(false); }} sx={{ py: 1.1, borderBottom: '1px solid', borderColor: 'divider' }}><Typography variant="h3" sx={{ fontSize: 30 }}>{label}</Typography></Link>;
      })}</Stack>
      <Typography variant="overline" sx={{ display: 'block', mt: 4, mb: 1, color: 'text.secondary' }}>The Hula Hula family</Typography>
      <SiteList onHere={() => setOpen(false)} />
      <Button href={book.href} onClick={(e) => { book.onClick?.(e); setOpen(false); }} variant="contained" sx={{ mt: 3 }}>Book your stay</Button>
    </Drawer>
  </Box>;
}
