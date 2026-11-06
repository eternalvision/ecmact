import type { HttpErrorLike, HttpRequestConfig, RetryOptions } from '@em/http/types';

const idempotent = new Set(['get', 'head', 'options', 'put', 'delete']);

/**
 * Tells whether a failure is worth another attempt: no answer from the server, a timeout, or a 5xx status,
 * for a method that can be repeated safely.
 *
 * @param error - The failure.
 * @returns `true` to retry.
 */
const defaultRetryOn = (error: HttpErrorLike) =>
  idempotent.has((error.config.method ?? 'get').toLowerCase()) &&
  (error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT' ||
    (error.status !== undefined && error.status >= 500));

/**
 * Waits for a number of milliseconds.
 *
 * @param ms - How long to wait.
 * @returns A promise that resolves after the wait.
 */
const sleep = (ms: number): Promise<void> => {
  let finish!: () => void;
  const waiting = new Promise<void>((done) => {
    finish = done;
  });
  setTimeout(finish, ms);
  return waiting;
};

/**
 * Runs an attempt, and runs it again after a failure while the retry options allow it. A cancellation is never retried.
 *
 * @template R - The type of the result.
 * @param config - The request config, with the `retry` option.
 * @param attempt - Makes one attempt.
 * @returns The result of the first attempt that succeeds.
 * @throws {unknown} The error of the last attempt.
 */
export const withRetry = async <R>(
  config: HttpRequestConfig,
  attempt: () => Promise<R>,
): Promise<R> => {
  const options: RetryOptions =
    typeof config.retry === 'number' ? { retries: config.retry } : (config.retry ?? {});
  const retries = options.retries ?? 0;
  for (let count = 0; ; count++) {
    try {
      return await attempt();
    } catch (error) {
      const like = error as HttpErrorLike;
      const retry =
        count < retries &&
        like.code !== 'ERR_CANCELED' &&
        (options.retryOn ?? defaultRetryOn)(like, count);
      if (!retry) throw error;
      const delay = options.delay ?? 300 * 2 ** count;
      await sleep(typeof delay === 'function' ? delay(count, like) : delay);
    }
  }
};
