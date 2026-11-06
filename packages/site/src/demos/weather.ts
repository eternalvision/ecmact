import { computed, createHttp, em, resource, signal, tags } from 'ecmact';

const css = `
  :host, div { display: block; }
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
 * The weather from the open-meteo.com API. The city is a signal the request reads, so changing it starts a new
 * request and aborts the old one; the unit only changes how the same number is shown.
 *
 * @returns The demo.
 */
export const create = () => {
  const city = signal<keyof typeof cities>('Prague');
  const fahrenheit = signal(false);
  const api = createHttp({ baseURL: 'https://api.open-meteo.com', timeout: 8000, retry: 1 });

  const weather = resource(({ signal: aborted }) => {
    const [latitude, longitude] = cities[city.value];
    return api
      .get<Forecast>('/v1/forecast', {
        params: { latitude, longitude, current: 'temperature_2m,wind_speed_10m,weather_code' },
        signal: aborted,
      })
      .then((response) => response.data.current);
  });

  const temperature = computed(() => {
    const value = weather.data.value?.temperature_2m;
    if (value === undefined) return '...';
    return `${Math.round(fahrenheit.value ? (value * 9) / 5 + 32 : value)}°${fahrenheit.value ? 'F' : 'C'}`;
  });

  return em.Weather({
    shadow: true,
    css,
    children: [
      tags.div({
        shadow: false,
        class: 'bar',
        children: [
          tags.select({
            shadow: false,
            'aria-label': 'City',
            html: Object.keys(cities)
              .map((name) => `<option>${name}</option>`)
              .join(''),
            onchange: (event) =>
              (city.value = (event.target as HTMLSelectElement).value as keyof typeof cities),
          }),
          tags.button({
            shadow: false,
            type: 'button',
            content: computed(() => (fahrenheit.value ? 'Show °C' : 'Show °F')),
            onclick: () => (fahrenheit.value = !fahrenheit.value),
          }),
        ],
      }),
      tags.div({
        shadow: false,
        class: 'now',
        children: [
          tags.strong({ shadow: false, content: temperature }),
          tags.p({
            shadow: false,
            content: computed(() => {
              const now = weather.data.value;
              return now
                ? `${describe(now.weather_code)}, wind ${Math.round(now.wind_speed_10m)} km/h`
                : '';
            }),
          }),
          tags.p({
            shadow: false,
            class: 'error',
            content: 'Could not load the weather.',
            hidden: computed(() => weather.error.value === undefined),
          }),
        ],
      }),
    ],
  });
};
