import ThermostatOutlined from '@mui/icons-material/ThermostatOutlined';
import { useKrabiClock } from '../../hooks/useKrabiClock';
import { useKrabiWeather } from '../../hooks/useKrabiWeather';

const dateFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false });

// Keep the ticking clock in this leaf, so it never restarts the hero animation.
export function KrabiNow() {
  const now = useKrabiClock();
  const temperature = useKrabiWeather();
  return <div className="krabi-now" aria-label="The date, local time and current temperature in Krabi">
    <span className="krabi-now-place"><span aria-hidden="true" />Right now in Krabi, Thailand</span>
    <div className="krabi-now-details">
      <time dateTime={now.toISOString()}>{dateFormat.format(now)}<span aria-hidden="true"> · </span>{timeFormat.format(now)} ICT</time>
      <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" title={temperature === null ? 'Live temperature is currently unavailable' : 'Current temperature in Krabi, provided by Open-Meteo'} aria-label={temperature === null ? 'Live Krabi temperature is currently unavailable' : `${Math.round(temperature)} degrees Celsius in Krabi. Weather by Open-Meteo.`}><ThermostatOutlined aria-hidden="true" />{temperature === null ? '—°C' : `${Math.round(temperature)}°C`}</a>
    </div>
  </div>;
}
