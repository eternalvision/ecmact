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
