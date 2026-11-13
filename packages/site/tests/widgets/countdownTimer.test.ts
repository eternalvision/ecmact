import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineCountdownTimer, parseTarget, remaining } from '@site/widgets/countdownTimer';
import { mountWidget } from '@tests/widgets/helpers';

defineCountdownTimer();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2027-01-01T00:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

/**
 * Reads the numbers that the cards show, in the order days, hours, minutes, seconds.
 *
 * @param root - The shadow root of the widget.
 * @returns The numbers.
 */
const shown = (root: ShadowRoot) =>
  [...root.querySelectorAll('.digit')].map(
    (digit) => digit.querySelector('.half.top span')?.textContent,
  );

describe('remaining', () => {
  it('splits the time into units', () => {
    expect(remaining(90061000, 0)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
      done: false,
    });
  });

  it('counts a started second as a whole one, so it is done exactly at the target', () => {
    expect(remaining(1999, 1000)).toMatchObject({ seconds: 1, done: false });
    expect(remaining(1000, 1000)).toMatchObject({ seconds: 0, done: true });
    expect(remaining(1001, 1000)).toMatchObject({ seconds: 1, done: false });
  });

  it('is all zeros once the time has run out', () => {
    expect(remaining(0, 5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  });
});

describe('parseTarget', () => {
  const fallback = 12345;

  it('reads a date with a time as local time and a date with an offset as that moment', () => {
    expect(parseTarget('2027-01-02T01:01:01', fallback)).toBe(
      new Date(2027, 0, 2, 1, 1, 1).getTime(),
    );
    expect(parseTarget('2027-01-02T00:00:00Z', fallback)).toBe(Date.UTC(2027, 0, 2));
  });

  it('reads a date without a time as the start of that day in local time, not in UTC', () => {
    expect(parseTarget('2027-01-02', fallback)).toBe(new Date(2027, 0, 2).getTime());
    expect(parseTarget(' 2027-01-02 ', fallback)).toBe(new Date(2027, 0, 2).getTime());
  });

  it('gives the fallback for anything else', () => {
    expect(parseTarget('soon', fallback)).toBe(fallback);
    expect(parseTarget('', fallback)).toBe(fallback);
    expect(parseTarget(null, fallback)).toBe(fallback);
    expect(parseTarget(undefined, fallback)).toBe(fallback);
  });
});

describe('countdown-timer', () => {
  it('counts down to the date in its attribute', async () => {
    const { root, text } = await mountWidget('countdown-timer', {
      to: '2027-01-02T01:01:01',
      label: 'Launch',
    });
    expect(text()).toContain('Launch');
    expect(shown(root)).toEqual(['01', '01', '01', '01']);
    await vi.advanceTimersByTimeAsync(1000);
    expect(shown(root)).toEqual(['01', '01', '01', '00']);
    expect(root.querySelector('.flip')).not.toBeNull();
  });

  it('counts three days when it has no date at all, or an invalid one', async () => {
    const none = await mountWidget('countdown-timer');
    expect(shown(none.root)[0]).toBe('03');
    const invalid = await mountWidget('countdown-timer', { to: 'soon' });
    expect(shown(invalid.root)[0]).toBe('03');
    expect(invalid.text()).toContain('Countdown');
  });

  it('gives each card one image with the number as its label', async () => {
    const { root } = await mountWidget('countdown-timer', { to: '2027-01-02T01:01:01' });
    expect(
      [...root.querySelectorAll('.digit')].map((digit) => digit.getAttribute('aria-label')),
    ).toEqual(['01', '01', '01', '01']);
  });

  it('fires done once, when the time runs out and not before', async () => {
    const done = vi.fn();
    const { element } = await mountWidget(
      'countdown-timer',
      { to: '2027-01-01T00:00:03' },
      { done },
    );
    await vi.advanceTimersByTimeAsync(2000);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1000);
    expect(done).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(done).toHaveBeenCalledTimes(1);
    element.remove();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops ticking once the time has run out', async () => {
    await mountWidget('countdown-timer', { to: '2027-01-01T00:00:02' });
    await vi.advanceTimersByTimeAsync(3000);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not fire done again when it is moved in the page', async () => {
    const done = vi.fn();
    const { element } = await mountWidget(
      'countdown-timer',
      { to: '2027-01-01T00:00:01' },
      { done },
    );
    await vi.advanceTimersByTimeAsync(2000);
    for (let move = 0; move < 3; move++) {
      element.remove();
      document.body.append(element);
      await vi.advanceTimersByTimeAsync(2000);
    }
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('does not fire done again when it is taken out of the page and put back later', async () => {
    const done = vi.fn();
    const { element } = await mountWidget(
      'countdown-timer',
      { to: '2027-01-01T00:00:01' },
      { done },
    );
    await vi.advanceTimersByTimeAsync(2000);
    element.remove();
    await vi.advanceTimersByTimeAsync(2000);
    expect(element.shadowRoot?.querySelector('.clock')).toBeNull();
    document.body.append(element);
    await vi.advanceTimersByTimeAsync(2000);
    expect(shown(element.shadowRoot!)).toEqual(['00', '00', '00', '00']);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('stops the clock and a flip in progress when it is taken out of the page', async () => {
    const { element, root } = await mountWidget('countdown-timer', { to: '2027-01-02T00:00:00' });
    await vi.advanceTimersByTimeAsync(1000);
    const digit = root.querySelector('.tile.sec .digit')!;
    expect(digit.classList.contains('flip')).toBe(true);
    element.remove();
    await vi.advanceTimersByTimeAsync(0);
    expect(digit.classList.contains('flip')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('fires done again for a new, later moment', async () => {
    const done = vi.fn();
    const { element, root } = await mountWidget(
      'countdown-timer',
      { to: '2027-01-01T00:00:01' },
      { done },
    );
    await vi.advanceTimersByTimeAsync(2000);
    expect(done).toHaveBeenCalledTimes(1);
    element.setAttribute('to', '2027-01-01T00:00:10');
    await vi.advanceTimersByTimeAsync(0);
    expect(shown(root)[3]).not.toBe('00');
    await vi.advanceTimersByTimeAsync(10000);
    expect(done).toHaveBeenCalledTimes(2);
  });

  it('fires done at once for a moment that has already passed', async () => {
    const done = vi.fn();
    await mountWidget('countdown-timer', { to: '2020-01-01T00:00:00' }, { done });
    expect(done).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('ticks only while it is on screen and the tab is visible', async () => {
    let notify: (entries: { isIntersecting: boolean }[]) => void = () => {};
    let disconnected = 0;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        /**
         * Keeps the callback.
         *
         * @param callback - The callback.
         */
        constructor(callback: typeof notify) {
          notify = callback;
        }
        /** Does nothing. */
        observe() {}
        /** Counts the disconnects. */
        disconnect() {
          disconnected++;
        }
      },
    );
    const { element } = await mountWidget('countdown-timer', { to: '2027-01-02T00:00:00' });
    expect(vi.getTimerCount()).toBe(1);
    notify([{ isIntersecting: false }]);
    expect(vi.getTimerCount()).toBe(0);
    notify([{ isIntersecting: true }]);
    expect(vi.getTimerCount()).toBe(1);
    notify([]);
    expect(vi.getTimerCount()).toBe(1);
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(vi.getTimerCount()).toBe(0);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(vi.getTimerCount()).toBe(1);
    element.remove();
    await vi.advanceTimersByTimeAsync(0);
    expect(disconnected).toBe(1);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('works where IntersectionObserver does not exist', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    await mountWidget('countdown-timer', { to: '2027-01-02T00:00:00' });
    expect(vi.getTimerCount()).toBe(1);
  });

  it('catches up at once when it comes back into view', async () => {
    let notify: (entries: { isIntersecting: boolean }[]) => void = () => {};
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        /**
         * Keeps the callback.
         *
         * @param callback - The callback.
         */
        constructor(callback: typeof notify) {
          notify = callback;
        }
        /** Does nothing. */
        observe() {}
        /** Does nothing. */
        disconnect() {}
      },
    );
    const { root } = await mountWidget('countdown-timer', { to: '2027-01-02T00:00:00' });
    notify([{ isIntersecting: false }]);
    vi.setSystemTime(new Date('2027-01-01T06:00:00'));
    expect(shown(root)[1]).toBe('00');
    notify([{ isIntersecting: true }]);
    expect(shown(root)[1]).toBe('18');
  });
});
