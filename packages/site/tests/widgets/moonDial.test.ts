import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineMoonDial, moonOn, parseDay } from '@site/widgets/moonDial';
import { mountWidget } from '@tests/widgets/helpers';

defineMoonDial();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 20, 9, 0));
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

const name = (root: ShadowRoot) => root.querySelector('.name')?.textContent;
const day = (root: ShadowRoot) => root.querySelector('.day')?.textContent;
const dial = (root: ShadowRoot) => root.querySelector<HTMLElement>('.dial')!;
const press = (target: Element, key: string) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
};
const button = (root: ShadowRoot, label: string) =>
  root.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;

describe('moonOn', () => {
  it('knows the new moon of 6 January 2000 and a full moon two weeks on', () => {
    expect(moonOn(new Date(2000, 0, 7, 20))).toMatchObject({
      day: 1,
      phase: 'New moon',
      waxing: true,
    });
    const full = moonOn(new Date(2000, 0, 21));
    expect(full.phase).toBe('Full moon');
    expect(full.lit).toBeGreaterThan(0.99);
  });

  it('counts the days from 1 to 29 and names the eight phases', () => {
    const names = new Set<string>();
    const days = new Set<number>();
    for (let offset = 0; offset < 60; offset++) {
      const moon = moonOn(new Date(2026, 10, 1 + offset));
      names.add(moon.phase);
      days.add(moon.day);
      expect(moon.day).toBeGreaterThanOrEqual(1);
      expect(moon.day).toBeLessThanOrEqual(29);
    }
    expect(names.size).toBe(8);
    expect(Math.min(...days)).toBe(1);
    expect(Math.max(...days)).toBe(29);
  });

  it('handles a day before the reference', () => {
    const moon = moonOn(new Date(1990, 5, 1));
    expect(moon.day).toBeGreaterThanOrEqual(1);
    expect(moon.day).toBeLessThanOrEqual(29);
  });
});

describe('parseDay', () => {
  it('reads a day and falls back to today for anything else', () => {
    expect(parseDay('2026-11-17').getDate()).toBe(17);
    for (const value of [undefined, null, '', 'abc', '2026-13-40', '2026-02-31', '17/11/2026']) {
      const date = parseDay(value);
      expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 10, 20]);
    }
  });
});

