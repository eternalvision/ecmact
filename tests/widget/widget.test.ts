import { afterEach, describe, expect, it, vi } from 'vitest';
import { computed, tags } from '@em';
import { defineWidget } from '@em/widget/widget';
import { inner } from '@tests/helpers';

let count = 0;
const shown = (element: Element) =>
  inner(element.shadowRoot!.firstElementChild as HTMLElement).textContent;

const nextName = () => `test-widget-${++count}`;

afterEach(() => {
  document.body.replaceChildren();
});

describe('defineWidget', () => {
  it('registers a custom element that renders the returned node', () => {
    const name = nextName();
    defineWidget(name, () => tags.p({ content: 'hello' }));
    const element = document.createElement(name);
    document.body.append(element);
    expect(shown(element)).toBe('hello');
  });

  it('works when the element comes from markup', () => {
    const name = nextName();
    defineWidget(name, () => tags.p({ content: 'parsed' }));
    document.body.innerHTML = `<${name}></${name}>`;
    expect(shown(document.body.firstElementChild!)).toBe('parsed');
  });

  it('renders into the light DOM when shadow is false', () => {
    const name = nextName();
    defineWidget(name, () => tags.p({ content: 'light', shadow: false }), { shadow: false });
    const element = document.createElement(name);
    document.body.append(element);
    expect(element.shadowRoot).toBeNull();
    expect(element.textContent).toBe('light');
  });

  it('passes the host', () => {
    const name = nextName();
    let host: HTMLElement | undefined;
    defineWidget(name, (context) => {
      host = context.host;
      return document.createElement('span');
    });
    const element = document.createElement(name);
    document.body.append(element);
    expect(host).toBe(element);
  });

  it('exposes the observed attributes as signals that follow the page', () => {
    const name = nextName();
    defineWidget(
      name,
      ({ props }) => tags.p({ content: computed(() => `${props.currency.value ?? 'none'}`) }),
      { attributes: ['currency'] },
    );
    const element = document.createElement(name);
    element.setAttribute('currency', 'EUR');
    document.body.append(element);
    const text = () => shown(element);
    expect(text()).toBe('EUR');
    element.setAttribute('currency', 'CZK');
    expect(text()).toBe('CZK');
    element.removeAttribute('currency');
    expect(text()).toBe('none');
  });

  it('does not follow attributes that were not listed', () => {
    const name = nextName();
    defineWidget(name, () => document.createElement('span'), { attributes: ['a'] });
    const element = document.createElement(name);
    document.body.append(element);
    expect(() => element.setAttribute('b', '1')).not.toThrow();
  });

  it('emits events that cross the shadow boundary', () => {
    const name = nextName();
    defineWidget(name, ({ emit }) =>
      tags.button({ content: 'pay', onclick: () => emit('pay', { amount: 5 }) }),
    );
    const element = document.createElement(name);
    document.body.append(element);
    const listener = vi.fn();
    document.body.addEventListener('pay', listener);
    inner(element.shadowRoot!.firstElementChild as HTMLElement).click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({ amount: 5 });
    document.body.removeEventListener('pay', listener);
  });

  it('reports whether a listener cancelled the event', () => {
    const name = nextName();
    let emit: (type: string) => boolean = () => true;
    defineWidget(name, (context) => {
      emit = context.emit;
      return document.createElement('span');
    });
    document.body.append(document.createElement(name));
    expect(emit('ping')).toBe(true);
  });

  it('renders once, even if the element is moved', () => {
    const name = nextName();
    const render = vi.fn(() => document.createElement('span'));
    defineWidget(name, render);
    const element = document.createElement(name);
    document.body.append(element);
    element.remove();
    document.body.append(element);
    expect(render).toHaveBeenCalledTimes(1);
  });

  it('refuses a name that is already defined', () => {
    const name = nextName();
    defineWidget(name, () => document.createElement('span'));
    expect(() => defineWidget(name, () => document.createElement('span'))).toThrow(
      'already defined',
    );
  });

  it('returns the registered class', () => {
    const name = nextName();
    const widget = defineWidget(name, () => document.createElement('span'));
    expect(customElements.get(name)).toBe(widget);
  });
});
