import { toFormData } from '@em/http/body';
import { libraryDefaults, mergeConfig } from '@em/http/config';
import { dispatch } from '@em/http/dispatch';
import { InterceptorManager } from '@em/http/interceptors';
import { withRetry } from '@em/http/retry';
import type { HttpMethod, HttpRequestConfig, HttpResponse } from '@em/http/types';
import { buildUrl } from '@em/http/url';
import { resource, type Resource } from '@em/data/resource';

/**
 * The promise of a response, which also gives the body alone: `await api.get(url).data`.
 *
 * @template T - The type of the response data.
 * @template D - The type of the request data.
 */
export type HttpPromise<T = unknown, D = unknown> = Promise<HttpResponse<T, D>> & {
  /** A promise of the body of the response, after `transformResponse`. */
  readonly data: Promise<T>;
};

/**
 * Options of `api.resource`: the config of the request, plus the data to show before the first answer.
 *
 * @template T - The type of the response data.
 */
export type HttpResourceConfig<T> = Omit<HttpRequestConfig, 'url' | 'signal'> & {
  /** The data before the first answer. */
  initial?: T;
};

/** The method shortcuts that take no body. */
type BodylessShortcut = <T = unknown, D = unknown>(
  url: string,
  config?: HttpRequestConfig<D>,
) => HttpPromise<T, D>;

/** The method shortcuts that take a body. */
type BodyShortcut = <T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: HttpRequestConfig<D>,
) => HttpPromise<T, D>;

/** A client: a function that sends requests, with shortcuts for the methods, defaults and interceptors. */
export interface HttpInstance {
  /**
   * Sends a request.
   *
   * @template T - The type of the response data.
   * @template D - The type of the request data.
   * @param config - The request config, with `url`.
   * @returns The response.
   */
  <T = unknown, D = unknown>(config: HttpRequestConfig<D>): HttpPromise<T, D>;
  /**
   * Sends a GET request, or the request that the config describes.
   *
   * @template T - The type of the response data.
   * @template D - The type of the request data.
   * @param url - The URL.
   * @param config - The request config.
   * @returns The response.
   */
  <T = unknown, D = unknown>(url: string, config?: HttpRequestConfig<D>): HttpPromise<T, D>;
  /** The defaults for every request of this instance. Change them in place. */
  defaults: HttpRequestConfig;
  /** Runs before a request is sent. They run in reverse order of adding, the last one added first. */
  interceptors: {
    request: InterceptorManager<HttpRequestConfig>;
    /** Runs after a response arrived, in the order of adding. */
    response: InterceptorManager<HttpResponse>;
  };
  /** Sends a request. */
  request: <T = unknown, D = unknown>(config: HttpRequestConfig<D>) => HttpPromise<T, D>;
  /** Sends a GET request. */
  get: BodylessShortcut;
  /** Sends a DELETE request. */
  delete: BodylessShortcut;
  /** Sends a HEAD request. */
  head: BodylessShortcut;
  /** Sends an OPTIONS request. */
  options: BodylessShortcut;
  /** Sends a POST request. */
  post: BodyShortcut;
  /** Sends a PUT request. */
  put: BodyShortcut;
  /** Sends a PATCH request. */
  patch: BodyShortcut;
  /** Sends a POST request with `multipart/form-data`; an object is turned into form data. */
  postForm: BodyShortcut;
  /** Sends a PUT request with `multipart/form-data`; an object is turned into form data. */
  putForm: BodyShortcut;
  /** Sends a PATCH request with `multipart/form-data`; an object is turned into form data. */
  patchForm: BodyShortcut;
  /**
   * Builds the URL that a config would request, without sending anything.
   *
   * @param config - The request config.
   * @returns The URL with the base and the query string.
   */
  getUri(config?: HttpRequestConfig): string;
  /**
   * Requests a URL and exposes the answer as a resource: `data`, `error` and `loading`. The URL may be a
   * function that reads signals; when one of them changes, the request in flight is cancelled and a new one starts.
   *
   * @template T - The type of the response data.
   * @param url - The URL, or a function that returns it.
   * @param config - The config of the request, and the initial data.
   * @returns The resource.
   */
  resource<T = unknown>(url: string | (() => string), config?: HttpResourceConfig<T>): Resource<T>;
}

