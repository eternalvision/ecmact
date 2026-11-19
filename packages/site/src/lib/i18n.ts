import { createJSONStorage, createStore, type PersistStorage, type StorageValue } from 'ecmact';

/** The languages of the site. */
export type Locale = 'en' | 'ru';

/** Every language, in the order the switch cycles through them. */
export const locales: Locale[] = ['en', 'ru'];

/**
 * Reads a language that the address asks for, as in `?lang=ru`.
 *
 * @param search - The query string of the address.
 * @returns The locale, or `undefined` when the address does not ask for a known one.
 */
export const readLocaleParam = (search: string): Locale | undefined => {
  const value = new URLSearchParams(search).get('lang');
  return locales.find((locale) => locale === value);
};

/** The part of the language store that is kept. */
interface StoredLocale {
  /** The language. */
  locale: Locale;
}

/** The key in `sessionStorage` that holds a language the address asked for, for the rest of the tab session. */
const sessionKey = 'ecmact-site-locale-session';

/**
 * Reads the language that the address asked for earlier in this tab session.
 *
 * @returns The locale, or `undefined` when there is none, it is unknown, or `sessionStorage` refuses.
 */
export const readSessionLocale = (): Locale | undefined => {
  try {
    const value = sessionStorage.getItem(sessionKey);
    return locales.find((locale) => locale === value);
  } catch {
    return undefined;
  }
};

/**
 * Remembers the language of the address for the tab session, or forgets it.
 *
 * @param locale - The language, or `undefined` to forget it.
 */
const writeSessionLocale = (locale: Locale | undefined) => {
  try {
    if (locale) sessionStorage.setItem(sessionKey, locale);
    else sessionStorage.removeItem(sessionKey);
  } catch {
    /* The language then lasts for this page load only. */
  }
};

/**
 * Opens the storage that keeps the choice. A storage that is missing or refuses is not an error: the choice then
 * lives for the visit only.
 *
 * @returns The storage, or `undefined` when there is none.
 */
const backing = () => createJSONStorage<StoredLocale>(() => localStorage);

/** The storage of the choice. It never throws, drops a stored language it does not know, and does not write while the language comes from the address. */
const choiceStorage: PersistStorage<StoredLocale> = {
  /**
   * Reads the stored choice.
   *
   * @param name - The key.
   * @returns The stored value, or `null` when there is none, it is not a known language, or the storage refuses.
   */
  getItem: (name) => {
    try {
      const stored = backing()?.getItem(name) as StorageValue<StoredLocale> | null | undefined;
      return locales.includes(stored?.state?.locale as Locale)
        ? (stored as StorageValue<StoredLocale>)
        : null;
    } catch {
      return null;
    }
  },
  /**
   * Keeps the choice, unless the language comes from the address.
   *
   * @param name - The key.
   * @param value - The value.
   */
  setItem: (name, value) => {
    if (readSessionLocale()) return;
    try {
      backing()?.setItem(name, value);
    } catch {
      /* The choice is not kept; the visit goes on in the language on screen. */
    }
  },
  /**
   * Forgets the stored choice.
   *
   * @param name - The key.
   */
  removeItem: (name) => {
    try {
      backing()?.removeItem(name);
    } catch {
      /* Nothing was kept. */
    }
  },
};

/** The language of the site. The visitor's choice is kept in `localStorage`; until there is one it is English. */
export const localeStore = createStore(
  { locale: 'en' as Locale },
  (set) => ({
    /**
     * Moves to the next language and keeps it as the visitor's choice.
     */
    cycle: () => {
      writeSessionLocale(undefined);
      set((state) => ({
        locale: locales[(locales.indexOf(state.locale) + 1) % locales.length] as Locale,
      }));
    },
    /**
     * Shows a language for this tab session, as `?lang=` asks, and leaves the kept choice as it is.
     *
     * @param locale - The language.
     */
    force: (locale: Locale) => {
      writeSessionLocale(locale);
      set({ locale });
    },
  }),
  { persist: { name: 'ecmact-site-locale', storage: choiceStorage } },
);

/**
 * Reads the language that is in use now.
 *
 * @returns The locale.
 */
export const currentLocale = () => localeStore.locale;

/**
 * Puts the language on the document, for screen readers and search engines.
 *
 * @param locale - The locale.
 */
export const applyLocale = (locale: Locale) => {
  document.documentElement.lang = locale;
};
