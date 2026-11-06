import { defaultTransformRequest, defaultTransformResponse } from '@em/http/body';
import { mergeHeaders } from '@em/http/headers';
import type { HttpRequestConfig } from '@em/http/types';

/**
 * Tells whether a status is a success: 200 to 299.
 *
 * @param status - The HTTP status.
 * @returns `true` for a success.
 */
export const defaultValidateStatus = (status: number) => status >= 200 && status < 300;

/**
 * Creates the defaults that every instance starts from.
 *
 * @returns A fresh copy of the library defaults.
 */
export const libraryDefaults = (): HttpRequestConfig => ({
  headers: { common: { Accept: 'application/json, text/plain, */*' } },
  transformRequest: [defaultTransformRequest],
  transformResponse: [defaultTransformResponse],
  timeout: 0,
  responseType: 'json',
  validateStatus: defaultValidateStatus,
  allowAbsoluteUrls: true,
  withCredentials: false,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

const requestOnly = new Set(['url', 'method', 'data']);

/**
 * Merges the defaults of an instance with the config of a request. A value in the request wins; `url`, `method`
 * and `data` are never taken from the defaults, and `headers` are merged bucket by bucket.
 *
 * @param defaults - The defaults of the instance.
 * @param config - The config of the request.
 * @returns A new config.
 */
export const mergeConfig = (defaults: HttpRequestConfig, config: HttpRequestConfig) => {
  const merged: Record<string, unknown> = {};
  Object.entries(defaults).forEach(([key, value]) => {
    if (!requestOnly.has(key) && key !== 'headers') merged[key] = value;
  });
  Object.entries(config).forEach(([key, value]) => {
    if (key !== 'headers' && value !== undefined) merged[key] = value;
  });
  merged.headers = mergeHeaders(defaults.headers, config.headers);
  return merged as HttpRequestConfig;
};
