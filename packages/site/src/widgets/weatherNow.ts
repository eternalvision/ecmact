import { computed, defineWidget, effect, resource } from 'ecmact';
import { tag } from '@site/lib/component';
import { api, describeError } from '@site/widgets/api';
import { part, sheet } from '@site/widgets/kit';

/** The current weather of a place. */
interface Weather {
  /** The name of the place. */
  place: string;
  /** The temperature in degrees Celsius. */
  temperature: number;
  /** The WMO weather code. */
  code: number;
  /** The wind speed in km/h. */
  wind: number;
  /** Whether it is day there now. */
  day: boolean;
}

/** The answer of the geocoding API. */
interface Geocoding {
  /** The places found. */
  results?: { name: string; latitude: number; longitude: number }[];
}

/** The answer of the forecast API. */
interface Forecast {
  /** The weather now. */
  current: { temperature_2m: number; weather_code: number; wind_speed_10m: number; is_day: number };
}

const css = `
  :host {
    display: block;
    max-width: 22rem;
    font-family: var(--w-font, 'Avenir Next', 'Segoe UI', system-ui, sans-serif);
  }
  .sky {
    position: relative;
    overflow: hidden;
    min-height: 13rem;
    padding: 1.3rem 1.4rem;
    border-radius: var(--w-radius, 28px);
    color: var(--w-fg, #fff);
    background: var(--w-bg, linear-gradient(170deg, #4f9cff, #7bc4ff));
    box-shadow: 0 1rem 2.4rem rgba(40, 90, 160, 0.3);
    transition: background 0.4s;
  }
  .sky[data-sky='night'] { background: var(--w-bg, linear-gradient(170deg, #121a3d, #2b2f6b)); }
  .sky[data-sky='cloud'] { background: var(--w-bg, linear-gradient(170deg, #7b8da3, #a9b7c6)); }
  .sky[data-sky='rain'] { background: var(--w-bg, linear-gradient(170deg, #3d4b63, #5e7490)); }
  .sky[data-sky='snow'] { background: var(--w-bg, linear-gradient(170deg, #90a9c4, #cfdceb)); }
  .sky[data-sky='storm'] { background: var(--w-bg, linear-gradient(170deg, #2a2540, #4a3f6b)); }
  .sky::after {
    content: ''; position: absolute; right: -2.5rem; top: -2.5rem; width: 9rem; height: 9rem; border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.5), transparent 70%);
  }
  .place { margin: 0; font-size: 1rem; font-weight: 600; letter-spacing: 0.03em; opacity: 0.95; }
  .temp { margin: 0.6rem 0 0; font-size: 4rem; font-weight: 200; line-height: 1; letter-spacing: -0.04em; }
  .temp small { font-size: 1.4rem; font-weight: 400; vertical-align: top; }
  .glyph { position: absolute; right: 1.2rem; top: 1.2rem; font-size: 2.8rem; line-height: 1; }
  .meta { display: flex; gap: 1rem; margin-top: 1.1rem; font-size: 0.9rem; opacity: 0.92; }
  .state { margin: 2rem 0 0; font-size: 0.95rem; }
  button {
    margin-top: 0.8rem; padding: 0.45rem 1rem; border: 1px solid rgba(255, 255, 255, 0.7); border-radius: 999px;
    background: rgba(255, 255, 255, 0.18); color: inherit; font: inherit; cursor: pointer;
  }
  button:hover { background: rgba(255, 255, 255, 0.32); }
  .pulse { animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity: 0.45; } }
`;

const conditions: [number[], string, string, string][] = [
  [[0], 'Clear sky', '☀', 'clear'],
  [[1, 2], 'Partly cloudy', '⛅', 'clear'],
  [[3], 'Overcast', '☁', 'cloud'],
  [[45, 48], 'Fog', '≋', 'cloud'],
  [[51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], 'Rain', '☂', 'rain'],
  [[71, 73, 75, 77, 85, 86], 'Snow', '❄', 'snow'],
  [[95, 96, 99], 'Thunderstorm', '⚡', 'storm'],
];

