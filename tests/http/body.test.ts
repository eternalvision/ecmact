import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  defaultTransformRequest,
  defaultTransformResponse,
  readBody,
  toFormData,
  toList,
} from '@em/http/body';
import { reply } from '@tests/http/helpers';

const request = (data: unknown, headers = new Headers()) => ({
  body: defaultTransformRequest(data, headers),
  headers,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('defaultTransformRequest', () => {
  it('leaves strings, null and undefined alone', () => {
    expect(request('text').body).toBe('text');
    expect(request(null).body).toBeNull();
    expect(request(undefined).body).toBeUndefined();
    expect(request('text').headers.has('content-type')).toBe(false);
  });

  it('turns objects and arrays into JSON and sets the content type', () => {
    const { body, headers } = request({ a: 1 });
    expect(body).toBe('{"a":1}');
    expect(headers.get('content-type')).toBe('application/json');
    expect(request([1, 2]).body).toBe('[1,2]');
  });

  it('keeps a content type that was set', () => {
    const { headers } = request(
      { a: 1 },
      new Headers({ 'content-type': 'application/vnd.api+json' }),
    );
    expect(headers.get('content-type')).toBe('application/vnd.api+json');
  });

  it('sends URLSearchParams as a form body', () => {
    const params = new URLSearchParams({ a: '1' });
    const { body, headers } = request(params);
    expect(body).toBe(params);
    expect(headers.get('content-type')).toBe('application/x-www-form-urlencoded;charset=utf-8');
    const set = request(params, new Headers({ 'content-type': 'x/y' }));
    expect(set.headers.get('content-type')).toBe('x/y');
  });

  it('removes the content type for FormData so that the boundary is added', () => {
    const form = new FormData();
    const { body, headers } = request(form, new Headers({ 'content-type': 'multipart/form-data' }));
    expect(body).toBe(form);
    expect(headers.has('content-type')).toBe(false);
  });

  it('sends blobs, buffers, views and streams as they are', () => {
    const blob = new Blob(['x']);
    const buffer = new ArrayBuffer(2);
    const view = new Uint8Array(2);
    const stream = new ReadableStream();
    [blob, buffer, view, stream].forEach((data) => expect(request(data).body).toBe(data));
  });

  it('turns numbers and booleans into text', () => {
    expect(request(5).body).toBe('5');
    expect(request(true).body).toBe('true');
  });

  it('works where FormData, Blob and ReadableStream do not exist', () => {
    vi.stubGlobal('FormData', undefined);
    vi.stubGlobal('Blob', undefined);
    vi.stubGlobal('ReadableStream', undefined);
    expect(request({ a: 1 }).body).toBe('{"a":1}');
  });
});

describe('defaultTransformResponse', () => {
  const config = {};
  it('parses JSON text', () => {
    expect(defaultTransformResponse('{"a":1}', {}, 200, config)).toEqual({ a: 1 });
  });

  it('returns text that is not JSON, and empty text', () => {
    expect(defaultTransformResponse('plain', {}, 200, config)).toBe('plain');
    expect(defaultTransformResponse('', {}, 200, config)).toBe('');
  });

  it('leaves non-text data and other response types alone', () => {
    const blob = new Blob(['x']);
    expect(defaultTransformResponse(blob, {}, 200, config)).toBe(blob);
    expect(defaultTransformResponse('{"a":1}', {}, 200, { responseType: 'text' })).toBe('{"a":1}');
    expect(defaultTransformResponse('{"a":1}', {}, 200, { responseType: 'json' })).toEqual({
      a: 1,
    });
  });
});

describe('toList', () => {
  it('makes a list of one transform, a list, or nothing', () => {
    const f = () => 1;
    expect(toList(f)).toEqual([f]);
    expect(toList([f, f])).toEqual([f, f]);
    expect(toList(undefined)).toEqual([]);
  });
});

describe('readBody', () => {
  it('reads text and JSON text as text', async () => {
    expect(await readBody(reply('hi'), 'text', {})).toBe('hi');
    expect(await readBody(reply('{}'), 'json', {})).toBe('{}');
  });

  it('reads a blob, a buffer and form data', async () => {
    expect(await readBody(reply('abc'), 'blob', {})).toBeInstanceOf(Blob);
    expect(await readBody(reply('abc'), 'arraybuffer', {})).toBeInstanceOf(ArrayBuffer);
    const form = new FormData();
    form.append('a', '1');
    const response = new Response(form);
    expect(await readBody(response, 'formdata', {})).toBeInstanceOf(FormData);
  });

  it('returns the stream itself for stream', async () => {
    const response = reply('abc');
    expect(await readBody(response, 'stream', {})).toBe(response.body);
  });

  it('reports the progress while it reads, with the total when it is known', async () => {
    const events: unknown[] = [];
    const response = reply('hello world', { headers: { 'content-length': '11' } });
    const text = await readBody(response, 'text', {
      onDownloadProgress: (event) => events.push(event),
    });
    expect(text).toBe('hello world');
    expect(events.at(-1)).toEqual({ loaded: 11, total: 11, progress: 1 });
  });

  it('reports no progress fraction when the total is unknown, and builds blobs and buffers', async () => {
    const events: { total: number | undefined; progress: number | undefined }[] = [];
    const onDownloadProgress = (event: (typeof events)[number]) => events.push(event);
    const blob = (await readBody(
      reply('abc', { headers: { 'content-type': 'text/plain' } }),
      'blob',
      {
        onDownloadProgress,
      },
    )) as Blob;
    expect(blob.size).toBe(3);
    expect(events[0]).toMatchObject({ total: undefined, progress: undefined });
    const buffer = (await readBody(reply('abc'), 'arraybuffer', {
      onDownloadProgress,
    })) as ArrayBuffer;
    expect(buffer.byteLength).toBe(3);
    const plain = (await readBody(new Response(new Blob(['xyz'])), 'blob', {
      onDownloadProgress,
    })) as Blob;
    expect(plain.size).toBe(3);
  });

  it('puts several chunks together', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('ab'));
        controller.enqueue(new TextEncoder().encode('cd'));
        controller.close();
      },
    });
    const text = await readBody(new Response(stream), 'text', { onDownloadProgress: () => {} });
    expect(text).toBe('abcd');
  });

  it('reads without progress when there is no body to stream', async () => {
    const response = new Response(null, { status: 204 });
    expect(await readBody(response, 'text', { onDownloadProgress: () => {} })).toBe('');
  });
});

