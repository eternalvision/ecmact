import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { create } from '@site/demos/store';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  document.body.replaceChildren();
});

const open = () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  const root = demo.shadowRoot!;
  const notes = () => [...root.querySelectorAll('li')].map((li) => li.textContent);
  const add = (text: string) => {
    root.querySelector<HTMLInputElement>('input[placeholder]')!.value = text;
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  };
  return { root, notes, add };
};

describe('store demo', () => {
  it('starts with a note that explains itself', () => {
    const { notes, root } = open();
    expect(notes()).toEqual(['Reload the page: I will still be here']);
    expect(root.querySelector('small')?.textContent).toBe('1 saved in localStorage');
  });

  it('saves a note to localStorage and brings it back in a new instance', () => {
    const first = open();
    first.add(' Hello ');
    expect(first.notes()).toHaveLength(2);
    expect(JSON.parse(localStorage.getItem('ecmact-site-notes')!).state.notes).toContain('Hello');
    document.body.replaceChildren();
    expect(open().notes()).toContain('Hello');
  });

  it('ignores an empty note and clears all notes', () => {
    const { notes, add, root } = open();
    add('  ');
    expect(notes()).toHaveLength(1);
    root.querySelectorAll('button')[1]!.click();
    expect(notes()).toEqual([]);
    expect(root.querySelector('small')?.textContent).toBe('0 saved in localStorage');
  });
});
