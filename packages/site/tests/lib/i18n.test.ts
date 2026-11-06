import { afterEach, describe, expect, it } from 'vitest';
import {
  applyLocale,
  currentLocale,
  detectLocale,
  localeStore,
  locales,
  readLocaleParam,
} from '@site/lib/i18n';
import { resetLocale } from '@tests/helpers';

afterEach(async () => {
  await resetLocale();
});

describe('detectLocale', () => {
  it('picks Russian for any Russian locale and English for the rest', () => {
    expect(detectLocale('ru')).toBe('ru');
    expect(detectLocale('ru-RU')).toBe('ru');
    expect(detectLocale('RU-ru')).toBe('ru');
    expect(detectLocale('en-US')).toBe('en');
    expect(detectLocale('de')).toBe('en');
    expect(detectLocale(undefined)).toBe('en');
  });
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
  it('starts with the language of the browser, English here', () => {
    expect(currentLocale()).toBe('en');
  });

  it('cycles through the languages and wraps around', () => {
    localeStore.getState().cycle();
    expect(currentLocale()).toBe('ru');
    localeStore.getState().cycle();
    expect(currentLocale()).toBe('en');
    expect(locales).toEqual(['en', 'ru']);
  });

  it('remembers the choice', () => {
    localeStore.getState().cycle();
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
