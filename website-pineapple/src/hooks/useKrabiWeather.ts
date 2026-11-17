import { useEffect, useState } from 'react';

// Krabi Town, by the river — where the hotel is.
const KRABI_COORDS = { latitude: 8.086, longitude: 98.906 };

export function useKrabiWeather(): number | null {
  const [temperature, setTemperature] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let request: AbortController | null = null;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const fetchWeather = () => {
      request?.abort();
      if (timeout) clearTimeout(timeout);
      const controller = new AbortController();
      request = controller;
      const requestTimeout = setTimeout(() => controller.abort(), 8000);
      timeout = requestTimeout;
      const params = new URLSearchParams({
        latitude: String(KRABI_COORDS.latitude),
        longitude: String(KRABI_COORDS.longitude),
        current: 'temperature_2m',
        timezone: 'Asia/Bangkok',
      });
      fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error('Weather unavailable');
          return res.json();
        })
        .then((data) => {
          const value = data?.current?.temperature_2m;
          if (!cancelled) setTemperature(typeof value === 'number' && Number.isFinite(value) ? value : null);
        })
        .catch(() => { if (!cancelled) setTemperature(null); })
        .finally(() => { clearTimeout(requestTimeout); if (timeout === requestTimeout) timeout = undefined; });
    };
    fetchWeather();
    const id = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); if (timeout) clearTimeout(timeout); request?.abort(); };
  }, []);

  return temperature;
}
