import { describe, expect, it } from 'vitest';
import { toPackageName } from '@create/project/name';

describe('toPackageName', () => {
  it('lowercases and replaces spaces', () => {
    expect(toPackageName('My Cool App')).toBe('my-cool-app');
  });

  it('removes characters that npm does not allow', () => {
    expect(toPackageName('app!@#name')).toBe('app-name');
  });

  it('trims leading dots, underscores and dashes and trailing dashes', () => {
    expect(toPackageName('._-app--')).toBe('app');
  });

  it('keeps valid characters', () => {
    expect(toPackageName('my-app_2.0~x')).toBe('my-app_2.0~x');
  });

  it('collapses runs of spaces and of invalid characters, separately', () => {
    expect(toPackageName('a   b')).toBe('a-b');
    expect(toPackageName('a !b')).toBe('a--b');
    expect(toPackageName('a!! b')).toBe('a--b');
  });

  it('stays fast on a long hostile name', () => {
    const started = Date.now();
    toPackageName(`a${'-'.repeat(80000)}b`);
    toPackageName(`${'-'.repeat(50000)}a${'-'.repeat(50000)}!`);
    toPackageName('!'.repeat(50000));
    expect(Date.now() - started).toBeLessThan(500);
  });

  it('falls back to a default name', () => {
    expect(toPackageName('')).toBe('ecmact-app');
    expect(toPackageName('!!!')).toBe('ecmact-app');
  });
});
