import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { computed, effect, em, signal } from '@em';
import { resource, type Resource } from '@em/resource';
import { inner } from '@tests/helpers';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
};

const flush = () => new Promise((done) => setTimeout(done, 0));

describe('resource', () => {
  it('starts loading right away and exposes the result', async () => {
    const pending = deferred<string>();
    const user = resource(() => pending.promise);
    expect(user.loading.value).toBe(true);
    expect(user.data.value).toBeUndefined();
    pending.resolve('Ada');
    await flush();
    expect(user.data.value).toBe('Ada');
    expect(user.loading.value).toBe(false);
    expect(user.error.value).toBeUndefined();
  });

  it('accepts a synchronous fetcher', async () => {
    const user = resource(() => 42);
    await flush();
    expect(user.data.value).toBe(42);
    expect(user.loading.value).toBe(false);
  });

  it('exposes a rejection as the error', async () => {
    const boom = new Error('boom');
    const user = resource(() => Promise.reject(boom));
    await flush();
    expect(user.error.value).toBe(boom);
    expect(user.loading.value).toBe(false);
  });

  it('turns a synchronous throw into the error', async () => {
    const boom = new Error('sync');
    const user = resource((): string => {
      throw boom;
    });
    await flush();
    expect(user.error.value).toBe(boom);
  });

  it('uses the initial value until data arrives', () => {
    const user = resource(() => new Promise<string>(() => {}), { initial: 'cached' });
    expect(user.data.value).toBe('cached');
  });

  it('passes an abort signal to the fetcher', () => {
    const fetcher = vi.fn((context: { signal: AbortSignal }) => context.signal.aborted);
    resource(fetcher);
    expect(fetcher.mock.calls[0]![0].signal).toBeInstanceOf(AbortSignal);
  });

  it('refetches when a signal read by the fetcher changes', async () => {
    const id = signal(1);
    const fetcher = vi.fn(async () => `user ${id.value}`);
    const user = resource(fetcher);
    await flush();
    expect(user.data.value).toBe('user 1');
    id.value = 2;
    expect(fetcher).toHaveBeenCalledTimes(2);
    await flush();
    expect(user.data.value).toBe('user 2');
  });

  it('aborts the previous request when it refetches', () => {
    const id = signal(1);
    const signals: AbortSignal[] = [];
    resource(({ signal: abort }) => {
      signals.push(abort);
      return new Promise<string>(() => void id.value);
    });
    id.value = 2;
    expect(signals[0]!.aborted).toBe(true);
    expect(signals[1]!.aborted).toBe(false);
  });

  it('ignores the result of a request that was superseded', async () => {
    const id = signal(1);
    const first = deferred<string>();
    const second = deferred<string>();
    const user = resource(() => (id.value === 1 ? first.promise : second.promise));
    id.value = 2;
    second.resolve('second');
    await flush();
    first.resolve('first');
    await flush();
    expect(user.data.value).toBe('second');
  });

  it('ignores the error of a request that was superseded', async () => {
    const id = signal(1);
    const first = deferred<string>();
    const user = resource(() => (id.value === 1 ? first.promise : Promise.resolve('ok')));
    id.value = 2;
    await flush();
    first.reject(new Error('stale'));
    await flush();
    expect(user.error.value).toBeUndefined();
    expect(user.data.value).toBe('ok');
  });

  it('keeps the previous data while reloading and clears the error', async () => {
    const id = signal(1);
    const user = resource(async () => {
      if (id.value === 2) throw new Error('fail');
      return `user ${id.value}`;
    });
    await flush();
    id.value = 2;
    await flush();
    expect(user.error.value).toBeInstanceOf(Error);
    expect(user.data.value).toBe('user 1');
    id.value = 3;
    expect(user.error.value).toBeUndefined();
    expect(user.loading.value).toBe(true);
    expect(user.data.value).toBe('user 1');
  });

  it('refetch runs the fetcher again', async () => {
    let calls = 0;
    const user = resource(async () => ++calls);
    await flush();
    user.refetch();
    await flush();
    expect(user.data.value).toBe(2);
  });

  it('refetch does not subscribe the caller to the fetcher signals', async () => {
    const id = signal(1);
    const user = resource(async () => id.value);
    await flush();
    const run = vi.fn(() => user.refetch());
    effect(run);
    id.value = 2;
    await flush();
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('mutate sets the data and clears the error', async () => {
    const user = resource(() => Promise.reject(new Error('x')));
    await flush();
    user.mutate('manual' as never);
    expect(user.data.value).toBe('manual');
    expect(user.error.value).toBeUndefined();
  });

  it('dispose stops reacting, aborts and ignores late results', async () => {
    const id = signal(1);
    const pending = deferred<string>();
    const fetcher = vi.fn(({ signal: abort }: { signal: AbortSignal }) => {
      void id.value;
      void abort;
      return pending.promise;
    });
    const user = resource(fetcher);
    user.dispose();
    expect(user.loading.value).toBe(false);
    id.value = 2;
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]![0].signal.aborted).toBe(true);
    pending.resolve('late');
    await flush();
    expect(user.data.value).toBeUndefined();
  });

  it('dispose works before anything was fetched twice', () => {
    const user = resource(() => 1);
    user.dispose();
    expect(() => user.dispose()).not.toThrow();
  });

  it('can drive a component', async () => {
    const user = resource(async () => ({ name: 'Ada' }));
    const card = em.Card({
      content: computed(() =>
        user.loading.value ? 'Loading...' : (user.data.value?.name ?? 'none'),
      ),
    });
    document.body.append(card);
    expect(inner(card).textContent).toBe('Loading...');
    await flush();
    expect(inner(card).textContent).toBe('Ada');
    card.remove();
  });

  it('is typed from the fetcher', () => {
    const user = resource(async () => ({ id: 1 }));
    expectTypeOf(user).toEqualTypeOf<Resource<{ id: number }>>();
    expectTypeOf(user.data.value).toEqualTypeOf<{ id: number } | undefined>();
  });
});
