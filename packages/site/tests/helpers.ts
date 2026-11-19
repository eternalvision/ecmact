import { createRouter, type Router } from 'ecmact';

export const routers: Router[] = [];

export const makeRouter = (path = '/') => {
  window.history.replaceState(null, '', path);
  const router = createRouter({
    routes: [
      { path: '/', view: () => document.createElement('p') },
      { path: '/docs', view: () => document.createElement('p') },
      { path: '/docs/:slug', view: () => document.createElement('p') },
      { path: '/examples', view: () => document.createElement('p') },
    ],
  });
  routers.push(router);
  return router;
};

export const disposeRouters = () => routers.splice(0).forEach((router) => router.dispose());

// After `vi.resetModules()` this imports a new module, so it resets the new store, not the one a test file imported at the top.
export const useLocale = async (locale: 'en' | 'ru') => {
  const { localeStore } = await import('@site/lib/i18n');
  localeStore.setState({ locale });
};

export const resetLocale = async () => {
  sessionStorage.removeItem('ecmact-site-locale-session');
  await useLocale('en');
  localStorage.removeItem('ecmact-site-locale');
};
