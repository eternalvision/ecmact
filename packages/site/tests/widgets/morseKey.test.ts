import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { decode, defineMorseKey, unitMs } from '@site/widgets/morseKey';
import { mountWidget } from '@tests/widgets/helpers';

defineMorseKey();

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

/** At the default 12 words a minute one unit is 100 ms: a press of 200 ms or more is a dash, a pause of 300 ms ends a letter. */
const unit = 100;

const key = (root: ShadowRoot) => root.querySelector<HTMLButtonElement>('.key')!;
const out = (root: ShadowRoot) => root.querySelector('.out')?.textContent;
const status = (root: ShadowRoot) => root.querySelector('[role="status"]')?.textContent;
const marks = (root: ShadowRoot) =>
  [...root.querySelectorAll('.tape i')].map((mark) =>
    mark.classList.contains('dash') ? '-' : '.',
  );
const pointer = (target: Element, type: string, init: PointerEventInit = {}) =>
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, ...init }));
const keyboard = (target: Element, type: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent(type, { bubbles: true, cancelable: true, key: ' ', ...init });
  target.dispatchEvent(event);
  return event;
};

/** Holds the key with the pointer for a time, and lets go. */
const tap = async (root: ShadowRoot, ms: number) => {
  pointer(key(root), 'pointerdown');
  await vi.advanceTimersByTimeAsync(ms);
  pointer(key(root), 'pointerup');
};

describe('decode and unitMs', () => {
  it('reads the letters and the digits of the International Morse code', () => {
    expect(decode('.')).toBe('E');
    expect(decode('-.-.')).toBe('C');
    expect(decode('--')).toBe('M');
    expect(decode('.----')).toBe('1');
    expect(decode('-----')).toBe('0');
  });

  it('gives nothing for a pattern that is not a letter', () => {
    expect(decode('......')).toBe('');
    expect(decode('')).toBe('');
  });

  it('takes the unit from the speed: 1200 ms divided by the words a minute', () => {
    expect(unitMs(12)).toBe(100);
    expect(unitMs(20)).toBe(60);
  });
});

