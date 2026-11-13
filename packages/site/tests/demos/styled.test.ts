import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from 'ecmact';
import { create } from '@site/demos/styled';

beforeEach(() => {
  vi.stubGlobal('CSSStyleSheet', undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

const open = () => {
  const demo = create() as HTMLElement;
  mount(document.body, demo);
  const [primary, outline, ...swatches] = [...demo.querySelectorAll('button')];
  const rule = (element: Element) =>
    [...document.querySelectorAll('style[data-ecmact="styled"]')]
      .map((style) => style.textContent)
      .filter((text) => text.includes(`.${element.className}`))
      .join('\n');
  return { demo, primary: primary!, outline: outline!, swatches, rule };
};

describe('styled demo', () => {
  it('has two buttons, a spinner and four swatches, which are plain elements with a generated class', () => {
    const { demo, primary, outline, swatches } = open();
    expect(primary.textContent).toBe('Primary');
    expect(outline.textContent).toBe('Outline');
    expect(primary.className).toMatch(/^em-/);
    expect(primary.className).not.toBe(outline.className);
    expect(demo.querySelectorAll(':scope > div:not(:has(button))')).toHaveLength(1);
    expect(swatches.map((swatch) => swatch.getAttribute('aria-label'))).toEqual([
      'Use #1665e0',
      'Use #d6336c',
      'Use #2f9e44',
      'Use #e67700',
    ]);
  });

  it('styles the buttons from their props and the theme', () => {
    const { primary, outline, swatches, rule } = open();
    expect(rule(primary)).toContain('background: #1665e0');
    expect(rule(outline)).toContain('background: transparent');
    expect(rule(swatches[2]!)).toContain('background: #2f9e44');
  });

  it('restyles the elements below the provider when a swatch is picked', () => {
    const { demo, primary, swatches, rule } = open();
    const spinner = demo.querySelector(':scope > div:not(:has(button))')!;
    swatches[1]!.click();
    expect(rule(primary)).toContain('background: #d6336c');
    expect(rule(spinner)).toContain('border-top-color: #d6336c');
    expect(rule(spinner)).toMatch(/animation: em-\S+ 0\.9s linear infinite/);
  });
});
