import { bind, isReactive, read } from '@em/render/bindings';
import { appendChildren } from '@em/render/children';
import { applyProperties, applyProps } from '@em/render/props';
import type { Child } from '@em/types';
import { warn } from '@em/utils/warn';

/** The props of an element, before they are told apart. */
export type AnyProps = Record<string, unknown>;

/**
 * Tells whether a property name must not create a factory, so that `await tags` and `String(tags)` are safe.
 *
 * @param prop - The property name that was accessed.
 * @returns `true` for symbols and `then`.
 */
export const isIgnoredKey = (prop: string | symbol): prop is symbol | 'then' =>
  typeof prop === 'symbol' || prop === 'then';

/**
 * Tells whether the first argument of a factory is the props: a plain object, as opposed to a node, a list,
 * a signal or a function, which are children.
 *
 * @param value - The first argument.
 * @returns `true` for plain objects.
 */
const isProps = (value: unknown): value is AnyProps =>
  typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;

/**
 * Splits the arguments of a factory into the props and the children.
 *
 * @param args - The arguments: optional props, then children.
 * @returns The props and the children.
 */
export const splitArgs = (args: unknown[]): [AnyProps, Child[]] =>
  isProps(args[0]) ? [args[0], args.slice(1) as Child[]] : [{}, args as Child[]];

/**
 * Applies the props to an element and puts its content into a root: the children, or the `html` prop.
 *
 * @param element - The element that takes the props.
 * @param root - Where the content goes: the element itself, or its shadow root.
 * @param props - The props.
 * @param children - The children.
 */
export const build = (
  element: HTMLElement,
  root: Element | ShadowRoot,
  props: AnyProps,
  children: Child[],
) => {
  const { html, ref } = props;
  applyProps(element, props);
  if (html === undefined) {
    appendChildren(root, children);
  } else {
    if (children.length > 0) warn('children are ignored when html is set');
    /**
     * Replaces the content with parsed HTML.
     *
     * @param value - The markup, or nothing.
     */
    const write = (value: unknown) => {
      root.innerHTML = typeof value === 'string' ? value : '';
    };
    if (isReactive(html)) bind(element, () => write(read(html)));
    else write(html);
  }
  applyProperties(element, props);
  if (typeof ref === 'function') ref(element);
};

/**
 * Creates a plain DOM element from the arguments of a factory.
 *
 * @param tag - The tag name.
 * @param args - Optional props, then children.
 * @returns The element.
 */
export const createElement = (tag: string, args: unknown[]) => {
  const [props, children] = splitArgs(args);
  const element = document.createElement(tag);
  build(element, element, props, children);
  return element;
};
