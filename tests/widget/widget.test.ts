import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createContext, effect, signal, styled, tags } from '@em';
import { resetWarnings } from '@em/utils/warn';
import { defineWidget } from '@em/widget/widget';
import { tick } from '@tests/helpers';

let count = 0;
const nextName = () => `test-widget-${++count}`;
const shown = (element: Element) => element.shadowRoot!.textContent;

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  resetWarnings();
  document.body.replaceChildren();
});

describe('defineWidget', () => {
  it('registers a custom element that renders what render returns', () => {
    const name = nextName();
    defineWidget(name, () => tags.p('hello'));
    const element = document.createElement(name);
    document.body.append(element);
    expect(shown(element)).toBe('hello');
  });

  it('works when the element comes from markup', () => {
    const name = nextName();
    defineWidget(name, () => tags.p('parsed'));
    document.body.innerHTML = `<${name}></${name}>`;
    expect(shown(document.body.firstElementChild!)).toBe('parsed');
  });

  it('renders text, lists and reactive children', () => {
    const name = nextName();
    const text = signal('a');
    defineWidget(name, () => ['[', text, ']']);
    const element = document.createElement(name);
    document.body.append(element);
    text.value = 'b';
    expect(shown(element)).toBe('[b]');
  });

  it('renders into the light DOM when shadow is false', () => {
    const name = nextName();
    defineWidget(name, () => tags.p('light'), { shadow: false });
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
      return null;
    });
    const element = document.createElement(name);
    document.body.append(element);
    expect(host).toBe(element);
  });

  it('refuses a name that is already defined', () => {
    const name = nextName();
    defineWidget(name, () => null);
    expect(() => defineWidget(name, () => null)).toThrow(`"${name}" is already defined`);
  });
});

describe('attributes', () => {
  it('reads each attribute in the type of its default and follows the page', () => {
    const name = nextName();
    defineWidget(
      name,
      ({ props }) => tags.p(() => `${props.price * 2} ${props.currency} ${props.open}`),
      { attributes: { price: 1, currency: 'USD', open: false } },
    );
    const element = document.createElement(name);
    document.body.append(element);
    expect(shown(element)).toBe('2 USD false');
    element.setAttribute('price', '5');
    element.setAttribute('currency', 'EUR');
    element.setAttribute('open', '');
    expect(shown(element)).toBe('10 EUR true');
    element.setAttribute('open', 'false');
    element.removeAttribute('price');
    expect(shown(element)).toBe('2 EUR false');
  });

  it('reads a camelCase prop from the attribute in kebab-case', () => {
    const name = nextName();
    defineWidget(name, ({ props }) => tags.p(() => String(props.maxItems)), {
      attributes: { maxItems: 3 },
    });
    document.body.innerHTML = `<${name} max-items="7"></${name}>`;
    expect(shown(document.body.firstElementChild!)).toBe('7');
  });

  it('lists the props and types them from the defaults', () => {
    const name = nextName();
    defineWidget(
      name,
      ({ props }) => {
        expect(Object.keys(props)).toEqual(['price', 'label', 'open']);
        expectTypeOf(props.price).toEqualTypeOf<number>();
        expectTypeOf(props.label).toEqualTypeOf<string>();
        expectTypeOf(props.open).toEqualTypeOf<boolean>();
        return null;
      },
      { attributes: { price: 0, label: '', open: true } },
    );
    document.body.append(document.createElement(name));
  });

  it('does not follow attributes that were not listed', () => {
    const name = nextName();
    defineWidget(name, () => null, { attributes: { a: '' } });
    const element = document.createElement(name);
    document.body.append(element);
    expect(() => element.setAttribute('b', '1')).not.toThrow();
  });
});

