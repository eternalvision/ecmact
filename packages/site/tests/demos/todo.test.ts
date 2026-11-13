import { afterEach, describe, expect, it } from 'vitest';
import { create } from '@site/demos/todo';

afterEach(() => {
  document.body.replaceChildren();
});

const open = () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  const root = demo.shadowRoot!;
  const items = () => [...root.querySelectorAll('li')];
  const add = (text: string) => {
    const input = root.querySelector<HTMLInputElement>('input[placeholder]')!;
    input.value = text;
    input.dispatchEvent(new Event('input'));
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  };
  return { root, items, add };
};

describe('todo demo', () => {
  it('starts with two items, one of them done', () => {
    const { root, items } = open();
    expect(items()).toHaveLength(2);
    expect(items()[0]?.querySelector('span')?.className).toBe('done');
    expect(root.querySelector('small')?.textContent).toBe('1 left of 2');
  });

  it('adds an item and clears the field', () => {
    const { root, items, add } = open();
    add('  Write tests ');
    expect(items()).toHaveLength(3);
    expect(items()[2]?.textContent).toContain('Write tests');
    expect(root.querySelector<HTMLInputElement>('input[placeholder]')!.value).toBe('');
    expect(root.querySelector('small')?.textContent).toBe('2 left of 3');
  });

  it('ignores an empty item', () => {
    const { items, add } = open();
    add('   ');
    expect(items()).toHaveLength(2);
  });

  it('toggles and removes an item', () => {
    const { root, items } = open();
    const second = items()[1]!;
    second.querySelector<HTMLInputElement>('input')!.dispatchEvent(new Event('change'));
    expect(items()[1]?.querySelector('span')?.className).toBe('done');
    expect(root.querySelector('small')?.textContent).toBe('0 left of 2');
    items()[0]!.querySelector('button')!.click();
    expect(items()).toHaveLength(1);
  });
});
