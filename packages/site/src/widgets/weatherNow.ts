import { defineWidget, effect, resource, tags, untracked } from 'ecmact';
import { api, describeError } from '@site/widgets/api';
import { widgetCss } from '@site/widgets/kit';

const { button, div, p, small, span } = tags;

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

/** A place found by the geocoding API. */
interface Place {
  /** The name of the place. */
  name: string;
  /** The latitude. */
  latitude: number;
  /** The longitude. */
  longitude: number;
}

/** The answer of the geocoding API. */
interface Geocoding {
  /** The places found. */
  results?: Place[];
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
    content: ''; position: absolute; inset-inline-end: -2.5rem; top: -2.5rem; width: 9rem; height: 9rem; border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.5), transparent 70%);
  }
  .place { margin: 0; font-size: 1rem; font-weight: 600; letter-spacing: 0.03em; opacity: 0.95; }
  .temp { margin: 0.6rem 0 0; font-size: 4rem; font-weight: 200; line-height: 1; letter-spacing: -0.04em; }
  .temp small { font-size: 1.4rem; font-weight: 400; vertical-align: top; }
  .glyph { position: absolute; inset-inline-end: 1.2rem; top: 1.2rem; font-size: 2.8rem; line-height: 1; }
  .meta { display: flex; gap: 1rem; margin-top: 1.1rem; font-size: 0.9rem; color: var(--w-muted, inherit); opacity: 0.92; }
  .state { margin: 2rem 0 0; font-size: 0.95rem; }
  button {
    margin-top: 0.8rem; padding: 0.45rem 1rem; border: 1px solid var(--w-border, rgba(255, 255, 255, 0.7)); border-radius: 999px;
    background: color-mix(in srgb, var(--w-accent, #fff) 18%, transparent); color: inherit; font: inherit; cursor: pointer;
  }
  button:hover { background: color-mix(in srgb, var(--w-accent, #fff) 32%, transparent); }
  button:focus-visible { outline: 2px solid var(--w-accent, #fff); outline-offset: 2px; }
  .sky[data-busy] { opacity: 0.7; }
  .pulse { animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity: 0.45; } }
`;

const conditions: [number[], string, string, string][] = [
  [[0], 'Clear sky', '☀', 'clear'],
  [[1, 2], 'Partly cloudy', '⛅', 'clear'],
  [[3], 'Overcast', '☁', 'cloud'],
  [[45, 48], 'Fog', '≋', 'cloud'],
  [[51, 53, 55], 'Drizzle', '☂', 'rain'],
  [[56, 57, 66, 67], 'Freezing rain', '☂', 'rain'],
  [[61, 63, 65, 80, 81, 82], 'Rain', '☂', 'rain'],
  [[71, 73, 75, 77, 85, 86], 'Snow', '❄', 'snow'],
  [[95, 96, 99], 'Thunderstorm', '⚡', 'storm'],
];

/** The glyphs that show the sun and have a night counterpart. */
const nightGlyphs: Record<string, string> = { '☀': '☾', '⛅': '☁' };

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
    glyph: day ? glyph : (nightGlyphs[glyph] ?? glyph),
    sky: sky === 'clear' && !day ? 'night' : sky,
  };
};

const places = new Map<string, Promise<Place>>();

/**
 * Finds the coordinates of a city. The answer for a name never changes, so each name is asked once per page, however
 * many widgets, reloads and retries need it; a failed lookup is forgotten so that it can be tried again.
 *
 * @param name - The name of the city.
 * @returns The place.
 * @throws {Error} If no place has that name.
 */
const locate = (name: string) => {
  const key = name.trim().toLowerCase();
  let found = places.get(key);
  if (!found) {
    found = api
      .get<Geocoding>('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name, count: 1 },
      })
      .data.then(({ results }) => {
        const place = results?.[0];
        if (!place) throw new Error(`No place called "${name}".`);
        return place;
      });
    places.set(key, found);
    found.catch(() => places.delete(key));
  }
  return found;
};

/**
 * Registers `<weather-now>`: the current weather of a city, from the open-meteo.com API.
 * Attributes: `city` (default `Prague`), `unit` (`c` or `f`, default `c`).
 * Event: `loaded` with `{ place, temperature, unit }`.
 * Custom properties: `--w-accent` (buttons), `--w-bg` (any CSS background), `--w-fg`, `--w-muted` (the details line),
 * `--w-border` (buttons), `--w-radius`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const defineWeatherNow = () =>
  defineWidget(
    'weather-now',
    ({ props, emit }) => {
      /**
       * Reads the city to show: the attribute, or Prague when it is empty.
       *
       * @returns The name.
       */
      const city = () => props.city || 'Prague';
      const weather = resource<Weather>(async ({ signal }) => {
        const place = await locate(city());
        const { current } = await api.get<Forecast>('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: place.latitude,
            longitude: place.longitude,
            current: 'temperature_2m,weather_code,wind_speed_10m,is_day',
            timezone: 'auto',
          },
          signal,
        }).data;
        return {
          place: place.name,
          temperature: current.temperature_2m,
          code: current.weather_code,
          wind: current.wind_speed_10m,
          day: current.is_day === 1,
        };
      });
      /**
       * Tells which unit the attribute asks for.
       *
       * @returns `true` for Fahrenheit.
       */
      const fahrenheit = () => props.unit.toLowerCase() === 'f';
      /**
       * Reads the weather to show: not the old one beside the message that a newer request failed.
       *
       * @returns The weather, or `undefined`.
       */
      const shown = () => (weather.error === undefined ? weather.data : undefined);
      /**
       * Describes the weather that is shown.
       *
       * @returns The text, the glyph and the sky, or `undefined` while there is no weather.
       */
      const look = () => {
        const data = shown();
        return data && describeWeather(data.code, data.day);
      };
      /**
       * Writes a temperature in the unit of the widget.
       *
       * @param celsius - The temperature in degrees Celsius.
       * @returns The whole degrees.
       */
      const degrees = (celsius: number) =>
        Math.round(fahrenheit() ? (celsius * 9) / 5 + 32 : celsius);

      effect(() => {
        const data = weather.data;
        if (!data) return;
        untracked(() =>
          emit('loaded', {
            place: data.place,
            temperature: degrees(data.temperature),
            unit: fahrenheit() ? 'f' : 'c',
          }),
        );
      });

      return div(
        {
          class: 'sky',
          'aria-live': 'polite',
          /**
           * Picks the sky to paint.
           *
           * @returns The name of the sky.
           */
          'data-sky': () => look()?.sky ?? 'clear',
          /**
           * Marks the weather that a newer request is about to replace.
           *
           * @returns `true` while such a request runs.
           */
          'data-busy': () => weather.loading && !!shown(),
        },
        p({ class: 'place' }, () => shown()?.place ?? city()),
        span({ class: 'glyph', 'aria-hidden': 'true' }, () => look()?.glyph),
        p({ class: 'temp' }, () => {
          const data = shown();
          return data && [degrees(data.temperature), small(fahrenheit() ? '°F' : '°C')];
        }),
        div(
          { class: 'meta' },
          span(() => look()?.text),
          span(() => {
            const data = shown();
            return data && `Wind ${Math.round(data.wind)} km/h`;
          }),
        ),
        () => weather.loading && !shown() && p({ class: 'state pulse' }, 'Loading the weather...'),
        () =>
          weather.error !== undefined &&
          div(
            { class: 'error' },
            p({ class: 'state' }, describeError(weather.error)),
            button({ type: 'button', onclick: weather.refetch }, 'Try again'),
          ),
      );
    },
    { attributes: { city: 'Prague', unit: 'c' }, css: widgetCss(css) },
  );
