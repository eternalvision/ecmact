import { createRouter, type Router } from 'ecmact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { followInternalLinks, scrollToHash } from '@site/lib/links';

let router: Router;
let container: HTMLElement;

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  router = createRouter({
    routes: [
      { path: '/docs', view: () => document.createElement('p') },
      { path: '/docs/:slug', view: () => document.createElement('p') },
    ],
  });
  container = document.createElement('div');
  container.innerHTML =
    '<a id="in" href="/docs" data-internal="/docs"><b>go</b></a><a id="out" href="https://x.test">out</a>';
  document.body.append(container);
  followInternalLinks(container, router);
});

afterEach(() => {
  vi.restoreAllMocks();
  router.dispose();
  document.body.replaceChildren();
});

const click = (target: Element, init: MouseEventInit = {}) => {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
  target.dispatchEvent(event);
  return event;
};

describe('followInternalLinks', () => {
  it('navigates through the router on a plain click, also on a child of the anchor', () => {
    const event = click(container.querySelector('b')!);
    expect(event.defaultPrevented).toBe(true);
    expect(router.location.value.path).toBe('/docs');
  });

  it('leaves links to other sites to the browser', () => {
    const event = click(container.querySelector('#out')!);
    expect(event.defaultPrevented).toBe(false);
  });

  it('leaves clicks with modifier keys or another button to the browser', () => {
    ['metaKey', 'ctrlKey', 'shiftKey', 'altKey'].forEach((key) => {
      expect(click(container.querySelector('#in')!, { [key]: true }).defaultPrevented).toBe(false);
    });
    expect(click(container.querySelector('#in')!, { button: 1 }).defaultPrevented).toBe(false);
    expect(router.location.value.path).toBe('/');
  });

  it('respects a click that was already handled', () => {
    container.addEventListener('click', (event) => event.preventDefault(), { capture: true });
    click(container.querySelector('#in')!);
    expect(router.location.value.path).toBe('/');
  });

  it('ignores clicks that are not on an element', () => {
    container.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
    expect(router.location.value.path).toBe('/');
    document.dispatchEvent(new MouseEvent('click'));
    const text = document.createTextNode('x');
    container.append(text);
    text.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
    expect(router.location.value.path).toBe('/');
  });
});

describe('scrollToHash', () => {
  it('scrolls to the element that the hash names', () => {
    const target = document.createElement('h2');
    target.id = 'rules';
    target.tabIndex = -1;
    document.body.append(target);
    const scroll = vi.spyOn(target, 'scrollIntoView');
    expect(scrollToHash('/docs/signals#rules')).toBe(true);
    expect(scroll).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(target);
  });

  it('does nothing for an address without a hash, with an empty one or with an unknown one', () => {
    const scroll = vi.spyOn(Element.prototype, 'scrollIntoView');
    expect(scrollToHash('/docs/signals')).toBe(false);
    expect(scrollToHash('/docs/signals#')).toBe(false);
    expect(scrollToHash('/docs/signals#nope')).toBe(false);
    expect(scroll).not.toHaveBeenCalled();
  });
});

describe('followInternalLinks to a section', () => {
  it('opens the other page and then scrolls to the section', async () => {
    container.innerHTML =
      '<a id="deep" href="/docs/signals#rules" data-internal="/docs/signals#rules">r</a>';
    const target = document.createElement('h2');
    target.id = 'rules';
    document.body.append(target);
    const scroll = vi.spyOn(target, 'scrollIntoView');
    click(container.querySelector('#deep')!);
    await vi.waitFor(() => expect(scroll).toHaveBeenCalledOnce());
    expect(router.location.value.path).toBe('/docs/signals');
    expect(router.location.value.hash).toBe('#rules');
  });

  const withFallback = (href: string) => {
    const own = document.createElement('div');
    own.innerHTML = `<a href="${href}" data-internal="${href}">x</a>`;
    document.body.append(own);
    const fallback = vi.fn();
    followInternalLinks(own, router, fallback);
    click(own.querySelector('a')!);
    return fallback;
  };

  it('puts the focus on the section it scrolls to, and not on the fallback', async () => {
    const target = document.createElement('h2');
    target.id = 'rules';
    target.tabIndex = -1;
    document.body.append(target);
    const fallback = withFallback('/docs/signals#rules');
    await vi.waitFor(() => expect(document.activeElement).toBe(target));
    expect(fallback).not.toHaveBeenCalled();
  });

  it('calls the fallback when the address names no section', async () => {
    const fallback = withFallback('/docs/signals');
    await vi.waitFor(() => expect(fallback).toHaveBeenCalledOnce());
  });
});
