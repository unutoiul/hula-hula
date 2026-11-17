import { Stack, Typography } from '@mui/material';
import { useKrabiClock } from '../../hooks/useKrabiClock';
import { useKrabiWeather } from '../../hooks/useKrabiWeather';
import { LiveDot } from '../common/LiveDot';

const krabiTimeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false });
const krabiDateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', weekday: 'short', day: '2-digit', month: 'short' });

// The live line over the hero photo: where we are, the weather and the time
// in Krabi right now. The clock/weather hooks live here, not in Hero — the
// clock re-renders every second, and owning it in this leaf means a tick can
// only ever move this row, never the headline or the booking bar.
export function HeroMetaCompact({ light = false }: { light?: boolean }) {
  const now = useKrabiClock();
  const temperature = useKrabiWeather();
  const color = light ? 'rgba(255,255,255,.92)' : 'text.secondary';

  return <Stack direction="row" flexWrap="wrap" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} rowGap={.6} columnGap={1.3} sx={{
    color, minHeight: 28, textShadow: light ? '0 1px 8px rgba(58,24,48,.45)' : undefined,
  }}>
    <Stack direction="row" alignItems="center" spacing={.9}>
      <LiveDot />
      <Typography variant="overline" sx={{ color: 'inherit', fontSize: 11 }}>Krabi Town, Thailand</Typography>
    </Stack>
    <Typography variant="overline" sx={{ color: 'inherit', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
      {temperature !== null ? `${Math.round(temperature)}°C, ` : ''}{krabiDateFmt.format(now)}, {krabiTimeFmt.format(now)}
    </Typography>
  </Stack>;
}
