import { afterEach, describe, expect, it } from 'vitest';
import { em, mount } from '../../src';

afterEach(() => {
  document.body.replaceChildren();
});

describe('mount', () => {
  it('mounts into a selector', () => {
    const card = em.Card({ content: 'x' });
    mount('body', card);
    expect(document.body.contains(card)).toBe(true);
  });

  it('mounts into an element and returns it', () => {
    const container = document.createElement('main');
    expect(mount(container, em.Card(), em.Card())).toBe(container);
    expect(container.children).toHaveLength(2);
  });

  it('throws when the target is missing', () => {
    expect(() => mount('#missing', em.Card())).toThrow('mount target "#missing" not found');
  });
});
