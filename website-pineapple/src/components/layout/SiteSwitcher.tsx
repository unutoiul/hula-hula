import ApartmentRounded from '@mui/icons-material/ApartmentRounded';
import BeachAccessRounded from '@mui/icons-material/BeachAccessRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import East from '@mui/icons-material/East';
import GolfCourseRounded from '@mui/icons-material/GolfCourseRounded';
import SwapHorizRounded from '@mui/icons-material/SwapHorizRounded';
import { Box, Popover, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { linkClick } from '../../router';
import { fonts } from '../../theme';
import { ClubMarkArt, type MarkSize } from '../common/ClubMark';

// The Hula Hula family: the resort, the golf club and Royal Pineapple are
// three websites that hand guests to each other. Three ways across: the
// "Resort | Golf Club | Royal Pineapple" tabs in the top strip (large
// screens), the badge on the header logo, and the mobile menu. The logo
// itself goes home. Here everything in the switcher wears the hotel's royal
// pink (the resort and golf club use their yellow). The other copies of this file are
// website-resort/src/components/layout/SiteSwitcher.tsx and
// website-golf/src/components/layout/SiteSwitcher.tsx — keep the three in step.
// The golf club and Royal Pineapple live on their Vercel addresses until they have their own domains.

export const SITES = [
  { id: 'resort', name: 'Hula Hula Resort', short: 'Resort', line: 'Tropical stays & pool villas in Ao Nang', url: 'https://www.hulahularesort.com', image: '/images/switcher/resort.webp', Icon: BeachAccessRounded },
  { id: 'golf', name: 'Hula Hula Golf Club', short: 'Golf Club', line: '9 holes, FootGolf & range bays by the airport', url: 'https://www.hulahulagolfclub.com', image: '/images/switcher/golf.webp', Icon: GolfCourseRounded },
  { id: 'pineapple', name: 'Royal Pineapple Hotel', short: 'Royal Pineapple', line: 'A tropical urban resort in Krabi Town', url: 'https://www.royalpineapplehotel.com', image: '/images/switcher/pineapple.webp', Icon: ApartmentRounded },
] as const;

const HERE = 'pineapple';
const here = SITES.find((s) => s.id === HERE)!;

/** The tabs in the plum strip at the very top (large screens). */
export function SiteTabs() {
  return <Stack component="nav" aria-label="Hula Hula websites" direction="row" sx={{ p: '3px', gap: '2px', borderRadius: 999, bgcolor: 'rgba(255,255,255,.14)' }}>
    {SITES.map(({ id, short, url, Icon }) => {
      const isHere = id === HERE;
      return <Box key={id} component="a" href={isHere ? '/' : url} onClick={isHere ? linkClick('/') : undefined} aria-current={isHere ? 'page' : undefined} sx={{
        display: 'inline-flex', alignItems: 'center', gap: .6, height: 26, px: 1.4, borderRadius: 999, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
        textDecoration: 'none', color: isHere ? 'primary.main' : 'common.white', bgcolor: isHere ? 'common.white' : 'transparent',
        transition: 'background-color .2s ease', '&:hover': isHere ? undefined : { bgcolor: 'rgba(255,255,255,.22)' }, '& svg': { fontSize: 15 },
      }}><Icon />{short}</Box>;
    })}
  </Stack>;
}

/**
 * All three places as cards, the current one marked — in the logo badge's
 * panel and the mobile menu (`compact`: smaller photos, for a phone's menu).
 */
export function SiteList({ onHere, compact = false }: { onHere?: () => void; compact?: boolean }) {
  const thumb = compact ? 48 : 56;
  return <Stack spacing={1}>
    {SITES.map(({ id, name, line, url, image }) => {
      const isHere = id === HERE;
      return <Box key={id} component="a" href={isHere ? '/' : url} onClick={isHere ? (e: MouseEvent) => { linkClick('/')(e); onHere?.(); } : undefined} aria-current={isHere ? 'page' : undefined} sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, p: compact ? 1 : 1.25, borderRadius: '18px', textDecoration: 'none', color: 'text.primary',
        border: '1px solid', borderColor: isHere ? 'primary.main' : 'divider', bgcolor: isHere ? 'primary.light' : 'background.paper',
        transition: 'border-color .2s ease, transform .2s ease, box-shadow .2s ease',
        '&:hover': { borderColor: 'primary.main', ...(isHere ? {} : { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(90,36,72,.10)' }) },
        '&:hover .site-go': isHere ? undefined : { bgcolor: 'primary.dark' },
      }}>
        <Box component="img" src={image} alt="" width={thumb} height={thumb} sx={{ width: thumb, height: thumb, flexShrink: 0, borderRadius: '14px', objectFit: 'cover' }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isHere && <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'primary.main', lineHeight: 1.4 }}>You’re here</Typography>}
          <Typography sx={{ fontFamily: fonts.playful, fontSize: compact ? 16 : 17, lineHeight: 1.2 }}>{name}</Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.4, mt: .25 }}>{line}</Typography>
        </Box>
        <Box className="site-go" aria-hidden sx={{
          width: 34, height: 34, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', '& svg': { fontSize: 18 }, transition: 'background-color .2s ease',
          bgcolor: isHere ? 'common.white' : 'primary.main', color: isHere ? 'primary.main' : 'primary.contrastText', border: isHere ? '1px solid' : 0, borderColor: 'primary.main',
        }}>{isHere ? <CheckRounded /> : <East />}</Box>
      </Box>;
    })}
  </Stack>;
}

