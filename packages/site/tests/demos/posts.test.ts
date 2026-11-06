import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/posts';

const posts = [
  { id: 1, title: 'First' },
  { id: 2, title: 'Second' },
];

let failing = false;

beforeEach(() => {
  vi.useFakeTimers();
  failing = false;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (failing && init?.method && init.method !== 'GET') {
        return new Response('{}', { status: 500 });
      }
      const body = !init?.method || init.method === 'GET' ? posts : {};
      return new Response(JSON.stringify(body), {
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

const open = async () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  await vi.advanceTimersByTimeAsync(10);
  const root = demo.shadowRoot!;
  return {
    root,
    titles: () => [...root.querySelectorAll('li span')].map((span) => span.textContent),
    text: () => root.textContent!,
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
    const { titles, text } = await open();
    expect(titles()).toEqual(['First', 'Second']);
    expect(text()).toContain('1 requests');
  });

  it('lets a post be added before the list has loaded', async () => {
    const demo = create() as HTMLElement;
    document.body.append(demo);
    await add(demo.shadowRoot!, 'Early');
    expect(demo.shadowRoot!.textContent).toContain('requests');
  });

  it('adds a post and keeps it', async () => {
    const { root, titles, text } = await open();
    await add(root, 'Third');
    expect(titles()).toEqual(['First', 'Second', 'Third']);
    expect(text()).toContain('2 requests');
  });

  it('ignores an empty title', async () => {
    const { root, titles } = await open();
    await add(root, '   ');
    expect(titles()).toEqual(['First', 'Second']);
  });

  it('deletes a post', async () => {
    const { root, titles } = await open();
    root.querySelector<HTMLButtonElement>('li button')!.click();
    await vi.advanceTimersByTimeAsync(10);
    expect(titles()).toEqual(['Second']);
  });

  it('takes a change back when the request fails', async () => {
    const { root, titles, text } = await open();
    failing = true;
    root.querySelector<HTMLButtonElement>('li button')!.click();
    await vi.advanceTimersByTimeAsync(2000);
    expect(titles()).toEqual(['First', 'Second']);
    expect(text()).toContain('taken back');
  });
});
