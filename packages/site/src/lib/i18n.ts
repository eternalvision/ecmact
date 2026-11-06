import { combine, createStore, persist } from 'ecmact';

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

/** The language of the site, kept in `localStorage`. It is English until the visitor chooses another language. */
export const localeStore = createStore(
  persist(
    combine({ locale: 'en' as Locale }, (set) => ({
      /**
       * Moves to the next language.
       */
      cycle: () => {
        set((state) => ({
          locale: locales[(locales.indexOf(state.locale) + 1) % locales.length] as Locale,
        }));
      },
    })),
    {
      name: 'ecmact-site-locale',
      /**
       * Picks what to persist: the language only.
       *
       * @param state - The state.
       * @returns The part to store.
       */
      partialize: (state) => ({ locale: state.locale }),
    },
  ),
);

/**
 * Reads the language that is in use now.
 *
 * @returns The locale.
 */
export const currentLocale = () => localeStore.getState().locale;

/**
 * Puts the language on the document, for screen readers and search engines.
 *
 * @param locale - The locale.
 */
export const applyLocale = (locale: Locale) => {
  document.documentElement.lang = locale;
};
