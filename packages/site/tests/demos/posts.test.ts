import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/posts';

const posts = [
  { id: 1, title: 'First' },
  { id: 2, title: 'Second' },
];

let failing: ((method: string, url: string) => boolean) | undefined;
let delay: (method: string, url: string) => number;

beforeEach(() => {
  vi.useFakeTimers();
  failing = undefined;
  delay = () => 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      const wait = delay(method, String(url));
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      if (failing?.(method, String(url))) return new Response('{}', { status: 500 });
      return new Response(JSON.stringify(method === 'GET' ? posts : {}), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

const open = async (wait = 10) => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  await vi.advanceTimersByTimeAsync(wait);
  const root = demo.shadowRoot!;
  return {
    root,
    titles: () => [...root.querySelectorAll('li span')].map((span) => span.textContent),
    text: () => root.textContent!,
    footer: () => root.querySelector('small')?.textContent,
    remove: (index: number) =>
      root.querySelectorAll<HTMLButtonElement>('li button')[index]!.click(),
  };
};

const add = async (root: ShadowRoot, title: string) => {
  const input = root.querySelector('input')!;
  input.value = title;
  root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  await vi.advanceTimersByTimeAsync(10);
};

describe('posts demo', () => {
  it('lists the posts and counts the requests', async () => {
    const { titles, footer } = await open();
    expect(titles()).toEqual(['First', 'Second']);
    expect(footer()).toContain('1 requests');
  });

  it('adds a post and keeps it', async () => {
    const { root, titles, footer } = await open();
    await add(root, 'Third');
    expect(titles()).toEqual(['First', 'Second', 'Third']);
    expect(footer()).toContain('2 requests');
  });

  it('ignores an empty title', async () => {
    const { root, titles } = await open();
    await add(root, '   ');
    expect(titles()).toEqual(['First', 'Second']);
  });

  it('deletes a post', async () => {
    const { titles, remove } = await open();
    remove(0);
    await vi.advanceTimersByTimeAsync(10);
    expect(titles()).toEqual(['Second']);
  });

  it('puts a deleted post back where it was when the request fails', async () => {
    const { titles, remove, text } = await open();
    failing = (method) => method === 'DELETE';
    remove(1);
    await vi.advanceTimersByTimeAsync(2000);
    expect(titles()).toEqual(['First', 'Second']);
    expect(text()).toContain('taken back');
  });

  it('removes an added post again when the request fails', async () => {
    const { root, titles, text } = await open();
    failing = (method) => method === 'POST';
    await add(root, 'Third');
    await vi.advanceTimersByTimeAsync(2000);
    expect(titles()).toEqual(['First', 'Second']);
    expect(text()).toContain('taken back');
  });

  it('does not take back a change that went well because an earlier one failed', async () => {
    const { titles, remove } = await open();
    failing = (method, url) => method === 'DELETE' && url.endsWith('/1');
    delay = (method, url) => (method === 'DELETE' && url.endsWith('/1') ? 1500 : 0);
    remove(0);
    await vi.advanceTimersByTimeAsync(10);
    remove(0);
    await vi.advanceTimersByTimeAsync(10);
    expect(titles()).toEqual([]);
    await vi.advanceTimersByTimeAsync(6000);
    expect(titles()).toEqual(['First']);
  });

  it('keeps the form off until the list has loaded, so that a late answer cannot wipe a change', async () => {
    delay = (method) => (method === 'GET' ? 1000 : 0);
    const { root, titles, footer } = await open(100);
    const input = root.querySelector('input')!;
    expect(input.hasAttribute('disabled')).toBe(true);
    expect(root.querySelector('form button')?.hasAttribute('disabled')).toBe(true);
    await add(root, 'Early');
    expect(titles()).toEqual([]);
    expect(footer()).toContain('1 requests');
    await vi.advanceTimersByTimeAsync(1000);
    expect(titles()).toEqual(['First', 'Second']);
    expect(input.hasAttribute('disabled')).toBe(false);
    await add(root, 'Late');
    expect(titles()).toEqual(['First', 'Second', 'Late']);
  });

  it('shows how long the last request took, also when it failed', async () => {
    const { root, footer } = await open();
    expect(footer()).toMatch(/the last one took \d+ ms/);
    failing = (method) => method === 'POST';
    delay = (method) => (method === 'POST' ? 250 : 0);
    await add(root, 'Third');
    await vi.advanceTimersByTimeAsync(3000);
    expect(footer()).toMatch(/the last one took (\d{3,}) ms/);
  });

  it('keeps the last time when a request fails without an answer', async () => {
    const { root, footer } = await open();
    const before = footer();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await add(root, 'Third');
    await vi.advanceTimersByTimeAsync(3000);
    expect(footer()).toMatch(/requests, the last one took \d+ ms/);
    expect(before).toMatch(/the last one took/);
  });
});
