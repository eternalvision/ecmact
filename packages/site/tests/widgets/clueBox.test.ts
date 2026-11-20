import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineClueBox, parseAnswer } from '@site/widgets/clueBox';
import { mountWidget } from '@tests/widgets/helpers';

defineClueBox();

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

const cells = (root: ShadowRoot) => [...root.querySelectorAll<HTMLInputElement>('.cells input')];
const letters = (root: ShadowRoot) =>
  cells(root)
    .map((cell) => cell.value)
    .join('|');
const status = (root: ShadowRoot) => root.querySelector('.by')?.textContent;
const buttons = (root: ShadowRoot) => [...root.querySelectorAll<HTMLButtonElement>('.acts button')];
const check = (root: ShadowRoot) => buttons(root)[0]!;
const reveal = (root: ShadowRoot) => buttons(root)[1]!;
const marks = (root: ShadowRoot) =>
  cells(root)
    .map((cell) =>
      cell.classList.contains('good') ? 'g' : cell.classList.contains('wrong') ? 'w' : '-',
    )
    .join('');
const press = (target: Element, key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
};
/** Types a word cell by cell, from the first, as a visitor does. */
const type = (root: ShadowRoot, word: string) => {
  cells(root)[0]!.focus();
  [...word].forEach((letter) => press(root.activeElement!, letter));
};
const focused = (root: ShadowRoot) => cells(root).indexOf(root.activeElement as HTMLInputElement);

describe('parseAnswer', () => {
  it('keeps the letters, in capitals, and drops what is none', () => {
    expect(parseAnswer('pear')).toBe('PEAR');
    expect(parseAnswer(' Ice-cream 2 ')).toBe('ICECREAM');
    expect(parseAnswer('груша')).toBe('ГРУША');
  });

  it('holds at most twelve letters', () => {
    expect(parseAnswer('abcdefghijklmnop')).toBe('ABCDEFGHIJKL');
  });

  it('gives PEAR for a value with no letter in it', () => {
    ['', '123', '- -', undefined, null].forEach((value) => expect(parseAnswer(value)).toBe('PEAR'));
  });
});

