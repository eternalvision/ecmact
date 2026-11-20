import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineFeedLamp, parseFeeds } from '@site/widgets/feedLamp';
import { mountWidget, stubFetch } from '@tests/widgets/helpers';

defineFeedLamp();

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

const state = (root: ShadowRoot) => root.querySelector('.state')?.textContent;
const meta = (root: ShadowRoot) => root.querySelector('.meta')?.textContent;
const lamp = (root: ShadowRoot) => root.querySelector('.plate')?.getAttribute('data-lamp');
const lampName = (root: ShadowRoot) => root.querySelector('.lamp')?.getAttribute('aria-label');
const tabs = (root: ShadowRoot) => [...root.querySelectorAll<HTMLElement>('[role="tab"]')];
const press = (target: Element, key: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
const settle = () => vi.advanceTimersByTimeAsync(0);

/** A `fetch` that answers from a table of addresses, each with a status and a body. */
const answers = (table: Record<string, [number, string]>) => {
  const mock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const hit = table[String(input)];
    if (!hit) throw new TypeError('Failed to fetch');
    if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return new Response(hit[1], { status: hit[0] });
  });
  vi.stubGlobal('fetch', mock);
  return mock;
};

/** A `fetch` that does not answer until told to, and gives up when its signal aborts, as a real one does. */
const pending = () => {
  const signals: AbortSignal[] = [];
  const mock = vi.fn(
    (_input: unknown, init?: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        const signal = init?.signal as AbortSignal;
        signals.push(signal);
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        void resolve;
      }),
  );
  vi.stubGlobal('fetch', mock);
  return { mock, signals };
};

const feed = JSON.stringify({ title: 'Kiln is done', detail: 'fired at 14:20' });

describe('parseFeeds', () => {
  it('reads name=address pairs and leaves out an entry with no name or no address', () => {
    expect(parseFeeds('ok=a.json, slow=b.json#lag=3000 ,missing=c.json')).toEqual([
      { name: 'ok', url: 'a.json' },
      { name: 'slow', url: 'b.json#lag=3000' },
      { name: 'missing', url: 'c.json' },
    ]);
    expect(parseFeeds('=a.json, ok=, plain, , ok=x?a=b')).toEqual([{ name: 'ok', url: 'x?a=b' }]);
    expect(parseFeeds('')).toEqual([]);
    expect(parseFeeds(undefined)).toEqual([]);
    expect(parseFeeds(null)).toEqual([]);
  });
});

