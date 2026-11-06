import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, describeError } from '@site/widgets/api';

afterEach(() => {
  vi.unstubAllGlobals();
});

const failure = (status: number | undefined, code?: string) =>
  Object.assign(new Error('failed'), { isHttpError: true, status, code });

describe('describeError', () => {
  it('describes an error that is not an HTTP error', () => {
    expect(describeError(new Error('x'))).toBe('Something went wrong.');
  });

  it('describes the common statuses and codes', () => {
    expect(describeError(failure(404))).toBe('Not found.');
    expect(describeError(failure(403))).toBe('Rate limit reached. Try again later.');
    expect(describeError(failure(429))).toBe('Rate limit reached. Try again later.');
    expect(describeError(failure(undefined, 'ERR_NETWORK'))).toBe('No connection.');
    expect(describeError(failure(undefined, 'ECONNABORTED'))).toBe('The server took too long.');
    expect(describeError(failure(500))).toBe('The server answered 500.');
    expect(describeError(failure(undefined))).toBe('The server answered with an error.');
  });
});

describe('api', () => {
  it('is a client', () => {
    expect(typeof api.get).toBe('function');
  });
});