describe('clue-box', () => {
  it('shows the clue, the count of letters and one empty cell for each', async () => {
    const { root, text } = await mountWidget('clue-box');
    expect(root.querySelector('.clue')?.textContent).toBe('Fruit that sounds like a couple (4)');
    expect(text()).toContain('Crossword clue · 4 letters');
    expect(cells(root)).toHaveLength(4);
    expect(cells(root).map((cell) => cell.getAttribute('aria-label'))).toEqual([
      'Letter 1 of 4',
      'Letter 2 of 4',
      'Letter 3 of 4',
      'Letter 4 of 4',
    ]);
    expect(root.querySelector('.cells')?.getAttribute('role')).toBe('group');
    expect(letters(root)).toBe('|||');
    expect(buttons(root).map((item) => item.textContent)).toEqual(['Check', 'Reveal']);
    expect(status(root)).toBe('Set by the host page through two attributes.');
  });

  it('says "letter" for an answer of one', async () => {
    const { text } = await mountWidget('clue-box', { answer: 'a' });
    expect(text()).toContain('Crossword clue · 1 letter');
  });

  it('takes the clue and the answer from its two attributes', async () => {
    const { root } = await mountWidget('clue-box', { clue: 'Capital of France', answer: 'paris' });
    expect(root.querySelector('.clue')?.textContent).toBe('Capital of France (5)');
    expect(cells(root)).toHaveLength(5);
  });

  it('puts a typed letter in capitals in the cell and moves to the next one', async () => {
    const { root } = await mountWidget('clue-box');
    type(root, 'pe');
    expect(letters(root)).toBe('P|E||');
    expect(focused(root)).toBe(2);
  });

  it('keeps one letter in a cell: a new letter replaces it', async () => {
    const { root } = await mountWidget('clue-box');
    cells(root)[1]!.focus();
    press(cells(root)[1]!, 'x');
    cells(root)[1]!.focus();
    press(cells(root)[1]!, 'y');
    expect(letters(root)).toBe('|Y||');
  });

  it('stays in the last cell when the last letter is typed', async () => {
    const { root } = await mountWidget('clue-box');
    type(root, 'xxxx');
    expect(focused(root)).toBe(3);
  });

  it('ignores a key that is no letter, and lets the browser keep its own shortcuts', async () => {
    const { root } = await mountWidget('clue-box');
    cells(root)[0]!.focus();
    for (const other of ['1', '-', ' ', '.', '#']) {
      expect(press(cells(root)[0]!, other).defaultPrevented, other).toBe(true);
    }
    expect(letters(root)).toBe('|||');
    expect(press(cells(root)[0]!, 'v', { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(press(cells(root)[0]!, 'Tab').defaultPrevented).toBe(false);
    expect(letters(root)).toBe('|||');
  });

  it('takes a letter that arrives by input, as a phone keyboard sends it, and drops anything else', async () => {
    const { root } = await mountWidget('clue-box');
    const input = (cell: HTMLInputElement, value: string) => {
      cell.value = value;
      cell.dispatchEvent(new Event('input', { bubbles: true }));
    };
    input(cells(root)[0]!, 'pq');
    expect(letters(root)).toBe('Q|||');
    expect(cells(root)[0]!.value).toBe('Q');
    input(cells(root)[1]!, '7');
    expect(letters(root)).toBe('Q|||');
    expect(cells(root)[1]!.value).toBe('');
    input(cells(root)[0]!, '');
    expect(letters(root)).toBe('|||');
  });

  it('moves between the cells with the arrows, Home and End, and stops at the ends', async () => {
    const { root } = await mountWidget('clue-box');
    cells(root)[1]!.focus();
    press(cells(root)[1]!, 'ArrowRight');
    expect(focused(root)).toBe(2);
    press(cells(root)[2]!, 'ArrowLeft');
    press(cells(root)[1]!, 'ArrowLeft');
    expect(focused(root)).toBe(0);
    press(cells(root)[0]!, 'ArrowLeft');
    expect(focused(root)).toBe(0);
    press(cells(root)[0]!, 'End');
    expect(focused(root)).toBe(3);
    press(cells(root)[3]!, 'ArrowRight');
    expect(focused(root)).toBe(3);
    press(cells(root)[3]!, 'Home');
    expect(focused(root)).toBe(0);
  });

  it('clears the letter with Backspace, and from an empty cell goes back and clears the one before', async () => {
    const { root } = await mountWidget('clue-box');
    type(root, 'pea');
    expect(focused(root)).toBe(3);
    press(cells(root)[3]!, 'Backspace');
    expect(letters(root)).toBe('P|E||');
    expect(focused(root)).toBe(2);
    cells(root)[1]!.focus();
    press(cells(root)[1]!, 'Backspace');
    expect(letters(root)).toBe('P|||');
    expect(focused(root)).toBe(1);
    press(cells(root)[1]!, 'Backspace');
    expect(letters(root)).toBe('|||');
    expect(focused(root)).toBe(0);
  });

  it('does nothing for Backspace in the first empty cell', async () => {
    const { root } = await mountWidget('clue-box');
    cells(root)[0]!.focus();
    press(cells(root)[0]!, 'Backspace');
    expect(focused(root)).toBe(0);
    expect(letters(root)).toBe('|||');
  });

  it('is solved by the right word, and says so once', async () => {
    const solved: unknown[] = [];
    const { root } = await mountWidget(
      'clue-box',
      {},
      { solved: (event) => solved.push(event.detail) },
    );
    type(root, 'pear');
    expect(solved).toEqual([{ answer: 'PEAR' }]);
    expect(marks(root)).toBe('gggg');
    expect(status(root)).toBe('Solved.');
    check(root).click();
    check(root).click();
    press(cells(root)[3]!, 'ArrowLeft');
    cells(root)[3]!.focus();
    press(cells(root)[3]!, 'r');
    expect(solved).toHaveLength(1);
    expect(status(root)).toBe('Solved.');
  });

  it('says it again only when the answer stops being right and becomes right again', async () => {
    const solved: unknown[] = [];
    const { root } = await mountWidget(
      'clue-box',
      {},
      { solved: (event) => solved.push(event.detail) },
    );
    type(root, 'pear');
    cells(root)[3]!.focus();
    press(cells(root)[3]!, 'Backspace');
    expect(marks(root)).toBe('----');
    expect(status(root)).toBe('Set by the host page through two attributes.');
    press(cells(root)[3]!, 'r');
    expect(solved).toHaveLength(2);
  });

  it('does not say it is solved for a wrong word', async () => {
    const solved: unknown[] = [];
    const { root } = await mountWidget(
      'clue-box',
      {},
      { solved: (event) => solved.push(event.detail) },
    );
    type(root, 'peat');
    expect(solved).toEqual([]);
  });

  it('marks a wrong letter by colour and by text, without showing the right one', async () => {
    const { root } = await mountWidget('clue-box');
    type(root, 'peat');
    check(root).click();
    expect(marks(root)).toBe('gggw');
    const wrong = cells(root)[3]!;
    expect(wrong.getAttribute('aria-invalid')).toBe('true');
    expect(wrong.getAttribute('aria-label')).toBe('Letter 4 of 4, wrong');
    expect(cells(root)[0]!.getAttribute('aria-label')).toBe('Letter 1 of 4, right');
    expect(status(root)).toBe('Letter 4 is wrong.');
    expect(letters(root)).toBe('P|E|A|T');
    expect(root.innerHTML).not.toMatch(/PEAR/);
  });

  it('names several wrong letters, and tells when the word is right so far', async () => {
    const { root } = await mountWidget('clue-box');
    type(root, 'tex');
    check(root).click();
    expect(marks(root)).toBe('wgw-');
    expect(status(root)).toBe('Letters 1, 3 are wrong.');
    cells(root)[0]!.focus();
    press(cells(root)[0]!, 'p');
    press(cells(root)[2]!, 'a');
    check(root).click();
    expect(marks(root)).toBe('ggg-');
    expect(status(root)).toBe('3 of 4 letters filled, none wrong so far.');
  });

  it('asks for a letter when the cells are empty', async () => {
    const { root } = await mountWidget('clue-box');
    check(root).click();
    expect(status(root)).toBe('Type a letter first.');
    expect(marks(root)).toBe('----');
  });

  it('takes the mark off a cell when the letter in it changes', async () => {
    const { root } = await mountWidget('clue-box');
    type(root, 'peat');
    check(root).click();
    cells(root)[3]!.focus();
    press(cells(root)[3]!, 'r');
    expect(marks(root)).toBe('gggg');
    cells(root)[1]!.focus();
    press(cells(root)[1]!, 'x');
    expect(marks(root)).toBe('----');
  });

  it('shows the answer on request, locks the cells and does not call it solved', async () => {
    const solved: unknown[] = [];
    const { root } = await mountWidget(
      'clue-box',
      {},
      { solved: (event) => solved.push(event.detail) },
    );
    reveal(root).click();
    expect(letters(root)).toBe('P|E|A|R');
    expect(cells(root).every((cell) => cell.readOnly)).toBe(true);
    expect(status(root)).toBe('The answer is shown.');
    expect(buttons(root).every((item) => item.disabled)).toBe(true);
    cells(root)[0]!.focus();
    press(cells(root)[0]!, 'x');
    press(cells(root)[0]!, 'Backspace');
    cells(root)[0]!.dispatchEvent(new Event('input', { bubbles: true }));
    expect(letters(root)).toBe('P|E|A|R');
    expect(solved).toEqual([]);
  });

  it('starts again when the answer or the clue changes', async () => {
    const { element, root } = await mountWidget('clue-box');
    type(root, 'pea');
    element.setAttribute('answer', 'plum');
    await vi.advanceTimersByTimeAsync(0);
    expect(letters(root)).toBe('|||');
    element.setAttribute('answer', 'fig');
    await vi.advanceTimersByTimeAsync(0);
    expect(cells(root)).toHaveLength(3);
    element.setAttribute('clue', 'Dried, in a roll');
    await vi.advanceTimersByTimeAsync(0);
    expect(root.querySelector('.clue')?.textContent).toBe('Dried, in a roll (3)');
  });

  it('flips and shakes only inside a block for no-preference, and shows the marks at once', async () => {
    const { element } = await mountWidget('clue-box');
    const rules = [...(element.shadowRoot?.adoptedStyleSheets[0]?.cssRules ?? [])];
    const outside = rules.filter((rule) => !rule.cssText.startsWith('@media'));
    expect(outside.every((rule) => !/transition|animation/.test(rule.cssText))).toBe(true);
    expect(rules.some((rule) => rule.cssText.includes('no-preference'))).toBe(true);
    expect(
      outside.some((rule) => /\.wrong/.test(rule.cssText) && /#fb7185/i.test(rule.cssText)),
    ).toBe(true);
  });

  it('leaves no timer, and starts clean when it is removed and put back', async () => {
    const { element, root } = await mountWidget('clue-box');
    type(root, 'pea');
    element.remove();
    await vi.advanceTimersByTimeAsync(0);
    document.body.append(element);
    await vi.advanceTimersByTimeAsync(0);
    expect(letters(element.shadowRoot as ShadowRoot)).toBe('|||');
    expect(vi.getTimerCount()).toBe(0);
  });
});
