import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configure, effect, em, signal, tags } from '@em';
import { Component, init } from '@em/core/component';
import { resetConfig } from '@em/core/config';
import { resetWarnings } from '@em/utils/warn';
import { tick } from '@tests/helpers';

let spy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  spy.mockRestore();
  resetWarnings();
  resetConfig();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  document.head.replaceChildren();
});

const rules = (sheet: CSSStyleSheet) => Array.from(sheet.cssRules, (rule) => rule.cssText).join('');

describe('Component: root', () => {
  it('is a custom element that extends HTMLElement', () => {
    const card = em.Card();
    expect(card).toBeInstanceOf(Component);
    expect(card).toBeInstanceOf(HTMLElement);
  });

  it('renders the children into an open shadow root by default', () => {
    const child = tags.p('inside');
    const card = em.Card(child);
    expect(card.shadowRoot!.firstChild).toBe(child);
    expect(card.childNodes).toHaveLength(0);
  });

  it('renders into itself with shadow false', () => {
    const card = em.Card({ shadow: false }, tags.p('inside'));
    expect(card.shadowRoot).toBeNull();
    expect(card.innerHTML).toBe('<p>inside</p>');
  });

  it('follows the configured default, which the prop overrides', () => {
    configure({ shadow: false });
    expect(em.Card('x').shadowRoot).toBeNull();
    expect(em.Card({ shadow: true }, 'x').shadowRoot).not.toBeNull();
  });

  it('applies attributes, styles and listeners to the custom element itself', () => {
    const onclick = vi.fn();
    const card = em.Card({ id: 'card', class: 'big', style: { color: 'red' }, onclick });
    card.click();
    expect(card.id).toBe('card');
    expect(card.className).toBe('big');
    expect(card.style.color).toBe('red');
    expect(onclick).toHaveBeenCalledTimes(1);
  });

  it('calls ref with the component', () => {
    const ref = vi.fn();
    const card = em.Card({ ref });
    expect(ref).toHaveBeenCalledWith(card);
  });

  it('puts html into the root', () => {
    const card = em.Card({ html: '<b>x</b>' });
    expect(card.shadowRoot!.innerHTML).toBe('<b>x</b>');
  });

  it('renders nothing when the element was created outside the library', () => {
    em.Card();
    const card = document.createElement('em-card');
    document.body.append(card);
    card.remove();
    expect(card.shadowRoot).toBeNull();
    expect(card.childNodes).toHaveLength(0);
  });
});

describe('Component: css', () => {
  it('adopts the css into the shadow root', () => {
    const card = em.Card({ css: 'p { color: red; }' });
    expect(rules(card.shadowRoot!.adoptedStyleSheets[0])).toContain('color: red');
  });

  it('adopts the shared styles without css', () => {
    configure({ styles: ['p { margin: 0; }'] });
    expect(em.Card().shadowRoot!.adoptedStyleSheets).toHaveLength(1);
  });

  it('follows reactive css', () => {
    const css = signal<string | null>('p { color: red; }');
    const card = em.Card({ css });
    css.value = 'p { color: blue; }';
    expect(rules(card.shadowRoot!.adoptedStyleSheets[0])).toContain('color: blue');
    css.value = null;
    expect(card.shadowRoot!.adoptedStyleSheets).toHaveLength(0);
  });

  it('ignores css without a shadow root, with a warning', () => {
    em.Card({ shadow: false, css: 'p {}' });
    expect(spy).toHaveBeenCalledWith('ecmact: css is ignored when shadow is false');
    resetWarnings();
    spy.mockClear();
    em.Card({ shadow: false });
    expect(spy).not.toHaveBeenCalled();
  });

  it('places style elements before the children where stylesheets cannot be constructed', () => {
    vi.stubGlobal('CSSStyleSheet', undefined);
    const css = signal('p { color: red; }');
    const card = em.Card({ css }, tags.p('x'));
    const root = card.shadowRoot!;
    expect(root.innerHTML).toBe('<style>p { color: red; }</style><p>x</p>');
    css.value = 'p { color: blue; }';
    expect(root.innerHTML).toBe('<style>p { color: blue; }</style><p>x</p>');
  });
});

