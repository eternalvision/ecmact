import type { HttpRequestConfig, HttpResponse } from '@em/http/types';

/** What went wrong, as a stable code to switch on. */
export type HttpErrorCode =
  | 'ERR_BAD_REQUEST'
  | 'ERR_BAD_RESPONSE'
  | 'ERR_NETWORK'
  | 'ECONNABORTED'
  | 'ETIMEDOUT'
  | 'ERR_CANCELED'
  | 'ERR_INVALID_URL'
  | 'ERR_BAD_OPTION';

const redacted = '[REDACTED ****]';

/**
 * Masks the values of the config keys and headers that are listed in `redact`.
 *
 * @param config - The request config.
 * @returns A copy of the config that is safe to log.
 */
const redact = (config: HttpRequestConfig) => {
  const names = (config.redact ?? []).map((name) => name.toLowerCase());
  /**
   * Replaces the values of the listed keys.
   *
   * @param record - The object to mask.
   * @returns A copy with the listed keys masked.
   */
  const mask = (record: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(record).map(([key, value]) => [
        key,
        names.includes(key.toLowerCase()) ? redacted : value,
      ]),
    );
  const masked = mask(config as Record<string, unknown>);
  if (config.headers) masked.headers = mask(config.headers);
  return masked;
};

/**
 * The error that a request rejects with: a failed status, a network failure, a timeout or an invalid request.
 *
 * @template T - The type of the response data.
 * @template D - The type of the request data.
 */
export class HttpError<T = unknown, D = unknown> extends Error {
  /** Always `true`, to recognize the error across realms. */
  readonly isHttpError = true;
  /** What went wrong. */
  readonly code: HttpErrorCode;
  /** The config of the request that failed. */
  readonly config: HttpRequestConfig<D>;
  /** The response, when the server answered. */
  readonly response: HttpResponse<T, D> | undefined;
  /** The HTTP status, when the server answered. */
  readonly status: number | undefined;

  /**
   * Creates the error.
   *
   * @param message - What happened.
   * @param code - The error code.
   * @param config - The config of the request.
   * @param response - The response, if the server answered.
   * @param cause - The error that this one wraps, if any.
   */
  constructor(
    message: string,
    code: HttpErrorCode,
    config: HttpRequestConfig<D>,
    response?: HttpResponse<T, D>,
    cause?: unknown,
  ) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'HttpError';
    this.code = code;
    this.config = config;
    this.response = response;
    this.status = response?.status;
  }

  /**
   * Describes the error as plain data for logging. The config keys and headers listed in `redact` are masked.
   *
   * @returns The message, the code, the status and the config.
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      config: redact(this.config),
      stack: this.stack,
    };
  }
}

/** The error of a request that was cancelled with an `AbortSignal`. */
export class CanceledError<D = unknown> extends HttpError<unknown, D> {
  /**
   * Creates the error.
   *
   * @param config - The config of the request.
   * @param message - What happened.
   */
  constructor(config: HttpRequestConfig<D>, message = 'canceled') {
    super(message, 'ERR_CANCELED', config);
    this.name = 'CanceledError';
  }
}

/**
 * Tells whether a value is an `HttpError`.
 *
 * @param value - The value to check.
 * @returns `true` for errors made by this client.
 */
export const isHttpError = (value: unknown): value is HttpError =>
  value instanceof HttpError ||
  (typeof value === 'object' &&
    value !== null &&
    (value as { isHttpError?: unknown }).isHttpError === true);

/**
 * Tells whether a value is the error of a cancelled request.
 *
 * @param value - The value to check.
 * @returns `true` for `CanceledError`.
 */
export const isCancel = (value: unknown): value is CanceledError => value instanceof CanceledError;
