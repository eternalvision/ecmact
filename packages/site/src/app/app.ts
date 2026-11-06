import { effect, mount } from 'ecmact';
import { watchTheme } from '@site/app/theme';
import { createSiteRouter } from '@site/app/router';
import { applyMeta, metaFor } from '@site/lib/title';
import { Footer } from '@site/ui/footer';
import { Header } from '@site/ui/header';

/**
 * Starts the site: mounts the header, the page and the footer, keeps the theme and the page title up to date,
 * and scrolls to the top on every navigation.
 *
 * @param target - The element to mount into.
 * @returns The router, and a function that stops everything.
 */
export const start = (target: string | Element) => {
  const router = createSiteRouter();
  const stopTheme = watchTheme();
  const stopMeta = effect(() => applyMeta(metaFor(router.location.value.path)));
  mount(target, Header(router), router.outlet({ class: 'outlet', shadow: false }), Footer(router));
  return {
    router,
    /**
     * Stops the theme, the title and the router.
     */
    stop: () => {
      stopTheme();
      stopMeta();
      router.dispose();
    },
  };
};
