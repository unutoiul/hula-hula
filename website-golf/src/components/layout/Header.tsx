import CloseRounded from '@mui/icons-material/CloseRounded';
import GolfCourseRounded from '@mui/icons-material/GolfCourseRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Collapse, Container, Drawer, IconButton, Link, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useContact, useSite } from '../../context/SiteDataContext';
import { linkClick, useLocation } from '../../router';
import { ClubMark } from '../common/ClubMark';
import { LineIcon } from '../common/LineIcon';
import { TropicalBackdrop } from '../common/TropicalBackdrop';
import { NavLink } from './NavLink';
import { SiteList, SiteTabs, SwitcherLogo } from './SiteSwitcher';

type NavGroup = { label: string; href: string; items?: [string, string][] };

// Two groups either side of the logo on large screens, all of them in the menu.
const GROUPS: NavGroup[] = [
  { label: 'Play', href: '/activities', items: [['The golf course', '/course'], ['FootGolf', '/activities/footgolf'], ['Fling Golf', '/activities/fling-golf'], ['Driving range', '/activities/range'], ['Pickleball', '/activities/pickleball'], ['All activities', '/activities'], ['Prices & rentals', '/prices']] },
  { label: 'Events & offers', href: '/events' },
  { label: 'Clubhouse', href: '/clubhouse' },
  { label: 'Visit', href: '/visit', items: [['Plan your visit', '/visit'], ['Photo gallery', '/gallery'], ['Contact the club', '/contact']] },
];

