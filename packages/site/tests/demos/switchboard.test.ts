import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/switchboard';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

const open = () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  const root = demo.shadowRoot!;
  const jack = (name: string) =>
    root.querySelector<HTMLButtonElement>(`button[aria-label="${name} line"]`)!;
  const lamp = (name: string) => jack(name).closest('.line')!.className;
  const lines = () => [...root.querySelectorAll('.strip p')].map((line) => line.textContent);
  return { root, jack, lamp, lines };
};

describe('switchboard example', () => {
  it('shows four lines, all idle, and a strip that has nothing on it yet', () => {
    const { root, jack, lamp, lines } = open();
    expect(root.querySelectorAll('.jack')).toHaveLength(4);
    ['Clear', 'Slow', 'Crackly', 'Dead'].forEach((name) => {
      expect(lamp(name)).toBe('line idle');
      expect(jack(name).getAttribute('aria-pressed')).toBe('false');
      expect(jack(name).textContent).toContain(name);
    });
    expect(lines()).toEqual(['No call yet.']);
    expect(root.querySelector('.strip')?.getAttribute('aria-live')).toBe('polite');
  });

  it('answers the clear line with a 200 and reports the time the request took', async () => {
    const { jack, lamp, lines } = open();
    jack('Clear').click();
    expect(lamp('Clear')).toBe('line ringing');
    expect(jack('Clear').getAttribute('aria-pressed')).toBe('true');
    await vi.advanceTimersByTimeAsync(399);
    expect(lamp('Clear')).toBe('line ringing');
    await vi.advanceTimersByTimeAsync(1);
    expect(lamp('Clear')).toBe('line ok');
    expect(jack('Clear').getAttribute('aria-pressed')).toBe('false');
    expect(lines()).toHaveLength(1);
    expect(lines()[0]).toMatch(/^GET \/line\/1 \.\.\. 200 after \d+ ms\./);
  });

  it('keeps the slow line ringing until the plug is pulled: ERR_CANCELED, and nothing is retried', async () => {
    const { jack, lamp, lines } = open();
    jack('Slow').click();
    await vi.advanceTimersByTimeAsync(10000);
    expect(lamp('Slow')).toBe('line ringing');
    expect(lines()).toEqual(['No call yet.']);
    jack('Slow').click();
    await vi.advanceTimersByTimeAsync(0);
    expect(lamp('Slow')).toBe('line cut');
    expect(lines()).toEqual(['GET /line/2 ... ERR_CANCELED, nothing retried.']);
    await vi.advanceTimersByTimeAsync(60000);
    expect(lines()).toHaveLength(1);
    expect(lamp('Slow')).toBe('line cut');
  });

  it('answers the crackly line on the third attempt', async () => {
    const { jack, lamp, lines } = open();
    jack('Crackly').click();
    await vi.advanceTimersByTimeAsync(1100);
    expect(lamp('Crackly')).toBe('line ringing');
    await vi.advanceTimersByTimeAsync(100);
    expect(lamp('Crackly')).toBe('line ok');
    expect(lines()).toEqual(['GET /line/3 ... failed, failed, 200 on attempt 3 of 3.']);
  });

  it('refuses the dead line with status 503 after two retries', async () => {
    const { jack, lamp, lines } = open();
    jack('Dead').click();
    await vi.advanceTimersByTimeAsync(5000);
    expect(lamp('Dead')).toBe('line bad');
    expect(lines()).toEqual([
      'GET /line/4 ... 503, 503, 503: refused with status 503 after 2 retries. HttpError.',
    ]);
  });

  it('stops a retry when the plug is pulled while the call waits to try again', async () => {
    const { jack, lamp, lines } = open();
    jack('Crackly').click();
    await vi.advanceTimersByTimeAsync(250);
    jack('Crackly').click();
    await vi.advanceTimersByTimeAsync(2000);
    expect(lamp('Crackly')).toBe('line cut');
    expect(lines()).toEqual(['GET /line/3 ... ERR_CANCELED, nothing retried.']);
  });

  it('runs the lines side by side and keeps the last four lines on the strip', async () => {
    const { jack, lamp, lines } = open();
    ['Clear', 'Crackly', 'Dead'].forEach((name) => jack(name).click());
    expect(['Clear', 'Crackly', 'Dead'].map(lamp)).toEqual([
      'line ringing',
      'line ringing',
      'line ringing',
    ]);
    await vi.advanceTimersByTimeAsync(5000);
    expect(lines()).toHaveLength(3);
    jack('Clear').click();
    await vi.advanceTimersByTimeAsync(500);
    jack('Clear').click();
    await vi.advanceTimersByTimeAsync(500);
    expect(lines()).toHaveLength(4);
    expect(lines()[0]).toContain('/line/3');
    expect(lamp('Clear')).toBe('line ok');
  });
});
