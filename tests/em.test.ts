import { describe, expect, it } from 'vitest';
import { em } from '../src';

describe('em', () => {
  it('registers a lowercase custom element once per name', () => {
    em.Widget();
    em.Widget();
    expect(customElements.get('em-widget')).toBeDefined();
  });

  it('shares the element between different casings', () => {
    expect(em.Foo()).toBeInstanceOf(customElements.get('em-foo')!);
    expect(em.FOO()).toBeInstanceOf(customElements.get('em-foo')!);
  });

  it('returns undefined for symbols and then', () => {
    expect(Reflect.get(em, Symbol.toPrimitive)).toBeUndefined();
    expect((em as Record<string, unknown>).then).toBeUndefined();
  });

  it('is safe to await', async () => {
    await expect(Promise.resolve(em)).resolves.toBe(em);
  });

  it('rejects invalid component names', () => {
    expect(() => em['bad name']).toThrow(TypeError);
    expect(() => em['1abc']).toThrow('invalid component name');
  });
});