describe('toFormData', () => {
  const entries = (form: FormData) => [...form].map(([key, value]) => [key, String(value)]);

  it('turns an object into form data', () => {
    expect(entries(toFormData({ a: 1, b: 'x', c: true }))).toEqual([
      ['a', '1'],
      ['b', 'x'],
      ['c', 'true'],
    ]);
  });

  it('writes arrays with [] and nested objects with brackets', () => {
    expect(entries(toFormData({ tags: ['a', 'b'], user: { name: 'n', roles: ['r'] } }))).toEqual([
      ['tags[]', 'a'],
      ['tags[]', 'b'],
      ['user[name]', 'n'],
      ['user[roles][]', 'r'],
    ]);
  });

  it('skips null and undefined, writes dates as ISO text and keeps blobs', () => {
    const blob = new Blob(['x']);
    const form = toFormData({
      a: null,
      b: undefined,
      at: new Date('2026-01-02T00:00:00.000Z'),
      file: blob,
    });
    expect(form.has('a')).toBe(false);
    expect(form.get('at')).toBe('2026-01-02T00:00:00.000Z');
    expect(form.get('file')).toBeInstanceOf(Blob);
  });

  it('returns existing form data as it is', () => {
    const form = new FormData();
    expect(toFormData(form)).toBe(form);
  });
});
