import { createHttp, em, signal, tags } from 'ecmact';

const { button, div, option, p, select, strong } = tags;

const css = `
  :host { display: block; }
  .bar { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.9rem; }
  select, button {
    padding: 0.45rem 0.8rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    cursor: pointer;
  }
  .now { min-height: 5rem; }
  strong { font-size: 2.4rem; font-weight: 300; }
  p { margin: 0.2rem 0; color: var(--muted); }
  .error { color: var(--danger); }
`;

/** The answer of the forecast API. */
interface Forecast {
  /** The weather now. */
  current: { temperature_2m: number; wind_speed_10m: number; weather_code: number };
}

const cities = {
  Prague: [50.08, 14.44],
  Reykjavik: [64.15, -21.94],
  Lisbon: [38.72, -9.14],
  Tokyo: [35.68, 139.69],
  Nairobi: [-1.29, 36.82],
} as const;

/** A city the demo knows. */
type City = keyof typeof cities;

const describe = (code: number) =>
  code === 0
    ? 'Clear sky'
    : code < 4
      ? 'Cloudy'
      : code < 50
        ? 'Fog'
        : code < 70
          ? 'Rain'
          : code < 80
            ? 'Snow'
            : 'Showers or storm';

/**
 * The weather from the open-meteo.com API. The city is a signal that the address of the request reads, so changing
 * it starts a new request and aborts the old one; the unit only changes how the same number is shown.
 *
 * @returns The demo.
 */
export const create = () => {
  const city = signal<City>('Prague');
  const fahrenheit = signal(false);
  const api = createHttp({ baseURL: 'https://api.open-meteo.com', timeout: 8000, retry: 1 });

  const weather = api.resource<Forecast>(() => {
    const [latitude, longitude] = cities[city.value];
    return `/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code`;
  });

  return em.Weather(
    { css },
    div(
      { class: 'bar' },
      select(
        { 'aria-label': 'City', bind: city },
        Object.keys(cities).map((name) => option(name)),
      ),
      button({ type: 'button', onclick: () => (fahrenheit.value = !fahrenheit.value) }, () =>
        fahrenheit.value ? 'Show °C' : 'Show °F',
      ),
    ),
    div({ class: 'now' }, () => {
      const now = weather.data?.current;
      if (weather.error) return p({ class: 'error' }, 'Could not load the weather.');
      if (!now) return strong('...');
      const degrees = fahrenheit.value ? (now.temperature_2m * 9) / 5 + 32 : now.temperature_2m;
      return [
        strong(`${Math.round(degrees)}°${fahrenheit.value ? 'F' : 'C'}`),
        p(`${describe(now.weather_code)}, wind ${Math.round(now.wind_speed_10m)} km/h`),
      ];
    }),
  );
};