describe('feed-lamp', () => {
  it('has no feed to read until it is given one', async () => {
    const fetchMock = stubFetch(() => ({ title: 'x' }));
    const { root } = await mountWidget('feed-lamp');
    expect(state(root)).toBe('No feed');
    expect(lamp(root)).toBe('idle');
    expect(lampName(root)).toBe('Lamp: grey');
    expect(root.querySelector('[role="tablist"]')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows a waiting lamp while it waits', async () => {
    pending();
    const { root } = await mountWidget('feed-lamp', { src: 'data/kiln.json' });
    expect(state(root)).toBe('Waiting');
    expect(lamp(root)).toBe('wait');
    expect(lampName(root)).toBe('Lamp: amber');
    expect(meta(root)).toBe('data/kiln.json · attempt 1 of 3');
  });

  it('shows the feed with a green lamp and says so in an event', async () => {
    answers({ 'data/kiln.json': [200, feed] });
    const loaded: unknown[] = [];
    const { root } = await mountWidget(
      'feed-lamp',
      { src: 'data/kiln.json' },
      { loaded: (event) => loaded.push(event.detail) },
    );
    expect(state(root)).toBe('Kiln is done');
    expect(lamp(root)).toBe('ok');
    expect(lampName(root)).toBe('Lamp: green');
    expect(state(root)).toBe('Kiln is done');
    expect(meta(root)).toBe('fired at 14:20 · 200 · attempt 1 of 3');
    expect(loaded).toEqual([{ src: 'data/kiln.json', title: 'Kiln is done' }]);
  });

  it('shows a feed with no detail with the status only', async () => {
    answers({ 'data/kiln.json': [200, '{"title":"Quiet"}'] });
    const { root } = await mountWidget('feed-lamp', { src: 'data/kiln.json' });
    await settle();
    expect(meta(root)).toBe('200 · attempt 1 of 3');
  });

  it('says that the answer is slow once the slow time has passed, and then shows it', async () => {
    answers({ 'data/kiln.json': [200, feed] });
    const { root } = await mountWidget('feed-lamp', { src: 'data/kiln.json#lag=4000' });
    expect(state(root)).toBe('Waiting');
    await vi.advanceTimersByTimeAsync(1499);
    expect(state(root)).toBe('Waiting');
    await vi.advanceTimersByTimeAsync(1);
    expect(state(root)).toBe('Slow answer');
    expect(lamp(root)).toBe('wait');
    expect(meta(root)).toBe('data/kiln.json · attempt 1 of 3');
    await vi.advanceTimersByTimeAsync(2600);
    expect(state(root)).toBe('Kiln is done');
  });

  it('uses the slow time of the attribute', async () => {
    answers({});
    const { root } = await mountWidget('feed-lamp', {
      src: 'data/kiln.json#lag=9000',
      slow: '200',
    });
    await vi.advanceTimersByTimeAsync(200);
    expect(state(root)).toBe('Slow answer');
  });

  it('shows a missing file as not found with a red lamp', async () => {
    answers({ 'data/none.json': [404, 'Not found'] });
    const { root } = await mountWidget('feed-lamp', { src: 'data/none.json' });
    await settle();
    expect(state(root)).toBe('Not found');
    expect(lamp(root)).toBe('fail');
    expect(lampName(root)).toBe('Lamp: red');
    expect(meta(root)).toBe('data/none.json · 404');
  });

  it('shows a body that is not JSON, and one that is not a feed, with a magenta lamp', async () => {
    answers({ 'data/broken.txt': [200, 'kiln: warm'], 'data/odd.json': [200, '{"ok":true}'] });
    const text = await mountWidget('feed-lamp', { src: 'data/broken.txt' });
    await settle();
    expect(state(text.root)).toBe('Not a feed');
    expect(lamp(text.root)).toBe('odd');
    expect(lampName(text.root)).toBe('Lamp: magenta');
    const odd = await mountWidget('feed-lamp', { src: 'data/odd.json' });
    await settle();
    expect(state(odd.root)).toBe('Not a feed');
  });

  it('names the answers of a failing server and a lost connection, each with a red lamp', async () => {
    answers({ 'data/down.json': [503, 'busy'] });
    const down = await mountWidget('feed-lamp', { src: 'data/down.json', retries: '0' });
    await settle();
    expect(state(down.root)).toBe('The server answered 503');
    expect(meta(down.root)).toBe('data/down.json · 503');
    const lost = await mountWidget('feed-lamp', { src: 'data/lost.json', retries: '0' });
    await settle();
    expect(state(lost.root)).toBe('No connection');
    expect(lamp(lost.root)).toBe('fail');
  });

  it('gives up an attempt after the timeout', async () => {
    pending();
    const { root } = await mountWidget('feed-lamp', {
      src: 'data/kiln.json',
      timeout: '2000',
      retries: '0',
    });
    await vi.advanceTimersByTimeAsync(2100);
    expect(state(root)).toBe('No answer in time');
    expect(lamp(root)).toBe('fail');
  });

  it('tries again as configured and counts the attempts', async () => {
    let calls = 0;
    const mock = vi.fn(
      async () => new Response(++calls < 3 ? 'busy' : feed, { status: calls < 3 ? 500 : 200 }),
    );
    vi.stubGlobal('fetch', mock);
    const { root } = await mountWidget('feed-lamp', { src: 'data/kiln.json', retries: '2' });
    expect(meta(root)).toBe('data/kiln.json · attempt 2 of 3');
    await vi.advanceTimersByTimeAsync(400);
    expect(meta(root)).toBe('data/kiln.json · attempt 3 of 3');
    await vi.advanceTimersByTimeAsync(700);
    expect(state(root)).toBe('Kiln is done');
    expect(meta(root)).toBe('fired at 14:20 · 200 · attempt 3 of 3');
    expect(mock).toHaveBeenCalledTimes(3);
  });

  it('does not try again with retries 0, and takes a malformed or negative number as the default', async () => {
    const none = answers({ 'data/down.json': [500, 'busy'] });
    await mountWidget('feed-lamp', { src: 'data/down.json', retries: '0' });
    await vi.advanceTimersByTimeAsync(5000);
    expect(none).toHaveBeenCalledTimes(1);
    for (const retries of ['lots', '-1', '']) {
      const mock = answers({ 'data/down.json': [500, 'busy'] });
      const { root } = await mountWidget('feed-lamp', { src: 'data/down.json', retries });
      await vi.advanceTimersByTimeAsync(5000);
      expect(mock, retries).toHaveBeenCalledTimes(3);
      expect(state(root), retries).toBe('The server answered 500');
    }
  });

  it('asks for at most five more attempts', async () => {
    const mock = answers({ 'data/down.json': [500, 'busy'] });
    await mountWidget('feed-lamp', { src: 'data/down.json', retries: '99', slow: '1' });
    await vi.advanceTimersByTimeAsync(60000);
    expect(mock).toHaveBeenCalledTimes(6);
  });

  it('keeps the last good reading when a later read fails', async () => {
    let up = true;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => (up ? new Response(feed) : new Response('gone', { status: 404 }))),
    );
    const { root } = await mountWidget('feed-lamp', { src: 'data/kiln.json' });
    await settle();
    expect(state(root)).toBe('Kiln is done');
    up = false;
    root.querySelector<HTMLButtonElement>('.refresh')!.click();
    await settle();
    expect(state(root)).toBe('Not found');
    expect(meta(root)).toBe('data/kiln.json · 404 · last good: Kiln is done');
    up = true;
    root.querySelector<HTMLButtonElement>('.refresh')!.click();
    await settle();
    expect(state(root)).toBe('Kiln is done');
  });

  it('aborts its request when src changes and shows the new feed', async () => {
    const mock = answers({
      'data/a.json': [200, '{"title":"A"}'],
      'data/b.json': [200, '{"title":"B"}'],
    });
    const { element, root } = await mountWidget('feed-lamp', { src: 'data/a.json#lag=5000' });
    mock.mockClear();
    element.setAttribute('src', 'data/b.json');
    await settle();
    expect(state(root)).toBe('B');
    await vi.advanceTimersByTimeAsync(6000);
    expect(state(root)).toBe('B');
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('cancels the request in flight when src changes', async () => {
    const { signals } = pending();
    const { element } = await mountWidget('feed-lamp', { src: 'data/a.json' });
    expect(signals[0]?.aborted).toBe(false);
    element.setAttribute('src', 'data/b.json');
    await settle();
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
  });

  it('cancels its request, and every timer, when it leaves the page, and starts clean when it is put back', async () => {
    const { signals } = pending();
    const { element, root } = await mountWidget('feed-lamp', { src: 'data/kiln.json' });
    element.remove();
    await settle();
    expect(signals[0]?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    document.body.append(element);
    await settle();
    expect(signals).toHaveLength(2);
    expect(signals[1]?.aborted).toBe(false);
    expect(state(root)).toBe('Waiting');
  });

  it('says nothing about a request that was cancelled, even one that fails when it is', async () => {
    pending();
    const { element, root } = await mountWidget('feed-lamp', { src: 'data/a.json' });
    element.remove();
    await settle();
    expect(state(root)).toBeUndefined();
  });

  it('offers the sample feeds as tabs, shows the first when there is no src, and follows a tab', async () => {
    answers({
      'data/kiln.json': [200, feed],
      'data/none.json': [404, 'x'],
    });
    const { root } = await mountWidget('feed-lamp', {
      feeds: 'ok=data/kiln.json, missing=data/none.json',
    });
    await settle();
    expect(tabs(root).map((tab) => tab.textContent)).toEqual(['ok', 'missing']);
    expect(tabs(root).map((tab) => tab.getAttribute('aria-selected'))).toEqual(['true', 'false']);
    expect(tabs(root).map((tab) => tab.tabIndex)).toEqual([0, -1]);
    expect(state(root)).toBe('Kiln is done');
    tabs(root)[1]!.click();
    await settle();
    expect(state(root)).toBe('Not found');
    expect(tabs(root).map((tab) => tab.getAttribute('aria-selected'))).toEqual(['false', 'true']);
  });

  it('lets src decide: it wins at the start, a tab overrides it, and a change of src takes the tab off', async () => {
    answers({
      'data/kiln.json': [200, feed],
      'data/none.json': [404, 'x'],
      'data/other.json': [200, '{"title":"Other"}'],
    });
    const { element, root } = await mountWidget('feed-lamp', {
      src: 'data/other.json',
      feeds: 'ok=data/kiln.json, missing=data/none.json',
    });
    await settle();
    expect(state(root)).toBe('Other');
    expect(tabs(root).map((tab) => tab.getAttribute('aria-selected'))).toEqual(['false', 'false']);
    tabs(root)[0]!.click();
    await settle();
    expect(state(root)).toBe('Kiln is done');
    element.setAttribute('src', 'data/other.json?again');
    await settle();
    expect(tabs(root).map((tab) => tab.getAttribute('aria-selected'))).toEqual(['false', 'false']);
  });

  it('moves between the tabs with the arrow keys, Home and End', async () => {
    answers({
      'data/kiln.json': [200, feed],
      'data/none.json': [404, 'x'],
      'data/odd.json': [200, '{}'],
    });
    const { root } = await mountWidget('feed-lamp', {
      feeds: 'a=data/kiln.json, b=data/none.json, c=data/odd.json',
    });
    const selected = () =>
      tabs(root).findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    press(tabs(root)[0]!, 'ArrowRight');
    expect(selected()).toBe(1);
    press(tabs(root)[1]!, 'ArrowRight');
    press(tabs(root)[2]!, 'ArrowRight');
    expect(selected()).toBe(0);
    press(tabs(root)[0]!, 'ArrowLeft');
    expect(selected()).toBe(2);
    press(tabs(root)[2]!, 'Home');
    expect(selected()).toBe(0);
    press(tabs(root)[0]!, 'End');
    expect(selected()).toBe(2);
    const stay = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true });
    tabs(root)[2]!.dispatchEvent(stay);
    expect(stay.defaultPrevented).toBe(false);
    expect(selected()).toBe(2);
  });

  it('moves from no tab to the first or last with an arrow key', async () => {
    answers({ 'data/kiln.json': [200, feed], 'data/none.json': [404, 'x'] });
    const { root } = await mountWidget('feed-lamp', {
      src: 'data/kiln.json',
      feeds: 'a=data/kiln.json, b=data/none.json',
    });
    press(tabs(root)[0]!, 'ArrowRight');
    expect(tabs(root).map((tab) => tab.getAttribute('aria-selected'))).toEqual(['true', 'false']);
  });

  it('reads the feed again with the refresh button, a native button', async () => {
    const mock = answers({ 'data/kiln.json': [200, feed] });
    const { root } = await mountWidget('feed-lamp', { src: 'data/kiln.json' });
    await settle();
    const refresh = root.querySelector<HTMLButtonElement>('.refresh')!;
    expect(refresh.type).toBe('button');
    expect(refresh.getAttribute('aria-label')).toBe('Refresh');
    refresh.click();
    await settle();
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('breathes only where motion is allowed', async () => {
    const { element } = await mountWidget('feed-lamp');
    const sheet = element.shadowRoot?.adoptedStyleSheets[0];
    const rules = [...(sheet?.cssRules ?? [])];
    const outside = rules.filter((rule) => !rule.cssText.startsWith('@media'));
    expect(outside.every((rule) => !/transition|animation/.test(rule.cssText))).toBe(true);
    expect(rules.some((rule) => rule.cssText.includes('no-preference'))).toBe(true);
  });
});