// The same header as the resort's (website/src/components/layout/Header.tsx):
// a contact strip with the Resort | Golf Club tabs, then the logo — which opens
// the site switcher — centred between the menu. It's fixed to the top on every
// page, so a spacer of its full height holds its place in the page.
export function Header() {
  const CONTACT = useContact();
  const { club } = useSite();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<{ label: string; anchor: HTMLElement } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 40);
    scroll(); window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  const isActive = (group: NavGroup) => pathname === group.href || !!group.items?.some(([, href]) => pathname === href)
    || (group.href === '/events' && (pathname.startsWith('/events/') || pathname === '/offers'));
  const go = (href: string, after?: () => void) => (event: Parameters<ReturnType<typeof linkClick>>[0]) => { after?.(); linkClick(href)(event); };
  const navLink = (group: NavGroup) => group.items
    ? <NavLink key={group.label} href={group.href} active={isActive(group)} aria-haspopup="menu" aria-expanded={menu?.label === group.label} aria-controls={menu?.label === group.label ? 'header-submenu' : undefined}
      onClick={(e) => { e.preventDefault(); setMenu({ label: group.label, anchor: e.currentTarget }); }}>
      {group.label}<KeyboardArrowDownRounded sx={{ fontSize: 18, verticalAlign: 'middle', ml: .25, mt: '-2px' }} />
    </NavLink>
    : <NavLink key={group.label} href={group.href} active={isActive(group)} aria-current={isActive(group) ? 'page' : undefined} onClick={linkClick(group.href)}>{group.label}</NavLink>;
  const bookButton = (onClick?: () => void) => <Button href="/book" onClick={go('/book', onClick)} variant="contained" color="secondary" startIcon={<GolfCourseRounded sx={{ fontSize: 18 }} />}
    sx={{ whiteSpace: 'nowrap', flexShrink: 0, '@media (max-width: 380px)': { px: 2, '& .MuiButton-startIcon': { display: 'none' } } }}>Book a tee time</Button>;

  // Tall with a big logo at the top of the page; once scrolled it slims to a
  // compact bar (and smaller logo) so it takes as little room as possible.
  return <>
    <Box component="header" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, bgcolor: 'rgba(255,253,243,.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid', borderColor: scrolled ? 'divider' : 'transparent', boxShadow: scrolled ? '0 3px 18px rgba(23,60,44,.06)' : 'none', transition: 'border-color .35s ease, box-shadow .35s ease' }}>
      <TropicalBackdrop side="left" compact />
      {/* Contact strip: always-on details at the very top; folds away on scroll. */}
      <Box sx={{ position: 'relative', overflow: 'hidden', height: scrolled ? 0 : { xs: 34, md: 36 }, transition: 'height .35s ease', bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="xl" sx={{ height: '100%' }}>
          <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', md: 'space-between' }} sx={{ height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ display: { xs: 'none', md: 'flex' }, minWidth: 0 }}>
              <Box sx={{ display: { xs: 'none', lg: 'block' } }}><SiteTabs /></Box>
              <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, opacity: .9 }}>{club.announcement}</Typography>
            </Stack>
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
          <Stack component="nav" aria-label="Main navigation" direction="row" spacing={4} sx={{ display: { xs: 'none', lg: 'flex' } }}>{GROUPS.slice(0, 2).map(navLink)}</Stack>
          <Box sx={{ gridColumn: { xs: 1, lg: 2 } }}><SwitcherLogo size={scrolled ? 'small' : 'header'} /></Box>
          <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={{ xs: 1.5, lg: 3 }} sx={{ gridColumn: { xs: 2, lg: 3 } }}>
            <Stack component="nav" aria-label="More navigation" direction="row" spacing={4} sx={{ display: { xs: 'none', lg: 'flex' } }}>{GROUPS.slice(2).map(navLink)}</Stack>
            {bookButton()}
            <IconButton aria-label="Open menu" onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', lg: 'none' }, width: 48, height: 48, color: 'text.primary', border: '1px solid', borderColor: 'divider' }}><MenuRounded /></IconButton>
          </Stack>
        </Box>
      </Container>
      <Menu id="header-submenu" anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)} slotProps={{ paper: { sx: { mt: 1, minWidth: 220, p: .75, border: '1px solid', borderColor: 'divider', borderRadius: '16px', boxShadow: '0 12px 36px rgba(18,78,57,.12)' } } }}>
        {GROUPS.find((group) => group.label === menu?.label)?.items?.map(([label, href]) => <MenuItem key={href} component="a" href={href} selected={pathname === href} onClick={go(href, () => setMenu(null))} sx={{ fontSize: 14, py: 1.5, borderRadius: '8px' }}>{label}</MenuItem>)}
      </Menu>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 380 }, bgcolor: 'background.default', p: 3 } } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between"><Box onClick={() => setOpen(false)}><ClubMark size="compact" href="/" /></Box><IconButton aria-label="Close menu" onClick={() => setOpen(false)} sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider' }}><CloseRounded /></IconButton></Stack>
        <Stack component="nav" aria-label="Mobile navigation" spacing={1} sx={{ mt: 4 }}>
          {GROUPS.map((group) => <Box key={group.label} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            {group.items
              ? <>
                <Box component="button" type="button" onClick={() => setExpanded(expanded === group.label ? null : group.label)} aria-expanded={expanded === group.label}
                  sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.2, px: 0, border: 0, bgcolor: 'transparent', color: 'text.primary', cursor: 'pointer', textAlign: 'left' }}>
                  <Typography variant="h3" component="span" sx={{ fontSize: 32 }}>{group.label}</Typography>
                  <KeyboardArrowDownRounded sx={{ transition: 'transform .25s ease', transform: expanded === group.label ? 'rotate(180deg)' : 'none' }} />
                </Box>
                <Collapse in={expanded === group.label}><Stack sx={{ pl: .5, pb: 1.5 }}>{group.items.map(([label, href]) => <Link key={href} href={href} onClick={go(href, () => setOpen(false))} underline="none" aria-current={pathname === href ? 'page' : undefined} sx={{ color: pathname === href ? 'primary.main' : 'text.secondary', fontSize: 16, fontWeight: 700, py: 1.1 }}>{label}</Link>)}</Stack></Collapse>
              </>
              : <Link href={group.href} onClick={go(group.href, () => setOpen(false))} color="text.primary" underline="none" aria-current={isActive(group) ? 'page' : undefined} sx={{ display: 'block', py: 1.2 }}><Typography variant="h3" component="span" sx={{ fontSize: 32 }}>{group.label}</Typography></Link>}
          </Box>)}
        </Stack>
        <Typography variant="overline" sx={{ display: 'block', mt: 4, mb: 1, color: 'text.secondary' }}>The Hula Hula family</Typography>
        <SiteList onHere={() => setOpen(false)} />
        <Box sx={{ mt: 3, display: 'grid' }}>{bookButton(() => setOpen(false))}</Box>
      </Drawer>
    </Box>
    <Box aria-hidden sx={{ height: { xs: 34 + 104 + 1, md: 36 + 150 + 1 } }} />
  </>;
}
