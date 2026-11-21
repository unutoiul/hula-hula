import ArrowOutward from '@mui/icons-material/ArrowOutward';
import CloseRounded from '@mui/icons-material/CloseRounded';
import East from '@mui/icons-material/East';
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

const quickContacts = [
  { href: CONTACT.whatsapp, label: 'WhatsApp', Icon: WhatsApp, external: true },
  { href: CONTACT.landlineTel, label: 'Call', Icon: PhoneRounded, external: false },
  { href: `mailto:${CONTACT.email}`, label: 'Email', Icon: MailOutlineRounded, external: false },
];

// The Hula Hula family header (the resort's layout): a plum contact strip
// with the family tabs, then three menu items, the logo in the middle and
// the rest beside the booking button. One header on every page: section
// links go home first from the room, meeting and experience pages. Below
// 1300px: logo, booking button ("Book" on phones) and the menu, a full
// sheet with the sections, the quickest ways to reach a person, the family
// and a booking button that stays in reach at its foot.
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
  const close = () => setOpen(false);
  // Tall with a big logo at the top of the page; once scrolled it slims to a
  // compact bar (and smaller logo) so it takes as little room as possible.
  return <Box component="header" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, bgcolor: 'rgba(255,249,242,.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid', borderColor: scrolled ? 'divider' : 'transparent', boxShadow: scrolled ? '0 3px 18px rgba(90,36,72,.07)' : 'none', transition: 'border-color .35s ease, box-shadow .35s ease' }}>
    {/* Contact strip: always-on details at the very top; folds away on scroll. The same
        height as the resort's and golf club's, so the 32px family tabs sit inside it. */}
    <Box sx={{ position: 'relative', overflow: 'hidden', height: scrolled ? 0 : { xs: 34, md: 36 }, transition: 'height .35s ease', bgcolor: 'primary.dark', color: 'white' }}>
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
      <Box sx={{ minHeight: scrolled ? { xs: 68, md: 80 } : { xs: 80, md: 96 }, transition: 'min-height .35s ease', display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', [desktopNavigation]: { gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)' }, alignItems: 'center', gap: { xs: 1.5, md: 3 }, py: 1 }}>
        <Stack component="nav" aria-label="Main navigation" direction="row" spacing={3} sx={{ display: 'none', [desktopNavigation]: { display: 'flex' }, minWidth: 0 }}>{navItems.slice(0, 3).map(([label, href]) => <NavLink key={href} {...sectionLink(href, pathname)} active={active === href}>{label}</NavLink>)}</Stack>
        <Box sx={{ gridColumn: 1, [desktopNavigation]: { gridColumn: 2 } }}><HomeLogo size={scrolled ? 'small' : 'compact'} /></Box>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={{ xs: 1, sm: 1.5, lg: 2 }} sx={{ gridColumn: 2, minWidth: 0, [desktopNavigation]: { gridColumn: 3 } }}>
          <Stack component="nav" aria-label="More navigation" direction="row" spacing={2} sx={{ display: 'none', [desktopNavigation]: { display: 'flex' } }}>{navItems.slice(3).filter(([, href]) => href !== '#contact').map(([label, href]) => <NavLink key={href} {...sectionLink(href, pathname)} active={active === href}>{label}</NavLink>)}</Stack>
          {/* "Book your stay" from tablets up; just "Book" on phones, so the logo keeps its room. */}
          <Button {...book} variant="contained" endIcon={<ArrowOutward sx={{ fontSize: 17 }} />} sx={{ whiteSpace: 'nowrap', flexShrink: 0, minHeight: { xs: 44, sm: 48 }, px: { xs: 2.25, sm: 3 } }}>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Book your stay</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Book</Box>
          </Button>
          <IconButton aria-label="Open menu" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)} sx={{ display: 'inline-flex', [desktopNavigation]: { display: 'none' }, width: 44, height: 44, flexShrink: 0, color: 'text.primary', border: '1px solid', borderColor: 'divider' }}><MenuRounded /></IconButton>
        </Stack>
      </Box>
    </Container>
    <Drawer anchor="right" open={open} onClose={close} slotProps={{ paper: { 'aria-label': 'Menu', sx: { width: { xs: '100%', sm: 400 }, bgcolor: 'background.default', display: 'flex', flexDirection: 'column' } } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <ClubMark size="small" />
        <IconButton aria-label="Close menu" onClick={close} sx={{ width: 44, height: 44, border: '1px solid', borderColor: 'divider' }}><CloseRounded /></IconButton>
      </Stack>
      <Box sx={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', px: 2.5, pt: .5, pb: 3 }}>
        <Box component="nav" aria-label="Mobile navigation">
          {navItems.map(([label, href]) => {
            const link = sectionLink(href, pathname);
            const isActive = active === href;
            return <Link key={href} href={link.href} underline="none" aria-current={isActive ? 'location' : undefined} onClick={(e) => { link.onClick?.(e); close(); }} sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, minHeight: 56, borderBottom: '1px solid', borderColor: 'divider',
              color: isActive ? 'primary.main' : 'text.primary', '& svg': { fontSize: 20, color: 'primary.main', transition: 'transform .2s ease' }, '&:hover svg': { transform: 'translateX(3px)' },
            }}>
              <Typography component="span" variant="h3" sx={{ fontSize: 26, lineHeight: 1.2 }}>{label}</Typography>
              <East aria-hidden />
            </Link>;
          })}
        </Box>
        {/* The quickest ways to a person. */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 3 }}>
          {quickContacts.map(({ href, label, Icon, external }) => <Box key={label} component="a" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: .5, minHeight: 64, borderRadius: '16px',
            border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary', textDecoration: 'none', fontSize: 13, fontWeight: 700,
            '& svg': { fontSize: 22, color: 'primary.main' }, '&:hover': { borderColor: 'primary.main' },
          }}><Icon />{label}</Box>)}
        </Box>
        <Typography variant="overline" sx={{ display: 'block', mt: 3.5, mb: 1, color: 'text.secondary' }}>The Hula Hula family</Typography>
        <SiteList compact onHere={close} />
      </Box>
      {/* The booking button stays in reach at the foot of the sheet. */}
      <Box sx={{ px: 2.5, pt: 1.5, pb: 'calc(16px + env(safe-area-inset-bottom))', borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <Button href={book.href} onClick={(e) => { book.onClick?.(e); close(); }} variant="contained" fullWidth endIcon={<ArrowOutward sx={{ fontSize: 17 }} />}>Book your stay</Button>
      </Box>
    </Drawer>
  </Box>;
}