describe('emit', () => {
  it('emits events that cross the shadow boundary', () => {
    const name = nextName();
    defineWidget(name, ({ emit }) =>
      tags.button({ onclick: () => emit('pay', { amount: 5 }) }, 'pay'),
    );
    const element = document.createElement(name);
    document.body.append(element);
    const listener = vi.fn();
    document.body.addEventListener('pay', listener);
    element.shadowRoot!.querySelector('button')!.click();
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({ amount: 5 });
    document.body.removeEventListener('pay', listener);
  });

  it('reports whether a listener cancelled the event', () => {
    const name = nextName();
    let emit: (type: string) => boolean = () => true;
    defineWidget(name, (context) => {
      emit = context.emit;
      return null;
    });
    const element = document.createElement(name);
    document.body.append(element);
    expect(emit('open')).toBe(true);
    element.addEventListener('open', (event) => event.preventDefault());
    expect(emit('open')).toBe(false);
  });
});

describe('css', () => {
  it('adopts the stylesheet into the shadow root', () => {
    const name = nextName();
    defineWidget(name, () => tags.p('x'), { css: 'p { color: red; }' });
    const element = document.createElement(name);
    document.body.append(element);
    const [sheet] = element.shadowRoot!.adoptedStyleSheets;
    expect(sheet.cssRules[0].cssText).toContain('color: red');
  });

  it('places a style element before the content where stylesheets cannot be constructed', () => {
    vi.stubGlobal('CSSStyleSheet', undefined);
    const name = nextName();
    defineWidget(name, () => tags.p('x'), { css: 'p { color: red; }' });
    const element = document.createElement(name);
    document.body.append(element);
    expect(element.shadowRoot!.innerHTML).toBe('<style>p { color: red; }</style><p>x</p>');
  });

  it('is ignored without a shadow root, with a warning', () => {
    defineWidget(nextName(), () => null, { css: 'p {}', shadow: false });
    expect(console.warn).toHaveBeenCalledWith('ecmact: css is ignored when shadow is false');
  });
});

describe('lifecycle', () => {
  it('keeps its content and state while it is only moved', async () => {
    const name = nextName();
    const render = vi.fn(() => tags.input());
    defineWidget(name, render);
    const element = document.createElement(name);
    const target = document.createElement('div');
    document.body.append(element, target);
    const input = element.shadowRoot!.querySelector('input');
    target.append(element);
    await tick();
    expect(render).toHaveBeenCalledTimes(1);
    expect(element.shadowRoot!.querySelector('input')).toBe(input);
  });

  it('stops what render started when it is taken out, and renders again when it is put back', async () => {
    const name = nextName();
    const outside = signal(0);
    const run = vi.fn(() => void outside.value);
    const label = vi.fn(() => String(outside.value));
    defineWidget(name, () => {
      effect(run);
      return tags.p(label);
    });
    const element = document.createElement(name);
    document.body.append(element);
    element.remove();
    await tick();
    outside.value = 1;
    expect(run).toHaveBeenCalledTimes(1);
    expect(label).toHaveBeenCalledTimes(1);
    expect(element.shadowRoot!.childNodes).toHaveLength(0);
    document.body.append(element);
    expect(shown(element)).toBe('1');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('does nothing when it is taken out twice before the check runs', async () => {
    const name = nextName();
    defineWidget(name, () => tags.p('x'));
    const element = document.createElement(name);
    document.body.append(element);
    element.remove();
    document.body.append(element);
    element.remove();
    await tick();
    expect(element.shadowRoot!.childNodes).toHaveLength(0);
  });

  it('lets context lookups and styled elements inside find their place', () => {
    vi.stubGlobal('CSSStyleSheet', undefined);
    const name = nextName();
    const Accent = createContext('accent', 'none');
    const Box = styled.div`
      margin: 0;
    `;
    defineWidget(name, () =>
      tags.div({ provide: Accent.provide('red') }, Box({ title: () => Accent.use() })),
    );
    const element = document.createElement(name);
    document.body.append(element);
    const root = element.shadowRoot!;
    expect(root.querySelector('[title]')!.getAttribute('title')).toBe('red');
    expect(root.querySelector('style[data-ecmact="styled"]')).not.toBeNull();
  });
});
