import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineWeatherNow, describeWeather } from '@site/widgets/weatherNow';
import { mountWidget, stubFetch } from '@tests/widgets/helpers';

const answer =
  (code = 0, day = 1) =>
  (url: string) =>
    url.includes('geocoding')
      ? { results: [{ name: 'Prague', latitude: 50, longitude: 14 }] }
      : { current: { temperature_2m: 20.4, weather_code: code, wind_speed_10m: 7.6, is_day: day } };

beforeEach(() => {
  vi.useFakeTimers();
  if (!customElements.get('weather-now')) defineWeatherNow();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe('describeWeather', () => {
  it('names a known code and paints the sky', () => {
    expect(describeWeather(0, true)).toEqual({ text: 'Clear sky', glyph: '☀', sky: 'clear' });
    expect(describeWeather(0, false)).toEqual({ text: 'Clear sky', glyph: '☾', sky: 'night' });
    expect(describeWeather(61, true).sky).toBe('rain');
    expect(describeWeather(3, false).sky).toBe('cloud');
  });

  it('falls back for an unknown code', () => {
    expect(describeWeather(1234, true)).toEqual({ text: 'Unknown', glyph: '?', sky: 'cloud' });
  });
});

describe('weather-now', () => {
  it('shows the weather of a city and announces it', async () => {
    const fetchMock = stubFetch(answer(61));
    const element = document.createElement('weather-now');
    element.setAttribute('city', 'Prague');
    const loaded = vi.fn();
    element.addEventListener('loaded', loaded);
    document.body.append(element);
    await vi.advanceTimersByTimeAsync(10);
    const text = element.shadowRoot!.textContent!;
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('name=Prague');
    expect(text).toContain('Prague');
    expect(text).toContain('20');
    expect(text).toContain('°C');
    expect(text).toContain('Rain');
    expect(text).toContain('Wind 8 km/h');
    expect(loaded).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { place: 'Prague', temperature: 20, unit: 'c' } }),
    );
    expect(element.shadowRoot!.querySelector('.sky')?.getAttribute('data-sky')).toBe('rain');
  });

  it('shows Fahrenheit when asked', async () => {
    stubFetch(answer());
    const { text } = await mountWidget('weather-now', { unit: 'F' });
    await vi.advanceTimersByTimeAsync(10);
    expect(text()).toContain('69');
    expect(text()).toContain('°F');
  });

  it('says so when no place is found', async () => {
    stubFetch(() => ({}));
    const { text } = await mountWidget('weather-now', { city: 'Nowhere' });
    await vi.advanceTimersByTimeAsync(10);
    expect(text()).toContain('No place called "Nowhere".');
  });

  it('describes a failing server and tries again', async () => {
    let fail = true;
    const fetchMock = stubFetch((url) => (fail ? 404 : answer()(url)));
    const { root, text } = await mountWidget('weather-now');
    await vi.advanceTimersByTimeAsync(10);
    expect(text()).toContain('Not found.');
    fail = false;
    root.querySelector<HTMLButtonElement>('.error button')!.click();
    await vi.advanceTimersByTimeAsync(10);
    expect(fetchMock.mock.calls.length).toBeGreaterThan(2);
    expect(text()).toContain('Clear sky');
  });
});
