import { mount } from 'ecmact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/typecase';

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
  const swatch = (label: string) =>
    demo.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
  const poster = demo.querySelector<HTMLElement>('[class*="em-"] > [class*="em-"]')!;
  const rule = (element: Element) =>
    [...document.querySelectorAll('style[data-ecmact="styled"]')]
      .map((style) => style.textContent)
      .filter((text) => text.includes(`.${element.className.split(' ').pop()} `))
      .join('\n');
  const styled = () => [...demo.querySelectorAll<HTMLElement>('[class*="em-"]')];
  return { demo, swatch, poster, rule, styled };
};

describe('typecase example', () => {
  it('sets a poster in black ink on cream stock', () => {
    const { demo, rule, poster } = open();
    expect(demo.querySelector('input')?.value).toBe('Grand opening');
    expect(demo.textContent).toContain('One night only');
    expect(demo.textContent).toContain('Doors at eight');
    expect(demo.textContent).toContain('Set in Blue ink on Mint stock.');
    expect(rule(poster)).toContain('background: #2b2bff');
  });

  it('restyles every styled element when one theme signal changes', () => {
    const { demo, swatch, styled, rule } = open();
    const before = styled().map((element) => element.className);
    swatch('Red ink').click();
    swatch('Lemon stock').click();
    const after = styled().map((element) => element.className);
    expect(after).toHaveLength(before.length);
    expect(after.filter((name, index) => name !== before[index]).length).toBeGreaterThanOrEqual(5);
    const bench = styled()[0]!;
    expect(rule(bench)).toContain('#fff27a');
    expect(rule(bench)).toContain('color: #c4161c');
    expect(demo.textContent).toContain('Set in Red ink on Lemon stock.');
    expect(swatch('Red ink').getAttribute('aria-pressed')).toBe('true');
    expect(swatch('Black ink').getAttribute('aria-pressed')).toBe('false');
  });

  it('pulls a proof with the keyframes of the press, and ends it when the animation ends', () => {
    const { demo, poster, rule } = open();
    const pull = [...demo.querySelectorAll('button')].find(
      (b) => b.textContent === 'Pull a proof',
    )!;
    expect(rule(poster)).toContain('animation: none 0.5s');
    pull.click();
    expect(rule(poster)).toMatch(/animation: em-\S+ 0\.5s ease-out/);
    expect(rule(poster)).toContain('prefers-reduced-motion: reduce');
    poster.dispatchEvent(new Event('animationend'));
    expect(rule(poster)).toContain('animation: none 0.5s');
    pull.click();
    poster.dispatchEvent(new Event('animationcancel'));
    expect(rule(poster)).toContain('animation: none 0.5s');
  });

  it('does not start the press animation when the visitor asked for less motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { demo, poster, rule, swatch } = open();
    const pull = [...demo.querySelectorAll('button')].find(
      (b) => b.textContent === 'Pull a proof',
    )!;
    pull.click();
    swatch('Red ink').click();
    expect(rule(poster)).toContain('animation: none 0.5s');
    expect(rule(poster)).not.toMatch(/animation: em-/);
  });

  it('declares a light color scheme for its stage', () => {
    const { rule, styled } = open();
    expect(rule(styled()[0]!)).toContain('color-scheme: light');
  });

  it('sets the headline from the field', () => {
    const { demo } = open();
    const field = demo.querySelector('input')!;
    field.value = 'Last call';
    field.dispatchEvent(new Event('input'));
    expect(demo.textContent).toContain('Last call');
  });
});
