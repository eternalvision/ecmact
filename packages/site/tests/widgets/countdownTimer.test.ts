import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineCountdownTimer, remaining } from '@site/widgets/countdownTimer';
import { mountWidget } from '@tests/widgets/helpers';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2027-01-01T00:00:00'));
  if (!customElements.get('countdown-timer')) defineCountdownTimer();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

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

  it('is all zeros once the time has run out', () => {
    expect(remaining(0, 5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  });
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

  it('counts three days when it has no date at all', async () => {
    const { root } = await mountWidget('countdown-timer');
    expect(shown(root)[0]).toBe('03');
  });

  it('falls back to three days ahead and to a default label', async () => {
    const { root, text } = await mountWidget('countdown-timer', { to: 'soon' });
    expect(text()).toContain('Countdown');
    expect(shown(root)[0]).toBe('03');
  });

  it('fires done once and stops its timer when removed', async () => {
    const { element } = await mountWidget('countdown-timer', { to: '2027-01-01T00:00:02' });
    const done = vi.fn();
    element.addEventListener('done', done);
    await vi.advanceTimersByTimeAsync(3000);
    expect(done).toHaveBeenCalledTimes(1);
    element.remove();
    expect(vi.getTimerCount()).toBe(0);
  });
});
