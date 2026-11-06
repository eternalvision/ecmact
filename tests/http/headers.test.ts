import { describe, expect, it } from 'vitest';
import { buildHeaders, mergeHeaders, toRecord } from '@em/http/headers';

describe('buildHeaders', () => {
  it('applies common, then the method bucket, then the headers set directly', () => {
    const headers = buildHeaders(
      { common: { A: '1', B: '1' }, post: { B: '2', C: '2' }, get: { C: 'get' }, C: '3' },
      'post',
    );
    expect(headers.get('a')).toBe('1');
    expect(headers.get('b')).toBe('2');
    expect(headers.get('c')).toBe('3');
  });

  it('is case-insensitive', () => {
    const headers = buildHeaders({ common: { 'Content-Type': 'a' }, 'content-type': 'b' }, 'get');
    expect(headers.get('Content-Type')).toBe('b');
  });

  it('removes a header set to null, undefined or false', () => {
    const headers = buildHeaders(
      { common: { A: '1', B: '1', C: '1' }, A: null, B: undefined, C: false },
      'get',
    );
    expect([...headers.keys()]).toEqual([]);
  });

  it('writes numbers and booleans as text', () => {
    const headers = buildHeaders({ 'X-N': 5, 'X-T': true }, 'get');
    expect(headers.get('x-n')).toBe('5');
    expect(headers.get('x-t')).toBe('true');
  });

  it('works without headers, and with a bucket that is not an object', () => {
    expect([...buildHeaders(undefined, 'get').keys()]).toEqual([]);
    expect([...buildHeaders({ common: 'x' as never }, 'get').keys()]).toEqual(['common']);
  });
});

describe('mergeHeaders', () => {
  it('merges buckets one by one and lets the override win', () => {
    expect(
      mergeHeaders(
        { common: { A: '1' }, post: { B: '1' }, X: 'a' },
        { common: { C: '2' }, X: 'b' },
      ),
    ).toEqual({ common: { A: '1', C: '2' }, post: { B: '1' }, X: 'b' });
  });

  it('replaces a bucket that has no counterpart, and a header that is not a bucket', () => {
    expect(mergeHeaders({ get: { A: '1' } }, { post: { B: '1' } })).toEqual({
      get: { A: '1' },
      post: { B: '1' },
    });
    expect(mergeHeaders({ common: 'x' as never }, { common: { A: '1' } })).toEqual({
      common: { A: '1' },
    });
  });

  it('works with nothing', () => {
    expect(mergeHeaders()).toEqual({});
  });
});

describe('toRecord', () => {
  it('lowercases the names', () => {
    const headers = new Headers({ 'Content-Type': 'text/plain', 'X-Id': '7' });
    expect(toRecord(headers)).toEqual({ 'content-type': 'text/plain', 'x-id': '7' });
  });
});
