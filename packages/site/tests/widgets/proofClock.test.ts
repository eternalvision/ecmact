import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clockText, defineProofClock, parseTarget, standing } from '@site/widgets/proofClock';
import { mountWidget } from '@tests/widgets/helpers';

defineProofClock();

const now = new Date(2026, 10, 20, 8, 0, 0).getTime();
const hour = 3600000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

/** Writes a moment as an attribute value without an offset. */
const local = (time: number) => {
  const date = new Date(time);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
const heading = (root: ShadowRoot) => root.querySelector('.blob small')?.textContent;
const clock = (root: ShadowRoot) => root.querySelector('.blob b')?.textContent;
const stage = (root: ShadowRoot) => [...root.querySelectorAll('li')].map((item) => item.className);

describe('parseTarget', () => {
  it('reads a date, a local moment and a moment with an offset, and falls back for anything else', () => {
    expect(parseTarget('2027-01-01', 5)).toBe(new Date(2027, 0, 1).getTime());
    expect(parseTarget('2027-01-01T18:00:00', 5)).toBe(new Date(2027, 0, 1, 18).getTime());
    expect(parseTarget('2027-01-01T18:00:00Z', 5)).toBe(Date.UTC(2027, 0, 1, 18));
    expect(parseTarget('', 5)).toBe(5);
    expect(parseTarget(null, 5)).toBe(5);
    expect(parseTarget(undefined, 5)).toBe(5);
    expect(parseTarget('soon', 5)).toBe(5);
  });
});

describe('standing', () => {
  const target = now + 10 * hour;

  it('works back from the end: the last stage ends at the target', () => {
    expect(standing(target, target - 30 * 60000, 24)).toMatchObject({ stage: 4, left: 1800 });
    expect(standing(target, target - 2 * hour, 24)).toMatchObject({ stage: 3, left: 3600 });
  });

  it('is before the start while the first stage has not begun, and done at the target', () => {
    expect(standing(target, now - 100 * hour, 24)).toMatchObject({ stage: -1, done: false });
    expect(standing(target, now, 24).stage).toBe(-1);
    expect(standing(target, target, 24)).toEqual({ stage: 5, left: 0, done: true });
    expect(standing(target, target + hour, 24).done).toBe(true);
  });

  it('shortens the rising stages in a warm kitchen and lengthens them in a cold one', () => {
    const at = target - 7 * hour;
    expect(standing(target, at, 24).stage).toBe(1);
    expect(standing(target, at, 30).stage).toBe(-1);
    expect(standing(target, at, 16).stage).toBe(1);
    expect(standing(target, target - 17 * hour, 24).stage).toBe(-1);
    expect(standing(target, target - 17 * hour, 16).stage).toBe(0);
  });
});

describe('clockText', () => {
  it('writes hours, minutes and seconds, with the hours going past 24', () => {
    expect(clockText(0)).toBe('00:00:00');
    expect(clockText(8049)).toBe('02:14:09');
    expect(clockText(100 * 3600 + 5)).toBe('100:00:05');
  });
});

describe('proof-clock', () => {
  it('shows the stage that runs, the time left in it and when the loaf comes out', async () => {
    const to = now + 7 * hour;
    const { root, text } = await mountWidget('proof-clock', { to: local(to), label: 'Boule' });
    expect(text()).toContain('Boule');
    expect(heading(root)).toBe('Bulk');
    const expected = standing(to, now, 24);
    expect(clock(root)).toBe(clockText(expected.left));
    expect(text()).toContain(
      `loaf out at ${new Date(to).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`,
    );
    expect(stage(root)).toEqual(['done', 'now', '', '', '']);
    expect(root.querySelector('li.now')?.getAttribute('aria-current')).toBe('step');
  });

  it('ticks once a second and moves to the next stage', async () => {
    const to = now + 3 * hour;
    const { root } = await mountWidget('proof-clock', { to: local(to) });
    const first = clock(root);
    await vi.advanceTimersByTimeAsync(1000);
    expect(clock(root)).not.toBe(first);
    await vi.advanceTimersByTimeAsync(2 * hour);
    expect(stage(root).indexOf('now')).toBeGreaterThan(1);
  });

  it('says that the schedule has not started when the loaf comes out a day away', async () => {
    const { root } = await mountWidget('proof-clock', { to: local(now + 24 * hour) });
    expect(heading(root)).toBe('Starts in');
    expect(stage(root)).toEqual(['', '', '', '', '']);
  });

  it('defaults to ten hours from now for a missing or malformed moment', async () => {
    for (const to of [undefined, '', 'tomorrow-ish']) {
      const { root } = await mountWidget('proof-clock', to === undefined ? {} : { to });
      expect(heading(root)).toBe('Starts in');
      expect(clock(root)).toBe('02:00:00');
      document.body.replaceChildren();
    }
  });

  it('shows the loaf as out and says done once for a moment in the past', async () => {
    const done = vi.fn();
    const { root, element } = await mountWidget('proof-clock', { to: local(now - hour) }, { done });
    expect(heading(root)).toBe('Out of the oven');
    expect(clock(root)).toBe('00:00:00');
    expect(done).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(done).toHaveBeenCalledTimes(1);
    element.remove();
    await vi.advanceTimersByTimeAsync(0);
    document.body.append(element);
    await vi.advanceTimersByTimeAsync(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('says done when the time runs out, and again when it moves to a later moment that passes too', async () => {
    const done = vi.fn();
    const { element, root } = await mountWidget('proof-clock', { to: local(now + 5000) }, { done });
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(6000);
    expect(done).toHaveBeenCalledTimes(1);
    element.setAttribute('to', local(Date.now() + 3000));
    await vi.advanceTimersByTimeAsync(0);
    expect(heading(root)).not.toBe('Out of the oven');
    await vi.advanceTimersByTimeAsync(4000);
    expect(done).toHaveBeenCalledTimes(2);
  });

  it('moves the schedule with the temperature slider, which is a native range input', async () => {
    const to = now + 7 * hour;
    const { root } = await mountWidget('proof-clock', { to: local(to) });
    const slider = root.querySelector<HTMLInputElement>('input[type="range"]')!;
    expect(slider.min).toBe('16');
    expect(slider.max).toBe('30');
    expect(slider.getAttribute('aria-label')).toBe('Kitchen temperature');
    expect(root.querySelector('.temp b')?.textContent).toBe('24 °C');
    slider.value = '30';
    slider.dispatchEvent(new Event('input'));
    expect(root.querySelector('.temp b')?.textContent).toBe('30 °C');
    expect(heading(root)).toBe('Starts in');
    slider.value = '16';
    slider.dispatchEvent(new Event('input'));
    expect(heading(root)).toBe('Bulk');
    expect(clock(root)).toBe(clockText(standing(to, now, 16).left));
  });

  it('stops the timer when the widget is taken out and starts clean when it is put back', async () => {
    const to = now + 7 * hour;
    const { element, root } = await mountWidget('proof-clock', { to: local(to) });
    expect(vi.getTimerCount()).toBe(1);
    element.remove();
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(root.childNodes).toHaveLength(0);
    document.body.append(element);
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(1);
    expect(heading(root)).toBe('Bulk');
  });

  it('pauses while the tab is hidden and goes on when it is shown', async () => {
    const hidden = vi.spyOn(document, 'hidden', 'get');
    const { root } = await mountWidget('proof-clock', { to: local(now + 7 * hour) });
    hidden.mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(vi.getTimerCount()).toBe(0);
    const frozen = clock(root);
    await vi.advanceTimersByTimeAsync(3000);
    expect(clock(root)).toBe(frozen);
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(clock(root)).not.toBe(frozen);
    hidden.mockRestore();
  });

  it('changes the stage and the shape only where motion is allowed', async () => {
    const { element } = await mountWidget('proof-clock');
    const sheet = element.shadowRoot?.adoptedStyleSheets[0];
    const rules = [...(sheet?.cssRules ?? [])];
    const outside = rules.filter((rule) => !rule.cssText.startsWith('@media'));
    expect(outside.every((rule) => !/transition|animation/.test(rule.cssText))).toBe(true);
    expect(
      rules.some((rule) => rule.cssText.includes('no-preference') && rule.cssText.includes('rise')),
    ).toBe(true);
  });
});
