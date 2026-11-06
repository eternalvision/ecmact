import { compilePattern, type CompiledPattern } from '@em/router/match';
import type { Route } from '@em/router/router';

/** A route with the full pattern it is reached by, and the layouts around it. */
export interface FlatRoute {
  /** The routes from the outermost layout to the route that ends the path. */
  chain: Route[];
  /** The full pattern of each route in the chain: the layouts' paths joined with its own. */
  paths: string[];
  /** The compiled full pattern of the last route. */
  pattern: CompiledPattern;
}

/**
 * Joins two route patterns into one.
 *
 * @param prefix - The pattern of the layout.
 * @param path - The pattern of the child, relative to the layout.
 * @returns The combined pattern, starting with a slash.
 */
export const joinPaths = (prefix: string, path: string) =>
  `/${[...prefix.split('/'), ...path.split('/')].filter(Boolean).join('/')}`;

/**
 * Turns a tree of routes into a flat list in matching order. A route with `children` is a layout: it never matches
 * alone, only together with one of its children, whose paths are relative to its own.
 *
 * @param routes - The routes as the user wrote them.
 * @param parents - The layouts around the routes, outermost first.
 * @param parentPaths - The full pattern of each of those layouts.
 * @returns One entry for every route that ends a path, depth first.
 */
export const flattenRoutes = (
  routes: Route[],
  parents: Route[] = [],
  parentPaths: string[] = [],
): FlatRoute[] =>
  routes.flatMap((route) => {
    const full = joinPaths(parentPaths.at(-1) ?? '', route.path);
    const chain = [...parents, route];
    const paths = [...parentPaths, full];
    if (route.children?.length) return flattenRoutes(route.children, chain, paths);
    return [{ chain, paths, pattern: compilePattern(full) }];
  });
