import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineWeatherNow, describeWeather } from '@site/widgets/weatherNow';
import { mountWidget, stubFetch } from '@tests/widgets/helpers';

defineWeatherNow();

/**
 * Answers the geocoding and the forecast APIs.
 *
 * @param code - The weather code.
 * @param day - 1 for day, 0 for night.
 * @returns A function for `stubFetch`.
 */
const answer =
  (code = 0, day = 1) =>
  (url: string) =>
    url.includes('geocoding')
      ? { results: [{ name: new URL(url).searchParams.get('name'), latitude: 50, longitude: 14 }] }
      : { current: { temperature_2m: 20.4, weather_code: code, wind_speed_10m: 7.6, is_day: day } };

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

/**
 * Counts the requests whose address contains a text.
 *
 * @param mock - The fetch mock.
 * @param part - The text.
 * @returns The number of requests.
 */
const requests = (mock: ReturnType<typeof stubFetch>, part: string) =>
  mock.mock.calls.filter(([url]) => String(url).includes(part)).length;

/**
 * Reads the parts of the card.
 *
 * @param root - The shadow root.
 * @returns The place, the temperature, the details and whether the error is shown.
 */
const card = (root: ShadowRoot) => ({
  place: root.querySelector('.place')?.textContent,
  temp: root.querySelector('.temp')?.textContent,
  meta: root.querySelector('.meta')?.textContent,
  failed: root.querySelector('.error')?.hasAttribute('hidden') === false,
  sky: root.querySelector('.sky')?.getAttribute('data-sky'),
  busy: root.querySelector('.sky')?.hasAttribute('data-busy'),
});

describe('describeWeather', () => {
  it('names a known code and paints the sky', () => {
    expect(describeWeather(0, true)).toEqual({ text: 'Clear sky', glyph: '☀', sky: 'clear' });
    expect(describeWeather(0, false)).toEqual({ text: 'Clear sky', glyph: '☾', sky: 'night' });
    expect(describeWeather(61, true).sky).toBe('rain');
    expect(describeWeather(3, false).sky).toBe('cloud');
  });

  it('draws no sun at night, not even behind a cloud', () => {
    expect(describeWeather(2, true).glyph).toBe('⛅');
    expect(describeWeather(2, false).glyph).toBe('☁');
    expect(describeWeather(61, false).glyph).toBe('☂');
  });

  it('tells drizzle and freezing rain from rain', () => {
    expect(describeWeather(53, true).text).toBe('Drizzle');
    expect(describeWeather(66, true).text).toBe('Freezing rain');
    expect(describeWeather(63, true).text).toBe('Rain');
  });

  it('falls back for an unknown code', () => {
    expect(describeWeather(1234, true)).toEqual({ text: 'Unknown', glyph: '?', sky: 'cloud' });
  });
});

