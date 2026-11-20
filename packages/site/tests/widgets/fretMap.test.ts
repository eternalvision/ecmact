import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defineFretMap,
  noteNames,
  parseKey,
  parseScale,
  parseTuning,
  scaleNotes,
} from '@site/widgets/fretMap';
import { mountWidget } from '@tests/widgets/helpers';

defineFretMap();

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

const title = (root: ShadowRoot) => root.querySelector('.head b')?.textContent;
const subtitle = (root: ShadowRoot) => root.querySelector('.head span')?.textContent;
const chips = (root: ShadowRoot) => [...root.querySelectorAll<HTMLButtonElement>('.keys button')];
const pressed = (root: ShadowRoot) =>
  chips(root)
    .filter((chip) => chip.getAttribute('aria-pressed') === 'true')
    .map((chip) => chip.textContent);
const select = (root: ShadowRoot) => root.querySelector<HTMLSelectElement>('.keys select')!;
/** The notes that are marked, as text, string by string from the highest. */
const board = (root: ShadowRoot) =>
  [...root.querySelectorAll('.board > div')].map(
    (cell) => cell.querySelector('b')?.textContent ?? '',
  );
const marked = (root: ShadowRoot) => [...new Set(board(root).filter(Boolean))].sort();
const roots = (root: ShadowRoot) =>
  [...root.querySelectorAll('.board b.root')].map((note) => note.textContent);
const labels = (root: ShadowRoot) =>
  [...root.querySelectorAll('.board > span')].map((label) => label.textContent);

describe('the readers of the attributes', () => {
  it('reads a key by its letter, a sharp or a flat, in either case', () => {
    expect(parseKey('A')).toBe(9);
    expect(parseKey(' c# ')).toBe(1);
    expect(parseKey('Bb')).toBe(10);
    expect(parseKey('eb')).toBe(3);
  });

  it('falls back to A for a key that is none', () => {
    ['', 'H', 'A##', 'minor', undefined, null].forEach((value) => expect(parseKey(value)).toBe(9));
  });

  it('reads a scale by its id or its name, and falls back to the pentatonic', () => {
    expect(parseScale('major')).toBe('major');
    expect(parseScale(' Minor Pentatonic ')).toBe('pentatonic');
    expect(parseScale('blues')).toBe('blues');
    ['', 'dorian', undefined, null].forEach((value) =>
      expect(parseScale(value)).toBe('pentatonic'),
    );
  });

  it('reads a tuning by its id, and falls back to the standard one', () => {
    expect(parseTuning('drop-d')).toBe('drop-d');
    expect(parseTuning('DADGAD')).toBe('dadgad');
    ['', 'banjo', undefined, null].forEach((value) => expect(parseTuning(value)).toBe('standard'));
  });

  it('lists the notes of a scale from its key', () => {
    expect(scaleNotes(9, 'pentatonic').map((note) => noteNames[note])).toEqual([
      'A',
      'C',
      'D',
      'E',
      'G',
    ]);
    expect(scaleNotes(0, 'major').map((note) => noteNames[note])).toEqual([
      'C',
      'D',
      'E',
      'F',
      'G',
      'A',
      'B',
    ]);
  });
});

