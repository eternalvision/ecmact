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

  it('falls back to a default name', () => {
    expect(toPackageName('')).toBe('ecmact-app');
    expect(toPackageName('!!!')).toBe('ecmact-app');
  });
});
