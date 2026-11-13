import { effect, mount } from 'ecmact';
import { createSiteRouter } from '@site/app/router';
import { watchTheme } from '@site/app/theme';
import { applyLocale, localeStore, readLocaleParam, type Locale } from '@site/lib/i18n';
import { applyMeta, metaFor } from '@site/lib/title';
import { Footer } from '@site/ui/footer';
import { Header } from '@site/ui/header';

/**
 * Starts the site: mounts the header, the page and the footer, keeps the theme, the language and the page title up
 * to date, and builds the whole interface again when the language changes.
 *
 * @param target - The element to mount into.
 * @returns The router, and a function that stops everything.
 */
export const start = (target: string | Element) => {
  const forced = readLocaleParam(window.location.search);
  if (forced) localeStore.setState({ locale: forced });
  const root = typeof target === 'string' ? (document.querySelector(target) as Element) : target;
  const router = createSiteRouter();

  /**
   * Builds the interface in a language, replacing what was there.
   *
   * @param locale - The language.
   */
  const render = (locale: Locale) => {
    applyLocale(locale);
    root.replaceChildren();
    mount(root, Header(router), router.outlet({ class: 'outlet' }), Footer(router));
  };

  const stopTheme = watchTheme();
  const stopLocale = localeStore.watch((state) => state.locale, render, { fireImmediately: true });
  const stopMeta = effect(() => applyMeta(metaFor(router.location.value.path, localeStore.locale)));
  return {
    router,
    /**
     * Stops the theme, the language, the title and the router.
     */
    stop: () => {
      stopTheme();
      stopLocale();
      stopMeta();
      router.dispose();
    },
  };
};