describe('morse-key', () => {
  it('shows a key, an empty tape and the hint with the speed', async () => {
    const { root, text } = await mountWidget('morse-key');
    expect(key(root).textContent).toBe('Hold to send');
    expect(text()).toContain('12 words a minute');
    expect(marks(root)).toEqual([]);
    expect(out(root)).toBe('');
  });

  it('turns a short press into a dot and a long press into a dash, by the pointer', async () => {
    const { root } = await mountWidget('morse-key');
    await tap(root, unit);
    await tap(root, 3 * unit);
    await tap(root, 2 * unit);
    expect(marks(root)).toEqual(['.', '-', '-']);
  });

  it('turns a short press into a dot and a long press into a dash, by the Space key', async () => {
    const { root } = await mountWidget('morse-key');
    keyboard(key(root), 'keydown');
    await vi.advanceTimersByTimeAsync(unit);
    keyboard(key(root), 'keyup');
    keyboard(key(root), 'keydown');
    await vi.advanceTimersByTimeAsync(3 * unit);
    keyboard(key(root), 'keyup');
    expect(marks(root)).toEqual(['.', '-']);
  });

  it('draws the held mark live, and makes it a dash once the press is long enough', async () => {
    const { root } = await mountWidget('morse-key');
    pointer(key(root), 'pointerdown');
    const live = () => root.querySelector('.tape i.live');
    expect(live()).not.toBeNull();
    expect(live()?.classList.contains('dash')).toBe(false);
    await vi.advanceTimersByTimeAsync(2 * unit - 1);
    expect(live()?.classList.contains('dash')).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(live()?.classList.contains('dash')).toBe(true);
    pointer(key(root), 'pointerup');
    expect(live()).toBeNull();
    expect(marks(root)).toEqual(['-']);
  });

  it('turns a pause into a letter and says it, in the output and for a screen reader', async () => {
    const letters: unknown[] = [];
    const { root } = await mountWidget(
      'morse-key',
      {},
      { letter: (event) => letters.push(event.detail) },
    );
    await tap(root, unit);
    await vi.advanceTimersByTimeAsync(3 * unit - 1);
    expect(out(root)).toBe('');
    await vi.advanceTimersByTimeAsync(1);
    expect(out(root)).toBe('E');
    expect(status(root)).toBe('Letter E');
    expect(letters).toEqual([{ pattern: '.', letter: 'E', message: 'E' }]);
  });

  it('keeps the dots and dashes of one letter together while the pauses are short', async () => {
    const { root } = await mountWidget('morse-key');
    await tap(root, 3 * unit);
    await vi.advanceTimersByTimeAsync(2 * unit);
    await tap(root, unit);
    await vi.advanceTimersByTimeAsync(2 * unit);
    await tap(root, 3 * unit);
    await vi.advanceTimersByTimeAsync(2 * unit);
    await tap(root, unit);
    await vi.advanceTimersByTimeAsync(3 * unit);
    expect(out(root)).toBe('C');
    expect(marks(root)).toEqual(['-', '.', '-', '.']);
  });

  it('spells a word, one letter after each pause', async () => {
    const { root } = await mountWidget('morse-key');
    const send = async (code: string) => {
      for (const mark of code) {
        await tap(root, mark === '.' ? unit : 3 * unit);
        await vi.advanceTimersByTimeAsync(unit);
      }
      await vi.advanceTimersByTimeAsync(3 * unit);
    };
    await send('.');
    await send('-.-.');
    await send('--');
    expect(out(root)).toBe('ECM');
  });

  it('keeps the last twelve letters of a long message', async () => {
    const { root } = await mountWidget('morse-key');
    for (let count = 0; count < 14; count++) {
      await tap(root, unit);
      await vi.advanceTimersByTimeAsync(3 * unit);
    }
    expect(out(root)).toBe('EEEEEEEEEEEE');
  });

  it('shows a pattern that is no letter as unknown, in the output and for a screen reader', async () => {
    const letters: unknown[] = [];
    const { root } = await mountWidget(
      'morse-key',
      {},
      { letter: (event) => letters.push(event.detail) },
    );
    for (const mark of '.-.-.-') {
      await tap(root, mark === '.' ? unit : 3 * unit);
      await vi.advanceTimersByTimeAsync(unit);
    }
    await vi.advanceTimersByTimeAsync(3 * unit);
    expect(out(root)).toBe('?');
    expect(status(root)).toBe('Unknown pattern: dot dash dot dash dot dash');
    expect(letters).toEqual([{ pattern: '.-.-.-', letter: '?', message: '?' }]);
  });

  it('ends a letter at once after eight marks, so that a pattern cannot grow without end', async () => {
    const { root } = await mountWidget('morse-key');
    for (let count = 0; count < 8; count++) await tap(root, unit);
    expect(out(root)).toBe('?');
  });

  it('ignores a key repeat while the key is held: the press keeps its first moment', async () => {
    const { root } = await mountWidget('morse-key');
    keyboard(key(root), 'keydown');
    await vi.advanceTimersByTimeAsync(150);
    const repeat = keyboard(key(root), 'keydown', { repeat: true });
    expect(repeat.defaultPrevented).toBe(true);
    await vi.advanceTimersByTimeAsync(100);
    keyboard(key(root), 'keyup');
    expect(marks(root)).toEqual(['-']);
  });

  it('ignores a second press while the key is already held', async () => {
    const { root } = await mountWidget('morse-key');
    pointer(key(root), 'pointerdown');
    await vi.advanceTimersByTimeAsync(150);
    keyboard(key(root), 'keydown');
    await vi.advanceTimersByTimeAsync(100);
    pointer(key(root), 'pointerup');
    expect(marks(root)).toEqual(['-']);
  });

  it('ends the press when the pointer leaves the key, and when it is cancelled', async () => {
    const { root } = await mountWidget('morse-key');
    pointer(key(root), 'pointerdown');
    await vi.advanceTimersByTimeAsync(3 * unit);
    pointer(key(root), 'pointerleave');
    expect(root.querySelector('.tape i.live')).toBeNull();
    expect(marks(root)).toEqual(['-']);
    pointer(key(root), 'pointerdown');
    await vi.advanceTimersByTimeAsync(unit);
    pointer(key(root), 'pointercancel');
    expect(marks(root)).toEqual(['-', '.']);
  });

  it('ends the press when the key loses the focus, and ignores a release with no press', async () => {
    const { root } = await mountWidget('morse-key');
    pointer(key(root), 'pointerup');
    keyboard(key(root), 'keyup');
    expect(marks(root)).toEqual([]);
    keyboard(key(root), 'keydown');
    await vi.advanceTimersByTimeAsync(unit);
    key(root).dispatchEvent(new FocusEvent('blur'));
    expect(marks(root)).toEqual(['.']);
  });

  it('answers only the main button of the pointer, and only the Space key', async () => {
    const { root } = await mountWidget('morse-key');
    pointer(key(root), 'pointerdown', { button: 2 });
    expect(root.querySelector('.tape i.live')).toBeNull();
    const other = keyboard(key(root), 'keydown', { key: 'a' });
    expect(other.defaultPrevented).toBe(false);
    expect(keyboard(key(root), 'keyup', { key: 'a' }).defaultPrevented).toBe(false);
    expect(root.querySelector('.tape i.live')).toBeNull();
  });

  it('does not open the context menu of a long touch on the key', async () => {
    const { root } = await mountWidget('morse-key');
    const event = new Event('contextmenu', { bubbles: true, cancelable: true });
    key(root).dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('follows the speed attribute: faster is shorter, and a malformed value is the default', async () => {
    const fast = await mountWidget('morse-key', { wpm: '20' });
    expect(fast.text()).toContain('20 words a minute');
    pointer(key(fast.root), 'pointerdown');
    await vi.advanceTimersByTimeAsync(120);
    pointer(key(fast.root), 'pointerup');
    expect(marks(fast.root)).toEqual(['-']);
    document.body.replaceChildren();
    await vi.advanceTimersByTimeAsync(0);
    for (const wpm of ['', 'quick', '0', '-3']) {
      const { text } = await mountWidget('morse-key', { wpm });
      expect(text(), wpm).toContain('12 words a minute');
      document.body.replaceChildren();
    }
    const clamped = await mountWidget('morse-key', { wpm: '500' });
    expect(clamped.text()).toContain('40 words a minute');
  });

  it('follows a change of the speed while it is on the page', async () => {
    const { element, root } = await mountWidget('morse-key');
    element.setAttribute('wpm', '24');
    await vi.advanceTimersByTimeAsync(0);
    expect(root.querySelector('.hint')?.textContent).toContain('24 words');
  });

  it('shows the new mark at once and moves only inside a block for no-preference', async () => {
    const { element } = await mountWidget('morse-key');
    const rules = [...(element.shadowRoot?.adoptedStyleSheets[0]?.cssRules ?? [])];
    const outside = rules.filter((rule) => !rule.cssText.startsWith('@media'));
    expect(outside.every((rule) => !/transition|animation/.test(rule.cssText))).toBe(true);
    expect(rules.some((rule) => rule.cssText.includes('no-preference'))).toBe(true);
  });

  it('leaves no timer when it is removed in the middle of a press, or of a pause, or put back', async () => {
    const { element, root } = await mountWidget('morse-key');
    pointer(key(root), 'pointerdown');
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    element.remove();
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(0);
    document.body.append(element);
    await vi.advanceTimersByTimeAsync(0);
    const again = element.shadowRoot as ShadowRoot;
    expect(marks(again)).toEqual([]);
    await tap(again, unit);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    element.remove();
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
