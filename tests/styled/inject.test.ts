import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyStyleSheets } from '@em/render/applyStyleSheets';
import { inject, isStyleRoot } from '@em/styled/inject';
import { resetWarnings } from '@em/utils/warn';
import { createRoot, createState } from '@tests/helpers';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  resetWarnings();
  document.head.replaceChildren();
  document.adoptedStyleSheets = [];
});

const texts = (root: ParentNode) =>
  Array.from(root.querySelectorAll('style[data-ecmact="styled"]'), (node) => node.textContent);

describe('isStyleRoot', () => {
  it('is true for a document and a shadow root', () => {
    expect(isStyleRoot(document)).toBe(true);
    expect(isStyleRoot(createRoot())).toBe(true);
  });

  it('is false for detached elements and fragments', () => {
    expect(isStyleRoot(document.createElement('div'))).toBe(false);
    expect(isStyleRoot(document.createDocumentFragment())).toBe(false);
  });
});

describe('inject with constructable stylesheets', () => {
  it('adopts one stylesheet per root and inserts each rule once', () => {
    const root = createRoot();
    inject(root, ['.a { color: red; }', '.b { color: blue; }']);
    inject(root, ['.a { color: red; }', '.c { margin: 0; }']);
    expect(root.adoptedStyleSheets).toHaveLength(1);
    expect(root.adoptedStyleSheets[0].cssRules).toHaveLength(3);
  });

  it('works for the document', () => {
    inject(document, ['.a { color: red; }']);
    expect(document.adoptedStyleSheets).toHaveLength(1);
  });

  it('keeps the stylesheets that the root already had', () => {
    const root = createRoot();
    const own = new CSSStyleSheet();
    root.adoptedStyleSheets = [own];
    inject(root, ['.a { color: red; }']);
    expect(root.adoptedStyleSheets[0]).toBe(own);
    expect(root.adoptedStyleSheets).toHaveLength(2);
  });

  it('survives a component that changes its own stylesheet', () => {
    const root = createRoot();
    inject(root, ['.a { color: red; }']);
    const [styled] = root.adoptedStyleSheets;
    applyStyleSheets(root, 'p { margin: 0; }', createState());
    expect(root.adoptedStyleSheets).toHaveLength(2);
    expect(root.adoptedStyleSheets[1]).toBe(styled);
  });

  it('starts again when the stylesheet was removed from the root', () => {
    const root = createRoot();
    inject(root, ['.a { color: red; }']);
    root.adoptedStyleSheets = [];
    inject(root, ['.a { color: red; }']);
    expect(root.adoptedStyleSheets).toHaveLength(1);
    expect(root.adoptedStyleSheets[0].cssRules).toHaveLength(1);
  });

  it('skips a rule that cannot be parsed, with a warning', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(CSSStyleSheet.prototype, 'insertRule').mockImplementation(() => {
      throw new SyntaxError('bad');
    });
    expect(() => inject(createRoot(), ['.a { ??? }'])).not.toThrow();
    expect(spy).toHaveBeenCalledWith(
      'ecmact: a styled rule was ignored, the browser cannot parse it: .a { ??? }',
    );
  });
});

describe('inject without constructable stylesheets', () => {
  beforeEach(() => {
    vi.stubGlobal('CSSStyleSheet', undefined);
  });

  it('appends a style element per rule to the head of the document', () => {
    inject(document, ['.a { color: red; }', '.b { color: blue; }']);
    inject(document, ['.a { color: red; }']);
    expect(texts(document.head)).toEqual(['.a { color: red; }', '.b { color: blue; }']);
  });

  it('appends to a shadow root', () => {
    const root = createRoot();
    inject(root, ['.a { color: red; }']);
    expect(texts(root)).toEqual(['.a { color: red; }']);
    expect(texts(document.head)).toEqual([]);
  });

  it('starts again when the style elements were removed', () => {
    const root = createRoot();
    inject(root, ['.a { color: red; }']);
    root.replaceChildren();
    inject(root, ['.a { color: red; }']);
    expect(texts(root)).toEqual(['.a { color: red; }']);
  });
});
