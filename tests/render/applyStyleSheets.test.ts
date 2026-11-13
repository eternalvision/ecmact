import { afterEach, describe, expect, it, vi } from 'vitest';
import { configure } from '@em';
import { resetConfig } from '@em/core/config';
import { applyStyleSheets } from '@em/render/applyStyleSheets';
import { cleanStyles, createRoot, createState } from '@tests/helpers';

const rules = (sheet: CSSStyleSheet) => Array.from(sheet.cssRules, (rule) => rule.cssText).join('');
const property = '@property --tw-x { syntax: "*"; inherits: false; }';
const hoisted = () => Array.from(document.head.querySelectorAll('style[data-ecmact="properties"]'));

afterEach(() => {
  resetConfig();
  vi.unstubAllGlobals();
  cleanStyles();
});

describe('applyStyleSheets with constructable stylesheets', () => {
  it('adopts a sheet for the css text and reports no node change', () => {
    const root = createRoot();
    const changed = applyStyleSheets(root, 'div { color: red; }', createState());
    expect(changed).toBe(false);
    expect(root.adoptedStyleSheets).toHaveLength(1);
    expect(rules(root.adoptedStyleSheets[0])).toContain('color: red');
  });

  it('adopts nothing without css or shared styles', () => {
    const root = createRoot();
    applyStyleSheets(root, undefined, createState());
    expect(root.adoptedStyleSheets).toHaveLength(0);
  });

  it('keeps the same sheet and rewrites it when css changes', () => {
    const root = createRoot();
    const state = createState();
    applyStyleSheets(root, 'div { color: red; }', state);
    const sheet = root.adoptedStyleSheets[0];
    applyStyleSheets(root, 'div { color: blue; }', state);
    expect(root.adoptedStyleSheets[0]).toBe(sheet);
    expect(rules(sheet)).toContain('color: blue');
  });

  it('does not rewrite the sheet when css is unchanged', () => {
    const root = createRoot();
    const state = createState();
    applyStyleSheets(root, 'div {}', state);
    const replaceSync = vi.spyOn(state.ownSheet!, 'replaceSync');
    applyStyleSheets(root, 'div {}', state);
    expect(replaceSync).not.toHaveBeenCalled();
  });

  it('drops the sheet when css is removed', () => {
    const root = createRoot();
    const state = createState();
    applyStyleSheets(root, 'div {}', state);
    applyStyleSheets(root, undefined, state);
    expect(root.adoptedStyleSheets).toHaveLength(0);
    expect(state.ownSheet).toBeNull();
  });

  it('puts shared strings and sheets before the own sheet', () => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync('span { margin: 0; }');
    configure({ styles: ['div { padding: 1px; }', sheet] });
    const root = createRoot();
    applyStyleSheets(root, 'div { color: red; }', createState());
    const adopted = root.adoptedStyleSheets;
    expect(adopted).toHaveLength(3);
    expect(rules(adopted[0])).toContain('padding: 1px');
    expect(adopted[1]).toBe(sheet);
    expect(rules(adopted[2])).toContain('color: red');
  });

  it('reuses converted shared sheets between roots', () => {
    configure({ styles: ['div { padding: 1px; }'] });
    const first = createRoot();
    const second = createRoot();
    applyStyleSheets(first, undefined, createState());
    applyStyleSheets(second, undefined, createState());
    expect(first.adoptedStyleSheets[0]).toBe(second.adoptedStyleSheets[0]);
  });
});

