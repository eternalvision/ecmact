/** What can be put inside an element: nodes and text. `null`, `undefined` and `false` are skipped. */
export type Content = Node | string | null | undefined | false;

/** Options for `el`. */
export interface ElementOptions {
  /** The class attribute. */
  class?: string;
  /** Other attributes. `false` and `undefined` leave the attribute out. */
  attrs?: Record<string, string | boolean | undefined>;
}

/**
 * Creates an element with a class, attributes and children, without a framework: for text-heavy markup where a
 * component per element would add nothing.
 *
 * @example
 * el('p', { class: 'lead' }, 'Hello ', el('strong', {}, 'world'));
 *
 * @param tag - The tag name.
 * @param options - The class and the attributes.
 * @param children - The children: nodes and text.
 * @returns The element.
 */
export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {},
  ...children: Content[]
) => {
  const element = document.createElement(tag);
  if (options.class) element.className = options.class;
  Object.entries(options.attrs ?? {}).forEach(([name, value]) => {
    if (value === true) element.setAttribute(name, '');
    else if (typeof value === 'string') element.setAttribute(name, value);
  });
  element.append(...children.filter((child): child is Node | string => !!child || child === ''));
  return element;
};

/**
 * Turns a heading into an id for an anchor: lower case, words joined with dashes, nothing else.
 *
 * @param text - The heading text.
 * @returns The id.
 */
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Draws a 24 by 24 stroke icon from path data. The path data is trusted: it comes from this package.
 *
 * @param paths - The `d` attributes of the paths.
 * @returns The svg element.
 */
export const icon = (paths: readonly string[]) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  paths.forEach((d) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.append(path);
  });
  return svg;
};
