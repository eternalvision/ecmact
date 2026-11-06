/** A header value. `null`, `undefined` and `false` remove the header. */
export type HeaderValue = string | number | boolean | null | undefined;

/** Headers by name. Names are case-insensitive. */
export type HeaderMap = Record<string, HeaderValue>;

/**
 * Headers for a request, or the defaults of an instance. In the defaults, the keys `common`, `get`, `post`,
 * `put`, `patch`, `delete`, `head` and `options` hold the headers for all methods or for one; any other key is a header.
 */
export type HttpHeaders = Record<string, HeaderValue | HeaderMap>;

/** The HTTP methods, in lower case. */
export type HttpMethod = 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch';

/** What to read the body of a response as. */
export type ResponseType = 'json' | 'text' | 'blob' | 'arraybuffer' | 'formdata' | 'stream';

/** How much of a download has arrived. */
export interface ProgressEvent {
  /** Bytes received so far. */
  loaded: number;
  /** The size announced by the server, when it announced one. */
  total: number | undefined;
  /** `loaded / total` between 0 and 1, when the total is known. */
  progress: number | undefined;
}

/** How to serialize `params`. */
export interface ParamsSerializerOptions {
  /** Turns the parameters into a query string. */
  serialize?: (params: Record<string, unknown>) => string;
  /** Encodes a key or a value. Defaults to `encodeURIComponent` with the characters `: $ , [ ]` kept. */
  encode?: (value: string) => string;
  /** `true` writes arrays as `a[0]=1`, `null` as `a=1&a=2`, `false` (the default) as `a[]=1`. */
  indexes?: boolean | null;
}

/** When to retry a failed request. */
export interface RetryOptions {
  /** How many more attempts after the first. */
  retries?: number;
  /** Milliseconds to wait before attempt `n` (from 0). Defaults to `300 * 2 ** n`. */
  delay?: number | ((attempt: number, error: HttpErrorLike) => number);
  /**
   * Tells whether to retry. Defaults to network failures, timeouts and 5xx statuses of idempotent methods.
   *
   * @param error - The error.
   * @param attempt - The number of the attempt that failed, from 0.
   * @returns `true` to retry.
   */
  retryOn?: (error: HttpErrorLike, attempt: number) => boolean;
}

/** What retry functions know about the failure. */
export interface HttpErrorLike {
  /** The error code. */
  code: string;
  /** The HTTP status, when the server answered. */
  status: number | undefined;
  /** The config of the request. */
  config: HttpRequestConfig;
}

/**
 * Turns the request data into a body. Receives the headers, which it may change.
 *
 * @param data - The request data.
 * @param headers - The request headers.
 * @returns The body to send.
 */
export type RequestTransform = (data: unknown, headers: Headers) => BodyInit | null | undefined;

/**
 * Turns the response data into what the caller gets.
 *
 * @param data - The data read from the response.
 * @param headers - The response headers, with lower-case names.
 * @param status - The HTTP status.
 * @param config - The request config.
 * @returns The data for `response.data`.
 */
export type ResponseTransform = (
  data: unknown,
  headers: Record<string, string>,
  status: number,
  config: HttpRequestConfig,
) => unknown;

/**
 * The config of a request. Every option except `url`, `method` and `data` can be set as a default of an instance.
 *
 * @template D - The type of the request data.
 */
export interface HttpRequestConfig<D = unknown> {
  /** The URL, absolute or relative to `baseURL`. */
  url?: string;
  /** The method. Defaults to `get`. */
  method?: HttpMethod | Uppercase<HttpMethod>;
  /** Prepended to a relative `url`. */
  baseURL?: string;
  /** When `false`, an absolute `url` is also prefixed by `baseURL`. Defaults to `true`. */
  allowAbsoluteUrls?: boolean;
  /** The request headers. */
  headers?: HttpHeaders;
  /** Query parameters: an object or `URLSearchParams`. */
  params?: Record<string, unknown> | URLSearchParams;
  /** A function, or options, that turn `params` into a query string. */
  paramsSerializer?: ((params: Record<string, unknown>) => string) | ParamsSerializerOptions;
  /** The body: an object (sent as JSON), a string, `FormData`, `URLSearchParams`, a `Blob`, a buffer or a stream. */
  data?: D;
  /** Turn `data` into a body, in order. Defaults to JSON for objects. */
  transformRequest?: RequestTransform | RequestTransform[];
  /** Turn the response data into what the caller gets, in order. Defaults to parsing JSON. */
  transformResponse?: ResponseTransform | ResponseTransform[];
  /** Milliseconds before the request is aborted. `0`, the default, means no timeout. */
  timeout?: number;
  /** The message of the error for a timeout. */
  timeoutErrorMessage?: string;
  /** Reports a timeout as `ETIMEDOUT` instead of `ECONNABORTED`. */
  clarifyTimeoutError?: boolean;
  /** Sends cookies and credentials to other origins. Defaults to `false`. */
  withCredentials?: boolean;
  /** Sets a Basic `Authorization` header. */
  auth?: { username: string; password?: string };
  /** What to read the body as. Defaults to `json`. */
  responseType?: ResponseType;
  /** Tells whether a status is a success. Defaults to 200 to 299. `null` accepts every status. */
  validateStatus?: ((status: number) => boolean) | null;
  /** Aborts the request when it aborts. */
  signal?: AbortSignal;
  /** `0` does not follow redirects. Any other value follows them. */
  maxRedirects?: number;
  /** Called while the body is downloaded. */
  onDownloadProgress?: (event: ProgressEvent) => void;
  /** The cookie to read the XSRF token from. Defaults to `XSRF-TOKEN`. */
  xsrfCookieName?: string;
  /** The header to send the XSRF token in. Defaults to `X-XSRF-TOKEN`. */
  xsrfHeaderName?: string;
  /** Sends the XSRF token to other origins too, when `true`. Defaults to same-origin requests only. */
  withXSRFToken?: boolean | ((config: HttpRequestConfig) => boolean | undefined);
  /** Retries failed requests: a number of retries, or options. Off by default. */
  retry?: number | RetryOptions;
  /** The names of config keys and headers to mask in `error.toJSON()`. */
  redact?: string[];
  /** The `fetch` to use. Defaults to the global one. */
  fetch?: typeof fetch;
}

/**
 * What a request resolves with.
 *
 * @template T - The type of the data.
 * @template D - The type of the request data.
 */
export interface HttpResponse<T = unknown, D = unknown> {
  /** The body, after `transformResponse`. */
  data: T;
  /** The HTTP status. */
  status: number;
  /** The status text. */
  statusText: string;
  /** The response headers, with lower-case names. */
  headers: Record<string, string>;
  /** The config of the request. */
  config: HttpRequestConfig<D>;
  /** How long the request took, in milliseconds. */
  duration: number;
}