/**
 * Creates a client with its own defaults and interceptors. Requests merge the library defaults, the defaults of
 * the instance and the config of the request, the last one winning.
 *
 * @example
 * const api = createHttp({ baseURL: 'https://api.example.com', timeout: 5000 });
 * const { data } = await api.get<User[]>('/users', { params: { page: 1 } });
 *
 * @param config - The defaults of the instance.
 * @returns The client.
 */
export const createHttp = (config: HttpRequestConfig = {}): HttpInstance => {
  const defaults = mergeConfig(libraryDefaults(), config);
  const interceptors = {
    request: new InterceptorManager<HttpRequestConfig>(),
    response: new InterceptorManager<HttpResponse>(),
  };

  /**
   * Sends a request: request interceptors, the request itself, then response interceptors.
   *
   * @param request - The config of the request.
   * @returns The response.
   */
  const send = (request: HttpRequestConfig): HttpPromise<never, never> => {
    let chain: Promise<unknown> = Promise.resolve(mergeConfig(instance.defaults, request));
    [...interceptors.request.list()].reverse().forEach(({ fulfilled, rejected, runWhen }) => {
      chain = chain.then(
        fulfilled &&
          ((value) =>
            !runWhen || runWhen(value as HttpRequestConfig)
              ? fulfilled(value as HttpRequestConfig)
              : value),
        rejected,
      );
    });
    chain = chain.then((value) =>
      withRetry(value as HttpRequestConfig, () => dispatch(value as HttpRequestConfig)),
    );
    interceptors.response.list().forEach(({ fulfilled, rejected }) => {
      chain = chain.then(fulfilled as never, rejected);
    });
    return Object.defineProperty(chain, 'data', {
      /**
       * Makes the promise of the body when it is asked for.
       *
       * @returns A promise of the response data.
       */
      get: () => chain.then((response) => (response as HttpResponse).data),
    }) as HttpPromise<never, never>;
  };

  /**
   * Sends a request given as a URL and a config, or as a config.
   *
   * @param target - The URL, or the config.
   * @param extra - The config, when the first argument is a URL.
   * @returns The response.
   */
  const instance = ((target: string | HttpRequestConfig, extra: HttpRequestConfig = {}) =>
    send(
      typeof target === 'string' ? { ...extra, url: target } : target,
    )) as unknown as HttpInstance;

  /**
   * Makes a shortcut for a method that takes no body.
   *
   * @param method - The method.
   * @returns The shortcut.
   */
  const bodyless =
    (method: HttpMethod): BodylessShortcut =>
    (url, request) =>
      send({ ...request, method, url });

  /**
   * Makes a shortcut for a method that takes a body.
   *
   * @param method - The method.
   * @param form - Whether to send the data as `multipart/form-data`.
   * @returns The shortcut.
   */
  const withBody =
    (method: HttpMethod, form = false): BodyShortcut =>
    (url, data, request) =>
      send({
        ...request,
        method,
        url,
        data:
          form && data && typeof data === 'object'
            ? toFormData(data as Record<string, unknown>)
            : data,
      });

  /**
   * Sends a request given as a config.
   *
   * @param request - The config of the request.
   * @returns The response.
   */
  const requestOf = (request: HttpRequestConfig) => send(request);

  /**
   * Builds the URL that a config would request.
   *
   * @param request - The config of the request.
   * @returns The URL.
   */
  const getUri = (request: HttpRequestConfig = {}) =>
    buildUrl(mergeConfig(instance.defaults, request));

  Object.assign(instance, {
    defaults,
    interceptors,
    request: requestOf,
    get: bodyless('get'),
    delete: bodyless('delete'),
    head: bodyless('head'),
    options: bodyless('options'),
    post: withBody('post'),
    put: withBody('put'),
    patch: withBody('patch'),
    postForm: withBody('post', true),
    putForm: withBody('put', true),
    patchForm: withBody('patch', true),
    getUri,
    /**
     * Requests a URL and exposes the answer as a resource.
     *
     * @param url - The URL, or a function that returns it.
     * @param config - The config of the request, and the initial data.
     * @returns The resource.
     */
    resource: (
      url: string | (() => string),
      { initial, ...request }: HttpResourceConfig<unknown> = {},
    ) =>
      resource(
        ({ signal }) =>
          send({ ...request, url: typeof url === 'function' ? url() : url, signal }).data,
        { initial },
      ),
  });
  return instance;
};

/** A ready-made client with the library defaults, for scripts and for tests. Use `createHttp` for an app. */
export const http = createHttp();
