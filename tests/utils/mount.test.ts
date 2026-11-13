import { afterEach, describe, expect, it } from 'vitest';
import { em, mount, signal, tags } from '@em';

afterEach(() => {
  document.body.replaceChildren();
});

describe('mount', () => {
  it('mounts into a selector', () => {
    const card = em.Card('x');
    mount('body', card);
    expect(document.body.contains(card)).toBe(true);
  });

  it('mounts into an element and returns it', () => {
    const container = document.createElement('main');
    expect(mount(container, tags.p(), tags.p())).toBe(container);
    expect(container.children).toHaveLength(2);
  });

  it('takes any children, reactive ones included', () => {
    const name = signal('Ada');
    const container = document.createElement('main');
    mount(container, 'Hello, ', name, [tags.b('!')]);
    name.value = 'Grace';
    expect(container.innerHTML).toBe('Hello, Grace<b>!</b>');
  });

  it('throws when the target is missing', () => {
    expect(() => mount('#missing', tags.p())).toThrow('mount target "#missing" not found');
  });
});