describe('applyStyleSheets without constructable stylesheets', () => {
  const stub = () => vi.stubGlobal('CSSStyleSheet', undefined);

  it('reports a node change on the first call and builds style nodes', () => {
    stub();
    const state = createState();
    expect(applyStyleSheets(createRoot(), 'div { color: red; }', state)).toBe(true);
    expect(state.sheetNodes).toHaveLength(1);
    expect(state.sheetNodes[0].textContent).toBe('div { color: red; }');
  });

  it('reports no change when css is the same', () => {
    stub();
    const root = createRoot();
    const state = createState();
    applyStyleSheets(root, 'div {}', state);
    expect(applyStyleSheets(root, 'div {}', state)).toBe(false);
  });

  it('rebuilds the nodes when css changes', () => {
    stub();
    const root = createRoot();
    const state = createState();
    applyStyleSheets(root, 'div { color: red; }', state);
    expect(applyStyleSheets(root, 'div { color: blue; }', state)).toBe(true);
    expect(state.sheetNodes[0].textContent).toBe('div { color: blue; }');
  });

  it('builds no nodes without css or shared styles', () => {
    stub();
    const state = createState();
    applyStyleSheets(createRoot(), undefined, state);
    expect(state.sheetNodes).toHaveLength(0);
  });

  it('removes the own node when css is removed', () => {
    stub();
    const root = createRoot();
    const state = createState();
    applyStyleSheets(root, 'div {}', state);
    applyStyleSheets(root, undefined, state);
    expect(state.sheetNodes).toHaveLength(0);
  });

  it('turns shared strings and sheets into nodes before the own one', () => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync('span { margin: 0; }');
    stub();
    configure({ styles: ['div { padding: 1px; }', sheet] });
    const state = createState();
    applyStyleSheets(createRoot(), 'div { color: red; }', state);
    const texts = state.sheetNodes.map((node) => node.textContent);
    expect(texts[0]).toBe('div { padding: 1px; }');
    expect(texts[1]).toContain('margin: 0');
    expect(texts[2]).toBe('div { color: red; }');
  });
});

describe('hoisting @property rules', () => {
  it('copies @property rules from shared styles into the document', () => {
    configure({ styles: [`${property} div { color: red; }`] });
    applyStyleSheets(createRoot(), undefined, createState());
    expect(hoisted()).toHaveLength(1);
    expect(hoisted()[0].textContent).toContain('@property --tw-x');
    expect(hoisted()[0].textContent).not.toContain('color: red');
  });

  it('does it once per configuration', () => {
    configure({ styles: [property] });
    applyStyleSheets(createRoot(), undefined, createState());
    applyStyleSheets(createRoot(), undefined, createState());
    expect(hoisted()).toHaveLength(1);
  });

  it('collects rules from several sources', () => {
    configure({ styles: [property, '@property --tw-y { syntax: "*"; inherits: false; }'] });
    applyStyleSheets(createRoot(), undefined, createState());
    expect(hoisted()[0].textContent).toContain('--tw-y');
  });

  it('skips an unnamed rule, an unclosed rule and a keyword without a block', () => {
    configure({
      styles: ['@property{} @property --a { x: y; } @property --b { x: y', '@property --c'],
    });
    applyStyleSheets(createRoot(), undefined, createState());
    expect(hoisted()[0].textContent).toBe('@property --a { x: y; }');
  });

  it('stays fast on unnamed rules followed by one closing brace', () => {
    const started = Date.now();
    configure({ styles: [`${'@property{'.repeat(200000)}}`] });
    applyStyleSheets(createRoot(), undefined, createState());
    expect(Date.now() - started).toBeLessThan(500);
  });

  it('stays fast on a long hostile stylesheet', () => {
    const started = Date.now();
    configure({ styles: ['@property'.repeat(20000), `@property ${'{'.repeat(5)}`] });
    applyStyleSheets(createRoot(), undefined, createState());
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it('adds nothing when there are no @property rules', () => {
    configure({ styles: ['div { color: red; }'] });
    applyStyleSheets(createRoot(), undefined, createState());
    expect(hoisted()).toHaveLength(0);
  });

  it('adds nothing without shared styles', () => {
    applyStyleSheets(createRoot(), undefined, createState());
    expect(hoisted()).toHaveLength(0);
  });
});
