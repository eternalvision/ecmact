import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from 'ecmact';
import { attachedResource, compact, money, part, readNumber, sheet, tag } from '@site/widgets/kit';

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.lang = '';
  document.body.replaceChildren();
});

/**
 * Creates a host with an open shadow root.
 *
 * @returns The host.
 */
const hostWithRoot = () => {
  const host = document.createElement('div');
  host.attachShadow({ mode: 'open' });
  document.body.append(host);
  return host;
};

describe('sheet', () => {
  it('adopts one shared stylesheet and returns the content alone', () => {
    const first = hostWithRoot();
    const second = hostWithRoot();
    const content = document.createElement('div');
    expect(sheet(first, '.a { color: red; }', content)).toBe(content);
    sheet(second, '.a { color: red; }', document.createElement('div'));
    const [one] = first.shadowRoot?.adoptedStyleSheets ?? [];
    const [two] = second.shadowRoot?.adoptedStyleSheets ?? [];
    expect(one).toBe(two);
    expect([...(one?.cssRules ?? [])].map((rule) => rule.cssText).join(' ')).toContain(
      '.a { color: red; }',
    );
  });

  it('starts with the reset that keeps the page out and lets hidden win', () => {
    const host = hostWithRoot();
    sheet(host, '.b { color: blue; }', document.createElement('div'));
    const text = [...(host.shadowRoot?.adoptedStyleSheets[0]?.cssRules ?? [])]
      .map((rule) => rule.cssText)
      .join(' ');
    expect(text).toContain('all: initial');
    expect(text).toContain(':host([hidden])');
    expect(text).toContain('[hidden]');
  });

  it('puts a style element in front of the content where nothing can be adopted', () => {
    vi.stubGlobal('CSSStyleSheet', undefined);
    const host = hostWithRoot();
    const content = document.createElement('div');
    const fragment = sheet(host, '.c { color: green; }', content) as DocumentFragment;
    expect(fragment.firstElementChild?.tagName).toBe('STYLE');
    expect(fragment.firstElementChild?.textContent).toContain('.c { color: green; }');
    expect(fragment.lastElementChild).toBe(content);
  });

  it('uses a style element for a host without a shadow root', () => {
    const fragment = sheet(
      document.createElement('div'),
      '.d {}',
      document.createElement('div'),
    ) as DocumentFragment;
    expect(fragment.firstElementChild?.tagName).toBe('STYLE');
  });
});

describe('tag and part', () => {
  it('create components under their own element names', () => {
    const box = tag('div', { content: 'x' });
    expect(box.localName).toBe('em-widgetdiv');
    const container = part('section', 'card', 'text');
    expect(container.localName).toBe('em-widgetsection');
    document.body.append(container);
    expect(container.querySelector('.card')?.textContent).toBe('text');
  });
});

describe('money', () => {
  it('formats an amount in a currency', () => {
    expect(money(1234, 'USD')).toBe('$1,234');
  });

  it('writes the amount the way the language of the page does', () => {
    document.documentElement.lang = 'de';
    expect(money(1234, 'EUR')).toMatch(/1\.234\s€/);
  });

  it('falls back to English for a language tag the browser rejects', () => {
    document.documentElement.lang = 'not a language';
    expect(money(1234, 'USD')).toBe('$1,234');
  });

  it('falls back to plain text for an unknown currency', () => {
    expect(money(12.4, 'nope')).toBe('12 nope');
  });
});

describe('compact', () => {
  it('shortens counts, with a unit for every size', () => {
    expect(compact(950)).toBe('950');
    expect(compact(1234)).toBe('1.2K');
    expect(compact(9999)).toBe('10K');
    expect(compact(999999)).toBe('1M');
    expect(compact(2500000)).toBe('2.5M');
  });
});

describe('readNumber', () => {
  it('reads a number and falls back for anything that is not one', () => {
    expect(readNumber('45', 12)).toBe(45);
    expect(readNumber('0', 12)).toBe(0);
    expect(readNumber('', 12)).toBe(12);
    expect(readNumber('  ', 12)).toBe(12);
    expect(readNumber(null, 12)).toBe(12);
    expect(readNumber(undefined, 12)).toBe(12);
    expect(readNumber('abc', 12)).toBe(12);
    expect(readNumber('1,5', 12)).toBe(12);
    expect(readNumber('Infinity', 12)).toBe(12);
  });

  it('rejects a number below the minimum', () => {
    expect(readNumber('-5', 12)).toBe(12);
    expect(readNumber('-5', 12, -10)).toBe(-5);
  });
});

describe('attachedResource', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does nothing until it is attached, then loads and mirrors the resource', async () => {
    const fetcher = vi.fn(async () => 'one');
    const loaded = attachedResource(fetcher);
    expect(fetcher).not.toHaveBeenCalled();
    const detach = loaded.attach();
    expect(loaded.loading.value).toBe(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(loaded.data.value).toBe('one');
    expect(loaded.loading.value).toBe(false);
    expect(loaded.error.value).toBeUndefined();
    detach();
  });

  it('keeps the old data while a newer request runs, and reports an error beside it', async () => {
    const id = signal(1);
    let fail = false;
    const loaded = attachedResource(async () => {
      const value = id.value;
      if (fail) throw new Error('boom');
      return `item ${value}`;
    });
    loaded.attach();
    await vi.advanceTimersByTimeAsync(0);
    fail = true;
    id.value = 2;
    await vi.advanceTimersByTimeAsync(0);
    expect(loaded.data.value).toBe('item 1');
    expect(loaded.error.value).toBeInstanceOf(Error);
  });

  it('aborts the request when it is detached, and loads again when it is attached again', async () => {
    const aborted: boolean[] = [];
    const loaded = attachedResource(({ signal: stop }) => {
      return new Promise<string>((resolve) => {
        stop.addEventListener('abort', () => aborted.push(true));
        setTimeout(() => resolve('late'), 100);
      });
    });
    const detach = loaded.attach();
    detach();
    expect(aborted).toEqual([true]);
    expect(loaded.loading.value).toBe(false);
    await vi.advanceTimersByTimeAsync(200);
    expect(loaded.data.value).toBeUndefined();
    loaded.attach();
    await vi.advanceTimersByTimeAsync(200);
    expect(loaded.data.value).toBe('late');
  });

  it('refetches while attached and ignores refetch while detached', async () => {
    const fetcher = vi.fn(async () => 'x');
    const loaded = attachedResource(fetcher);
    loaded.refetch();
    expect(fetcher).not.toHaveBeenCalled();
    const detach = loaded.attach();
    await vi.advanceTimersByTimeAsync(0);
    loaded.refetch();
    expect(fetcher).toHaveBeenCalledTimes(2);
    detach();
    loaded.refetch();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('does not forget a newer attachment when an older one is detached late', async () => {
    const fetcher = vi.fn(async () => 'x');
    const loaded = attachedResource(fetcher);
    const first = loaded.attach();
    const second = loaded.attach();
    first();
    loaded.refetch();
    expect(fetcher).toHaveBeenCalledTimes(3);
    second();
  });
});
