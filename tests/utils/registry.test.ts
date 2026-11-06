import { describe, expect, it } from 'vitest';
import { isComponent, registerComponent } from '@em/utils/registry';

describe('registry', () => {
  it('recognizes registered nodes', () => {
    const node = document.createElement('div');
    registerComponent(node);
    expect(isComponent(node)).toBe(true);
  });

  it('does not recognize other nodes', () => {
    expect(isComponent(document.createElement('div'))).toBe(false);
  });

  it('rejects values that are not objects', () => {
    expect(isComponent(null)).toBe(false);
    expect(isComponent(undefined)).toBe(false);
    expect(isComponent('div')).toBe(false);
    expect(isComponent(1)).toBe(false);
  });

  it('recognizes components created by the factories', async () => {
    const { em } = await import('@em');
    expect(isComponent(em.Card())).toBe(true);
  });
});