describe('fret-map', () => {
  it('shows A minor pentatonic in standard tuning by default, with the root marked', async () => {
    const { root, text } = await mountWidget('fret-map');
    expect(title(root)).toBe('A minor pentatonic');
    expect(subtitle(root)).toBe('standard tuning · frets 0 to 8');
    expect(marked(root)).toEqual(['A', 'C', 'D', 'E', 'G']);
    expect(roots(root)).toEqual(['A', 'A', 'A', 'A', 'A']);
    expect(labels(root)).toEqual(['e', 'B', 'G', 'D', 'A', 'E']);
    expect(text()).toContain('root');
    expect(pressed(root)).toEqual(['A']);
    expect(select(root).value).toBe('pentatonic');
  });

  it('draws the nut notes of the open strings and the notes of the first strings as the sheet does', async () => {
    const { root } = await mountWidget('fret-map');
    const cells = board(root);
    expect(cells).toHaveLength(54);
    expect(cells.slice(0, 9)).toEqual(['E', '', '', 'G', '', 'A', '', '', 'C']);
    expect(cells.slice(36, 45)).toEqual(['A', '', '', 'C', '', 'D', '', 'E', '']);
    expect(root.querySelectorAll('.board > div.nut')).toHaveLength(6);
  });

  it('marks the notes of the key and the scale that the attributes choose', async () => {
    const { root } = await mountWidget('fret-map', { key: 'D', scale: 'major' });
    expect(title(root)).toBe('D major');
    expect(marked(root)).toEqual(['A', 'B', 'C#', 'D', 'E', 'F#', 'G']);
    expect(pressed(root)).toEqual(['D']);
    expect(select(root).value).toBe('major');
  });

  it('follows the tuning', async () => {
    const { root } = await mountWidget('fret-map', { tuning: 'drop-d' });
    expect(subtitle(root)).toBe('drop D tuning · frets 0 to 8');
    expect(labels(root)).toEqual(['e', 'B', 'G', 'D', 'A', 'D']);
    expect(board(root).slice(45, 46)).toEqual(['D']);
  });

  it('moves the marks when a key chip is pressed, and says so', async () => {
    const changes: unknown[] = [];
    const { root } = await mountWidget(
      'fret-map',
      {},
      { change: (event) => changes.push(event.detail) },
    );
    chips(root)[2]!.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(title(root)).toBe('D minor pentatonic');
    expect(pressed(root)).toEqual(['D']);
    expect(marked(root)).toEqual(['A', 'C', 'D', 'F', 'G']);
    expect(changes).toEqual([
      { key: 'D', scale: 'pentatonic', tuning: 'standard', notes: ['D', 'F', 'G', 'A', 'C'] },
    ]);
  });

  it('moves the marks when another scale is chosen, and says so', async () => {
    const changes: unknown[] = [];
    const { root } = await mountWidget(
      'fret-map',
      {},
      { change: (event) => changes.push(event.detail) },
    );
    select(root).value = 'blues';
    select(root).dispatchEvent(new Event('change', { bubbles: true }));
    await vi.advanceTimersByTimeAsync(0);
    expect(title(root)).toBe('A blues');
    expect(marked(root)).toEqual(['A', 'C', 'D', 'D#', 'E', 'G']);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ key: 'A', scale: 'blues' });
  });

  it('ignores a scale that the list does not hold', async () => {
    const { root } = await mountWidget('fret-map', { scale: 'major' });
    const odd = document.createElement('option');
    odd.value = 'dorian';
    select(root).append(odd);
    select(root).value = 'dorian';
    select(root).dispatchEvent(new Event('change', { bubbles: true }));
    await vi.advanceTimersByTimeAsync(0);
    expect(title(root)).toBe('A major');
  });

  it('shows a key from outside the chips as a pressed chip of its own', async () => {
    const { root } = await mountWidget('fret-map', { key: 'f#' });
    expect(chips(root).map((chip) => chip.textContent)).toEqual(['A', 'C', 'D', 'E', 'G', 'F#']);
    expect(pressed(root)).toEqual(['F#']);
    expect(title(root)).toBe('F# minor pentatonic');
  });

  it('takes a whole preset: the key and the scale change in one update', async () => {
    const { element, root } = await mountWidget('fret-map', { key: 'C', scale: 'major' });
    expect(title(root)).toBe('C major');
    const seen: MutationRecord[] = [];
    const watcher = new MutationObserver((records) => seen.push(...records));
    watcher.observe(root.querySelector('.head b')!, {
      childList: true,
      characterData: true,
      subtree: true,
      characterDataOldValue: true,
    });
    element.setAttribute('preset', 'e-blues');
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(0);
    const records = [...seen, ...watcher.takeRecords()];
    expect(title(root)).toBe('E blues');
    expect(pressed(root)).toEqual(['E']);
    expect(select(root).value).toBe('blues');
    expect(marked(root)).toEqual(['A', 'A#', 'B', 'D', 'E', 'G']);
    /* One change of the title, never "E major" or "C blues" on the way. */
    expect(records.map((record) => record.oldValue ?? record.type)).toEqual(['C major']);
  });

  it('lets a preset win over the key and the scale, and ignores one it does not know', async () => {
    const strong = await mountWidget('fret-map', { preset: 'D-Minor', key: 'G', scale: 'major' });
    expect(title(strong.root)).toBe('D minor');
    document.body.replaceChildren();
    const odd = await mountWidget('fret-map', { preset: 'nonsense', key: 'G', scale: 'major' });
    expect(title(odd.root)).toBe('G major');
  });

  it('takes the choice of the attributes back when an attribute changes after a visitor chose', async () => {
    const { element, root } = await mountWidget('fret-map');
    chips(root)[1]!.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(title(root)).toBe('C minor pentatonic');
    element.setAttribute('key', 'G');
    await vi.advanceTimersByTimeAsync(0);
    expect(title(root)).toBe('G minor pentatonic');
    element.removeAttribute('key');
    await vi.advanceTimersByTimeAsync(0);
    expect(title(root)).toBe('A minor pentatonic');
  });

  it('falls back to the default for an unknown key, scale or tuning', async () => {
    const { root } = await mountWidget('fret-map', { key: 'Q', scale: 'lydian', tuning: 'banjo' });
    expect(title(root)).toBe('A minor pentatonic');
    expect(subtitle(root)).toBe('standard tuning · frets 0 to 8');
    expect(marked(root)).toEqual(['A', 'C', 'D', 'E', 'G']);
  });

  it('names the board for a screen reader with the notes, and gives every chip a state', async () => {
    const { root } = await mountWidget('fret-map');
    const label = root.querySelector('.board')?.getAttribute('aria-label');
    expect(label).toBe('A minor pentatonic on frets 0 to 8: A, C, D, E, G');
    expect(root.querySelector('.board')?.getAttribute('role')).toBe('img');
    expect(chips(root).every((chip) => chip.hasAttribute('aria-pressed'))).toBe(true);
    expect(select(root).getAttribute('aria-label')).toBe('Scale');
  });

  it('gives each note the place of its fret, so that the notes pop in fret by fret', async () => {
    const { root } = await mountWidget('fret-map');
    const first = root.querySelector<HTMLElement>('.board > div:nth-of-type(4) b')!;
    expect(first.style.getPropertyValue('--i')).toBe('3');
  });

  it('shows every note at once and animates only inside a block for no-preference', async () => {
    const { element } = await mountWidget('fret-map');
    const rules = [...(element.shadowRoot?.adoptedStyleSheets[0]?.cssRules ?? [])];
    const outside = rules.filter((rule) => !rule.cssText.startsWith('@media'));
    expect(outside.every((rule) => !/transition|animation/.test(rule.cssText))).toBe(true);
    expect(rules.some((rule) => rule.cssText.includes('no-preference'))).toBe(true);
  });

  it('leaves no timer and starts clean when it is removed and put back', async () => {
    const { element, root } = await mountWidget('fret-map');
    chips(root)[1]!.click();
    element.remove();
    await vi.advanceTimersByTimeAsync(0);
    document.body.append(element);
    await vi.advanceTimersByTimeAsync(0);
    expect(title(element.shadowRoot as ShadowRoot)).toBe('A minor pentatonic');
    expect(vi.getTimerCount()).toBe(0);
  });
});
