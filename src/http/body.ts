import type {
  HttpRequestConfig,
  ProgressEvent,
  RequestTransform,
  ResponseTransform,
  ResponseType,
} from '@em/http/types';

/**
 * Tells whether a value is an instance of a global class, which may not exist in the environment.
 *
 * @param value - The value.
 * @param name - The name of the global class.
 * @returns `true` if the class exists and the value is an instance of it.
 */
const isInstance = (value: unknown, name: 'FormData' | 'Blob' | 'ReadableStream') => {
  const constructor = (globalThis as Record<string, unknown>)[name] as
    (new () => unknown) | undefined;
  return constructor !== undefined && value instanceof constructor;
};

/**
 * Turns the request data into a body: objects become JSON, `URLSearchParams` a form body, and strings, forms,
 * blobs, buffers and streams are sent as they are. Sets the `Content-Type` header when it has not been set.
 *
 * @param data - The request data.
 * @param headers - The request headers.
 * @returns The body.
 */
export const defaultTransformRequest: RequestTransform = (data, headers) => {
  if (data === null || data === undefined || typeof data === 'string') return data;
  if (isInstance(data, 'FormData')) {
    headers.delete('content-type');
    return data as FormData;
  }
  if (
    isInstance(data, 'Blob') ||
    isInstance(data, 'ReadableStream') ||
    data instanceof ArrayBuffer ||
    ArrayBuffer.isView(data)
  ) {
    return data as BodyInit;
  }
  if (data instanceof URLSearchParams) {
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/x-www-form-urlencoded;charset=utf-8');
    }
    return data;
  }
  if (typeof data === 'object') {
    if (!headers.has('content-type')) headers.set('content-type', 'application/json');
    return JSON.stringify(data);
  }
  return String(data);
};

/**
 * Parses a string body as JSON when the response type is `json`. A body that is not valid JSON is returned as it is.
 *
 * @param data - The data read from the response.
 * @param _headers - The response headers, not used.
 * @param _status - The status, not used.
 * @param config - The request config.
 * @returns The parsed data, or the data.
 */
export const defaultTransformResponse: ResponseTransform = (data, _headers, _status, config) => {
  if (typeof data !== 'string' || data === '' || (config.responseType ?? 'json') !== 'json') {
    return data;
  }
  try {
    return JSON.parse(data) as unknown;
  } catch {
    return data;
  }
};

/**
 * Runs the transforms one after another.
 *
 * @template F - The type of the transform.
 * @param transforms - One transform, a list, or nothing.
 * @returns The list of transforms.
 */
export const toList = <F>(transforms: F | F[] | undefined): F[] =>
  transforms === undefined ? [] : Array.isArray(transforms) ? transforms : [transforms];

/**
 * Reads the whole body of a response while reporting the progress.
 *
 * @param response - The response.
 * @param onProgress - Receives the progress.
 * @returns The bytes of the body.
 */
const readWithProgress = async (response: Response, onProgress: (event: ProgressEvent) => void) => {
  const header = response.headers.get('content-length');
  const total = header === null ? undefined : Number(header);
  const reader = (response.body as ReadableStream<Uint8Array>).getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    onProgress({ loaded, total, progress: total ? Math.min(loaded / total, 1) : undefined });
  }
  const bytes = new Uint8Array(loaded);
  let offset = 0;
  chunks.forEach((chunk) => {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return bytes;
};

/**
 * Reads the body of a response as the type that was asked for.
 *
 * @param response - The response.
 * @param type - What to read the body as.
 * @param config - The request config, for the progress callback.
 * @returns The body: text, a blob, a buffer, form data or the stream itself.
 */
export const readBody = async (
  response: Response,
  type: ResponseType,
  config: HttpRequestConfig,
): Promise<unknown> => {
  if (type === 'stream') return response.body;
  if (type === 'formdata') return response.formData();
  if (config.onDownloadProgress && response.body) {
    const bytes = await readWithProgress(response, config.onDownloadProgress);
    if (type === 'arraybuffer') return bytes.buffer;
    if (type === 'blob')
      return new Blob([bytes as BlobPart], { type: response.headers.get('content-type') ?? '' });
    return new TextDecoder().decode(bytes);
  }
  if (type === 'arraybuffer') return response.arrayBuffer();
  if (type === 'blob') return response.blob();
  return response.text();
};

/**
 * Turns a plain object into `FormData`: nested objects use `key[name]`, arrays use `key[]`.
 *
 * @param data - The object. `FormData` is returned as it is.
 * @returns The form data.
 */
export const toFormData = (data: Record<string, unknown> | FormData) => {
  if (data instanceof FormData) return data;
  const form = new FormData();
  /**
   * Appends a value, descending into objects and arrays.
   *
   * @param key - The key so far.
   * @param value - The value.
   */
  const append = (key: string, value: unknown) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => append(`${key}[]`, item));
    } else if (
      typeof value === 'object' &&
      !isInstance(value, 'Blob') &&
      !(value instanceof Date)
    ) {
      Object.entries(value).forEach(([name, item]) => append(`${key}[${name}]`, item));
    } else if (isInstance(value, 'Blob')) {
      form.append(key, value as Blob);
    } else {
      form.append(key, value instanceof Date ? value.toISOString() : String(value));
    }
  };
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => append(`${key}[]`, item));
    else append(key, value);
  });
  return form;
};
