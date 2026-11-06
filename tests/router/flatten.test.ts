import { describe, expect, it } from 'vitest';
import { flattenRoutes, joinPaths } from '@em/router/flatten';
import type { Route } from '@em/router/router';

const view = () => document.createElement('p');

describe('joinPaths', () => {
  it('joins patterns with single slashes', () => {
    expect(joinPaths('/users', ':id')).toBe('/users/:id');
    expect(joinPaths('/users/', '/:id')).toBe('/users/:id');
  });

  it('keeps the layout path for an empty child path', () => {
    expect(joinPaths('/users', '')).toBe('/users');
    expect(joinPaths('', '')).toBe('/');
  });
});

describe('flattenRoutes', () => {
  it('keeps plain routes as one-route chains', () => {
    const route: Route = { path: '/about', view };
    const [entry] = flattenRoutes([route]);
    expect(entry.chain).toEqual([route]);
    expect(entry.paths).toEqual(['/about']);
    expect(entry.pattern.regexp.test('/about')).toBe(true);
  });

  it('replaces a layout with its children, in order', () => {
    const index: Route = { path: '', view };
    const detail: Route = { path: ':id', view };
    const layout: Route = { path: '/users', view, children: [index, detail] };
    const entries = flattenRoutes([layout, { path: '*', view }]);
    expect(entries.map((entry) => entry.paths)).toEqual([
      ['/users', '/users'],
      ['/users', '/users/:id'],
      ['/'.concat('*')],
    ]);
    expect(entries[1].chain).toEqual([layout, detail]);
  });

  it('nests layouts and joins every level', () => {
    const leaf: Route = { path: 'edit', view };
    const inner: Route = { path: ':id', view, children: [leaf] };
    const outer: Route = { path: '/users', view, children: [inner] };
    const [entry] = flattenRoutes([outer]);
    expect(entry.chain).toEqual([outer, inner, leaf]);
    expect(entry.paths).toEqual(['/users', '/users/:id', '/users/:id/edit']);
  });

  it('treats an empty children list as a plain route', () => {
    const [entry] = flattenRoutes([{ path: '/a', view, children: [] }]);
    expect(entry.chain).toHaveLength(1);
  });
});
