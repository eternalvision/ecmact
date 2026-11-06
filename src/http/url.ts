import type { HttpRequestConfig, ParamsSerializerOptions } from '@em/http/types';
import { trimTrailingSlashes } from '@em/utils/trimTrailingSlashes';

const absolute = /^([a-z][a-z\d+\-.]*:)?\/\//i;

/**
 * Encodes a key or a value for a query string, keeping the characters that are safe there readable.
 *
 * @param value - The text to encode.
 * @returns The encoded text.
 */
const encode = (value: string) =>
  encodeURIComponent(value)
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']');

/**
 * Turns a value into the text of a parameter.
 *
 * @param value - The value.
 * @returns Dates as ISO text, everything else as text.
 */
const text = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value));

/**
 * Flattens parameters into `key=value` pairs: arrays become `key[]` (or `key[0]`, or a repeated `key`), nested
 * objects become `key[name]`. `null` and `undefined` are skipped.
 *
 * @param key - The key so far.
 * @param value - The value.
 * @param indexes - How to write arrays.
 * @param pairs - Where the pairs are collected.
 */
const flatten = (
  key: string,
  value: unknown,
  indexes: boolean | null | undefined,
  pairs: [string, string][],
) => {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const name = indexes === null ? key : `${key}[${indexes ? index : ''}]`;
      flatten(name, item, indexes, pairs);
    });
  } else if (typeof value === 'object' && !(value instanceof Date)) {
    Object.entries(value).forEach(([name, item]) =>
      flatten(key === '' ? name : `${key}[${name}]`, item, indexes, pairs),
    );
  } else {
    pairs.push([key, text(value)]);
  }
};

/**
 * Turns parameters into a query string, without the leading `?`.
 *
 * @param params - An object or `URLSearchParams`.
 * @param serializer - A function, or options, that replace the default serialization.
 * @returns The query string.
 */
export const serializeParams = (
  params: HttpRequestConfig['params'],
  serializer?: HttpRequestConfig['paramsSerializer'],
) => {
  if (!params) return '';
  const options: ParamsSerializerOptions =
    typeof serializer === 'function' ? { serialize: serializer } : (serializer ?? {});
  if (params instanceof URLSearchParams) {
    return options.serialize ? options.serialize(Object.fromEntries(params)) : params.toString();
  }
  if (options.serialize) return options.serialize(params);
  const pairs: [string, string][] = [];
  flatten('', params, options.indexes, pairs);
  const encoder = options.encode ?? encode;
  return pairs.map(([key, value]) => `${encoder(key)}=${encoder(value)}`).join('&');
};

/**
 * Joins `baseURL` and `url`, unless `url` is absolute.
 *
 * @param baseURL - The base, or `undefined`.
 * @param url - The URL.
 * @param allowAbsoluteUrls - When `false`, an absolute `url` is prefixed too.
 * @returns The combined URL.
 */
export const combineUrls = (baseURL: string | undefined, url: string, allowAbsoluteUrls = true) => {
  if (!baseURL || (allowAbsoluteUrls && absolute.test(url))) return url;
  return `${trimTrailingSlashes(baseURL)}/${url.replace(/^\/+/, '')}`;
};

/**
 * Builds the full URL of a request: the base, the URL and the query string. The hash is dropped.
 *
 * @param config - The request config.
 * @returns The URL.
 */
export const buildUrl = (config: HttpRequestConfig) => {
  const combined = combineUrls(config.baseURL, config.url ?? '', config.allowAbsoluteUrls);
  const hash = combined.indexOf('#');
  const url = hash === -1 ? combined : combined.slice(0, hash);
  const query = serializeParams(config.params, config.paramsSerializer);
  if (!query) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
};
