import { afterEach, describe, expect, it, vi } from 'vitest';
import { libraryDefaults, mergeConfig } from '@em/http/config';
import { dispatch } from '@em/http/dispatch';
import { CanceledError, HttpError } from '@em/http/error';
import type { HttpRequestConfig } from '@em/http/types';
import { fake, json, reply } from '@tests/http/helpers';

const send = (config: HttpRequestConfig) => dispatch(mergeConfig(libraryDefaults(), config));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});

describe('dispatch request', () => {
  it('sends the method in upper case, the url with params and the default headers', async () => {
    const { calls, fetch } = fake();
    await send({ url: '/u', baseURL: 'https://a.test', params: { p: 1 }, method: 'get', fetch });
    expect(calls[0].url).toBe('https://a.test/u?p=1');
    expect(calls[0].init.method).toBe('GET');
    expect(calls[0].init.headers.get('accept')).toContain('application/json');
  });

  it('defaults to GET and accepts a method in capitals', async () => {
    const { calls, fetch } = fake();
    await send({ url: '/a', fetch });
    await send({ url: '/b', method: 'POST', fetch });
    expect(calls.map((call) => call.init.method)).toEqual(['GET', 'POST']);
  });

  it('sends objects as JSON and does not send a body with GET or HEAD', async () => {
    const { calls, fetch } = fake();
    await send({ url: '/a', method: 'post', data: { a: 1 }, fetch });
    await send({ url: '/b', method: 'get', data: { a: 1 }, fetch });
    await send({ url: '/c', method: 'head', data: { a: 1 }, fetch });
    expect(calls[0].init.body).toBe('{"a":1}');
    expect(calls[0].init.headers.get('content-type')).toBe('application/json');
    expect(calls[1].init.body).toBeUndefined();
    expect(calls[2].init.body).toBeUndefined();
  });

  it('runs transformRequest in order', async () => {
    const { calls, fetch } = fake();
    await send({
      url: '/a',
      method: 'post',
      data: 'x',
      transformRequest: [(data) => `${String(data)}1`, (data) => `${String(data)}2`],
      fetch,
    });
    expect(calls[0].init.body).toBe('x12');
  });

  it('sets a Basic Authorization header, with UTF-8 and without a password', async () => {
    const { calls, fetch } = fake();
    await send({ url: '/a', auth: { username: 'user', password: 'pass' }, fetch });
    await send({ url: '/b', auth: { username: 'ünï' }, fetch });
    expect(calls[0].init.headers.get('authorization')).toBe(`Basic ${btoa('user:pass')}`);
    expect(calls[1].init.headers.get('authorization')).toBe(
      'Basic w7xuw68g'.replace(
        'w7xuw68g',
        btoa(String.fromCharCode(...new TextEncoder().encode('ünï:'))),
      ),
    );
  });

  it('sends credentials only when asked', async () => {
    const { calls, fetch } = fake();
    await send({ url: '/a', fetch });
    await send({ url: '/b', withCredentials: true, fetch });
    expect(calls[0].init.credentials).toBe('same-origin');
    expect(calls[1].init.credentials).toBe('include');
  });

  it('follows redirects unless maxRedirects is 0', async () => {
    const { calls, fetch } = fake();
    await send({ url: '/a', fetch });
    await send({ url: '/b', maxRedirects: 0, fetch });
    expect(calls[0].init.redirect).toBe('follow');
    expect(calls[1].init.redirect).toBe('manual');
  });

  it('uses the global fetch by default', async () => {
    const { calls, fetch } = fake();
    vi.stubGlobal('fetch', fetch);
    await send({ url: '/a' });
    expect(calls).toHaveLength(1);
  });

  it('refuses a missing url and a malformed one', async () => {
    await expect(send({})).rejects.toMatchObject({ code: 'ERR_INVALID_URL' });
    await expect(send({ url: 'https:/x' })).rejects.toMatchObject({ code: 'ERR_INVALID_URL' });
  });
});