describe('moon-dial', () => {
  it('shows the moon of today with its phase, day and a slider that says the same', async () => {
    const { root } = await mountWidget('moon-dial');
    const expected = moonOn(new Date(2026, 10, 20));
    expect(name(root)).toBe(expected.phase);
    expect(day(root)).toContain(`day ${expected.day} of 29`);
    expect(day(root)).toContain('approximate');
    const ring = dial(root);
    expect(ring.getAttribute('role')).toBe('slider');
    expect(ring.getAttribute('aria-valuenow')).toBe(String(expected.day));
    expect(ring.getAttribute('aria-valuemin')).toBe('1');
    expect(ring.getAttribute('aria-valuemax')).toBe('29');
    expect(ring.getAttribute('aria-valuetext')).toBe(
      `${expected.phase}, day ${expected.day} of 29`,
    );
    expect(ring.tabIndex).toBe(0);
  });

  it('starts from the date attribute and falls back to today when it is malformed', async () => {
    const { root } = await mountWidget('moon-dial', { date: '2026-11-17' });
    expect(name(root)).toBe(moonOn(new Date(2026, 10, 17)).phase);
    const bad = await mountWidget('moon-dial', { date: 'soon' });
    expect(name(bad.root)).toBe(moonOn(new Date(2026, 10, 20)).phase);
  });

  it('steps a day with the buttons and the arrow keys, and Home goes to today', async () => {
    const changes: unknown[] = [];
    const { root } = await mountWidget(
      'moon-dial',
      { date: '2026-11-17' },
      { change: (event) => changes.push(event.detail) },
    );
    button(root, 'Next day').click();
    expect(changes.at(-1)).toMatchObject({ date: '2026-11-18' });
    button(root, 'Previous day').click();
    press(dial(root), 'ArrowRight');
    press(dial(root), 'ArrowUp');
    expect(changes.at(-1)).toMatchObject({ date: '2026-11-19' });
    press(dial(root), 'ArrowLeft');
    press(dial(root), 'ArrowDown');
    expect(changes.at(-1)).toMatchObject({ date: '2026-11-17' });
    expect(press(dial(root), 'Home').defaultPrevented).toBe(true);
    const today = moonOn(new Date(2026, 10, 20));
    expect(changes.at(-1)).toEqual({ date: '2026-11-20', day: today.day, phase: today.phase });
    root.querySelector<HTMLButtonElement>('.today')!.click();
    expect(name(root)).toBe(today.phase);
  });

  it('writes the date of the event with ASCII digits whatever the language of the page', async () => {
    document.documentElement.lang = 'ar-EG';
    const changes: { date: string }[] = [];
    const { root } = await mountWidget(
      'moon-dial',
      { date: '2026-11-17' },
      { change: (event) => changes.push(event.detail) },
    );
    button(root, 'Next day').click();
    document.documentElement.lang = '';
    expect(changes.at(-1)?.date).toBe('2026-11-18');
  });

  it('ignores a key that moves nothing', async () => {
    const changes: unknown[] = [];
    const { root } = await mountWidget(
      'moon-dial',
      {},
      { change: (event) => changes.push(event.detail) },
    );
    expect(press(dial(root), 'a').defaultPrevented).toBe(false);
    expect(changes).toEqual([]);
  });

  it('sets the day from a press on the ring, on the nearest day that has it', async () => {
    const changes: { day: number }[] = [];
    const { root } = await mountWidget(
      'moon-dial',
      { date: '2026-11-17' },
      { change: (event) => changes.push(event.detail) },
    );
    const ring = dial(root);
    ring.getBoundingClientRect = () => new DOMRect(0, 0, 200, 200);
    const at = (clientX: number, clientY: number, type = 'pointerdown', buttons = 1) => {
      ring.dispatchEvent(new MouseEvent(type, { clientX, clientY, buttons, bubbles: true }));
    };
    at(200, 100);
    expect(changes).toEqual([]);
    at(100, 200);
    expect(changes.at(-1)?.day).toBe(16);
    at(100, 0);
    expect(changes.at(-1)?.day).toBe(1);
    const count = changes.length;
    at(100, 0);
    expect(changes).toHaveLength(count);
    at(0, 100, 'pointermove', 1);
    expect(changes.at(-1)?.day).toBe(23);
    at(100, 200, 'pointermove', 0);
    expect(changes).toHaveLength(count + 1);
  });

  it('turns the moon over for the other hemisphere, by the attribute and by the button', async () => {
    const { root } = await mountWidget('moon-dial', { date: '2026-11-17' });
    const disc = root.querySelector<HTMLElement>('.disc')!;
    const north = disc.style.getPropertyValue('--right');
    expect(button(root, 'Hemisphere, now northern').textContent).toBe('N');
    button(root, 'Hemisphere, now northern').click();
    expect(button(root, 'Hemisphere, now southern').textContent).toBe('S');
    expect(disc.style.getPropertyValue('--left')).toBe(north);
    const south = await mountWidget('moon-dial', { date: '2026-11-17', hemisphere: 'South' });
    expect(button(south.root, 'Hemisphere, now southern')).not.toBeNull();
    const other = await mountWidget('moon-dial', { hemisphere: 'sideways' });
    expect(button(other.root, 'Hemisphere, now northern')).not.toBeNull();
  });

  it('draws a quarter with the terminator near the middle and a full moon with none', async () => {
    const quarter = await mountWidget('moon-dial', { date: '2000-01-13' });
    const full = await mountWidget('moon-dial', { date: '2000-01-21' });
    const inset = (root: ShadowRoot) =>
      root.querySelector<HTMLElement>('.disc')!.style.getPropertyValue('--inset');
    expect(Number.parseFloat(inset(quarter.root))).toBeGreaterThan(40);
    expect(Number.parseFloat(inset(full.root))).toBeLessThan(2);
  });

  it('follows a change of the date attribute', async () => {
    const { element, root } = await mountWidget('moon-dial', { date: '2026-11-17' });
    button(root, 'Next day').click();
    element.setAttribute('date', '2026-12-01');
    await vi.advanceTimersByTimeAsync(0);
    expect(name(root)).toBe(moonOn(new Date(2026, 11, 1)).phase);
  });

  it('moves the terminator and the handle only where motion is allowed', async () => {
    const { element } = await mountWidget('moon-dial');
    const sheet = element.shadowRoot?.adoptedStyleSheets[0];
    const rules = [...(sheet?.cssRules ?? [])];
    const outside = rules.filter((rule) => !rule.cssText.startsWith('@media'));
    expect(outside.every((rule) => !/transition|animation/.test(rule.cssText))).toBe(true);
    expect(
      rules.some(
        (rule) => rule.cssText.includes('no-preference') && rule.cssText.includes('inset'),
      ),
    ).toBe(true);
  });
});
