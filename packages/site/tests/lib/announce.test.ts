import { afterEach, describe, expect, it, vi } from 'vitest';
import { announce, announcer } from '@site/lib/announce';

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('announcer', () => {
  it('adds one polite, hidden status region and returns the same one again', () => {
    const region = announcer();
    expect(announcer()).toBe(region);
    expect(document.querySelectorAll('.sr-status')).toHaveLength(1);
    expect(region.getAttribute('role')).toBe('status');
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.classList.contains('sr-only')).toBe(true);
    expect(region.textContent).toBe('');
  });
});

describe('announce', () => {
  it('uses the region that exists and fills it on the next frame', async () => {
    vi.useFakeTimers();
    const region = announcer();
    announce('Copied');
    expect(document.querySelectorAll('.sr-status')).toHaveLength(1);
    expect(region.textContent).toBe('');
    await vi.advanceTimersByTimeAsync(20);
    expect(region.textContent).toBe('Copied');
  });

  it('creates the region when the app did not', async () => {
    vi.useFakeTimers();
    announce('Failed');
    await vi.advanceTimersByTimeAsync(20);
    expect(document.querySelector('.sr-status')?.textContent).toBe('Failed');
  });

  it('empties the region before it says the same message again', async () => {
    vi.useFakeTimers();
    const region = announcer();
    announce('Copied');
    await vi.advanceTimersByTimeAsync(20);
    expect(region.textContent).toBe('Copied');
    announce('Copied');
    expect(region.textContent).toBe('');
    await vi.advanceTimersByTimeAsync(20);
    expect(region.textContent).toBe('Copied');
  });

  it('keeps the last message when an earlier timer would have emptied it', async () => {
    vi.useFakeTimers();
    const region = announcer();
    announce('First');
    await vi.advanceTimersByTimeAsync(1000);
    announce('Second');
    await vi.advanceTimersByTimeAsync(600);
    expect(region.textContent).toBe('Second');
    await vi.advanceTimersByTimeAsync(1000);
    expect(region.textContent).toBe('');
  });
});
