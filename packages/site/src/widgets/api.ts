import { createHttp, isHttpError } from 'ecmact';

/** The client of the widgets that talk to public APIs: a timeout, and one retry for a flaky network. */
export const api = createHttp({ timeout: 8000, retry: 1 });

/**
 * Turns an error of a request into a sentence for the person who looks at the widget.
 *
 * @param error - The error that the request rejected with.
 * @returns A short message.
 */
export const describeError = (error: unknown) => {
  if (!isHttpError(error)) return 'Something went wrong.';
  if (error.status === 404) return 'Not found.';
  if (error.status === 403 || error.status === 429) return 'Rate limit reached. Try again later.';
  if (error.code === 'ERR_NETWORK') return 'No connection.';
  if (error.code === 'ECONNABORTED') return 'The server took too long.';
  return `The server answered ${error.status ?? 'with an error'}.`;
};
