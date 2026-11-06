import { createRouter } from 'ecmact';
import { afterEach, describe, expect, it } from 'vitest';
import { link, tag, view } from '@site/lib/component';

afterEach(() => {
  document.body.replaceChildren();
});

describe('view', () => {
  it('creates a light DOM component without a box for the host', () => {
    const component = view('Thing', { tag: 'section', class: 'x', content: 'hi' });
    document.body.append(component);
    expect(component.shadowRoot).toBeNull();
    expect(component.style.display).toBe('contents');
    expect(component.querySelector('section.x')?.textContent).toBe('hi');
  });

  it('works without props', () => {
    expect(view('Empty').querySelector('div')).not.toBeNull();
  });
});

describe('tag', () => {
  it('creates a component for a standard tag', () => {
    const button = tag('button', { type: 'button', content: 'Go' });
    document.body.append(button);
    expect(button.localName).toBe('em-button');
    expect(button.querySelector('button')?.textContent).toBe('Go');
    expect(button.style.display).toBe('contents');
  });

  it('works without props', () => {
    expect(tag('span').querySelector('span')).not.toBeNull();
  });
});

describe('link', () => {
  it('creates a router link in the light DOM', () => {
    window.history.replaceState(null, '', '/');
    const router = createRouter({ routes: [] });
    const anchor = link(router, '/docs', 'Docs', 'nav');
    document.body.append(anchor);
    expect(anchor.style.display).toBe('contents');
    expect(anchor.querySelector('a')?.className).toBe('nav');
    expect(anchor.querySelector('a')?.textContent).toBe('Docs');
    router.dispose();
  });

  it('works without a class', () => {
    window.history.replaceState(null, '', '/');
    const router = createRouter({ routes: [] });
    expect(link(router, '/x', 'X').querySelector('a')).not.toBeNull();
    router.dispose();
  });
});
