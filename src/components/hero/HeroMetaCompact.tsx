import { Stack, Typography } from '@mui/material';
import { useKrabiClock } from '../../hooks/useKrabiClock';
import { useKrabiWeather } from '../../hooks/useKrabiWeather';
import { LiveDot } from '../common/LiveDot';

const krabiTimeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false });
const krabiDateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', weekday: 'short', day: '2-digit', month: 'short' });

// Sits at the top of the hero, above the headline — the vertical scrim there is darkest,
// so this stays legible no matter how bright the slide behind it is. A stronger text-shadow
// is added on top as a second line of defense.
//
// The clock/weather hooks live *here*, not in Hero — the clock re-renders every second,
// and this used to be lifted up into Hero and passed down as props, which meant that
// tick re-rendered the whole hero tree (headline, body copy, the booking search bar)
// every second. If the ticking text's width wobbled even a pixel — the wrap point
// shifting as the temperature arrived, a minute rolling over — everything below it,
// including the search bar, reflowed with it. Owning the clock in this leaf component
// means a tick can only ever move this row, never anything else in the hero.
export function HeroMetaCompact() {
  const now = useKrabiClock();
  const temperature = useKrabiWeather();

  return <Stack direction="row" flexWrap="wrap" alignItems="center" rowGap={.6} columnGap={1.3} sx={{
    textShadow: '0 1px 8px rgba(0,0,0,.55)',
    // Reserves height for the wrapped (2-line) case up front, at every breakpoint,
    // so a tick that happens to flip the wrap point never nudges the headline/search
    // bar below it — see the file comment above for why that matters here specifically.
    minHeight: 44,
  }}>
    <Stack direction="row" alignItems="center" spacing={.9}>
      <LiveDot />
      <Typography variant="overline" sx={{ color: 'inherit' }}>KRABI, THAILAND&nbsp;&nbsp;—&nbsp;&nbsp;08°05' N</Typography>
    </Stack>
    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,.78)', fontVariantNumeric: 'tabular-nums' }}>
      {temperature !== null ? `${Math.round(temperature)}°C · ` : ''}{krabiDateFmt.format(now)} · {krabiTimeFmt.format(now)} ICT
    </Typography>
  </Stack>;
}
