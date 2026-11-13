import { describe, expect, it, vi } from 'vitest';
import { createHttp, http } from '@em/http/http';
import { signal } from '@em/signals/signals';
import { fake, json } from '@tests/http/helpers';

describe('createHttp', () => {
  it('sends a request given as a config, or as a url and a config', async () => {
    const { calls, fetch } = fake();
    const api = createHttp({ fetch });
    await api({ url: '/a' });
    await api('/b', { params: { p: 1 } });
    expect(calls.map((call) => call.url)).toEqual(['/a', '/b?p=1']);
  });

  it('has request and the shortcuts for the methods', async () => {
    const { calls, fetch } = fake();
    const api = createHttp({ fetch });
    await api.request({ url: '/r', method: 'put' });
    await api.get('/g');
    await api.delete('/d');
    await api.head('/h');
    await api.options('/o');
    await api.post('/p', { a: 1 });
    await api.put('/u', 'text');
    await api.patch('/c', { b: 2 });
    expect(calls.map((call) => `${call.init.method} ${call.url}`)).toEqual([
      'PUT /r',
      'GET /g',
      'DELETE /d',
      'HEAD /h',
      'OPTIONS /o',
      'POST /p',
      'PUT /u',
      'PATCH /c',
    ]);
    expect(calls[5].init.body).toBe('{"a":1}');
    expect(calls[6].init.body).toBe('text');
  });

  it('sends forms with postForm, putForm and patchForm', async () => {
    const { calls, fetch } = fake();
    const api = createHttp({ fetch });
    await api.postForm('/a', { name: 'n', tags: ['x'] });
    await api.putForm('/b', new FormData());
    await api.patchForm('/c');
    await api.postForm('/d', 'plain' as never);
    expect(calls[0].init.body).toBeInstanceOf(FormData);
    expect((calls[0].init.body as FormData).getAll('tags[]')).toEqual(['x']);
    expect(calls[0].init.headers.has('content-type')).toBe(false);
    expect(calls[1].init.method).toBe('PUT');
    expect(calls[2].init.method).toBe('PATCH');
    expect(calls[2].init.body).toBeUndefined();
    expect(calls[3].init.body).toBe('plain');
  });

  it('resolves with the response', async () => {
    const { fetch } = fake(() => json([1, 2]));
    const { data, status } = await createHttp({ fetch }).get<number[]>('/a');
    expect(data).toEqual([1, 2]);
    expect(status).toBe(200);
  });

  it('merges the library defaults, the defaults of the instance and the request', async () => {
    const { calls, fetch } = fake();
    const api = createHttp({
      baseURL: 'https://a.test',
      headers: { common: { 'X-A': '1' } },
      fetch,
    });
    api.defaults.headers = { ...api.defaults.headers, 'X-B': '2' };
    await api.get('/u', { headers: { 'X-C': '3' }, baseURL: 'https://b.test' });
    expect(calls[0].url).toBe('https://b.test/u');
    expect(calls[0].init.headers.get('x-a')).toBe('1');
    expect(calls[0].init.headers.get('x-b')).toBe('2');
    expect(calls[0].init.headers.get('x-c')).toBe('3');
    expect(calls[0].init.headers.get('accept')).toContain('application/json');
  });

  it('keeps instances apart', async () => {
    const { calls, fetch } = fake();
    const first = createHttp({ baseURL: 'https://one.test', fetch });
    const second = createHttp({ baseURL: 'https://two.test', fetch });
    await first.get('/a');
    await second.get('/a');
    expect(calls.map((call) => call.url)).toEqual(['https://one.test/a', 'https://two.test/a']);
  });

  it('builds a url without sending anything', () => {
    const { calls, fetch } = fake();
    const api = createHttp({ baseURL: 'https://a.test', fetch });
    expect(api.getUri({ url: '/u', params: { p: 1 } })).toBe('https://a.test/u?p=1');
    expect(api.getUri()).toBe('https://a.test/');
    expect(calls).toHaveLength(0);
  });

  it('retries with the retry option', async () => {
    let n = 0;
    const { calls, fetch } = fake(() =>
      n++ === 0 ? json({}, { status: 503 }) : json({ ok: true }),
    );
    const api = createHttp({ fetch, retry: { retries: 1, delay: 0 } });
    expect((await api.get('/a')).data).toEqual({ ok: true });
    expect(calls).toHaveLength(2);
  });

  it('has a ready-made instance', () => {
    expect(typeof http.get).toBe('function');
    expect(http.defaults.responseType).toBe('json');
  });
});

