import { createRouter, type Router } from 'ecmact';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { followInternalLinks } from '@site/lib/links';

let router: Router;
let container: HTMLElement;

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  router = createRouter({ routes: [{ path: '/docs', view: () => document.createElement('p') }] });
  container = document.createElement('div');
  container.innerHTML =
    '<a id="in" href="/docs" data-internal="/docs"><b>go</b></a><a id="out" href="https://x.test">out</a>';
  document.body.append(container);
  followInternalLinks(container, router);
});

afterEach(() => {
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
