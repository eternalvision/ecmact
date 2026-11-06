import { describe, expect, it } from 'vitest';
import { money, part, sheet, themeProperties } from '@site/widgets/kit';

describe('sheet', () => {
  it('puts a stylesheet before the content', () => {
    const content = document.createElement('div');
    const fragment = sheet('.a { color: red; }', content);
    expect(fragment.firstElementChild?.tagName).toBe('STYLE');
    expect(fragment.firstElementChild?.textContent).toBe('.a { color: red; }');
    expect(fragment.lastElementChild).toBe(content);
  });
});

describe('part', () => {
  it('creates a classed container with children', () => {
    const element = part('div', 'card', 'text') as HTMLElement;
    document.body.append(element);
    expect(element.querySelector('.card')?.textContent ?? element.textContent).toBe('text');
    expect(element.outerHTML).toContain('card');
    element.remove();
  });
});

describe('money', () => {
  it('formats an amount in a currency', () => {
    expect(money(1234, 'USD')).toContain('1,234');
  });

  it('falls back to plain text for an unknown currency', () => {
    expect(money(12.4, 'nope')).toBe('12 nope');
  });
});

describe('themeProperties', () => {
  it('lists the seven custom properties', () => {
    expect(themeProperties).toHaveLength(7);
    expect(themeProperties.every((name) => name.startsWith('--w-'))).toBe(true);
  });
});
