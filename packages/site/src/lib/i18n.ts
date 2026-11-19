import { createJSONStorage, createStore, type PersistStorage } from 'ecmact';

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

/** Whether the language on screen comes from the address and is not the visitor's choice, so it must not be written. */
let sessionOnly = false;

/**
 * Opens the storage that keeps the choice. A storage that is missing or refuses is not an error: the choice then
 * lives for the visit only.
 *
 * @returns The storage.
 */
const backing = () =>
  createJSONStorage<StoredLocale>(() => localStorage) as PersistStorage<StoredLocale>;

/** The storage of the choice. It never throws, and it does not write while the language comes from the address. */
const choiceStorage: PersistStorage<StoredLocale> = {
  /**
   * Reads the stored choice.
   *
   * @param name - The key.
   * @returns The stored value, or `null` when there is none or the storage refuses.
   */
  getItem: (name) => {
    try {
      return backing().getItem(name);
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
    if (sessionOnly) return;
    try {
      backing().setItem(name, value);
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
      backing().removeItem(name);
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
      sessionOnly = false;
      set((state) => ({
        locale: locales[(locales.indexOf(state.locale) + 1) % locales.length] as Locale,
      }));
    },
    /**
     * Shows a language for this visit only, as `?lang=` asks, and leaves the kept choice as it is.
     *
     * @param locale - The language.
     */
    force: (locale: Locale) => {
      sessionOnly = true;
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
