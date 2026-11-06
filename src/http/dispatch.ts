import { readBody, toList } from '@em/http/body';
import { defaultValidateStatus } from '@em/http/config';
import { CanceledError, HttpError } from '@em/http/error';
import { buildHeaders, toRecord } from '@em/http/headers';
import type { HttpRequestConfig, HttpResponse } from '@em/http/types';
import { buildUrl } from '@em/http/url';

/**
 * Encodes text as Base64, including characters outside Latin-1.
 *
 * @param text - The text.
 * @returns The Base64 text.
 */
const base64 = (text: string) => btoa(String.fromCharCode(...new TextEncoder().encode(text)));

/**
 * Reads a cookie of the current document.
 *
 * @param name - The cookie name.
 * @returns The value, or `undefined`.
 */
const readCookie = (name: string) => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split('; ')
    .map((entry) => entry.split('='))
    .find(([key]) => key === name);
  return match ? decodeURIComponent(match.slice(1).join('=')) : undefined;
};

/**
 * Tells whether a URL has the same origin as the page.
 *
 * @param url - The URL of the request.
 * @returns `true` for the same origin, and when there is no page.
 */
const sameOrigin = (url: string) => {
  if (typeof location === 'undefined') return true;
  return new URL(url, location.href).origin === location.origin;
};

/**
 * Adds the XSRF token from the cookie to the headers, for same-origin requests or when `withXSRFToken` allows it.
 *
 * @param config - The request config.
 * @param headers - The request headers.
 * @param url - The URL of the request.
 */
const addXsrfToken = (config: HttpRequestConfig, headers: Headers, url: string) => {
  const allowed =
    typeof config.withXSRFToken === 'function'
      ? config.withXSRFToken(config)
      : config.withXSRFToken;
  if (!(allowed ?? sameOrigin(url))) return;
  const token = readCookie(config.xsrfCookieName ?? 'XSRF-TOKEN');
  if (token) headers.set(config.xsrfHeaderName ?? 'X-XSRF-TOKEN', token);
};

/**
 * Sends a request with `fetch` and turns the answer into a response, or into an `HttpError`.
 * Timeouts and the `signal` abort the request; a failed status rejects unless `validateStatus` accepts it.
 *
 * @param config - The merged request config.
 * @returns The response.
 * @throws {HttpError} For an invalid URL, a failed status, a network failure, a timeout or a cancellation.
 */
export const dispatch = async (config: HttpRequestConfig): Promise<HttpResponse> => {
  const method = (config.method ?? 'get').toLowerCase();
  const url = buildUrl(config);
  if (url === '') throw new HttpError('url is required', 'ERR_INVALID_URL', config);
  if (/^https?:\/(?!\/)/i.test(url))
    throw new HttpError(`invalid url "${url}"`, 'ERR_INVALID_URL', config);

  const headers = buildHeaders(config.headers, method);
  const body = toList(config.transformRequest).reduce<BodyInit | null | undefined>(
    (data, transform) => transform(data, headers),
    config.data as BodyInit | undefined,
  );
  if (config.auth) {
    headers.set(
      'authorization',
      `Basic ${base64(`${config.auth.username}:${config.auth.password ?? ''}`)}`,
    );
  }
  addXsrfToken(config, headers, url);

  const controller = new AbortController();
  let timedOut = false;
  const timer =
    config.timeout !== undefined && config.timeout > 0
      ? setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, config.timeout)
      : undefined;
  /**
   * Aborts the request when the signal of the caller aborts.
   */
  const forward = () => {
    controller.abort();
  };
  if (config.signal?.aborted) controller.abort();
  config.signal?.addEventListener('abort', forward);

  const started = performance.now();
  try {
    const send = config.fetch ?? globalThis.fetch;
    const response = await send(url, {
      method: method.toUpperCase(),
      headers,
      body: method === 'get' || method === 'head' ? undefined : body,
      signal: controller.signal,
      credentials: config.withCredentials ? 'include' : 'same-origin',
      redirect: config.maxRedirects === 0 ? 'manual' : 'follow',
    });
    const responseHeaders = toRecord(response.headers);
    const raw = await readBody(response, config.responseType ?? 'json', config);
    const result: HttpResponse = {
      data: toList(config.transformResponse).reduce(
        (data, transform) => transform(data, responseHeaders, response.status, config),
        raw,
      ),
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      config,
      duration: performance.now() - started,
    };
    const valid =
      config.validateStatus === null
        ? () => true
        : (config.validateStatus ?? defaultValidateStatus);
    if (!valid(response.status)) {
      throw new HttpError(
        `Request failed with status code ${response.status}`,
        response.status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST',
        config,
        result,
      );
    }
    return result;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (timedOut) {
      throw new HttpError(
        config.timeoutErrorMessage ?? `timeout of ${config.timeout}ms exceeded`,
        config.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        config,
        undefined,
        error,
      );
    }
    if (controller.signal.aborted) throw new CanceledError(config);
    throw new HttpError('Network Error', 'ERR_NETWORK', config, undefined, error);
  } finally {
    clearTimeout(timer);
    config.signal?.removeEventListener('abort', forward);
  }
};