describe('dispatch xsrf', () => {
  it('sends the token from the cookie to the same origin', async () => {
    document.cookie = 'XSRF-TOKEN=a%20b=c';
    const { calls, fetch } = fake();
    await send({ url: '/a', fetch });
    expect(calls[0].init.headers.get('x-xsrf-token')).toBe('a b=c');
  });

  it('does not send it to another origin unless allowed', async () => {
    document.cookie = 'XSRF-TOKEN=t';
    const { calls, fetch } = fake();
    await send({ url: 'https://other.test/a', fetch });
    await send({ url: 'https://other.test/b', withXSRFToken: true, fetch });
    await send({ url: '/c', withXSRFToken: false, fetch });
    await send({ url: '/d', withXSRFToken: () => true, fetch });
    await send({ url: '/e', withXSRFToken: () => undefined, fetch });
    expect(calls.map((call) => call.init.headers.has('x-xsrf-token'))).toEqual([
      false,
      true,
      false,
      true,
      true,
    ]);
  });

  it('uses the configured names and sends nothing without a cookie', async () => {
    document.cookie = 'tok=1';
    const { calls, fetch } = fake();
    await send({ url: '/a', xsrfCookieName: 'tok', xsrfHeaderName: 'X-Tok', fetch });
    await send({ url: '/b', xsrfCookieName: 'missing', fetch });
    expect(calls[0].init.headers.get('x-tok')).toBe('1');
    expect(calls[1].init.headers.has('x-xsrf-token')).toBe(false);
  });

  it('works without a document and a location', async () => {
    vi.stubGlobal('document', undefined);
    vi.stubGlobal('location', undefined);
    const { calls, fetch } = fake();
    await send({ url: '/a', fetch });
    expect(calls[0].init.headers.has('x-xsrf-token')).toBe(false);
  });

  it('falls back to the default names when a config has none', async () => {
    document.cookie = 'XSRF-TOKEN=z';
    const { calls, fetch } = fake();
    await dispatch({ url: '/a', fetch });
    expect(calls[0].init.headers.get('x-xsrf-token')).toBe('z');
  });
});

describe('dispatch response', () => {
  it('returns the parsed data, the status, the headers and the config', async () => {
    const { fetch } = fake(() => json({ a: 1 }, { status: 201, statusText: 'Created' }));
    const config = { url: '/a', fetch };
    const response = await send(config);
    expect(response.data).toEqual({ a: 1 });
    expect(response.status).toBe(201);
    expect(response.statusText).toBe('Created');
    expect(response.headers['content-type']).toBe('application/json');
    expect(response.config.url).toBe('/a');
    expect(response.duration).toBeGreaterThanOrEqual(0);
  });

  it('reads the body as the response type', async () => {
    const { fetch } = fake(() => reply('{"a":1}'));
    expect((await send({ url: '/a', responseType: 'text', fetch })).data).toBe('{"a":1}');
    expect((await send({ url: '/a', responseType: 'blob', fetch })).data).toBeInstanceOf(Blob);
    expect((await send({ url: '/a', responseType: 'arraybuffer', fetch })).data).toBeInstanceOf(
      ArrayBuffer,
    );
    expect((await send({ url: '/a', responseType: 'stream', fetch })).data).toBeInstanceOf(
      ReadableStream,
    );
  });

  it('runs transformResponse in order with the headers, the status and the config', async () => {
    const { fetch } = fake(() => reply('x', { status: 200, headers: { 'x-a': '1' } }));
    const seen: unknown[] = [];
    const response = await send({
      url: '/a',
      responseType: 'text',
      transformResponse: [
        (data, headers, status, config) => {
          seen.push([headers['x-a'], status, config.url]);
          return `${String(data)}1`;
        },
        (data) => `${String(data)}2`,
      ],
      fetch,
    });
    expect(response.data).toBe('x12');
    expect(seen).toEqual([['1', 200, '/a']]);
  });

  it('reports the download progress', async () => {
    const { fetch } = fake(() => reply('hello', { headers: { 'content-length': '5' } }));
    const events: unknown[] = [];
    await send({ url: '/a', onDownloadProgress: (event) => events.push(event), fetch });
    expect(events.at(-1)).toEqual({ loaded: 5, total: 5, progress: 1 });
  });
});

