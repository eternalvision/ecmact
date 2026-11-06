import { describe, expectTypeOf, it } from 'vitest';
import type {
  HeaderMap,
  HttpHeaders,
  HttpMethod,
  HttpRequestConfig,
  HttpResponse,
  ProgressEvent,
  ResponseType,
} from '@em/http/types';

describe('http types', () => {
  it('describes the methods and the response types', () => {
    expectTypeOf<HttpMethod>().toEqualTypeOf<
      'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch'
    >();
    expectTypeOf<ResponseType>().toEqualTypeOf<
      'json' | 'text' | 'blob' | 'arraybuffer' | 'formdata' | 'stream'
    >();
  });

  it('lets headers be values or buckets of values', () => {
    expectTypeOf<{ Accept: string }>().toExtend<HttpHeaders>();
    expectTypeOf<{ common: HeaderMap }>().toExtend<HttpHeaders>();
  });

  it('types the data of a request and of a response', () => {
    expectTypeOf<HttpRequestConfig<{ a: number }>['data']>().toEqualTypeOf<
      { a: number } | undefined
    >();
    expectTypeOf<HttpResponse<string[]>['data']>().toEqualTypeOf<string[]>();
    expectTypeOf<HttpResponse['status']>().toBeNumber();
  });

  it('reports a download as bytes with an optional fraction', () => {
    expectTypeOf<ProgressEvent['loaded']>().toBeNumber();
    expectTypeOf<ProgressEvent['progress']>().toEqualTypeOf<number | undefined>();
  });
});
