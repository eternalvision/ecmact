import type { Component } from '@em/component';
import { createFactory, isIgnoredKey } from '@em/em';
import type { ComponentProps } from '@em/types';

/** One factory per HTML tag, with the props typed for that tag and the tag fixed. */
type TagFactories = {
  [K in keyof HTMLElementTagNameMap]: (props?: Omit<ComponentProps<K>, 'tag'>) => Component<K>;
};

/**
 * Creates components for HTML tags: `tags.button({ ... })` renders a `<button>` with props typed for it.
 *
 * @example
 * const link = tags.a({ href: '/docs', content: 'Docs' });
 */
const tags: TagFactories = new Proxy({} as TagFactories, {
  /**
   * Creates the factory for the tag that was accessed. The tag is fixed in the props.
   *
   * @param _ - The proxy target, not used.
   * @param prop - The tag name.
   * @returns The factory, or `undefined` for ignored keys.
   */
  get: (_, prop) => {
    if (isIgnoredKey(prop)) return undefined;
    const factory = createFactory(prop);
    return (props = {}) => factory({ ...props, tag: prop });
  },
});

export { tags };
