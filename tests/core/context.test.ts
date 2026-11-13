import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createContext, em, mount, signal, tags } from '@em';
import { contextRequestEvent, notifyAttached, offer } from '@em/core/context';

afterEach(() => {
  document.body.replaceChildren();
});

describe('createContext', () => {
  it('creates contexts with a name and a unique id', () => {
    const first = createContext<string>('theme');
    const second = createContext<string>('theme');
    expect(first.name).toBe('theme');
    expect(first.id).not.toBe(second.id);
  });

  it('types use with undefined, unless there is a fallback', () => {
    const node = document.createElement('div');
    expectTypeOf(createContext<number>('n').use(node)).toEqualTypeOf<number | undefined>();
    expectTypeOf(createContext('n', 1).use(node)).toEqualTypeOf<number>();
  });
});

describe('provide', () => {
  it('pairs the context with a value', () => {
    const context = createContext<number>('count');
    expect(context.provide(3)).toEqual({ context, value: 3 });
  });
});

describe('use', () => {
  const answerWith = (host: HTMLElement, value: unknown) =>
    host.addEventListener(contextRequestEvent, (event) => {
      (event as CustomEvent).detail.respond(value);
    });

  it('returns the value a provider responds with', () => {
    const host = document.createElement('div');
    answerWith(host, 'dark');
    expect(createContext<string>('theme').use(host)).toBe('dark');
  });

  it('sends the context in the request', () => {
    const context = createContext<string>('theme');
    const host = document.createElement('div');
    const listener = vi.fn();
    host.addEventListener(contextRequestEvent, listener);
    context.use(host);
    expect((listener.mock.calls[0][0] as CustomEvent).detail.context).toBe(context);
  });

  it('returns undefined, or the fallback, when nobody answers', () => {
    const host = document.createElement('div');
    expect(createContext<string>('theme').use(host)).toBeUndefined();
    expect(createContext('theme', 'light').use(host)).toBe('light');
  });

  it('returns a provided undefined instead of the fallback', () => {
    const host = document.createElement('div');
    answerWith(host, undefined);
    expect(createContext<string | undefined>('theme', 'light').use(host)).toBeUndefined();
  });

  it('bubbles through ancestors and across shadow roots, from text nodes too', () => {
    const outer = document.createElement('div');
    const leaf = document.createTextNode('leaf');
    outer.attachShadow({ mode: 'open' }).append(leaf);
    answerWith(outer, 'found');
    document.body.append(outer);
    expect(createContext<string>('theme').use(leaf)).toBe('found');
  });

  it('throws without a node outside of a reactive function', () => {
    expect(() => createContext<string>('theme').use()).toThrow('context "theme" needs a node');
  });

  it('uses the element of the reactive function it is called from', () => {
    const Accent = createContext<string>('accent');
    const label = tags.p({ title: () => Accent.use() ?? 'none' });
    expect(label.title).toBe('none');
    mount(document.body, tags.div({ provide: Accent.provide('red') }, label));
    expect(label.title).toBe('red');
  });

  it('works in a reactive child and follows a provided signal', () => {
    const Accent = createContext<ReturnType<typeof signal<string>>>('accent');
    const color = signal('red');
    const label = tags.p(() => Accent.use()?.value ?? 'none');
    mount(document.body, tags.div({ provide: [Accent.provide(color)] }, label));
    expect(label.textContent).toBe('red');
    color.value = 'blue';
    expect(label.textContent).toBe('blue');
  });

  it('looks again when a component is connected or a reactive child puts the element in', () => {
    const Accent = createContext<string>('accent');
    const inCard = tags.p({ title: () => Accent.use() ?? 'none' });
    document.body.append(em.Card({ provide: Accent.provide('card') }, inCard));
    expect(inCard.title).toBe('card');
    const show = signal(false);
    const late = tags.p({ title: () => Accent.use() ?? 'none' });
    mount(
      document.body,
      tags.div({ provide: Accent.provide('region') }, () => show.value && late),
    );
    show.value = true;
    expect(late.title).toBe('region');
  });

  it('stops looking once the element is in the document', () => {
    const Accent = createContext<string>('accent');
    const read = vi.fn(() => Accent.use() ?? 'none');
    mount(document.body, tags.p({ title: read }));
    const calls = read.mock.calls.length;
    notifyAttached();
    expect(read).toHaveBeenCalledTimes(calls);
  });
});

describe('offer', () => {
  it('answers the requests of the elements below for the contexts it provides', () => {
    const theme = createContext<string>('theme');
    const provider = document.createElement('div');
    const leaf = document.createElement('span');
    provider.append(leaf);
    offer(provider, [theme.provide('dark')]);
    expect(theme.use(leaf)).toBe('dark');
  });

  it('lets requests for other contexts pass to an outer provider', () => {
    const theme = createContext<string>('theme');
    const locale = createContext<string>('locale');
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    const leaf = document.createElement('span');
    outer.append(inner);
    inner.append(leaf);
    offer(outer, [locale.provide('cs')]);
    offer(inner, [theme.provide('dark')]);
    expect(locale.use(leaf)).toBe('cs');
  });

  it('does not answer its own request, so the nearest provider above wins', () => {
    const theme = createContext<string>('theme');
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    outer.append(inner);
    offer(outer, [theme.provide('outer')]);
    offer(inner, [theme.provide('inner')]);
    expect(theme.use(inner)).toBe('outer');
  });
});
