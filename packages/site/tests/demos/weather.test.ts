import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/weather';
import { stubFetch } from '@tests/widgets/helpers';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

const open = async (code = 0) => {
  const fetchMock = stubFetch(() => ({
    current: { temperature_2m: 20, wind_speed_10m: 5, weather_code: code },
  }));
  const demo = create() as HTMLElement;
  document.body.append(demo);
  await vi.advanceTimersByTimeAsync(10);
  const root = demo.shadowRoot!;
  return { fetchMock, root, text: () => root.textContent! };
};

describe('weather demo', () => {
  it('shows the weather of the first city', async () => {
    const { fetchMock, text } = await open();
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('latitude=50.08');
    expect(text()).toContain('20°C');
    expect(text()).toContain('Clear sky, wind 5 km/h');
  });

  it('shows dots until the first answer', async () => {
    vi.stubGlobal('fetch', () => new Promise(() => {}));
    const demo = create() as HTMLElement;
    document.body.append(demo);
    await vi.advanceTimersByTimeAsync(10);
    expect(demo.shadowRoot!.querySelector('.now')?.textContent).toBe('...');
  });

  it('switches the unit without a new request', async () => {
    const { fetchMock, root, text } = await open();
    root.querySelector<HTMLButtonElement>('button')!.click();
    expect(text()).toContain('68°F');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('asks again for another city', async () => {
    const { fetchMock, root } = await open();
    const select = root.querySelector('select')!;
    select.value = 'Nairobi';
    select.dispatchEvent(new Event('change'));
    await vi.advanceTimersByTimeAsync(10);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('latitude=-1.29');
  });

  it('describes every kind of weather', async () => {
    const kinds: [number, string][] = [
      [2, 'Cloudy'],
      [45, 'Fog'],
      [61, 'Rain'],
      [71, 'Snow'],
      [95, 'Showers or storm'],
    ];
    for (const [code, name] of kinds) {
      const { text } = await open(code);
      expect(text()).toContain(name);
      document.body.replaceChildren();
    }
  });

  it('reports a failed request', async () => {
    stubFetch(() => 500);
    const demo = create() as HTMLElement;
    document.body.append(demo);
    await vi.advanceTimersByTimeAsync(2000);
    expect(demo.shadowRoot!.querySelector('.error')?.textContent).toBe(
      'Could not load the weather.',
    );
    expect(demo.shadowRoot!.querySelector('strong')).toBeNull();
  });
});
