import { effect } from 'ecmact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyLocale,
  currentLocale,
  localeStore,
  locales,
  readLocaleParam,
  readSessionLocale,
} from '@site/lib/i18n';

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
  localeStore.setState({ locale: 'en' });
  localStorage.clear();
});

describe('readLocaleParam', () => {
  it('reads a language from the address', () => {
    expect(readLocaleParam('?lang=ru')).toBe('ru');
    expect(readLocaleParam('?a=1&lang=en')).toBe('en');
  });

  it('ignores an unknown language and a missing one', () => {
    expect(readLocaleParam('?lang=de')).toBeUndefined();
    expect(readLocaleParam('')).toBeUndefined();
    expect(readLocaleParam('?lang=')).toBeUndefined();
  });
});

describe('localeStore', () => {
  it('starts in English, whatever the language of the browser is', async () => {
    vi.stubGlobal('navigator', { language: 'ru-RU' });
    vi.resetModules();
    localStorage.clear();
    const fresh = await import('@site/lib/i18n');
    expect(fresh.currentLocale()).toBe('en');
    vi.unstubAllGlobals();
  });

  it('stays English and still switches when the storage throws on read and on write', async () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    vi.stubGlobal('localStorage', broken);
    vi.resetModules();
    const fresh = await import('@site/lib/i18n');
    expect(fresh.currentLocale()).toBe('en');
    expect(() => fresh.localeStore.cycle()).not.toThrow();
    expect(fresh.currentLocale()).toBe('ru');
    expect(() => fresh.localeStore.persist?.clearStorage()).not.toThrow();
    vi.unstubAllGlobals();
  });

  it('stays English and still switches when the storage is not there at all', async () => {
    vi.stubGlobal('localStorage', undefined);
    vi.resetModules();
    const fresh = await import('@site/lib/i18n');
    expect(fresh.currentLocale()).toBe('en');
    fresh.localeStore.cycle();
    expect(fresh.currentLocale()).toBe('ru');
    vi.unstubAllGlobals();
  });

  it('ignores a stored value that is not readable', async () => {
    localStorage.setItem('ecmact-site-locale', '{broken');
    vi.resetModules();
    const fresh = await import('@site/lib/i18n');
    expect(fresh.currentLocale()).toBe('en');
  });

  it('reads the stored choice', async () => {
    localStorage.setItem(
      'ecmact-site-locale',
      JSON.stringify({ state: { locale: 'ru' }, version: 0 }),
    );
    vi.resetModules();
    const fresh = await import('@site/lib/i18n');
    expect(fresh.currentLocale()).toBe('ru');
  });

  it.each([
    ['an unknown language', { state: { locale: 'de' }, version: 0 }],
    ['a value that is not a string', { state: { locale: 5 }, version: 0 }],
    ['a state without a language', { state: {}, version: 0 }],
    ['an empty state', { state: null, version: 0 }],
  ])('ignores a stored choice with %s', async (_name, stored) => {
    localStorage.setItem('ecmact-site-locale', JSON.stringify(stored));
    vi.resetModules();
    const fresh = await import('@site/lib/i18n');
    expect(fresh.currentLocale()).toBe('en');
    fresh.localeStore.cycle();
    expect(fresh.currentLocale()).toBe('ru');
  });

  it('remembers a forced language for the tab session and keeps it after the modules are loaded again', async () => {
    localeStore.force('ru');
    expect(sessionStorage.getItem('ecmact-site-locale-session')).toBe('ru');
    vi.resetModules();
    const fresh = await import('@site/lib/i18n');
    expect(fresh.readSessionLocale()).toBe('ru');
    expect(localStorage.getItem('ecmact-site-locale')).toBeNull();
    fresh.localeStore.cycle();
    expect(sessionStorage.getItem('ecmact-site-locale-session')).toBeNull();
  });

  it('shows a forced language without keeping it', () => {
    localeStore.force('ru');
    expect(currentLocale()).toBe('ru');
    expect(localStorage.getItem('ecmact-site-locale')).toBeNull();
  });

  it('leaves a stored choice alone when another language is forced', () => {
    localeStore.cycle();
    localeStore.force('en');
    expect(currentLocale()).toBe('en');
    expect(JSON.parse(localStorage.getItem('ecmact-site-locale')!).state).toEqual({ locale: 'ru' });
  });

  it('keeps the language the visitor sees after a switch during a forced visit', () => {
    localeStore.force('ru');
    localeStore.cycle();
    expect(currentLocale()).toBe('en');
    expect(JSON.parse(localStorage.getItem('ecmact-site-locale')!).state).toEqual({ locale: 'en' });
  });

  it('cycles through the languages and wraps around', () => {
    localeStore.cycle();
    expect(currentLocale()).toBe('ru');
    localeStore.cycle();
    expect(currentLocale()).toBe('en');
    expect(locales).toEqual(['en', 'ru']);
  });

  it('is read as a plain property that reactive functions follow', () => {
    const seen: string[] = [];
    const stop = effect(() => {
      seen.push(localeStore.locale);
    });
    localeStore.cycle();
    localeStore.cycle();
    stop();
    localeStore.cycle();
    localeStore.cycle();
    expect(seen).toEqual(['en', 'ru', 'en']);
  });

  it('remembers the choice', () => {
    localeStore.cycle();
    expect(JSON.parse(localStorage.getItem('ecmact-site-locale')!).state).toEqual({ locale: 'ru' });
  });
});

describe('readSessionLocale', () => {
  it('reads the language kept for the tab session', () => {
    sessionStorage.setItem('ecmact-site-locale-session', 'ru');
    expect(readSessionLocale()).toBe('ru');
  });

  it('ignores an unknown value and a missing one', () => {
    expect(readSessionLocale()).toBeUndefined();
    sessionStorage.setItem('ecmact-site-locale-session', 'de');
    expect(readSessionLocale()).toBeUndefined();
  });

  it('gives nothing, and does not stop a switch, when sessionStorage throws', () => {
    const blocked = () => {
      throw new Error('blocked');
    };
    vi.stubGlobal('sessionStorage', { getItem: blocked, setItem: blocked, removeItem: blocked });
    expect(readSessionLocale()).toBeUndefined();
    expect(() => localeStore.force('ru')).not.toThrow();
    expect(currentLocale()).toBe('ru');
    expect(() => localeStore.cycle()).not.toThrow();
    expect(currentLocale()).toBe('en');
  });
});

describe('applyLocale', () => {
  it('puts the language on the document', () => {
    applyLocale('ru');
    expect(document.documentElement.lang).toBe('ru');
    applyLocale('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
