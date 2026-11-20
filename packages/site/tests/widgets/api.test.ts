import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedError, loadFeed, type FeedOptions } from '@site/widgets/api';
import { stubFetch } from '@tests/widgets/helpers';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const options = (extra: Partial<FeedOptions> = {}): FeedOptions => ({
  retries: 0,
  timeout: 1000,
  signal: new AbortController().signal,
  onAttempt: () => undefined,
  ...extra,
});

/** Settles the promise that `loadFeed` returns with what it fails with, once the timers have run. */
const failure = async (promise: Promise<unknown>) => {
  const outcome = promise.then(
    () => undefined,
    (error: unknown) => error,
  );
  await vi.runAllTimersAsync();
  return outcome;
};

/** A `fetch` that never answers by itself and gives up when its signal aborts, as a real one does. */
const hang = () =>
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (_input: unknown, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    ),
  );

describe('loadFeed', () => {
  it('reads a feed with a title and an optional detail', async () => {
    stubFetch(() => ({ title: 'Kiln is done', detail: 'fired at 14:20' }));
    expect(await loadFeed('data/kiln.json', options())).toEqual({
      title: 'Kiln is done',
      detail: 'fired at 14:20',
      status: 200,
    });
    stubFetch(() => ({ title: 'Kiln is warm', detail: 7 }));
    expect(await loadFeed('data/kiln.json', options())).toMatchObject({
      title: 'Kiln is warm',
      detail: '',
    });
  });

  it('names a missing file', async () => {
    stubFetch(() => 404);
    const error = await failure(loadFeed('data/none.json', options()));
    expect(error).toBeInstanceOf(FeedError);
    expect(error).toMatchObject({ failure: 'missing', status: 404 });
  });

  it('names a body that is not a feed: text, a list, null and an object with no title', async () => {
    for (const body of ['kiln: warm', [1, 2], null, {}, { title: '  ' }, { title: 3 }]) {
      stubFetch(() => body);
      const error = await failure(loadFeed('data/kiln.json', options()));
      expect(error, JSON.stringify(body)).toMatchObject({ failure: 'malformed', status: 200 });
    }
  });

  it('names a body that is text and not JSON at all', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<!doctype html><p>hello</p>', { status: 200 })),
    );
    expect(await failure(loadFeed('data/kiln.txt', options()))).toMatchObject({
      failure: 'malformed',
    });
  });

  it('names a server error, and a lost connection', async () => {
    stubFetch(() => 503);
    expect(await failure(loadFeed('data/kiln.json', options()))).toMatchObject({
      failure: 'server',
      status: 503,
    });
    stubFetch(() => 403);
    expect(await failure(loadFeed('data/kiln.json', options()))).toMatchObject({
      failure: 'server',
      status: 403,
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );
    expect(await failure(loadFeed('data/kiln.json', options()))).toMatchObject({
      failure: 'offline',
    });
  });

  it('gives up an attempt that takes longer than the timeout', async () => {
    hang();
    expect(await failure(loadFeed('data/kiln.json', options({ timeout: 500 })))).toMatchObject({
      failure: 'timeout',
    });
  });

  it('tries again after a network failure, a timeout or a 5xx status, as many times as asked', async () => {
    const attempts: number[] = [];
    let calls = 0;
    const mock = stubFetch(() => (++calls < 3 ? 500 : { title: 'Back' }));
    const feed = loadFeed(
      'data/kiln.json',
      options({ retries: 2, onAttempt: (n) => attempts.push(n) }),
    );
    await vi.runAllTimersAsync();
    expect(await feed).toMatchObject({ title: 'Back' });
    expect(attempts).toEqual([2, 3]);
    expect(mock).toHaveBeenCalledTimes(3);
  });

  it('stops retrying when the retries run out', async () => {
    const mock = stubFetch(() => 500);
    expect(await failure(loadFeed('data/kiln.json', options({ retries: 1 })))).toMatchObject({
      failure: 'server',
    });
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('tries again after a lost connection', async () => {
    const mock = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    vi.stubGlobal('fetch', mock);
    expect(await failure(loadFeed('data/kiln.json', options({ retries: 1 })))).toMatchObject({
      failure: 'offline',
    });
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('tries again after a timeout', async () => {
    hang();
    expect(
      await failure(loadFeed('data/kiln.json', options({ timeout: 500, retries: 1 }))),
    ).toMatchObject({ failure: 'timeout' });
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it('does not try again after a 4xx status other than 404', async () => {
    const mock = stubFetch(() => 403);
    expect(await failure(loadFeed('data/kiln.json', options({ retries: 3 })))).toMatchObject({
      failure: 'server',
      status: 403,
    });
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('does not try again after a 404 or a body that is not a feed', async () => {
    const missing = stubFetch(() => 404);
    await failure(loadFeed('data/none.json', options({ retries: 3 })));
    expect(missing).toHaveBeenCalledTimes(1);
    const odd = stubFetch(() => 'nope');
    await failure(loadFeed('data/kiln.json', options({ retries: 3 })));
    expect(odd).toHaveBeenCalledTimes(1);
  });

  it('waits for a #lag before it asks, and never sends the fragment', async () => {
    const mock = stubFetch(() => ({ title: 'Late' }));
    const feed = loadFeed('data/kiln.json#lag=3000', options());
    await vi.advanceTimersByTimeAsync(2999);
    expect(mock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(await feed).toMatchObject({ title: 'Late' });
    expect(String(mock.mock.calls[0]?.[0])).not.toContain('#');
    expect(String(mock.mock.calls[0]?.[0])).toContain('data/kiln.json');
  });

  it('ignores a fragment that is not a lag', async () => {
    const mock = stubFetch(() => ({ title: 'Now' }));
    expect(await loadFeed('data/kiln.json#top', options())).toMatchObject({ title: 'Now' });
    expect(await loadFeed('data/kiln.json#lag=soon', options())).toMatchObject({ title: 'Now' });
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('stops waiting for a lag when the signal aborts', async () => {
    const controller = new AbortController();
    const mock = stubFetch(() => ({ title: 'Late' }));
    const feed = failure(
      loadFeed('data/kiln.json#lag=3000', options({ signal: controller.signal })),
    );
    controller.abort();
    expect(await feed).toBe(controller.signal.reason);
    expect(mock).not.toHaveBeenCalled();
  });

  it('does not wait at all for a lag when the signal has aborted already', async () => {
    const controller = new AbortController();
    controller.abort();
    const mock = stubFetch(() => ({ title: 'Late' }));
    const timers = vi.getTimerCount();
    const feed = loadFeed('data/kiln.json#lag=3000', options({ signal: controller.signal }));
    expect(vi.getTimerCount()).toBe(timers);
    expect(
      await feed.then(
        () => undefined,
        (error: unknown) => error,
      ),
    ).toBe(controller.signal.reason);
    expect(mock).not.toHaveBeenCalled();
  });

  it('does not wait for the pause between attempts, nor ask again, when the signal has aborted by then', async () => {
    const controller = new AbortController();
    const attempts: number[] = [];
    const mock = vi.fn(async () => {
      queueMicrotask(() => controller.abort());
      return new Response('{}', { status: 500 });
    });
    vi.stubGlobal('fetch', mock);
    const outcome = await failure(
      loadFeed(
        'data/kiln.json',
        options({ retries: 2, signal: controller.signal, onAttempt: (n) => attempts.push(n) }),
      ),
    );
    expect(outcome).toBe(controller.signal.reason);
    expect(attempts).toEqual([]);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('takes its abort listener off the signal once the pause is over', async () => {
    const controller = new AbortController();
    const add = vi.spyOn(controller.signal, 'addEventListener');
    const remove = vi.spyOn(controller.signal, 'removeEventListener');
    stubFetch(() => ({ title: 'Late' }));
    const feed = loadFeed('data/kiln.json#lag=100', options({ signal: controller.signal }));
    await vi.advanceTimersByTimeAsync(100);
    await feed;
    expect(remove).toHaveBeenCalledWith('abort', add.mock.calls[0]?.[1]);
  });

  it('hands back a cancelled request as it is, not as a failure of the feed', async () => {
    const controller = new AbortController();
    hang();
    const outcome = loadFeed('data/kiln.json', options({ signal: controller.signal })).then(
      () => undefined,
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(10);
    controller.abort();
    const error = await outcome;
    expect(error).not.toBeInstanceOf(FeedError);
    expect(error).toMatchObject({ code: 'ERR_CANCELED' });
  });
});
