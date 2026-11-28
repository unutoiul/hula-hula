import ThermostatOutlined from '@mui/icons-material/ThermostatOutlined';
import { Box } from '@mui/material';
import { useKrabiClock } from '../../hooks/useKrabiClock';
import { useKrabiWeather } from '../../hooks/useKrabiWeather';
import { brand } from '../../theme';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Bangkok',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const timeFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false });

// Keep the ticking clock in this leaf, so it never restarts the hero animation.
export function KrabiNow() {
  const now = useKrabiClock();
  const temperature = useKrabiWeather();
  return (
    <Box aria-label="The date, local time and current temperature in Krabi" sx={{ mt: { xs: '20px', sm: '24px' }, color: '#816173' }}>
      <Box
        component="span"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          fontSize: 10,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          '& > span': { display: 'inline-block', width: 5, height: 5, bgcolor: brand.royal, borderRadius: '50%' },
        }}
      >
        <span aria-hidden="true" />
        Right now in Krabi, Thailand
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          mt: '3px',
          fontSize: 12,
          fontVariantNumeric: 'tabular-nums',
          '& time': { whiteSpace: 'nowrap' },
          '& a': {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            borderLeft: '1px solid #e2c2d0',
            py: '4px',
            pr: 0,
            pl: { xs: '10px', sm: '12px' },
            color: '#a62b5d',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
            '& > svg': { fontSize: 16 },
          },
        }}
      >
        <time dateTime={now.toISOString()}>
          {dateFormat.format(now)}
          <span aria-hidden="true"> · </span>
          {timeFormat.format(now)} ICT
        </time>
        {temperature !== null && (
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Current temperature in Krabi, provided by Open-Meteo"
            aria-label={`${Math.round(temperature)} degrees Celsius in Krabi. Weather by Open-Meteo.`}
          >
            <ThermostatOutlined aria-hidden="true" />
            {`${Math.round(temperature)}°C`}
          </a>
        )}
      </Box>
    </Box>
  );
}
