import East from '@mui/icons-material/East';
import LocalCafeRounded from '@mui/icons-material/LocalCafeRounded';
import PoolRounded from '@mui/icons-material/PoolRounded';
import { Box, Typography, type SvgIconProps } from '@mui/material';
import type { ThingIconKey, ThingToDo } from '../../activities/things';
import { ActivityIcon } from '../../booking/activityIcons';
import { linkClick } from '../../router';
import { fonts } from '../../theme';
import { ClubPhoto } from '../common/ClubPhoto';
import { SunDoodle } from '../common/VacationDecor';

export function ThingIcon({ icon, ...props }: { icon: ThingIconKey } & SvgIconProps) {
  if (icon === 'cafe') return <LocalCafeRounded {...props} />;
  if (icon === 'villa') return <PoolRounded {...props} />;
  return <ActivityIcon icon={icon} {...props} />;
}

// One thing to do, as a card that opens its page: a photo (or, until it has
// one, its icon on a sunny tile), the name and line, and what it costs.
export function ThingCard({ thing, sizes = '(max-width: 900px) 46vw, 22vw' }: { thing: ThingToDo; sizes?: string }) {
  return <Box component="a" href={thing.href} onClick={linkClick(thing.href)} sx={{
    display: 'flex', flexDirection: 'column', height: '100%', borderRadius: { xs: '18px', md: '24px' }, overflow: 'hidden', textDecoration: 'none',
    bgcolor: 'background.paper', color: 'text.primary', boxShadow: '0 12px 30px rgba(10,40,30,.16)', transition: 'transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease',
    '&:hover, &:focus-visible': { transform: 'translateY(-5px)', boxShadow: '0 22px 44px rgba(10,40,30,.24)' },
    '&:hover .thing-photo img': { transform: 'scale(1.05)' }, '&:hover .thing-go': { bgcolor: 'secondary.main', color: 'text.primary' },
  }}>
    <Box className="thing-photo" sx={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', bgcolor: 'success.light', '& img': { transition: 'transform .6s ease' } }}>
      {thing.image
        ? <ClubPhoto image={thing.image} alt="" sizes={sizes} />
        : <Box aria-hidden sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at 30% 25%, #f9fbc5, #e7f4cc 60%)', color: 'success.dark' }}>
          <SunDoodle size={120} color="#f9f70c" sx={{ position: 'absolute', right: -18, top: -22, opacity: .9 }} />
          <ThingIcon icon={thing.icon} sx={{ fontSize: { xs: 56, md: 76 } }} />
        </Box>}
      <Box sx={{ position: 'absolute', left: 10, bottom: 10, px: 1.1, py: .35, borderRadius: 999, bgcolor: 'rgba(255,254,248,.94)', fontSize: { xs: 11.5, md: 12.5 }, fontWeight: 700, color: 'primary.dark', boxShadow: '0 2px 8px rgba(23,60,44,.12)' }}>{thing.note}</Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1, p: { xs: 1.5, md: 2.25 } }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography component="h3" sx={{ fontFamily: fonts.playful, fontSize: { xs: 18, md: 23 }, lineHeight: 1.15 }}>{thing.name}</Typography>
        <Typography sx={{ fontSize: { xs: 12.5, md: 14 }, color: 'text.secondary', lineHeight: 1.45, mt: .5 }}>{thing.tagline}</Typography>
      </Box>
      <Box className="thing-go" aria-hidden sx={{ display: { xs: 'none', sm: 'grid' }, placeItems: 'center', width: 36, height: 36, flexShrink: 0, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.main', transition: 'background-color .2s ease, color .2s ease', '& svg': { fontSize: 18 } }}><East /></Box>
    </Box>
  </Box>;
}
