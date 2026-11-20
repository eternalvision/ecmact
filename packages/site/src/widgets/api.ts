import { createHttp, isHttpError } from 'ecmact';

/** What a feed says: the line that the lamp shows, and an optional second line. */
export interface Feed {
  /** The state, in a sentence. */
  title: string;
  /** More about the state, or an empty text. */
  detail: string;
  /** The HTTP status of the answer. */
  status: number;
}

/** Why a feed could not be read. */
export type FeedFailure = 'missing' | 'malformed' | 'timeout' | 'offline' | 'server';

/** The error that `loadFeed` rejects with when a feed cannot be read. */
export class FeedError extends Error {
  /** Why the feed could not be read. */
  readonly failure: FeedFailure;
  /** The HTTP status of the answer, when the server answered. */
  readonly status: number | undefined;

  /**
   * Creates the error.
   *
   * @param failure - Why the feed could not be read.
   * @param status - The HTTP status, when the server answered.
   */
  constructor(failure: FeedFailure, status?: number) {
    super(failure);
    this.failure = failure;
    this.status = status;
  }
}

/** The options of `loadFeed`. */
export interface FeedOptions {
  /** How many more attempts after the first one a network failure, a timeout or a 5xx status gets. */
  retries: number;
  /** Milliseconds before an attempt is given up as a timeout. */
  timeout: number;
  /** Cancels the request, and the wait before it. */
  signal: AbortSignal;
  /** Called with the number of the attempt that is about to start, from 2. */
  onAttempt: (attempt: number) => void;
}

/**
 * Waits, and stops waiting when the signal aborts.
 *
 * @param ms - How long to wait.
 * @param signal - The signal that cancels the wait.
 * @returns A promise that resolves after the wait, or rejects when the signal aborts first.
 */
const lag = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

/**
 * Turns what the server sent into a feed. A feed is a JSON object with a text `title`; anything else, such as a
 * page of HTML, is not one.
 *
 * @param data - The body, parsed when it was JSON.
 * @param status - The HTTP status.
 * @returns The feed.
 * @throws {FeedError} If the body is not a feed.
 */
const readFeed = (data: unknown, status: number): Feed => {
  if (typeof data !== 'object' || data === null) throw new FeedError('malformed', status);
  const { title, detail } = data as { title?: unknown; detail?: unknown };
  if (typeof title !== 'string' || title.trim() === '') throw new FeedError('malformed', status);
  return { title, detail: typeof detail === 'string' ? detail : '', status };
};

/**
 * Names why a request failed.
 *
 * @param error - What the request rejected with.
 * @returns The error to report, or the error itself when the request was cancelled.
 */
const describeFailure = (error: unknown) => {
  if (!isHttpError(error)) return error;
  if (error.status === 404) return new FeedError('missing', 404);
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return new FeedError('timeout');
  if (error.code === 'ERR_CANCELED') return error;
  if (error.status !== undefined) return new FeedError('server', error.status);
  return new FeedError('offline');
};

/**
 * Reads a feed from an address of this site (or any address that allows it). A `#lag=1500` at the end of the
 * address makes the widget wait that many milliseconds before it asks, so that a static file can show a slow
 * answer; the fragment is never sent. A network failure, a timeout and a 5xx status are tried again as many times
 * as `retries` says; a 404 and a body that is not a feed are not.
 *
 * @param src - The address, relative to the page.
 * @param options - Retries, timeout, cancellation and a report of the attempts.
 * @returns The feed.
 * @throws {FeedError} If the feed cannot be read.
 */
export const loadFeed = async (src: string, options: FeedOptions): Promise<Feed> => {
  const cut = src.indexOf('#');
  const address = cut === -1 ? src : src.slice(0, cut);
  const wait = Number(new URLSearchParams(cut === -1 ? '' : src.slice(cut + 1)).get('lag'));
  if (wait > 0) await lag(wait, options.signal);
  const http = createHttp({
    timeout: options.timeout,
    retry: {
      retries: options.retries,
      /**
       * Reports the attempt that follows a failure and waits a little longer each time.
       *
       * @param failed - The number of the attempt that failed, from 0.
       * @returns The milliseconds to wait.
       */
      delay: (failed) => {
        options.onAttempt(failed + 2);
        return 300 * 2 ** failed;
      },
    },
  });
  try {
    const response = await http.get<unknown>(address, { signal: options.signal });
    return readFeed(response.data, response.status);
  } catch (error) {
    throw describeFailure(error);
  }
};
