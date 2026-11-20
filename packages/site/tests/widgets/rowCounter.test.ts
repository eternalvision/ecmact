import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineRowCounter } from '@site/widgets/rowCounter';
import { mountWidget } from '@tests/widgets/helpers';

defineRowCounter();

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.replaceChildren();
  localStorage.clear();
});

const big = (root: ShadowRoot) => root.querySelector<HTMLButtonElement>('.big')!;
const count = (root: ShadowRoot) => root.querySelector('.big b')?.textContent;
const undo = (root: ShadowRoot) => root.querySelector<HTMLButtonElement>('.undo')!;
const dots = (root: ShadowRoot) => [...root.querySelectorAll('.repeat i')];

describe('row-counter', () => {
  it('is one round button that adds a row, with the count in its name', async () => {
    const { root, text } = await mountWidget('row-counter');
    expect(text()).toContain('Pattern');
    expect(count(root)).toBe('0');
    expect(big(root).getAttribute('aria-label')).toBe('Add a row, now row 0');
    big(root).click();
    big(root).click();
    expect(count(root)).toBe('2');
    expect(big(root).getAttribute('aria-label')).toBe('Add a row, now row 2');
  });

  it('takes a row back, never below zero', async () => {
    const { root } = await mountWidget('row-counter');
    expect(undo(root).disabled).toBe(true);
    big(root).click();
    expect(undo(root).disabled).toBe(false);
    undo(root).click();
    expect(count(root)).toBe('0');
    expect(undo(root).disabled).toBe(true);
  });

  it('says each change with the pattern and the count', async () => {
    const rows: unknown[] = [];
    const { root } = await mountWidget(
      'row-counter',
      { pattern: 'Raglan sleeve' },
      { row: (event) => rows.push(event.detail) },
    );
    big(root).click();
    undo(root).click();
    expect(rows).toEqual([
      { pattern: 'Raglan sleeve', count: 1 },
      { pattern: 'Raglan sleeve', count: 0 },
    ]);
  });

  it('keeps the count for each pattern across a reload', async () => {
    const first = await mountWidget('row-counter', { pattern: 'Sleeve' });
    big(first.root).click();
    big(first.root).click();
    const other = await mountWidget('row-counter', { pattern: 'Hat' });
    big(other.root).click();
    document.body.replaceChildren();
    await vi.advanceTimersByTimeAsync(0);
    const again = await mountWidget('row-counter', { pattern: 'Sleeve' });
    expect(count(again.root)).toBe('2');
    const hat = await mountWidget('row-counter', { pattern: 'Hat' });
    expect(count(hat.root)).toBe('1');
    expect(localStorage.getItem('ecmact-row-counter:Sleeve')).toBe('2');
  });

  it('follows a change of the pattern attribute with the count kept for it', async () => {
    localStorage.setItem('ecmact-row-counter:Hat', '9');
    const { element, root } = await mountWidget('row-counter', { pattern: 'Sleeve' });
    element.setAttribute('pattern', 'Hat');
    await vi.advanceTimersByTimeAsync(0);
    expect(count(root)).toBe('9');
    element.setAttribute('pattern', '  ');
    await vi.advanceTimersByTimeAsync(0);
    expect(root.querySelector('.top span')?.textContent).toBe('Pattern');
  });

  it('starts from zero for a kept value that is not a whole count', async () => {
    for (const kept of ['abc', '-3', '', '1e999']) {
      localStorage.setItem('ecmact-row-counter:Pattern', kept);
      const { root } = await mountWidget('row-counter');
      expect(count(root)).toBe(kept === '1e999' ? '1' : '0');
      document.body.replaceChildren();
    }
  });

  it('works for the visit when the storage throws', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    });
    const { root } = await mountWidget('row-counter');
    expect(count(root)).toBe('0');
    big(root).click();
    big(root).click();
    expect(count(root)).toBe('2');
  });

  it('shows no repeat for the default, 0, a negative or a malformed value', async () => {
    for (const repeat of [undefined, '0', '-2', 'six', '']) {
      const { root, text } = await mountWidget(
        'row-counter',
        repeat === undefined ? {} : { repeat },
      );
      expect(root.querySelector('.repeat')).toBeNull();
      expect(text()).not.toContain('Repeat');
      document.body.replaceChildren();
    }
  });

  it('shows the position in a repeat, which restarts after the last row', async () => {
    const { root, text } = await mountWidget('row-counter', { repeat: '3' });
    expect(dots(root)).toHaveLength(3);
    expect(root.querySelector('.repeat')?.getAttribute('aria-label')).toBe(
      'Row 0 of a repeat of 3',
    );
    expect(text()).toContain('Repeat 1 · next starts at row 4');
    big(root).click();
    big(root).click();
    expect(dots(root).map((dot) => dot.classList.contains('on'))).toEqual([true, true, false]);
    expect(root.querySelector('.repeat')?.getAttribute('aria-label')).toBe(
      'Row 2 of a repeat of 3',
    );
    big(root).click();
    expect(dots(root).some((dot) => dot.classList.contains('on'))).toBe(false);
    expect(text()).toContain('Repeat 2 · next starts at row 7');
  });

  it('shows at most 24 dots for a long repeat and a whole number for a fraction', async () => {
    const long = await mountWidget('row-counter', { repeat: '500' });
    expect(dots(long.root)).toHaveLength(24);
    const fraction = await mountWidget('row-counter', { repeat: '2.9' });
    expect(dots(fraction.root)).toHaveLength(2);
  });

  it('works from the keyboard because the counter is a native button with a visible focus ring', async () => {
    const { root, element } = await mountWidget('row-counter');
    expect(big(root).tagName).toBe('BUTTON');
    expect(big(root).type).toBe('button');
    const sheet = element.shadowRoot?.adoptedStyleSheets[0];
    const rules = [...(sheet?.cssRules ?? [])].map((rule) => rule.cssText).join(' ');
    expect(rules).toContain('focus-visible');
  });

  it('springs only where motion is allowed', async () => {
    const { element } = await mountWidget('row-counter');
    const sheet = element.shadowRoot?.adoptedStyleSheets[0];
    const rules = [...(sheet?.cssRules ?? [])];
    const outside = rules.filter((rule) => !rule.cssText.startsWith('@media'));
    expect(outside.every((rule) => !/transition|animation/.test(rule.cssText))).toBe(true);
    expect(rules.some((rule) => rule.cssText.includes('no-preference'))).toBe(true);
  });

  it('starts clean when it is taken out and put back', async () => {
    const { element, root } = await mountWidget('row-counter');
    big(root).click();
    element.remove();
    await vi.advanceTimersByTimeAsync(0);
    document.body.append(element);
    await vi.advanceTimersByTimeAsync(0);
    expect(count(root)).toBe('1');
    expect(vi.getTimerCount()).toBe(0);
  });
});