/**
 * The header logo goes home. The little royal-pink badge on its corner opens
 * the panel of the three websites; its tap area is bigger than it looks, for thumbs.
 */
export function HomeLogo({ size }: { size: MarkSize }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // The "Switch website" hint is for mouse users only: on a phone a tap fires
  // hover too, and the hint would pop up over the logo and stay there.
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  return <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <Box component="a" href="/" onClick={linkClick('/')} aria-label={`${here.name} home`} sx={{
      display: 'inline-flex', lineHeight: 0, borderRadius: '16px', transition: 'transform .25s ease', '&:hover': { transform: 'translateY(-1px) scale(1.02)' },
    }}>
      <ClubMarkArt size={size} />
    </Box>
    <Tooltip title={canHover ? 'Switch website' : ''} placement="bottom" disableInteractive disableFocusListener disableTouchListener disableHoverListener={!!anchor}>
      <Box component="button" type="button" onClick={(e) => setAnchor(e.currentTarget)} aria-haspopup="dialog" aria-expanded={!!anchor} aria-label={`Switch website: you’re on ${here.name}`} sx={{
        position: 'absolute', top: { xs: -2, md: 2 }, right: { xs: -10, md: -12 }, width: { xs: 22, md: 26 }, height: { xs: 22, md: 26 }, p: 0, borderRadius: '50%', cursor: 'pointer',
        display: 'grid', placeItems: 'center', bgcolor: anchor ? 'primary.dark' : 'primary.main', color: 'primary.contrastText', border: '2px solid #fffdf9', boxShadow: '0 3px 8px rgba(90,36,72,.22)',
        transition: 'transform .2s ease, background-color .2s ease', '&:hover': { transform: 'scale(1.12)', bgcolor: 'primary.dark' }, '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: '2px' }, '& svg': { fontSize: { xs: 14, md: 16 } },
        '&::before': { content: '""', position: 'absolute', inset: -10, borderRadius: '50%' },
      }}><SwapHorizRounded /></Box>
    </Tooltip>
    <Popover open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{ paper: { sx: { mt: 1, borderRadius: '24px', boxShadow: '0 22px 50px rgba(90,36,72,.18)', width: 380, maxWidth: 'calc(100vw - 32px)' } } }}>
      <Box sx={{ p: 1.5 }}>
        <Typography variant="overline" sx={{ display: 'block', px: .5, mb: 1, color: 'text.secondary' }}>The Hula Hula family</Typography>
        <SiteList onHere={() => setAnchor(null)} />
      </Box>
    </Popover>
  </Box>;
}