/**
 * Describes a WMO weather code.
 *
 * @param code - The code.
 * @param day - Whether it is day.
 * @returns The text, a glyph and the sky to paint.
 */
export const describeWeather = (code: number, day: boolean) => {
  const found = conditions.find(([codes]) => codes.includes(code));
  const [, text, glyph, sky] = found ?? [[], 'Unknown', '?', 'cloud'];
  return {
    text,
    glyph: day || glyph !== '☀' ? glyph : '☾',
    sky: sky === 'clear' && !day ? 'night' : sky,
  };
};

/**
 * Registers `<weather-now>`: the current weather of a city, from the open-meteo.com API.
 * Attributes: `city` (default `Prague`), `unit` (`c` or `f`, default `c`).
 * Event: `loaded` with `{ place, temperature, unit }`.
 * Custom properties: `--w-fg`, `--w-bg` (any CSS background), `--w-radius`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const defineWeatherNow = () =>
  defineWidget(
    'weather-now',
    ({ props, emit }) => {
      const weather = resource<Weather>(async ({ signal }) => {
        const city = props.city.value ?? 'Prague';
        const found = await api.get<Geocoding>('https://geocoding-api.open-meteo.com/v1/search', {
          params: { name: city, count: 1 },
          signal,
        });
        const place = found.data.results?.[0];
        if (!place) throw new Error(`No place called "${city}".`);
        const forecast = await api.get<Forecast>('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: place.latitude,
            longitude: place.longitude,
            current: 'temperature_2m,weather_code,wind_speed_10m,is_day',
            timezone: 'auto',
          },
          signal,
        });
        const { current } = forecast.data;
        return {
          place: place.name,
          temperature: current.temperature_2m,
          code: current.weather_code,
          wind: current.wind_speed_10m,
          day: current.is_day === 1,
        };
      });

      const fahrenheit = computed(() => (props.unit.value ?? 'c').toLowerCase() === 'f');
      const view = computed(() => {
        const data = weather.data.value;
        return data ? describeWeather(data.code, data.day) : undefined;
      });
      const temperature = computed(() => {
        const data = weather.data.value;
        if (!data) return '';
        return String(
          Math.round(fahrenheit.value ? (data.temperature * 9) / 5 + 32 : data.temperature),
        );
      });
      const failure = computed(() => {
        const error = weather.error.value;
        return error instanceof Error && !('isHttpError' in error)
          ? error.message
          : describeError(error);
      });

      const root = tag('div', {
        class: 'sky',
        'data-sky': computed(() => view.value?.sky ?? 'clear'),
        'aria-live': 'polite',
        mounted: () =>
          effect(() => {
            const data = weather.data.value;
            if (data) {
              emit('loaded', {
                place: data.place,
                temperature: Number(temperature.value),
                unit: fahrenheit.value ? 'f' : 'c',
              });
            }
          }),
        children: [
          tag('p', {
            class: 'place',
            content: computed(() => weather.data.value?.place ?? props.city.value ?? 'Prague'),
          }),
          tag('span', {
            class: 'glyph',
            content: computed(() => view.value?.glyph ?? ''),
            'aria-hidden': 'true',
          }),
          part(
            'p',
            'temp',
            tag('span', { content: temperature }),
            tag('small', {
              content: computed(() => (weather.data.value ? (fahrenheit.value ? '°F' : '°C') : '')),
            }),
          ),
          part(
            'div',
            'meta',
            tag('span', { content: computed(() => view.value?.text ?? '') }),
            tag('span', {
              content: computed(() =>
                weather.data.value ? `Wind ${Math.round(weather.data.value.wind)} km/h` : '',
              ),
            }),
          ),
          tag('p', {
            class: 'state pulse',
            content: 'Loading the weather...',
            hidden: computed(() => !weather.loading.value || !!weather.data.value),
          }),
          tag('div', {
            class: 'error',
            hidden: computed(() => weather.error.value === undefined),
            children: [
              tag('p', { class: 'state', content: failure }),
              tag('button', {
                type: 'button',
                content: 'Try again',
                onclick: () => weather.refetch(),
              }),
            ],
          }),
        ],
      });
      return sheet(css, root);
    },
    { attributes: ['city', 'unit'] },
  );
