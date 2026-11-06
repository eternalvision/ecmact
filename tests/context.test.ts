import { describe, expect, it, vi } from 'vitest';
import { consume, createContext, provide } from '@em';
import { contextRequestEvent } from '@em/context';

describe('createContext', () => {
  it('creates contexts with a name and a unique id', () => {
    const first = createContext<string>('theme');
    const second = createContext<string>('theme');
    expect(first.name).toBe('theme');
    expect(first.id).not.toBe(second.id);
  });
});

describe('provide', () => {
  it('pairs a context with a value', () => {
    const context = createContext<number>('count');
    expect(provide(context, 3)).toEqual({ context, value: 3 });
  });
});

describe('consume', () => {
  const answerWith = (host: HTMLElement, value: unknown) =>
    host.addEventListener(contextRequestEvent, (event) => {
      (event as CustomEvent).detail.respond(value);
    });

  it('returns the value a listener responds with', () => {
    const context = createContext<string>('theme');
    const host = document.createElement('div');
    answerWith(host, 'dark');
    expect(consume(context, host)).toBe('dark');
  });

  it('sends the context in the request', () => {
    const context = createContext<string>('theme');
    const host = document.createElement('div');
    const listener = vi.fn();
    host.addEventListener(contextRequestEvent, listener);
    consume(context, host);
    expect((listener.mock.calls[0][0] as CustomEvent).detail.context).toBe(context);
  });

  it('returns undefined when nobody answers', () => {
    expect(consume(createContext<string>('theme'), document.createElement('div'))).toBeUndefined();
  });

  it('returns undefined when the provided value is undefined', () => {
    const host = document.createElement('div');
    answerWith(host, undefined);
    expect(consume(createContext<string>('theme'), host)).toBeUndefined();
  });

  it('bubbles through ancestors and across shadow roots', () => {
    const outer = document.createElement('div');
    const shadow = outer.attachShadow({ mode: 'open' });
    const leaf = document.createElement('span');
    shadow.append(leaf);
    answerWith(outer, 'found');
    document.body.append(outer);
    expect(consume(createContext<string>('theme'), leaf)).toBe('found');
  });
});
