import type { HeaderMap, HeaderValue, HttpHeaders } from '@em/http/types';

const buckets = new Set(['common', 'get', 'post', 'put', 'patch', 'delete', 'head', 'options']);

/**
 * Tells whether a header entry is a bucket of headers rather than a header.
 *
 * @param value - The value of the entry.
 * @returns `true` for objects.
 */
const isBucket = (value: HeaderValue | HeaderMap): value is HeaderMap =>
  typeof value === 'object' && value !== null;

/**
 * Sets or removes headers on a `Headers` object.
 *
 * @param target - The headers to change.
 * @param map - The names and values to apply. `null`, `undefined` and `false` remove a header.
 */
const apply = (target: Headers, map: HeaderMap) => {
  Object.entries(map).forEach(([name, value]) => {
    if (value === null || value === undefined || value === false) target.delete(name);
    else target.set(name, String(value));
  });
};

/**
 * Builds the headers of a request: `common`, then the bucket of the method, then the headers set directly.
 * Names are case-insensitive, so a later entry replaces an earlier one that differs only in case.
 *
 * @param headers - The merged headers of defaults and request.
 * @param method - The method, in lower case.
 * @returns The headers.
 */
export const buildHeaders = (headers: HttpHeaders = {}, method: string) => {
  const result = new Headers();
  const own: HeaderMap = {};
  Object.entries(headers).forEach(([name, value]) => {
    if (!isBucket(value)) own[name] = value;
  });
  [headers.common, headers[method]].forEach((bucket) => {
    if (bucket && isBucket(bucket)) apply(result, bucket);
  });
  apply(result, own);
  return result;
};

/**
 * Merges two sets of headers, with `override` winning. The buckets (`common`, `get`, ...) are merged one by one.
 *
 * @param base - The headers to start from.
 * @param override - The headers that win.
 * @returns A new set of headers.
 */
export const mergeHeaders = (base: HttpHeaders = {}, override: HttpHeaders = {}) => {
  const result: HttpHeaders = { ...base };
  Object.entries(override).forEach(([name, value]) => {
    const current = result[name];
    result[name] =
      buckets.has(name) && isBucket(value) && current && isBucket(current)
        ? { ...current, ...value }
        : value;
  });
  return result;
};

/**
 * Turns response headers into a plain object with lower-case names.
 *
 * @param headers - The response headers.
 * @returns The headers as an object.
 */
export const toRecord = (headers: Headers) => {
  const record: Record<string, string> = {};
  headers.forEach((value, name) => {
    record[name.toLowerCase()] = value;
  });
  return record;
};
