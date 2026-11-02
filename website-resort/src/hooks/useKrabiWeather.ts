import { useEffect, useState } from 'react';

// Railay / Ao Nang coast — matches the "08°05' N" coordinate already in the copy.
const KRABI_COORDS = { latitude: 8.05, longitude: 98.92 };

export function useKrabiWeather(): number | null {
  const [temperature, setTemperature] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchWeather = () => {
      const params = new URLSearchParams({
        latitude: String(KRABI_COORDS.latitude),
        longitude: String(KRABI_COORDS.longitude),
        current: 'temperature_2m',
        timezone: 'Asia/Bangkok',
      });
      fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled && typeof data?.current?.temperature_2m === 'number') setTemperature(data.current.temperature_2m);
        })
        .catch(() => {}); // live weather is a nice-to-have — fail silently, keep the clock running
    };
    fetchWeather();
    const id = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return temperature;
}
