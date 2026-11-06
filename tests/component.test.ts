import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, consume, createContext, effect, em, provide, signal, tags } from '@em';
import { resetConfig, configure } from '@em/config';
import { resetWarnings } from '@em/utils/warn';
import { inner } from '@tests/helpers';

let spy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  spy.mockRestore();
  resetWarnings();
  resetConfig();
  document.body.replaceChildren();
});

describe('props', () => {
  it('renders the initial props', () => {
    const card = em.Card({ content: 'a', title: 't' });
    expect(inner(card).textContent).toBe('a');
    expect(card.props).toEqual({ content: 'a', title: 't' });
  });

  it('replaces all props when assigned', () => {
    const card = em.Card({ content: 'a', title: 't' });
    card.props = { content: 'b' };
    expect(card.props).toEqual({ content: 'b' });
    expect(inner(card).hasAttribute('title')).toBe(false);
  });

  it('merges new props into the existing ones with setState', () => {
    const card = em.Card({ content: 'a', title: 't' });
    card.setState({ content: 'b' });
    expect(card.props).toMatchObject({ content: 'b', title: 't' });
    expect(inner(card).textContent).toBe('b');
  });

  it('removes attributes set to undefined', () => {
    const card = em.Card({ title: 'a', lang: 'en' });
    card.setState({ title: undefined });
    expect(inner(card).hasAttribute('title')).toBe(false);
    expect(inner(card).getAttribute('lang')).toBe('en');
  });

  it('replaces handlers on update without duplicating them', () => {
    const first = vi.fn();
    const second = vi.fn();
    const card = em.Card({ onclick: first });
    card.setState({ onclick: second });
    inner(card).click();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('renders on connect when props were never set', () => {
    const element = document.createElement('em-card') as ReturnType<typeof em.Card>;
    document.body.append(element);
    expect(inner(element).localName).toBe('div');
  });
});

describe('updates', () => {
  it('reuses the element between renders', () => {
    const card = em.Card({ content: 'a' });
    const before = inner(card);
    card.setState({ content: 'b' });
    expect(inner(card)).toBe(before);
  });

  it('keeps input state between renders', () => {
    const field = em.Field({ tag: 'input' });
    (inner(field) as HTMLInputElement).value = 'typed';
    field.setState({ placeholder: 'name' });
    expect((inner(field) as HTMLInputElement).value).toBe('typed');
  });

  it('recreates the element when the tag changes', () => {
    const card = em.Card({ tag: 'div' as string });
    const before = inner(card);
    card.setState({ tag: 'section' });
    expect(inner(card)).not.toBe(before);
    expect(inner(card).localName).toBe('section');
  });

  it('does not render again on connect when already rendered', () => {
    const card = em.Card({ content: 'a' });
    const before = inner(card);
    document.body.append(card);
    expect(inner(card)).toBe(before);
  });
});

describe('shadow option', () => {
  it('renders into an open shadow root by default', () => {
    const card = em.Card({ content: 'x' });
    expect(inner(card).textContent).toBe('x');
    expect(card.children).toHaveLength(0);
  });

  it('renders into the host when shadow is false', () => {
    const card = em.Card({ shadow: false, content: 'x' });
    expect(card.shadowRoot).toBeNull();
    expect(card.firstElementChild?.textContent).toBe('x');
  });

  it('is visible to global selectors when shadow is false', () => {
    document.body.append(em.Card({ shadow: false, class: 'box' }));
    expect(document.querySelector('em-card > div.box')).not.toBeNull();
  });

  it('updates in place when shadow is false', () => {
    const field = em.Field({ shadow: false, tag: 'input' });
    const before = field.firstElementChild;
    field.setState({ placeholder: 'name' });
    expect(field.firstElementChild).toBe(before);
    expect(field.childElementCount).toBe(1);
  });

  it('is read on the first render only', () => {
    const card = em.Card({ content: 'a' });
    card.setState({ shadow: false });
    expect(card.shadowRoot?.firstElementChild).not.toBeNull();
    expect(card.children).toHaveLength(0);
  });

  it('follows the configured default', () => {
    configure({ shadow: false });
    expect(em.Card({ content: 'x' }).shadowRoot).toBeNull();
  });

  it('lets the component override the configured default', () => {
    configure({ shadow: false });
    expect(em.Card({ shadow: true }).shadowRoot).not.toBeNull();
  });
});

describe('mounted', () => {
  it('runs on connect with the inner element and the component', () => {
    const mounted = vi.fn();
    const card = em.Card({ mounted });
    expect(mounted).not.toHaveBeenCalled();
    document.body.append(card);
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(mounted).toHaveBeenCalledWith(inner(card), card);
  });

  it('runs on every reconnect', () => {
    const mounted = vi.fn();
    const card = em.Card({ mounted });
    document.body.append(card);
    card.remove();
    document.body.append(card);
    expect(mounted).toHaveBeenCalledTimes(2);
  });

  it('works with shadow false', () => {
    const mounted = vi.fn();
    const card = em.Card({ shadow: false, mounted });
    document.body.append(card);
    expect(mounted).toHaveBeenCalledWith(card.firstElementChild, card);
  });

  it('lets a hook update the component', () => {
    const card = em.Card({
      content: 'before',
      mounted: (_, component) => component.setState({ content: 'after' }),
    });
    document.body.append(card);
    expect(inner(card).textContent).toBe('after');
  });
});

describe('cleanup returned from mounted', () => {
  it('runs on disconnect before unmounted', () => {
    const order: string[] = [];
    const card = em.Card({
      mounted: () => () => order.push('cleanup'),
      unmounted: () => order.push('unmounted'),
    });
    document.body.append(card);
    expect(order).toEqual([]);
    card.remove();
    expect(order).toEqual(['cleanup', 'unmounted']);
  });

  it('runs once per mount cycle', () => {
    const cleanup = vi.fn();
    const mounted = vi.fn(() => cleanup);
    const card = em.Card({ mounted });
    document.body.append(card);
    card.remove();
    document.body.append(card);
    card.remove();
    expect(mounted).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('is not called again when disconnected twice', () => {
    const cleanup = vi.fn();
    const card = em.Card({ mounted: () => cleanup });
    document.body.append(card);
    card.remove();
    card.disconnectedCallback();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('is optional', () => {
    const card = em.Card({ mounted: () => {} });
    document.body.append(card);
    expect(() => card.remove()).not.toThrow();
  });
});

describe('unmounted', () => {
  it('runs on disconnect with the inner element and the component', () => {
    const unmounted = vi.fn();
    const card = em.Card({ unmounted });
    document.body.append(card);
    expect(unmounted).not.toHaveBeenCalled();
    card.remove();
    expect(unmounted).toHaveBeenCalledWith(inner(card), card);
  });

  it('uses the latest props', () => {
    const first = vi.fn();
    const second = vi.fn();
    const card = em.Card({ unmounted: first });
    document.body.append(card);
    card.setState({ unmounted: second });
    card.remove();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe('updated', () => {
  it('does not run on the first render', () => {
    const updated = vi.fn();
    document.body.append(em.Card({ updated }));
    expect(updated).not.toHaveBeenCalled();
  });

  it('runs after every later render with the element, the component and the previous props', () => {
    const updated = vi.fn();
    const card = em.Card({ content: 'a', updated });
    card.setState({ content: 'b' });
    card.setState({ content: 'c' });
    expect(updated).toHaveBeenCalledTimes(2);
    expect(updated.mock.calls[0][0]).toBe(inner(card));
    expect(updated.mock.calls[0][1]).toBe(card);
    expect(updated.mock.calls[0][2]).toMatchObject({ content: 'a' });
    expect(updated.mock.calls[1][2]).toMatchObject({ content: 'b' });
  });

  it('receives the new element when the tag changes', () => {
    const updated = vi.fn();
    const card = em.Card({ tag: 'div' as string, updated });
    card.setState({ tag: 'section' });
    expect(updated.mock.calls[0][0]).toBe(inner(card));
    expect((updated.mock.calls[0][0] as HTMLElement).localName).toBe('section');
  });
});

describe('beforeUpdate', () => {
  it('does not run on the first render', () => {
    const beforeUpdate = vi.fn();
    em.Card({ beforeUpdate });
    expect(beforeUpdate).not.toHaveBeenCalled();
  });

  it('receives next props, current props and the component', () => {
    const beforeUpdate = vi.fn();
    const card = em.Card({ content: 'a', beforeUpdate });
    card.setState({ content: 'b' });
    const [next, current, component] = beforeUpdate.mock.calls[0];
    expect(next.content).toBe('b');
    expect(current.content).toBe('a');
    expect(component).toBe(card);
  });

  it('cancels the update when it returns false', () => {
    const updated = vi.fn();
    const card = em.Card({ content: 'a', beforeUpdate: () => false, updated });
    card.setState({ content: 'b' });
    expect(inner(card).textContent).toBe('a');
    expect(card.props.content).toBe('a');
    expect(updated).not.toHaveBeenCalled();
  });

  it('allows the update when it returns true or nothing', () => {
    const decide = vi.fn<() => boolean | void>();
    const card = em.Card({ content: 'a', beforeUpdate: decide });
    decide.mockReturnValueOnce(true);
    card.setState({ content: 'b' });
    decide.mockReturnValueOnce(undefined);
    card.setState({ content: 'c' });
    expect(inner(card).textContent).toBe('c');
  });

  it('can skip updates that change nothing', () => {
    const card = em.Card({
      content: 'a',
      beforeUpdate: (next, current) => next.content !== current.content,
    });
    const child = document.createElement('i');
    card.setState({ children: [child] });
    expect(inner(card).contains(child)).toBe(false);
    card.setState({ content: 'b' });
    expect(inner(card).textContent).toBe('b');
  });
});

describe('signals', () => {
  const text = (component: HTMLElement) => inner(component).textContent;

  it('renders the current value of a signal prop', () => {
    const label = signal('a');
    expect(text(em.Card({ content: label }))).toBe('a');
  });

  it('updates the DOM when a signal changes while connected', () => {
    const label = signal('a');
    const card = em.Card({ content: label });
    document.body.append(card);
    label.value = 'b';
    expect(text(card)).toBe('b');
  });

  it('keeps the element when a signal changes', () => {
    const label = signal('a');
    const card = em.Card({ content: label });
    document.body.append(card);
    const before = inner(card);
    label.value = 'b';
    expect(inner(card)).toBe(before);
  });

  it('does not subscribe before the component is connected', () => {
    const label = signal('a');
    const card = em.Card({ content: label });
    label.value = 'b';
    expect(text(card)).toBe('a');
  });

  it('stops following signals after disconnect', () => {
    const label = signal('a');
    const card = em.Card({ content: label });
    document.body.append(card);
    card.remove();
    label.value = 'b';
    expect(text(card)).toBe('a');
  });

  it('catches up with changes made while disconnected when it reconnects', () => {
    const label = signal('a');
    const card = em.Card({ content: label });
    document.body.append(card);
    card.remove();
    label.value = 'b';
    document.body.append(card);
    expect(text(card)).toBe('b');
    label.value = 'c';
    expect(text(card)).toBe('c');
  });

  it('does not repaint on reconnect when nothing changed', () => {
    const updated = vi.fn();
    const card = em.Card({ content: signal('a'), updated });
    document.body.append(card);
    card.remove();
    document.body.append(card);
    expect(updated).not.toHaveBeenCalled();
  });

  it('can veto the repaint on reconnect', () => {
    const label = signal('a');
    const card = em.Card({ content: label, beforeUpdate: () => false });
    document.body.append(card);
    card.remove();
    label.value = 'b';
    document.body.append(card);
    expect(text(card)).toBe('a');
  });

  it('resolves computed signals', () => {
    const count = signal(1);
    const card = em.Card({ content: computed(() => `count ${count.value}`) });
    document.body.append(card);
    count.value = 2;
    expect(text(card)).toBe('count 2');
  });

  it('applies signals in attributes', () => {
    const title = signal('a');
    const card = em.Card({ title });
    document.body.append(card);
    title.value = 'b';
    expect(inner(card).getAttribute('title')).toBe('b');
  });

  it('applies signals in style values and in the whole style', () => {
    const color = signal('red');
    const style = signal({ margin: '1px' });
    const card = em.Card({ style: { color } });
    const other = em.Card({ style });
    document.body.append(card, other);
    color.value = 'blue';
    style.value = { margin: '2px' };
    expect(inner(card).style.color).toBe('blue');
    expect(inner(other).style.margin).toBe('2px');
  });

  it('applies a css signal', () => {
    const css = signal('div { color: red; }');
    const card = em.Card({ css });
    document.body.append(card);
    css.value = 'div { color: blue; }';
    expect(card.shadowRoot!.adoptedStyleSheets).toHaveLength(1);
  });

  it('follows the signals of the new props after setState', () => {
    const first = signal('first');
    const second = signal('second');
    const card = em.Card({ content: first });
    document.body.append(card);
    card.setState({ content: second });
    first.value = 'ignored';
    expect(text(card)).toBe('second');
    second.value = 'changed';
    expect(text(card)).toBe('changed');
  });

  it('stops following a signal that setState replaced with a plain value', () => {
    const label = signal('a');
    const card = em.Card({ content: label });
    document.body.append(card);
    card.setState({ content: 'plain' });
    label.value = 'b';
    expect(text(card)).toBe('plain');
  });

  it('exposes the raw props, with the signals', () => {
    const label = signal('a');
    expect(em.Card({ content: label }).props.content).toBe(label);
  });

  it('calls updated with the resolved current and previous props', () => {
    const label = signal('a');
    const updated = vi.fn();
    const card = em.Card({ content: label, updated });
    document.body.append(card);
    label.value = 'b';
    expect(updated).toHaveBeenCalledTimes(1);
    expect(updated.mock.calls[0][0]).toBe(inner(card));
    expect(updated.mock.calls[0][1]).toBe(card);
    expect(updated.mock.calls[0][2]).toMatchObject({ content: 'a' });
  });

  it('runs beforeUpdate with resolved values and can veto signal updates', () => {
    const label = signal('a');
    const beforeUpdate = vi.fn(() => false);
    const card = em.Card({ content: label, beforeUpdate });
    document.body.append(card);
    label.value = 'b';
    const [next, current] = beforeUpdate.mock.calls[0] as unknown as [
      Record<string, unknown>,
      Record<string, unknown>,
    ];
    expect(next.content).toBe('b');
    expect(current.content).toBe('a');
    expect(text(card)).toBe('a');
  });

  it('keeps tracking after a vetoed update', () => {
    const label = signal('a');
    let allow = false;
    const card = em.Card({ content: label, beforeUpdate: () => allow });
    document.body.append(card);
    label.value = 'b';
    allow = true;
    label.value = 'c';
    expect(text(card)).toBe('c');
  });

  it('does not make the surrounding effect depend on the props it resolves', () => {
    const label = signal('a');
    const outer = signal(0);
    const run = vi.fn(() => {
      void outer.value;
      document.body.append(em.Card({ content: label }));
    });
    effect(run);
    label.value = 'b';
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('does not make the surrounding effect depend on hook reads', () => {
    const inside = signal(0);
    const outer = signal(0);
    const run = vi.fn(() => {
      void outer.value;
      document.body.append(em.Card({ mounted: () => void inside.value }));
    });
    effect(run);
    inside.value = 1;
    expect(run).toHaveBeenCalledTimes(1);
  });
});

describe('error handling', () => {
  const boom = new Error('boom');
  const fail = () => {
    throw boom;
  };

  it('rethrows hook errors when there is no handler', () => {
    const card = em.Card({ mounted: fail });
    expect(() => card.connectedCallback()).toThrow(boom);
  });

  it('reports a mounted error to the component handler and keeps going', () => {
    const error = vi.fn();
    const card = em.Card({ mounted: fail, error });
    document.body.append(card);
    expect(error).toHaveBeenCalledWith(boom, {
      component: card,
      phase: 'mounted',
      event: undefined,
    });
    card.setState({ content: 'still works' });
    expect(inner(card).textContent).toBe('still works');
  });

  it('reports an unmounted error', () => {
    const error = vi.fn();
    const card = em.Card({ unmounted: fail, error });
    document.body.append(card);
    card.remove();
    expect(error.mock.calls[0][1]).toMatchObject({ phase: 'unmounted' });
  });

  it('reports a cleanup error and still runs unmounted', () => {
    const error = vi.fn();
    const unmounted = vi.fn();
    const card = em.Card({ mounted: () => fail, unmounted, error });
    document.body.append(card);
    card.remove();
    expect(error.mock.calls[0][1]).toMatchObject({ phase: 'cleanup' });
    expect(unmounted).toHaveBeenCalledTimes(1);
  });

  it('reports a beforeUpdate error and lets the update through', () => {
    const error = vi.fn();
    const card = em.Card({ content: 'a', beforeUpdate: fail, error });
    card.setState({ content: 'b' });
    expect(error.mock.calls[0][1]).toMatchObject({ phase: 'beforeUpdate' });
    expect(inner(card).textContent).toBe('b');
  });

  it('reports an updated error', () => {
    const error = vi.fn();
    const card = em.Card({ updated: fail, error });
    card.setState({ content: 'b' });
    expect(error.mock.calls[0][1]).toMatchObject({ phase: 'updated' });
  });

  it('reports a render error and skips updated', () => {
    const error = vi.fn();
    const updated = vi.fn();
    const card = em.Card({ updated, error, ref: fail });
    expect(error.mock.calls[0][1]).toMatchObject({ phase: 'render' });
    card.setState({ tag: 'section' as never, ref: fail });
    expect(error).toHaveBeenCalledTimes(2);
    expect(updated).not.toHaveBeenCalled();
  });

  it('reports an event handler error with the event name', () => {
    const error = vi.fn();
    const card = em.Card({ onclick: fail, error });
    inner(card).click();
    expect(error).toHaveBeenCalledWith(boom, { component: card, phase: 'event', event: 'click' });
  });

  it('falls back to the configured handler', () => {
    const onError = vi.fn();
    configure({ onError });
    em.Card({ onclick: fail }).shadowRoot!.firstElementChild!.dispatchEvent(new Event('click'));
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('prefers the component handler over the configured one', () => {
    const onError = vi.fn();
    const error = vi.fn();
    configure({ onError });
    const card = em.Card({ mounted: fail, error });
    document.body.append(card);
    expect(error).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('reports errors from signal driven updates', () => {
    const error = vi.fn();
    const label = signal('a');
    const card = em.Card({ content: label, updated: fail, error });
    document.body.append(card);
    label.value = 'b';
    expect(error.mock.calls[0][1]).toMatchObject({ phase: 'updated' });
  });
});

describe('context', () => {
  const theme = createContext<string>('theme');
  const locale = createContext<string>('locale');

  const consumer = (onValue: (value: string | undefined) => void) =>
    em.Consumer({
      mounted: (_, component) => {
        onValue(consume(theme, component));
      },
    });

  it('gives consumers the value of the nearest provider above them', () => {
    const seen: (string | undefined)[] = [];
    const provider = em.Provider({
      provide: [provide(theme, 'dark')],
      children: [consumer((value) => seen.push(value))],
    });
    document.body.append(provider);
    expect(seen).toEqual(['dark']);
  });

  it('prefers the closer provider', () => {
    const seen: (string | undefined)[] = [];
    const inside = em.Inner({
      provide: [provide(theme, 'inner')],
      children: [consumer((value) => seen.push(value))],
    });
    document.body.append(em.Outer({ provide: [provide(theme, 'outer')], children: [inside] }));
    expect(seen).toEqual(['inner']);
  });

  it('passes unrelated contexts on to outer providers', () => {
    const seen: (string | undefined)[] = [];
    const reader = em.Reader({
      mounted: (_, component) => {
        seen.push(consume(locale, component));
      },
    });
    const inside = em.Inner({ provide: [provide(theme, 'dark')], children: [reader] });
    document.body.append(em.Outer({ provide: [provide(locale, 'cs')], children: [inside] }));
    expect(seen).toEqual(['cs']);
  });

  it('does not answer its own request, only requests from below', () => {
    const seen: (string | undefined)[] = [];
    const middle = em.Middle({
      provide: [provide(theme, 'middle')],
      mounted: (_, component) => {
        seen.push(consume(theme, component));
      },
    });
    document.body.append(em.Outer({ provide: [provide(theme, 'outer')], children: [middle] }));
    expect(seen).toEqual(['outer']);
  });

  it('returns undefined without a provider', () => {
    const seen: (string | undefined)[] = [];
    document.body.append(consumer((value) => seen.push(value)));
    expect(seen).toEqual([undefined]);
  });

  it('works for plain elements inside a provider', () => {
    const provider = em.Provider({ provide: [provide(theme, 'dark')] });
    document.body.append(provider);
    const probe = document.createElement('span');
    inner(provider).append(probe);
    expect(consume(theme, probe)).toBe('dark');
  });

  it('answers for elements inside it even while it is not in the document', () => {
    const provider = em.Provider({ provide: [provide(theme, 'dark')] });
    const probe = document.createElement('span');
    inner(provider).append(probe);
    expect(consume(theme, probe)).toBe('dark');
  });

  it('follows the current provide prop', () => {
    const probe = document.createElement('span');
    const provider = em.Provider({ provide: [provide(theme, 'dark')], children: [probe] });
    provider.setState({ provide: [provide(theme, 'light')] });
    expect(consume(theme, probe)).toBe('light');
  });

  it('can provide a signal that consumers read reactively', () => {
    const mode = signal('light');
    const provider = em.Provider({
      provide: [provide(createContext<typeof mode>('mode'), mode)],
    });
    const mark = createContext<typeof mode>('mark');
    const reactive = em.Provider({ provide: [provide(mark, mode)] });
    const label = tags.span({
      mounted: (_, component) => {
        const value = consume(mark, component)!;
        component.setState({ content: computed(() => `mode ${value.value}`) });
      },
    });
    inner(reactive).append(label);
    document.body.append(provider, reactive);
    expect(inner(label).textContent).toBe('mode light');
    mode.value = 'dark';
    expect(inner(label).textContent).toBe('mode dark');
  });
});

describe('warnings', () => {
  it('warns when shadow changes after the first render', () => {
    const card = em.Card({ content: 'a' });
    card.setState({ shadow: false });
    expect(spy).toHaveBeenCalledWith('ecmact: shadow cannot change after the first render');
  });

  it('warns when the default changes between renders', () => {
    const card = em.Card({ content: 'a' });
    configure({ shadow: false });
    card.setState({ content: 'b' });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not warn when shadow stays the same', () => {
    const card = em.Card({ shadow: false, content: 'a' });
    card.setState({ content: 'b' });
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('element', () => {
  it('is null before the first render', () => {
    expect((document.createElement('em-card') as ReturnType<typeof em.Card>).element).toBeNull();
  });

  it('is the inner element after rendering', () => {
    const card = em.Card({ content: 'x' });
    expect(card.element).toBe(inner(card));
  });

  it('is the new element after the tag changes', () => {
    const card = em.Card({ tag: 'div' as string });
    card.setState({ tag: 'section' });
    expect(card.element?.localName).toBe('section');
  });
});

describe('children', () => {
  const item = (key: number, content: string) => tags.li({ key, content });

  it('renders text mixed with elements', () => {
    const link = tags.a({ href: '/x', content: 'link' });
    const paragraph = tags.p({ children: ['See ', link, ' for details'] });
    expect(inner(paragraph).childNodes).toHaveLength(3);
    expect(inner(paragraph).textContent).toBe('See  for details');
  });

  it('does not render the key as an attribute', () => {
    expect(inner(item(1, 'a')).hasAttribute('key')).toBe(false);
  });

  it('keeps keyed items and their state when the list changes', () => {
    const field = (key: number) => em.Field({ key, tag: 'input' });
    const list = tags.ul({ children: [field(1), field(2)] });
    const [one, two] = Array.from(inner(list).children) as ReturnType<typeof field>[];
    (inner(one) as HTMLInputElement).value = 'first';
    (inner(two) as HTMLInputElement).value = 'second';
    list.setState({ children: [field(2), field(1), field(3)] });
    const after = Array.from(inner(list).children);
    expect(after.slice(0, 2)).toEqual([two, one]);
    expect(after).toHaveLength(3);
    expect((inner(one) as HTMLInputElement).value).toBe('first');
    expect((inner(two) as HTMLInputElement).value).toBe('second');
  });

  it('updates keyed items with the new props', () => {
    const list = tags.ul({ children: [item(1, 'a'), item(2, 'b')] });
    const [first] = Array.from(inner(list).children);
    list.setState({ children: [item(1, 'changed'), item(2, 'b')] });
    expect(Array.from(inner(list).children)[0]).toBe(first);
    expect(first?.shadowRoot?.firstElementChild?.textContent).toBe('changed');
  });

  it('runs hooks of the surviving item, not of the discarded instance', () => {
    const mounted = vi.fn();
    const list = tags.ul({ children: [tags.li({ key: 1, mounted })] });
    document.body.append(list);
    list.setState({ children: [tags.li({ key: 1, mounted })] });
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it('follows a signal used as a text child', () => {
    const name = signal('Ada');
    const greeting = tags.p({ children: ['Hello, ', name, '!'] });
    document.body.append(greeting);
    name.value = 'Grace';
    expect(inner(greeting).textContent).toBe('Hello, Grace!');
  });

  it('does not repaint on reconnect when the children did not change', () => {
    const updated = vi.fn();
    const greeting = tags.p({ children: ['Hello, ', signal('Ada')], updated });
    document.body.append(greeting);
    greeting.remove();
    document.body.append(greeting);
    expect(updated).not.toHaveBeenCalled();
  });

  it('rebuilds a list from a signal inside an effect', () => {
    const items = signal([1, 2]);
    const list = tags.ul({
      mounted: (_, component) =>
        effect(() => component.setState({ children: items.value.map((id) => item(id, `n${id}`)) })),
    });
    document.body.append(list);
    const [first] = Array.from(inner(list).children);
    items.value = [1, 2, 3];
    expect(inner(list).children).toHaveLength(3);
    expect(Array.from(inner(list).children)[0]).toBe(first);
  });
});

describe('form fields', () => {
  interface Fake {
    setFormValue: ReturnType<typeof vi.fn>;
    setValidity: ReturnType<typeof vi.fn>;
  }
  let fakes: Fake[];
  const proto = HTMLElement.prototype as unknown as { attachInternals?: () => Fake };

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
    expect(
      (em.Card() as unknown as { constructor: { formAssociated: boolean } }).constructor
        .formAssociated,
    ).toBe(true);
  });

  it('hands name, disabled, value and validity to the form', () => {
    const field = em.Field({
      tag: 'input',
      field: true,
      name: 'email',
      value: 'a@b.c',
      disabled: true,
    });
    document.body.append(field);
    expect(field.getAttribute('name')).toBe('email');
    expect(field.hasAttribute('disabled')).toBe(true);
    expect(fakes[0].setFormValue).toHaveBeenLastCalledWith('a@b.c');
    expect(fakes[0].setValidity).toHaveBeenLastCalledWith({}, '', undefined);
  });

  it('reports an invalid control with an anchor', () => {
    const field = em.Field({ tag: 'input', field: true, name: 'n', required: true });
    document.body.append(field);
    const [flags, message, anchor] = fakes[0].setValidity.mock.calls.at(-1)!;
    expect(flags.valueMissing).toBe(true);
    expect(message).not.toBe('');
    expect(anchor).toBe(field.element);
  });

  it('follows what the user types', () => {
    const field = em.Field({ tag: 'input', field: true, name: 'n' });
    document.body.append(field);
    const input = field.element as HTMLInputElement;
    input.value = 'typed';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    expect(fakes[0].setFormValue).toHaveBeenLastCalledWith('typed');
    input.value = 'changed';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(fakes[0].setFormValue).toHaveBeenLastCalledWith('changed');
  });

  it('updates the host when props change, and drops the name', () => {
    const field = em.Field({ tag: 'input', field: true, name: 'n', disabled: true });
    document.body.append(field);
    field.setState({ name: undefined, disabled: false } as never);
    expect(field.hasAttribute('name')).toBe(false);
    expect(field.hasAttribute('disabled')).toBe(false);
    expect(fakes).toHaveLength(1);
  });

  it('does nothing without the field prop', () => {
    document.body.append(em.Field({ tag: 'input', name: 'n' }));
    expect(fakes).toHaveLength(0);
  });

  it('does nothing where ElementInternals is not available', () => {
    delete proto.attachInternals;
    const field = em.Field({ tag: 'input', field: true, name: 'n' });
    document.body.append(field);
    expect(field.hasAttribute('name')).toBe(false);
  });

  it('puts the control back to its default when the form resets', () => {
    const field = em.Field({ tag: 'input', field: true, name: 'n', value: 'start' }) as unknown as {
      element: HTMLInputElement;
      formResetCallback(): void;
    };
    document.body.append(field as unknown as Node);
    field.element.value = 'typed';
    field.formResetCallback();
    expect(field.element.value).toBe('start');
    expect(fakes[0].setFormValue).toHaveBeenLastCalledWith('start');
  });

  it('disables the control when the form or a fieldset does', () => {
    const field = em.Field({ tag: 'input', field: true, name: 'n' }) as unknown as {
      element: HTMLInputElement;
      formDisabledCallback(disabled: boolean): void;
    };
    document.body.append(field as unknown as Node);
    field.formDisabledCallback(true);
    expect(field.element.disabled).toBe(true);
    field.formDisabledCallback(false);
    expect(field.element.disabled).toBe(false);
  });

  it('keeps a control disabled by its own prop when the form enables it', () => {
    const field = em.Field({ tag: 'input', field: true, name: 'n', disabled: true }) as unknown as {
      element: HTMLInputElement;
      formDisabledCallback(disabled: boolean): void;
    };
    document.body.append(field as unknown as Node);
    field.formDisabledCallback(false);
    expect(field.element.disabled).toBe(true);
  });

  it('ignores a form disabling an element that cannot be disabled', () => {
    const field = em.Field({ field: true }) as unknown as {
      formDisabledCallback(disabled: boolean): void;
    };
    document.body.append(field as unknown as Node);
    expect(() => field.formDisabledCallback(true)).not.toThrow();
  });

  it('reports errors from the form hand-over to the error handler', () => {
    proto.attachInternals = () => {
      throw new Error('no internals');
    };
    const onError = vi.fn();
    document.body.append(em.Field({ tag: 'input', field: true, error: onError }));
    expect(onError).toHaveBeenCalled();
  });
});
