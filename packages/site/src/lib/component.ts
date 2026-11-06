import { em, type Component, type ComponentProps, type Router } from 'ecmact';

/**
 * Creates one of the site's own interface components: rendered into the light DOM, so the global stylesheet
 * applies, and with `display: contents` on the host, so that the custom element does not take part in the layout.
 *
 * @param name - The component name.
 * @param props - The props of the component.
 * @returns The component.
 */
export const view = <K extends string = 'div'>(name: string, props = {} as ComponentProps<K>) => {
  const component = em[name]({ shadow: false, ...props } as ComponentProps<K>) as Component<K>;
  component.style.display = 'contents';
  return component;
};

/**
 * Creates a component for a standard tag, in the light DOM and without a box of its own for the host.
 *
 * @param name - The tag.
 * @param props - The props of the component.
 * @returns The component.
 */
export const tag = <K extends keyof HTMLElementTagNameMap>(
  name: K,
  props = {} as ComponentProps<K>,
) =>
  view<K>(`${name[0]?.toUpperCase()}${name.slice(1)}`, {
    ...props,
    tag: name,
  } as ComponentProps<K>);

/**
 * Creates a link that navigates through the router, in the light DOM and without a box of its own for the host.
 *
 * @param router - The router.
 * @param to - The path inside the site.
 * @param content - The text of the link.
 * @param className - The class of the anchor.
 * @returns The link component.
 */
export const link = (router: Router, to: string, content: string, className = '') => {
  const anchor = router.link({ to, content, class: className, shadow: false });
  anchor.style.display = 'contents';
  return anchor;
};
