import { effect } from 'ecmact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyLocale, currentLocale, localeStore, locales, readLocaleParam } from '@site/lib/i18n';
import { resetLocale } from '@tests/helpers';

afterEach(async () => {
  await resetLocale();
});

describe('readLocaleParam', () => {
  it('reads a language from the address', () => {
    expect(readLocaleParam('?lang=ru')).toBe('ru');
    expect(readLocaleParam('?a=1&lang=en')).toBe('en');
  });

  it('ignores an unknown language and a missing one', () => {
    expect(readLocaleParam('?lang=de')).toBeUndefined();
    expect(readLocaleParam('')).toBeUndefined();
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

describe('applyLocale', () => {
  it('puts the language on the document', () => {
    applyLocale('ru');
    expect(document.documentElement.lang).toBe('ru');
    applyLocale('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
