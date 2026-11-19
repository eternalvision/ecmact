import { afterEach, describe, expect, it } from 'vitest';
import { create } from '@site/demos/setlist';

afterEach(() => {
  document.body.replaceChildren();
});

const open = () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  const root = demo.shadowRoot!;
  const rows = () => [...root.querySelectorAll<HTMLElement>('ol > li')];
  const titles = () => rows().map((row) => row.querySelector('.title')?.textContent);
  const button = (label: string) =>
    root.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
  const sum = () => root.querySelector('.total')!.textContent;
  const add = (title: string, minutes: string) => {
    const [name, length] = [...root.querySelectorAll<HTMLInputElement>('form input')];
    name!.value = title;
    name!.dispatchEvent(new Event('input'));
    length!.value = minutes;
    length!.dispatchEvent(new Event('input'));
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  };
  return { root, rows, titles, button, sum, add };
};

describe('setlist example', () => {
  it('lists the songs in order with their total and the curfew', () => {
    const { titles, sum, root } = open();
    expect(titles()).toEqual(['Opening drone', 'Harbour lights', 'The long one', 'Encore, maybe']);
    expect(sum()).toBe("SET 26' · CURFEW 45'");
    expect(root.querySelector('.sum')?.classList.contains('over')).toBe(false);
  });

  it('moves a row as the same node, keeps its focus and computes only the total again', () => {
    const { rows, titles, button, root, sum } = open();
    const [first, second] = rows();
    const total = root.querySelector('.total')!;
    const before = total.textContent;
    const down = button('Move Opening drone down');
    down.focus();
    expect(root.activeElement).toBe(down);
    down.click();
    expect(titles().slice(0, 2)).toEqual(['Harbour lights', 'Opening drone']);
    expect(rows()[0]).toBe(second);
    expect(rows()[1]).toBe(first);
    expect(root.activeElement).toBe(down);
    expect(sum()).toBe(before);
  });

  it('does not move the first row up or the last row down', () => {
    const { titles, button } = open();
    button('Move Opening drone up').click();
    button('Move Encore, maybe down').click();
    expect(titles()).toEqual(['Opening drone', 'Harbour lights', 'The long one', 'Encore, maybe']);
  });

  it('strikes a song that was played and takes it back', () => {
    const { rows, button } = open();
    const played = button('Played The long one');
    played.click();
    expect(rows()[2]?.classList.contains('played')).toBe(true);
    expect(button('Played The long one').getAttribute('aria-pressed')).toBe('true');
    button('Played The long one').click();
    expect(rows()[2]?.classList.contains('played')).toBe(false);
  });

  it('adds a song, ignores an empty title and a length that is not a number', () => {
    const { titles, sum, add } = open();
    add('  Soundcheck jam ', '8');
    expect(titles().at(-1)).toBe('Soundcheck jam');
    expect(sum()).toBe("SET 34' · CURFEW 45'");
    add('   ', '4');
    add('No length', '');
    expect(titles()).toHaveLength(5);
  });

  it('warns when the set runs past the curfew, and moves the curfew', () => {
    const { root, sum, button, add } = open();
    add('Long drone', '30');
    expect(sum()).toBe("SET 56' · CURFEW 45' · OVER BY 11'");
    expect(root.querySelector('.sum')?.classList.contains('over')).toBe(true);
    Array.from({ length: 3 }, () => button('Curfew 5 minutes later').click());
    expect(sum()).toBe("SET 56' · CURFEW 60'");
    Array.from({ length: 20 }, () => button('Curfew 5 minutes earlier').click());
    expect(sum()).toContain("CURFEW 5'");
  });

  it('shows an empty state after the last song is removed', () => {
    const { rows, titles, button } = open();
    ['Opening drone', 'Harbour lights', 'The long one', 'Encore, maybe'].forEach((title) =>
      button(`Remove ${title}`).click(),
    );
    expect(rows().map((row) => row.textContent)).toEqual(['The set list is empty. Add a song.']);
    expect(rows()[0]?.classList.contains('empty')).toBe(true);
    expect(titles()).toEqual([undefined]);
  });
});