describe('dispatch errors', () => {
  it('rejects a 4xx with ERR_BAD_REQUEST and keeps the response', async () => {
    const { fetch } = fake(() => json({ message: 'no' }, { status: 404 }));
    const error = (await send({ url: '/a', fetch }).catch((e: unknown) => e)) as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.code).toBe('ERR_BAD_REQUEST');
    expect(error.message).toBe('Request failed with status code 404');
    expect(error.status).toBe(404);
    expect(error.response?.data).toEqual({ message: 'no' });
  });

  it('rejects a 5xx with ERR_BAD_RESPONSE', async () => {
    const { fetch } = fake(() => reply('', { status: 503 }));
    await expect(send({ url: '/a', fetch })).rejects.toMatchObject({
      code: 'ERR_BAD_RESPONSE',
      status: 503,
    });
  });

  it('accepts statuses that validateStatus accepts, and every status for null', async () => {
    const { fetch } = fake(() => reply('', { status: 404 }));
    expect(
      (await send({ url: '/a', validateStatus: (status) => status === 404, fetch })).status,
    ).toBe(404);
    expect((await send({ url: '/a', validateStatus: null, fetch })).status).toBe(404);
  });

  it('uses the default validation for a config that has none', async () => {
    const { fetch } = fake(() => reply('', { status: 500 }));
    await expect(dispatch({ url: '/a', fetch })).rejects.toMatchObject({
      code: 'ERR_BAD_RESPONSE',
    });
  });

  it('reports a network failure with the cause', async () => {
    const cause = new TypeError('failed');
    const fetch = (() => Promise.reject(cause)) as unknown as typeof globalThis.fetch;
    const error = (await send({ url: '/a', fetch }).catch((e: unknown) => e)) as HttpError;
    expect(error.code).toBe('ERR_NETWORK');
    expect(error.message).toBe('Network Error');
    expect(error.cause).toBe(cause);
  });

  it('cancels with the signal of the caller', async () => {
    const controller = new AbortController();
    const fetch = ((_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        );
      })) as unknown as typeof globalThis.fetch;
    const pending = send({ url: '/a', signal: controller.signal, fetch });
    controller.abort();
    await expect(pending).rejects.toBeInstanceOf(CanceledError);
  });

  it('cancels at once with a signal that is already aborted', async () => {
    const { fetch } = fake();
    const controller = new AbortController();
    controller.abort();
    const fail = (() =>
      Promise.reject(
        new DOMException('aborted', 'AbortError'),
      )) as unknown as typeof globalThis.fetch;
    await expect(send({ url: '/a', signal: controller.signal, fetch: fail })).rejects.toMatchObject(
      { code: 'ERR_CANCELED' },
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('aborts after the timeout, with ECONNABORTED or ETIMEDOUT', async () => {
    vi.useFakeTimers();
    const hang = ((_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        );
      })) as unknown as typeof globalThis.fetch;
    const first = send({ url: '/a', timeout: 100, fetch: hang }).catch(
      (e: unknown) => e,
    ) as Promise<HttpError>;
    await vi.advanceTimersByTimeAsync(100);
    const error = await first;
    expect(error.code).toBe('ECONNABORTED');
    expect(error.message).toBe('timeout of 100ms exceeded');
    const second = send({
      url: '/a',
      timeout: 50,
      clarifyTimeoutError: true,
      timeoutErrorMessage: 'too slow',
      fetch: hang,
    }).catch((e: unknown) => e) as Promise<HttpError>;
    await vi.advanceTimersByTimeAsync(50);
    const clarified = await second;
    expect(clarified.code).toBe('ETIMEDOUT');
    expect(clarified.message).toBe('too slow');
  });

  it('does not time out when the request is fast', async () => {
    vi.useFakeTimers();
    const { fetch } = fake();
    await send({ url: '/a', timeout: 100, fetch });
    await vi.advanceTimersByTimeAsync(200);
  });
});
