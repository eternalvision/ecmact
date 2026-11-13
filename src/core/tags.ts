import { createElement, isIgnoredKey } from '@em/core/element';
import type { ElementOf, Factory, Props } from '@em/types';

/** One factory per HTML tag, with the props typed for that tag, and one for any custom element name. */
export type Tags = {
  [K in keyof HTMLElementTagNameMap]: Factory<Props<K>, ElementOf<K>>;
} & Record<`${string}-${string}`, Factory<Props, HTMLElement>>;

/**
 * Creates plain DOM elements: `tags.button({ onclick }, 'Save')` returns a `<button>`. The first argument may be
 * the props, everything else is children: nodes, text, lists, and signals or functions that are rendered again
 * when they change.
 *
 * @example
 * const { a, button } = tags;
 * const link = a({ href: '/docs' }, 'Docs');
 * const counter = button({ onclick: () => count.value++ }, () => `count is ${count.value}`);
 */
const tags: Tags = new Proxy({} as Tags, {
  /**
   * Creates the factory for the tag that was accessed.
   *
   * @param _ - The proxy target, not used.
   * @param tag - The tag name.
   * @returns The factory, or `undefined` for ignored keys.
   */
  get: (_, tag) =>
    isIgnoredKey(tag) ? undefined : (...args: unknown[]) => createElement(tag, args),
});

export { tags };
