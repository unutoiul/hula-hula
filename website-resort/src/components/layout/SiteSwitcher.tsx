import BeachAccessRounded from '@mui/icons-material/BeachAccessRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import East from '@mui/icons-material/East';
import GolfCourseRounded from '@mui/icons-material/GolfCourseRounded';
import SwapHorizRounded from '@mui/icons-material/SwapHorizRounded';
import { Box, Popover, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { fonts } from '../../theme';
import { ClubMarkArt, type MarkSize } from '../common/ClubMark';

// The Hula Hula family: the resort and the golf club are two websites that
// hand guests to each other. Three ways across: the "Resort | Golf Club" tabs
// in the top strip (large screens), the yellow badge on the header logo, and
// the mobile menu. The logo itself goes home. The golf club's copy of this file is
// website-golf/src/components/layout/SiteSwitcher.tsx — keep the two in step.
// The golf club lives on its Vercel address until it has its own domain.

export const SITES = [
  { id: 'resort', name: 'Hula Hula Resort', short: 'Resort', line: 'Tropical stays & pool villas in Ao Nang', url: 'https://hulahularesort.com', image: '/images/switcher/resort.webp', Icon: BeachAccessRounded },
  { id: 'golf', name: 'Hula Hula Golf Club', short: 'Golf Club', line: '9 holes, FootGolf & range bays by the airport', url: 'https://hulahula-golf.vercel.app', image: '/images/switcher/golf.webp', Icon: GolfCourseRounded },
] as const;

const HERE = 'resort';
const here = SITES.find((s) => s.id === HERE)!;

/** The two-way tab in the blue strip at the very top (large screens). */
export function SiteTabs() {
  return <Stack component="nav" aria-label="Hula Hula websites" direction="row" sx={{ p: '3px', gap: '2px', borderRadius: 999, bgcolor: 'rgba(255,255,255,.14)' }}>
    {SITES.map(({ id, short, url, Icon }) => {
      const here = id === HERE;
      return <Box key={id} component="a" href={here ? '#top' : url} aria-current={here ? 'page' : undefined} sx={{
        display: 'inline-flex', alignItems: 'center', gap: .6, height: 26, px: 1.4, borderRadius: 999, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
        textDecoration: 'none', color: here ? 'primary.main' : 'common.white', bgcolor: here ? 'common.white' : 'transparent',
        transition: 'background-color .2s ease', '&:hover': here ? undefined : { bgcolor: 'rgba(255,255,255,.22)' }, '& svg': { fontSize: 15 },
      }}><Icon />{short}</Box>;
    })}
  </Stack>;
}

/** Both places as cards, the current one marked — in the logo badge's panel and the mobile menu. */
export function SiteList({ onHere }: { onHere?: () => void }) {
  return <Stack spacing={1}>
    {SITES.map(({ id, name, line, url, image }) => {
      const here = id === HERE;
      return <Box key={id} component="a" href={here ? '#top' : url} onClick={here ? onHere : undefined} aria-current={here ? 'page' : undefined} sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: '18px', textDecoration: 'none', color: 'text.primary',
        border: '1px solid', borderColor: here ? 'primary.main' : 'divider', bgcolor: here ? 'primary.light' : 'background.paper',
        transition: 'border-color .2s ease, transform .2s ease, box-shadow .2s ease',
        '&:hover': { borderColor: 'primary.main', ...(here ? {} : { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(23,60,44,.10)' }) },
      }}>
        <Box component="img" src={image} alt="" width={56} height={56} sx={{ width: 56, height: 56, flexShrink: 0, borderRadius: '14px', objectFit: 'cover' }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {here && <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'primary.main', lineHeight: 1.4 }}>You’re here</Typography>}
          <Typography sx={{ fontFamily: fonts.playful, fontSize: 17, lineHeight: 1.2 }}>{name}</Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.4, mt: .25 }}>{line}</Typography>
        </Box>
        <Box aria-hidden sx={{
          width: 34, height: 34, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', '& svg': { fontSize: 18 },
          bgcolor: here ? 'common.white' : 'primary.main', color: here ? 'primary.main' : 'primary.contrastText', border: here ? '1px solid' : 0, borderColor: 'primary.main',
        }}>{here ? <CheckRounded /> : <East />}</Box>
      </Box>;
    })}
  </Stack>;
}

/**
 * The header logo goes home. The little yellow badge on its corner opens the
 * panel of both websites; its tap area is bigger than it looks, for thumbs.
 */
export function HomeLogo({ size }: { size: MarkSize }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <Box component="a" href="#top" aria-label={`${here.name} home`} sx={{
      display: 'inline-flex', lineHeight: 0, borderRadius: '16px', transition: 'transform .25s ease', '&:hover': { transform: 'translateY(-1px) scale(1.02)' },
    }}>
      <ClubMarkArt size={size} />
    </Box>
    <Tooltip title="Switch website" placement="bottom" disableHoverListener={!!anchor}>
      <Box component="button" type="button" onClick={(e) => setAnchor(e.currentTarget)} aria-haspopup="dialog" aria-expanded={!!anchor} aria-label={`Switch website: you’re on ${here.name}`} sx={{
        position: 'absolute', top: { xs: -2, md: 2 }, right: { xs: -10, md: -12 }, width: { xs: 22, md: 26 }, height: { xs: 22, md: 26 }, p: 0, borderRadius: '50%', cursor: 'pointer',
        display: 'grid', placeItems: 'center', bgcolor: 'secondary.main', color: 'text.primary', border: '2px solid #fffef8', boxShadow: '0 3px 8px rgba(23,60,44,.18)',
        transition: 'transform .2s ease', '&:hover': { transform: 'scale(1.12)' }, '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: '2px' }, '& svg': { fontSize: { xs: 14, md: 16 } },
        '&::before': { content: '""', position: 'absolute', inset: -10, borderRadius: '50%' },
      }}><SwapHorizRounded /></Box>
    </Tooltip>
    <Popover open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{ paper: { sx: { mt: 1, borderRadius: '24px', boxShadow: '0 22px 50px rgba(23,60,44,.18)', width: 380, maxWidth: 'calc(100vw - 32px)' } } }}>
      <Box sx={{ p: 1.5 }}>
        <Typography variant="overline" sx={{ display: 'block', px: .5, mb: 1, color: 'text.secondary' }}>The Hula Hula family</Typography>
        <SiteList onHere={() => setAnchor(null)} />
      </Box>
    </Popover>
  </Box>;
}
