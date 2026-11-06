import { describe, expect, it } from 'vitest';
import { defaultValidateStatus, libraryDefaults, mergeConfig } from '@em/http/config';

describe('defaultValidateStatus', () => {
  it('accepts 200 to 299', () => {
    expect([199, 200, 204, 299, 300, 404, 500].map(defaultValidateStatus)).toEqual([
      false,
      true,
      true,
      true,
      false,
      false,
      false,
    ]);
  });
});

describe('libraryDefaults', () => {
  it('describes the library defaults and returns a fresh copy', () => {
    const defaults = libraryDefaults();
    expect(defaults).toMatchObject({
      timeout: 0,
      responseType: 'json',
      allowAbsoluteUrls: true,
      withCredentials: false,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
    });
    expect(defaults.headers).toEqual({ common: { Accept: 'application/json, text/plain, */*' } });
    expect(libraryDefaults()).not.toBe(defaults);
  });
});

describe('mergeConfig', () => {
  it('lets the request win over the defaults', () => {
    expect(mergeConfig({ timeout: 1, baseURL: 'a' }, { timeout: 2 })).toMatchObject({
      timeout: 2,
      baseURL: 'a',
    });
  });

  it('ignores undefined values of the request', () => {
    expect(mergeConfig({ timeout: 1 }, { timeout: undefined })).toMatchObject({ timeout: 1 });
  });

  it('takes url, method and data only from the request', () => {
    const merged = mergeConfig({ url: '/d', method: 'post', data: 1 }, { url: '/r' });
    expect(merged.url).toBe('/r');
    expect(merged.method).toBeUndefined();
    expect(merged.data).toBeUndefined();
  });

  it('merges headers bucket by bucket', () => {
    const merged = mergeConfig(
      { headers: { common: { A: '1' } } },
      { headers: { common: { B: '2' }, C: '3' } },
    );
    expect(merged.headers).toEqual({ common: { A: '1', B: '2' }, C: '3' });
  });

  it('does not change its inputs', () => {
    const defaults = { headers: { common: { A: '1' } }, timeout: 1 };
    mergeConfig(defaults, { headers: { common: { B: '2' } }, timeout: 2 });
    expect(defaults).toEqual({ headers: { common: { A: '1' } }, timeout: 1 });
  });
});