describe('interceptors', () => {
  it('runs request interceptors in reverse order and can change the config', async () => {
    const { calls, fetch } = fake();
    const api = createHttp({ fetch });
    const order: string[] = [];
    api.interceptors.request.use((config) => {
      order.push('first');
      return { ...config, headers: { ...config.headers, 'X-Order': 'first' } };
    });
    api.interceptors.request.use((config) => {
      order.push('second');
      return { ...config, headers: { ...config.headers, 'X-Order': 'second' } };
    });
    await api.get('/a');
    expect(order).toEqual(['second', 'first']);
    expect(calls[0].init.headers.get('x-order')).toBe('first');
  });

  it('runs response interceptors in the order they were added', async () => {
    const { fetch } = fake(() => json(1));
    const api = createHttp({ fetch });
    const order: string[] = [];
    api.interceptors.response.use((response) => {
      order.push('first');
      return { ...response, data: (response.data as number) + 1 };
    });
    api.interceptors.response.use((response) => {
      order.push('second');
      return { ...response, data: (response.data as number) * 10 };
    });
    expect((await api.get('/a')).data).toBe(20);
    expect(order).toEqual(['first', 'second']);
  });

  it('skips a request interceptor when runWhen says so', async () => {
    const { calls, fetch } = fake();
    const api = createHttp({ fetch });
    api.interceptors.request.use(
      (config) => ({ ...config, headers: { ...config.headers, 'X-Run': '1' } }),
      undefined,
      { runWhen: (config) => config.url === '/yes' },
    );
    await api.get('/yes');
    await api.get('/no');
    expect(calls[0].init.headers.has('x-run')).toBe(true);
    expect(calls[1].init.headers.has('x-run')).toBe(false);
  });

  it('passes an interceptor without a fulfilled handler through', async () => {
    const { fetch } = fake(() => json(1));
    const api = createHttp({ fetch });
    api.interceptors.request.use(undefined, (error) => Promise.reject(error));
    api.interceptors.response.use();
    expect((await api.get('/a')).data).toBe(1);
  });

  it('lets a request interceptor stop the request, and a rejected handler recover', async () => {
    const { calls, fetch } = fake();
    const api = createHttp({ fetch });
    const blocker = api.interceptors.request.use(() => {
      throw new Error('blocked');
    });
    await expect(api.get('/a')).rejects.toThrow('blocked');
    expect(calls).toHaveLength(0);
    api.interceptors.request.eject(blocker);
    api.interceptors.request.use(undefined, () => ({ url: '/recovered', fetch }));
    api.interceptors.request.use(() => {
      throw new Error('bad');
    });
    await api.get('/ignored');
    expect(calls[0].url).toBe('/recovered');
  });

  it('lets a response interceptor handle an error and recover or rethrow it', async () => {
    const { fetch } = fake(() => json({}, { status: 401 }));
    const api = createHttp({ fetch });
    const seen = vi.fn();
    api.interceptors.response.use(undefined, (error) => {
      seen((error as { status: number }).status);
      throw error;
    });
    await expect(api.get('/a')).rejects.toMatchObject({ status: 401 });
    expect(seen).toHaveBeenCalledWith(401);
    api.interceptors.response.clear();
    api.interceptors.response.use(undefined, () => ({ recovered: true }));
    expect(await api.get('/a')).toEqual({ recovered: true });
  });

  it('can be ejected and cleared', async () => {
    const { calls, fetch } = fake();
    const api = createHttp({ fetch });
    const id = api.interceptors.request.use((config) => ({ ...config, url: '/changed' }));
    api.interceptors.request.eject(id);
    await api.get('/a');
    api.interceptors.request.use((config) => ({ ...config, url: '/changed' }));
    api.interceptors.request.clear();
    await api.get('/b');
    expect(calls.map((call) => call.url)).toEqual(['/a', '/b']);
  });
});

describe('data', () => {
  it('gives the body alone', async () => {
    const { fetch } = fake(() => json({ name: 'Ada' }));
    const api = createHttp({ fetch });
    await expect(api.get<{ name: string }>('/user').data).resolves.toEqual({ name: 'Ada' });
    await expect(api.post('/user', {}).data).resolves.toEqual({ name: 'Ada' });
    await expect(api({ url: '/user' }).data).resolves.toEqual({ name: 'Ada' });
  });

  it('still resolves with the whole response', async () => {
    const { fetch } = fake(() => json({ ok: 1 }));
    const response = await createHttp({ fetch }).get('/x');
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: 1 });
  });

  it('rejects with the error of the request', async () => {
    const { fetch } = fake(() => json({}, { status: 500 }));
    const api = createHttp({ fetch });
    await expect(api.get('/x').data).rejects.toMatchObject({ status: 500 });
    await expect(api.get('/x')).rejects.toMatchObject({ status: 500 });
  });
});

describe('resource', () => {
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

  it('exposes the body of a request as data, with loading', async () => {
    const { calls, fetch } = fake(() => json([{ id: 1 }]));
    const users = createHttp({ fetch, baseURL: 'https://api.test' }).resource<{ id: number }[]>(
      '/users',
      { params: { page: 2 } },
    );
    expect(users.loading).toBe(true);
    expect(users.data).toBeUndefined();
    await flush();
    expect(users.loading).toBe(false);
    expect(users.data).toEqual([{ id: 1 }]);
    expect(calls[0].url).toBe('https://api.test/users?page=2');
    expect(calls[0].init.signal).toBeInstanceOf(AbortSignal);
    users.dispose();
  });

  it('shows the initial data first and keeps the error of a failed request', async () => {
    const { fetch } = fake(() => json({}, { status: 404 }));
    const user = createHttp({ fetch }).resource('/user', { initial: 'none' });
    expect(user.data).toBe('none');
    await flush();
    expect(user.error).toMatchObject({ status: 404 });
    user.dispose();
  });

  it('follows the signals in a url function and cancels the request it replaces', async () => {
    const id = signal(1);
    const { calls, fetch } = fake((call) => json({ url: call.url }));
    const user = createHttp({ fetch }).resource<{ url: string }>(() => `/users/${id.value}`);
    await Promise.resolve();
    await Promise.resolve();
    id.value = 2;
    expect(calls[0].init.signal?.aborted).toBe(true);
    await flush();
    expect(user.data).toEqual({ url: '/users/2' });
    user.dispose();
  });
});
