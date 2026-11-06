import { describe, expect, it } from 'vitest';
import { buildUrl, combineUrls, serializeParams } from '@em/http/url';

describe('combineUrls', () => {
  it('joins a base and a relative url with one slash', () => {
    expect(combineUrls('https://a.test/api/', '/users')).toBe('https://a.test/api/users');
    expect(combineUrls('https://a.test', 'users')).toBe('https://a.test/users');
  });

  it('leaves an absolute url alone', () => {
    expect(combineUrls('https://a.test', 'https://b.test/x')).toBe('https://b.test/x');
    expect(combineUrls('https://a.test', '//b.test/x')).toBe('//b.test/x');
  });

  it('prefixes an absolute url when it is not allowed', () => {
    expect(combineUrls('https://a.test', 'https://b.test/x', false)).toBe(
      'https://a.test/https://b.test/x',
    );
  });

  it('returns the url without a base', () => {
    expect(combineUrls(undefined, '/x')).toBe('/x');
    expect(combineUrls('', '/x')).toBe('/x');
  });
});

describe('serializeParams', () => {
  it('returns nothing for no params', () => {
    expect(serializeParams(undefined)).toBe('');
    expect(serializeParams({})).toBe('');
  });

  it('writes keys and values, skipping null and undefined', () => {
    expect(serializeParams({ a: 1, b: 'x y', c: null, d: undefined, e: false })).toBe(
      'a=1&b=x+y&e=false',
    );
  });

  it('encodes, keeping : $ , [ ] readable', () => {
    expect(serializeParams({ q: 'a&b=c', t: '12:30', m: '$5,00' })).toBe(
      'q=a%26b%3Dc&t=12:30&m=$5,00',
    );
  });

  it('writes arrays with empty brackets by default, with indexes or as repeated keys', () => {
    expect(serializeParams({ id: [1, 2] })).toBe('id[]=1&id[]=2');
    expect(serializeParams({ id: [1, 2] }, { indexes: true })).toBe('id[0]=1&id[1]=2');
    expect(serializeParams({ id: [1, 2] }, { indexes: null })).toBe('id=1&id=2');
  });

  it('writes nested objects with brackets', () => {
    expect(serializeParams({ filter: { name: 'a', tags: ['x'] } })).toBe(
      'filter[name]=a&filter[tags][]=x',
    );
  });

  it('writes dates as ISO text', () => {
    expect(serializeParams({ at: new Date('2026-01-02T03:04:05.000Z') })).toBe(
      'at=2026-01-02T03:04:05.000Z',
    );
  });

  it('accepts URLSearchParams', () => {
    expect(serializeParams(new URLSearchParams({ a: '1', b: '2' }))).toBe('a=1&b=2');
  });

  it('uses a custom serializer, function or options', () => {
    expect(serializeParams({ a: 1 }, () => 'custom')).toBe('custom');
    expect(serializeParams({ a: 1 }, { serialize: () => 'opts' })).toBe('opts');
    expect(serializeParams(new URLSearchParams({ a: '1' }), () => 'fn')).toBe('fn');
    expect(serializeParams({ a: 'b c' }, { encode: encodeURIComponent })).toBe('a=b%20c');
  });
});

describe('buildUrl', () => {
  it('adds the base and the query string', () => {
    expect(buildUrl({ baseURL: 'https://a.test', url: '/u', params: { p: 1 } })).toBe(
      'https://a.test/u?p=1',
    );
  });

  it('continues an existing query string and drops the hash', () => {
    expect(buildUrl({ url: '/u?x=1#top', params: { p: 2 } })).toBe('/u?x=1&p=2');
  });

  it('leaves the url as it is without params, and works without a url', () => {
    expect(buildUrl({ url: '/u' })).toBe('/u');
    expect(buildUrl({})).toBe('');
  });
});