describe('Component: lifecycle', () => {
  it('runs mounted when connected and not before', () => {
    const mounted = vi.fn();
    const card = em.Card({ mounted });
    expect(mounted).not.toHaveBeenCalled();
    document.body.append(card);
    expect(mounted).toHaveBeenCalledWith(card);
  });

  it('runs the cleanup and then unmounted when disconnected', () => {
    const order: string[] = [];
    const unmounted = vi.fn(() => void order.push('unmounted'));
    const card = em.Card({ mounted: () => () => void order.push('cleanup'), unmounted });
    document.body.append(card);
    card.remove();
    expect(order).toEqual(['cleanup', 'unmounted']);
    expect(unmounted).toHaveBeenCalledWith(card);
  });

  it('runs the hooks once per connect', () => {
    const cleanup = vi.fn();
    const mounted = vi.fn(() => cleanup);
    const card = em.Card({ mounted });
    document.body.append(card);
    card.remove();
    card.remove();
    document.body.append(card);
    expect(mounted).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('stops the effects that mounted created, after its cleanup', () => {
    const count = signal(0);
    const run = vi.fn(() => void count.value);
    const order: number[] = [];
    const card = em.Card({
      mounted: () => {
        effect(run);
        return () => void order.push(run.mock.calls.length);
      },
    });
    document.body.append(card);
    count.value = 1;
    card.remove();
    count.value = 2;
    expect(run).toHaveBeenCalledTimes(2);
    expect(order).toEqual([2]);
    document.body.append(card);
    expect(run).toHaveBeenCalledTimes(3);
  });

  it('stops the effects of mounted even when its cleanup throws', () => {
    const count = signal(0);
    const run = vi.fn(() => void count.value);
    const card = em.Card({
      error: () => {},
      mounted: () => {
        effect(run);
        return () => {
          throw new Error('cleanup');
        };
      },
    });
    document.body.append(card);
    card.remove();
    count.value = 1;
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('has no cleanup to run when it was never connected', () => {
    const unmounted = vi.fn();
    em.Card({ unmounted }).disconnectedCallback();
    expect(unmounted).toHaveBeenCalledTimes(1);
  });

  it('works without hooks', () => {
    const card = em.Card();
    document.body.append(card);
    expect(() => card.remove()).not.toThrow();
  });

  it('reports errors of the hooks to the error prop and carries on', () => {
    const error = vi.fn();
    const unmounted = vi.fn(() => {
      throw new Error('unmounted');
    });
    const card = em.Card({
      error,
      mounted: () => () => {
        throw new Error('cleanup');
      },
      unmounted,
    });
    document.body.append(card);
    card.remove();
    expect(error.mock.calls.map(([, info]) => info.phase)).toEqual(['cleanup', 'unmounted']);
    expect(error.mock.calls[0][1].element).toBe(card);
  });

  it('reports an error of mounted and keeps no cleanup', () => {
    const onError = vi.fn();
    configure({ onError });
    const card = em.Card({
      mounted: () => {
        throw new Error('mounted');
      },
    });
    document.body.append(card);
    expect(onError.mock.calls[0][1]).toEqual({ element: card, phase: 'mounted', event: undefined });
    expect(() => card.remove()).not.toThrow();
  });

  it('rethrows an error of a hook when nothing handles it', () => {
    const card = em.Card({
      mounted: () => {
        throw new Error('mounted');
      },
    });
    expect(() => card.connectedCallback()).toThrow('mounted');
  });
});

describe('Component: signals', () => {
  it('follows signals before it is connected', () => {
    const count = signal(0);
    const card = em.Card(() => String(count.value));
    count.value = 1;
    expect(card.shadowRoot!.textContent).toBe('1');
  });

  it('stops following signals after it left the document, and catches up when it comes back', async () => {
    const count = signal(0);
    const text = vi.fn(() => String(count.value));
    const card = em.Card({ title: () => `t${count.value}` }, tags.p(text));
    document.body.append(card);
    card.remove();
    await tick();
    count.value = 1;
    expect(text).toHaveBeenCalledTimes(1);
    expect(card.title).toBe('t0');
    document.body.append(card);
    expect(card.shadowRoot!.textContent).toBe('1');
    expect(card.title).toBe('t1');
    count.value = 2;
    expect(card.shadowRoot!.textContent).toBe('2');
  });

  it('keeps following signals when it is only moved', async () => {
    const count = signal(0);
    const text = vi.fn(() => String(count.value));
    const card = em.Card(text);
    const target = document.createElement('div');
    document.body.append(card, target);
    target.append(card);
    await tick();
    expect(text).toHaveBeenCalledTimes(1);
    count.value = 1;
    expect(card.shadowRoot!.textContent).toBe('1');
  });
});

describe('Component: form fields', () => {
  /** A stand-in for `ElementInternals`. */
  interface Fake {
    /** Records the values handed to the form. */
    setFormValue: ReturnType<typeof vi.fn>;
    /** Records the validity handed to the form. */
    setValidity: ReturnType<typeof vi.fn>;
  }
  let fakes: Fake[];
  const proto = HTMLElement.prototype as unknown as { attachInternals?: () => Fake };
  const last = (mock: ReturnType<typeof vi.fn>) => mock.mock.calls[mock.mock.calls.length - 1];

  beforeEach(() => {
    fakes = [];
    proto.attachInternals = () => {
      const fake = { setFormValue: vi.fn(), setValidity: vi.fn() };
      fakes.push(fake);
      return fake;
    };
  });

  afterEach(() => {
    delete proto.attachInternals;
  });

  it('is form associated', () => {
    expect((em.Card().constructor as typeof Component).formAssociated).toBe(true);
  });

  it('hands the value and the validity of its control to the form', () => {
    const input = tags.input({ value: 'a@b.c', required: true });
    const field = em.Field({ field: true, name: 'email', disabled: true }, input);
    expect(field.getAttribute('name')).toBe('email');
    expect(field.hasAttribute('disabled')).toBe(true);
    expect(fakes[0].setFormValue).toHaveBeenCalledWith('a@b.c');
    expect(fakes[0].setValidity).toHaveBeenCalledWith({}, '', undefined);
  });

  it('reports an invalid control with the control as the anchor', () => {
    const input = tags.input({ required: true });
    em.Field({ field: true, name: 'n' }, input);
    const [flags, message, anchor] = last(fakes[0].setValidity);
    expect(flags.valueMissing).toBe(true);
    expect(message).not.toBe('');
    expect(anchor).toBe(input);
  });

  it('hands the value again after the user changed the control and when it is connected', () => {
    const input = tags.input();
    const field = em.Field({ field: true, name: 'n' }, input);
    input.value = 'typed';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(last(fakes[0].setFormValue)).toEqual(['typed']);
    input.value = 'changed';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(last(fakes[0].setFormValue)).toEqual(['changed']);
    input.value = 'later';
    document.body.append(field);
    expect(last(fakes[0].setFormValue)).toEqual(['later']);
  });

  it('hands the value again when a signal changed a bound control', () => {
    const text = signal('a');
    em.Field({ field: true, name: 'n' }, tags.input({ bind: text }));
    text.value = 'b';
    expect(last(fakes[0].setFormValue)).toEqual(['b']);
  });

  it('works in the light DOM and without a name or a control', () => {
    const field = em.Field({ field: true, shadow: false }, tags.select(tags.option('a')));
    expect(last(fakes[0].setFormValue)).toEqual(['a']);
    expect(field.shadowRoot).toBeNull();
    em.Field({ field: true });
    expect(last(fakes[1].setFormValue)).toEqual([null]);
  });

  it('does nothing without the field prop', () => {
    const input = tags.input({ value: 'start' });
    const card = em.Card(input);
    document.body.append(card);
    input.value = 'typed';
    card.formResetCallback();
    card.formDisabledCallback(true);
    expect(fakes).toHaveLength(0);
    expect(input.value).toBe('typed');
    expect(input.disabled).toBe(false);
  });

  it('does nothing where ElementInternals is missing', () => {
    delete proto.attachInternals;
    expect(() => em.Field({ field: true, name: 'n' }, tags.input())).not.toThrow();
  });

  it('puts the control back to its default when the form is reset', () => {
    const input = tags.input({ value: 'start' });
    const field = em.Field({ field: true, name: 'n' }, input);
    input.value = 'typed';
    field.formResetCallback();
    expect(input.value).toBe('start');
    expect(last(fakes[0].setFormValue)).toEqual(['start']);
  });

  it('disables the control when the form or a fieldset does', () => {
    const input = tags.input();
    const field = em.Field({ field: true, name: 'n' }, input);
    field.formDisabledCallback(true);
    expect(input.disabled).toBe(true);
    field.formDisabledCallback(false);
    expect(input.disabled).toBe(false);
    expect(() => em.Field({ field: true }).formDisabledCallback(true)).not.toThrow();
  });

  it('forwards a click on the host to the control', () => {
    const input = tags.input({ type: 'checkbox' });
    const field = em.Field({ field: true, name: 'n' }, input);
    document.body.append(field);
    field.click();
    expect(input.checked).toBe(true);
    expect(field.shadowRoot!.activeElement).toBe(input);
  });

  it('leaves a click that started inside, and a field without a control, alone', () => {
    const input = tags.input({ type: 'checkbox' });
    const field = em.Field({ field: true, name: 'n' }, input);
    document.body.append(field);
    input.click();
    expect(input.checked).toBe(true);
    expect(() => em.Field({ field: true }).click()).not.toThrow();
  });
});

describe('init', () => {
  it('fills a component that was created by hand', () => {
    em.Card();
    const card = document.createElement('em-card') as Component;
    card[init]({ shadow: false }, ['x']);
    expect(card.textContent).toBe('x');
  });
});
