import { afterEach, describe, expect, it, vi } from 'vitest';
import { configure, em } from '../src';
import { resetConfig } from '../src/config';

const rules = (sheet: CSSStyleSheet) => Array.from(sheet.cssRules, (rule) => rule.cssText).join('');

afterEach(() => {
  resetConfig();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe('css prop with adopted stylesheets', () => {
  it('adopts a sheet scoped to the component', () => {
    const card = em.Card({ css: 'div { color: red; }' });
    const sheets = card.shadowRoot!.adoptedStyleSheets;
    expect(sheets).toHaveLength(1);
    expect(rules(sheets[0])).toContain('color: red');
  });

  it('does not create style elements', () => {
    const card = em.Card({ css: 'div { color: red; }' });
    expect(card.shadowRoot!.querySelector('style')).toBeNull();
  });

  it('updates the sheet in place when css changes', () => {
    const card = em.Card({ css: 'div { color: red; }' });
    const sheet = card.shadowRoot!.adoptedStyleSheets[0];
    card.setState({ css: 'div { color: blue; }' });
    expect(card.shadowRoot!.adoptedStyleSheets[0]).toBe(sheet);
    expect(rules(sheet)).toContain('color: blue');
  });

  it('does not rewrite the sheet when css is unchanged', () => {
    const card = em.Card({ css: 'div { color: red; }' });
    const sheet = card.shadowRoot!.adoptedStyleSheets[0];
    const replaceSync = vi.spyOn(sheet, 'replaceSync');
    card.setState({ content: 'x' });
    expect(replaceSync).not.toHaveBeenCalled();
  });

  it('drops the sheet when css is removed', () => {
    const card = em.Card({ css: 'div { color: red; }' });
    card.setState({ css: undefined });
    expect(card.shadowRoot!.adoptedStyleSheets).toHaveLength(0);
  });

  it('is not rendered as an attribute', () => {
    const card = em.Card({ css: 'div {}' });
    expect(card.shadowRoot!.firstElementChild!.hasAttribute('css')).toBe(false);
  });

  it('is ignored when shadow is false', () => {
    const card = em.Card({ shadow: false, css: 'div { color: red; }' });
    expect(card.shadowRoot).toBeNull();
    expect(card.querySelector('style')).toBeNull();
  });
});

describe('shared styles', () => {
  it('adopts configured strings and sheets before the own sheet', () => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync('span { margin: 0; }');
    configure({ styles: ['div { padding: 1px; }', sheet] });
    const card = em.Card({ css: 'div { color: red; }' });
    const sheets = card.shadowRoot!.adoptedStyleSheets;
    expect(sheets).toHaveLength(3);
    expect(rules(sheets[0])).toContain('padding: 1px');
    expect(sheets[1]).toBe(sheet);
    expect(rules(sheets[2])).toContain('color: red');
  });

  it('reuses the converted sheets between components', () => {
    configure({ styles: ['div { padding: 1px; }'] });
    const first = em.Card();
    const second = em.Card();
    expect(first.shadowRoot!.adoptedStyleSheets[0]).toBe(second.shadowRoot!.adoptedStyleSheets[0]);
  });

  it('applies to every component without a css prop', () => {
    configure({ styles: ['div { padding: 1px; }'] });
    expect(em.Card().shadowRoot!.adoptedStyleSheets).toHaveLength(1);
  });

  it('does not apply to light DOM components', () => {
    configure({ styles: ['div { padding: 1px; }'] });
    expect(em.Card({ shadow: false }).querySelector('style')).toBeNull();
  });
});

describe('default shadow mode', () => {
  it('renders into the light DOM when configured', () => {
    configure({ shadow: false });
    const card = em.Card({ content: 'x' });
    expect(card.shadowRoot).toBeNull();
    expect(card.firstElementChild!.textContent).toBe('x');
  });

  it('can be overridden per component', () => {
    configure({ shadow: false });
    expect(em.Card({ shadow: true }).shadowRoot).not.toBeNull();
  });

  it('merges options between calls', () => {
    configure({ shadow: false });
    configure({ styles: ['div {}'] });
    expect(em.Card().shadowRoot).toBeNull();
  });
});

describe('css prop without constructable stylesheets', () => {
  const stub = () => vi.stubGlobal('CSSStyleSheet', undefined);

  it('falls back to style elements before the content', () => {
    stub();
    const card = em.Card({ css: 'div { color: red; }', content: 'x' });
    const [style, element] = Array.from(card.shadowRoot!.children);
    expect(style.localName).toBe('style');
    expect(style.textContent).toBe('div { color: red; }');
    expect(element.textContent).toBe('x');
  });

  it('rebuilds the style elements when css changes and keeps the element', () => {
    stub();
    const card = em.Card({ css: 'div { color: red; }' });
    const element = card.shadowRoot!.lastElementChild;
    card.setState({ css: 'div { color: blue; }' });
    expect(card.shadowRoot!.querySelector('style')!.textContent).toBe('div { color: blue; }');
    expect(card.shadowRoot!.lastElementChild).toBe(element);
    expect(card.shadowRoot!.children).toHaveLength(2);
  });

  it('keeps the style elements when css is unchanged', () => {
    stub();
    const card = em.Card({ css: 'div {}' });
    const style = card.shadowRoot!.querySelector('style');
    card.setState({ content: 'x' });
    expect(card.shadowRoot!.querySelector('style')).toBe(style);
  });

  it('removes the style element when css is removed', () => {
    stub();
    const card = em.Card({ css: 'div {}' });
    card.setState({ css: undefined });
    expect(card.shadowRoot!.querySelector('style')).toBeNull();
  });

  it('injects shared strings and sheets', () => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync('span { margin: 0; }');
    stub();
    configure({ styles: ['div { padding: 1px; }', sheet] });
    const card = em.Card({ css: 'div { color: red; }' });
    const texts = Array.from(
      card.shadowRoot!.querySelectorAll('style'),
      (node) => node.textContent,
    );
    expect(texts[0]).toBe('div { padding: 1px; }');
    expect(texts[1]).toContain('margin: 0');
    expect(texts[2]).toBe('div { color: red; }');
  });
});

describe('hoisting @property rules', () => {
  const property = '@property --tw-x { syntax: "*"; inherits: false; }';
  const hoisted = () =>
    Array.from(document.head.querySelectorAll('style[data-ecmact="properties"]'));

  afterEach(() => {
    document.head.replaceChildren();
  });

  it('copies @property rules from shared styles into the document', () => {
    configure({ styles: [`${property} div { color: red; }`] });
    em.Card();
    expect(hoisted()).toHaveLength(1);
    expect(hoisted()[0].textContent).toContain('@property --tw-x');
    expect(hoisted()[0].textContent).not.toContain('color: red');
  });

  it('does it once per configuration', () => {
    configure({ styles: [property] });
    em.Card();
    em.Card();
    expect(hoisted()).toHaveLength(1);
  });

  it('collects rules from several sources', () => {
    configure({ styles: [property, '@property --tw-y { syntax: "*"; inherits: false; }'] });
    em.Card();
    expect(hoisted()[0].textContent).toContain('--tw-y');
  });

  it('adds nothing when there are no @property rules', () => {
    configure({ styles: ['div { color: red; }'] });
    em.Card();
    expect(hoisted()).toHaveLength(0);
  });

  it('adds nothing without shared styles', () => {
    em.Card();
    expect(hoisted()).toHaveLength(0);
  });
});