describe('weather-now', () => {
  it('shows the weather of a city and announces it once', async () => {
    const mock = stubFetch(answer(61));
    const loaded = vi.fn();
    const { element, root } = await mountWidget(
      'weather-now',
      { city: 'Tabor' },
      { loaded: (event) => loaded(event.detail) },
    );
    await vi.advanceTimersByTimeAsync(10);
    expect(String(mock.mock.calls[0]?.[0])).toContain('name=Tabor');
    expect(card(root)).toMatchObject({
      place: 'Tabor',
      temp: '20°C',
      meta: 'RainWind 8 km/h',
      failed: false,
      sky: 'rain',
    });
    expect(loaded).toHaveBeenCalledTimes(1);
    expect(loaded).toHaveBeenCalledWith({ place: 'Tabor', temperature: 20, unit: 'c' });
    expect(element.isConnected).toBe(true);
  });

  it('shows Fahrenheit when asked, and a change of unit is not a new load', async () => {
    stubFetch(answer());
    const loaded = vi.fn();
    const { element, root } = await mountWidget(
      'weather-now',
      { city: 'Brno', unit: 'F' },
      { loaded: (event) => loaded(event.detail) },
    );
    await vi.advanceTimersByTimeAsync(10);
    expect(card(root).temp).toBe('69°F');
    element.setAttribute('unit', 'c');
    await vi.advanceTimersByTimeAsync(10);
    expect(card(root).temp).toBe('20°C');
    expect(loaded).toHaveBeenCalledTimes(1);
  });

  it('uses Prague for an empty city', async () => {
    const mock = stubFetch(answer());
    await mountWidget('weather-now', { city: '' });
    await vi.advanceTimersByTimeAsync(10);
    expect(String(mock.mock.calls[0]?.[0])).toContain('name=Prague');
  });

  it('asks for the coordinates of a city once, however many widgets and reloads need them', async () => {
    const mock = stubFetch(answer());
    const first = await mountWidget('weather-now', { city: 'Ostrava' });
    await vi.advanceTimersByTimeAsync(10);
    await mountWidget('weather-now', { city: ' ostrava ' });
    await vi.advanceTimersByTimeAsync(10);
    first.root.querySelector<HTMLButtonElement>('.error button')?.click();
    expect(requests(mock, 'geocoding')).toBe(1);
    expect(requests(mock, 'forecast')).toBe(2);
  });

  it('forgets a failed lookup so that it can be tried again', async () => {
    let fail = true;
    const mock = stubFetch((url) => (fail ? 500 : answer()(url)));
    const { root } = await mountWidget('weather-now', { city: 'Plzen' });
    await vi.advanceTimersByTimeAsync(2000);
    expect(card(root).failed).toBe(true);
    fail = false;
    root.querySelector<HTMLButtonElement>('.error button')!.click();
    await vi.advanceTimersByTimeAsync(10);
    expect(card(root)).toMatchObject({ failed: false, place: 'Plzen', temp: '20°C' });
    expect(requests(mock, 'geocoding')).toBeGreaterThan(1);
  });

  it('says so when no place is found', async () => {
    stubFetch(() => ({}));
    const { root } = await mountWidget('weather-now', { city: 'Nowhere' });
    await vi.advanceTimersByTimeAsync(10);
    expect(root.querySelector('.error .state')?.textContent).toBe('No place called "Nowhere".');
  });

  it('describes a failing server and tries again', async () => {
    let fail = true;
    const mock = stubFetch((url) => (fail ? 404 : answer()(url)));
    const { root } = await mountWidget('weather-now', { city: 'Liberec' });
    await vi.advanceTimersByTimeAsync(10);
    expect(root.querySelector('.error .state')?.textContent).toBe('Not found.');
    fail = false;
    root.querySelector<HTMLButtonElement>('.error button')!.click();
    await vi.advanceTimersByTimeAsync(10);
    expect(mock.mock.calls.length).toBeGreaterThan(1);
    expect(card(root).meta).toContain('Clear sky');
  });

  it('does not show the old weather beside the message that a newer request failed', async () => {
    stubFetch((url) => (url.includes('name=Nowhere') ? {} : answer()(url)));
    const { element, root } = await mountWidget('weather-now', { city: 'Olomouc' });
    await vi.advanceTimersByTimeAsync(10);
    expect(card(root)).toMatchObject({ place: 'Olomouc', temp: '20°C' });
    element.setAttribute('city', 'Nowhere');
    await vi.advanceTimersByTimeAsync(10);
    expect(card(root)).toMatchObject({ place: 'Nowhere', temp: '', meta: '', failed: true });
  });

  it('marks the old weather as busy while a newer request runs', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    const mock = stubFetch(answer());
    const { element, root } = await mountWidget('weather-now', { city: 'Zlin' });
    await vi.advanceTimersByTimeAsync(10);
    expect(card(root).busy).toBe(false);
    mock.mockImplementation(async (input) => {
      await gate;
      return new Response(JSON.stringify(answer()(String(input))), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    element.setAttribute('city', 'Jihlava');
    await vi.advanceTimersByTimeAsync(10);
    expect(card(root)).toMatchObject({ busy: true, place: 'Zlin' });
    release();
    await vi.advanceTimersByTimeAsync(10);
    expect(card(root)).toMatchObject({ busy: false, place: 'Jihlava' });
  });

  it('stops its requests when removed, and loads again when put back', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    const mock = stubFetch(answer());
    mock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('forecast')) {
        await gate;
        if (init?.signal?.aborted) throw new DOMException('aborted', 'AbortError');
      }
      return new Response(JSON.stringify(answer()(url)), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    const loaded = vi.fn();
    const { element, root } = await mountWidget(
      'weather-now',
      { city: 'Pardubice' },
      { loaded: (event) => loaded(event.detail) },
    );
    await vi.advanceTimersByTimeAsync(10);
    element.remove();
    release();
    await vi.advanceTimersByTimeAsync(10);
    expect(loaded).not.toHaveBeenCalled();
    element.setAttribute('city', 'Hradec');
    await vi.advanceTimersByTimeAsync(10);
    expect(requests(mock, 'forecast')).toBe(1);
    document.body.append(element);
    await vi.advanceTimersByTimeAsync(10);
    expect(requests(mock, 'forecast')).toBe(2);
    expect(card(root).place).toBe('Hradec');
    expect(loaded).toHaveBeenCalledTimes(1);
  });

  it('is hidden by the hidden attribute', async () => {
    stubFetch(answer());
    const { element } = await mountWidget('weather-now', { city: 'Kladno', hidden: '' });
    const rules = [...(element.shadowRoot?.adoptedStyleSheets[0]?.cssRules ?? [])]
      .map((rule) => rule.cssText)
      .join(' ');
    expect(rules).toContain(':host([hidden])');
  });
});
