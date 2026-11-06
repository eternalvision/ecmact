import { describe, expect, it, vi } from 'vitest';
import { withRetry } from '@em/http/retry';
import { HttpError } from '@em/http/error';

const failure = (code: HttpError['code'], status?: number, method = 'get') =>
  new HttpError(
    'x',
    code,
    { method: method as 'get' },
    status === undefined ? undefined : ({ status } as never),
  );

const flaky = (errors: unknown[]) => {
  let calls = 0;
  const attempt = vi.fn(async () => {
    const error = errors[calls++];
    if (error) throw error;
    return 'ok';
  });
  return attempt;
};

describe('withRetry', () => {
  it('does not retry by default', async () => {
    const attempt = flaky([failure('ERR_NETWORK')]);
    await expect(withRetry({}, attempt)).rejects.toMatchObject({ code: 'ERR_NETWORK' });
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('returns the result of the first attempt that works', async () => {
    const attempt = flaky([failure('ERR_NETWORK'), failure('ERR_NETWORK')]);
    expect(await withRetry({ retry: { retries: 3, delay: 0 } }, attempt)).toBe('ok');
    expect(attempt).toHaveBeenCalledTimes(3);
  });

  it('accepts a number of retries', async () => {
    const attempt = flaky([failure('ECONNABORTED')]);
    expect(await withRetry({ retry: 1 }, attempt)).toBe('ok');
  }, 2000);

  it('gives up after the retries and throws the last error', async () => {
    const attempt = flaky([failure('ERR_NETWORK'), failure('ETIMEDOUT'), failure('ERR_NETWORK')]);
    await expect(withRetry({ retry: { retries: 1, delay: 0 } }, attempt)).rejects.toMatchObject({
      code: 'ETIMEDOUT',
    });
    expect(attempt).toHaveBeenCalledTimes(2);
  });

  it('retries 5xx but not 4xx', async () => {
    expect(
      await withRetry(
        { retry: { retries: 1, delay: 0 } },
        flaky([failure('ERR_BAD_RESPONSE', 503)]),
      ),
    ).toBe('ok');
    const attempt = flaky([failure('ERR_BAD_REQUEST', 404)]);
    await expect(withRetry({ retry: { retries: 1, delay: 0 } }, attempt)).rejects.toMatchObject({
      status: 404,
    });
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('does not repeat a method that is not idempotent', async () => {
    const attempt = flaky([failure('ERR_NETWORK', undefined, 'post')]);
    await expect(withRetry({ retry: { retries: 1, delay: 0 } }, attempt)).rejects.toBeInstanceOf(
      HttpError,
    );
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('treats a config without a method as GET', async () => {
    const error = new HttpError('x', 'ERR_NETWORK', {});
    expect(await withRetry({ retry: { retries: 1, delay: 0 } }, flaky([error]))).toBe('ok');
  });

  it('never retries a cancellation', async () => {
    const attempt = flaky([failure('ERR_CANCELED')]);
    await expect(
      withRetry({ retry: { retries: 3, delay: 0, retryOn: () => true } }, attempt),
    ).rejects.toMatchObject({
      code: 'ERR_CANCELED',
    });
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('asks retryOn, with the error and the attempt', async () => {
    const retryOn = vi.fn(() => true);
    await withRetry(
      { retry: { retries: 1, delay: 0, retryOn } },
      flaky([failure('ERR_BAD_REQUEST', 400, 'post')]),
    );
    expect(retryOn).toHaveBeenCalledWith(expect.objectContaining({ code: 'ERR_BAD_REQUEST' }), 0);
  });

  it('waits for a delay that is a number, or a function of the attempt and the error', async () => {
    vi.useFakeTimers();
    const delay = vi.fn(() => 50);
    const pending = withRetry({ retry: { retries: 1, delay } }, flaky([failure('ERR_NETWORK')]));
    await vi.advanceTimersByTimeAsync(50);
    expect(await pending).toBe('ok');
    expect(delay).toHaveBeenCalledWith(0, expect.objectContaining({ code: 'ERR_NETWORK' }));
    const second = withRetry(
      { retry: { retries: 2 } },
      flaky([failure('ERR_NETWORK'), failure('ERR_NETWORK')]),
    );
    await vi.advanceTimersByTimeAsync(300);
    await vi.advanceTimersByTimeAsync(600);
    expect(await second).toBe('ok');
    vi.useRealTimers();
  });
});
