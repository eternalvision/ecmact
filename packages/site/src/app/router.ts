import { createRouter, type Route, type RouteContext, type Router } from 'ecmact';
import { docs, findDoc } from '@site/content/docs/index';
import { basePath } from '@site/lib/paths';
import { docsPage } from '@site/pages/docs';
import { examples } from '@site/pages/examples';
import { home } from '@site/pages/home';
import { notFound } from '@site/pages/notFound';

/**
 * Lists the routes of the site: the home page, the examples, the documentation and the redirect from `/docs` to
 * the first page of the documentation.
 *
 * @param router - Returns the router that the pages link with. It is a function, because the routes are needed to create the router.
 * @returns The routes.
 */
export const siteRoutes = (router: () => Router): Route[] => {
  /**
   * Shows the home page.
   *
   * @returns The page.
   */
  const homeView = () => home(router());

  /**
   * Shows the gallery of demos.
   *
   * @returns The page.
   */
  const examplesView = () => examples();

  /**
   * Shows the page for an address that matches nothing. The redirect of `/docs` normally comes first.
   *
   * @returns The page.
   */
  const notFoundView = () => notFound(router());

  /**
   * Sends `/docs` to the first page of the documentation.
   *
   * @returns The path to go to instead.
   */
  const firstDoc = () => `/docs/${docs[0]?.slug}`;

  /**
   * Shows a documentation page, or the not found page for a slug that does not exist.
   *
   * @param context - The matched parameters.
   * @returns The page.
   */
  const docView = ({ params }: RouteContext) => {
    const page = findDoc(params.slug as string);
    return page ? docsPage(router(), page) : notFound(router());
  };

  return [
    { path: '/', view: homeView },
    { path: '/examples', view: examplesView },
    { path: '/docs', view: notFoundView, beforeEnter: firstDoc },
    { path: '/docs/:slug', view: docView },
  ];
};

/**
 * Creates the router of the site: the home page, the examples, the documentation and a page for anything else.
 * `/docs` redirects to the first page of the documentation.
 *
 * @returns The router.
 */
export const createSiteRouter = (): Router => {
  /**
   * Shows the page for an address that matches nothing.
   *
   * @returns The page.
   */
  const missing = () => notFound(router);

  /**
   * Reads the router that is being created, for the pages that link with it.
   *
   * @returns The router.
   */
  const self = () => router;

  const router: Router = createRouter({
    base: basePath(),
    routes: siteRoutes(self),
    notFound: missing,
  });
  return router;
};
