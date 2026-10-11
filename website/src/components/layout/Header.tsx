import ArrowOutward from '@mui/icons-material/ArrowOutward';
import CloseRounded from '@mui/icons-material/CloseRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import { Box, Button, Container, Drawer, IconButton, Link, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { scrim } from '../../theme';
import type { NavItem } from '../../types';
import { ClubMark } from '../common/ClubMark';
import { NavLink } from './NavLink';

export function Header({ navItems }: { navItems: NavItem[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(navItems[0]?.[1] ?? '');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the nav item for whichever section is currently centered in the viewport.
  useEffect(() => {
    const sections = navItems.map(([, href]) => document.getElementById(href.slice(1))).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(`#${entry.target.id}`); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [navItems]);

  const closeMenu = () => setOpen(false);

  // Split the nav in half so it flanks the centered logo symmetrically —
  // paired with the 1fr/auto/1fr grid below, the two outer columns are
  // always equal width by construction (however much nav/button content
  // each holds), which is what actually keeps the mark dead-center rather
  // than approximately so.
  const half = Math.ceil(navItems.length / 2);
  const leftNav = navItems.slice(0, half);
  const rightNav = navItems.slice(half);

  return <Box component="header" sx={(theme) => ({
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
    // A scrim sits under the header at all times so nav text stays legible over bright
    // hero photography, not just once the user scrolls past it.
    background: scrolled ? scrim(.92) : `linear-gradient(180deg, ${scrim(.62)} 0%, ${scrim(.28)} 75%, ${scrim(0)} 100%)`,
    backdropFilter: scrolled ? 'blur(12px)' : 'blur(1.5px)',
    // A hairline of the logo's pineapple gold once scrolled, instead of a plain white
    // border — a small, deliberate callback to the mark rather than a generic divider.
    // No border at all at the top: a transparent-colored 1px border can still leave a
    // faint seam against the gradient/blur underneath it, so it's removed outright
    // rather than just made transparent.
    borderBottom: scrolled ? '1px solid' : 'none', borderColor: alpha(theme.palette.secondary.main, .45),
    transition: 'background .4s ease, border-color .4s ease, backdrop-filter .4s ease, border-bottom .1s ease',
  })}>
    <Container maxWidth="xl">
      <Box sx={{
        display: 'grid', gridTemplateColumns: { xs: 'auto 1fr auto', md: '1fr auto 1fr' }, alignItems: 'center', columnGap: { xs: 2, md: 5 },
        minHeight: scrolled ? { xs: 66, md: 84 } : { xs: 80, md: 108 },
        py: scrolled ? { xs: .5, md: 1 } : { xs: 1, md: 1.25 },
        color: 'common.white', textShadow: '0 1px 6px rgba(0,0,0,.4)',
        transition: 'min-height .35s ease, padding .35s ease',
      }}>
        <Stack component="nav" direction="row" spacing={{ md: 2.75, lg: 4 }} justifyContent="flex-end" sx={{ display: { xs: 'none', md: 'flex' }, gridColumn: 1 }}>
          {leftNav.map(([label, href]) => <NavLink key={label} href={href} active={active === href}>{label}</NavLink>)}
        </Stack>

        {/* Left-aligned on mobile (nav columns are hidden there); centered once they appear at md+. */}
        <Box sx={{ gridColumn: { xs: 1, md: 2 } }}><ClubMark size={scrolled ? 'compact' : 'default'} /></Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minWidth: 0, gridColumn: 3 }}>
          <Stack component="nav" direction="row" spacing={{ md: 2.75, lg: 4 }} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {rightNav.map(([label, href]) => <NavLink key={label} href={href} active={active === href}>{label}</NavLink>)}
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ width: '100%' }} spacing={2}>
            <Button href="#arrival" color="inherit" variant="outlined" endIcon={<ArrowOutward sx={{ fontSize: 15 }} />} sx={{
              display: { xs: 'none', sm: 'inline-flex' }, borderRadius: 999, px: 2.4, py: .9, fontSize: 11,
              borderColor: 'rgba(255,255,255,.55)',
              '&:hover': { borderColor: 'info.main', bgcolor: 'info.main', color: 'info.contrastText' },
            }}>Book a stay</Button>
            <IconButton aria-label="Open menu" onClick={() => setOpen(true)} sx={{
              display: { xs: 'inline-flex', md: 'none' }, color: 'inherit',
              border: '1px solid', borderColor: 'rgba(255,255,255,.35)',
            }}><MenuRounded /></IconButton>
          </Stack>
        </Stack>
      </Box>
    </Container>

    <Drawer anchor="right" open={open} onClose={closeMenu} PaperProps={{ sx: {
      width: { xs: '100%', sm: 340 }, maxWidth: '100%', bgcolor: 'primary.dark', color: 'primary.contrastText',
      display: 'flex', flexDirection: 'column',
    } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'rgba(255,255,255,.14)' }}>
        <ClubMark size="compact" />
        <IconButton aria-label="Close menu" onClick={closeMenu} sx={{ color: 'inherit', border: '1px solid', borderColor: 'rgba(255,255,255,.25)' }}><CloseRounded /></IconButton>
      </Stack>

      <Stack component="nav" sx={{ px: 3, pt: 4, pb: 4, flex: 1, overflowY: 'auto' }}>
        {navItems.map(([label, href], i) => {
          const isActive = active === href;
          return <Link key={label} href={href} onClick={closeMenu} color="inherit" underline="none" sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, py: 1.3,
            borderTop: i === 0 ? 'none' : '1px solid', borderColor: 'rgba(255,255,255,.1)',
            fontFamily: 'inherit',
          }}>
            <Typography variant="overline" sx={{ width: 20, fontSize: '.6rem', color: isActive ? 'secondary.main' : 'rgba(255,255,255,.4)' }}>{String(i + 1).padStart(2, '0')}</Typography>
            <Typography variant="h3" sx={{ fontSize: 17, color: isActive ? 'secondary.main' : 'inherit', transition: 'color .2s ease' }}>{label}</Typography>
          </Link>;
        })}

        <Button href="#arrival" onClick={closeMenu} color="inherit" variant="outlined" fullWidth endIcon={<ArrowOutward sx={{ fontSize: 16 }} />} sx={{
          mt: 4, py: 1.4, borderRadius: 999, borderColor: 'rgba(255,255,255,.4)',
          '&:hover': { borderColor: 'info.main', bgcolor: 'info.main', color: 'info.contrastText' },
        }}>Book a stay</Button>
      </Stack>
    </Drawer>
  </Box>;
}
