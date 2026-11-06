import type { Component } from '@em/component';
import { createFactory, isIgnoredKey } from '@em/em';
import { computed, isSignal, type ReadonlySignal } from '@em/signals';
import type { ComponentProps, ResolvedProps } from '@em/types';
import { resolveProps } from '@em/utils';

/** The attribute that the styles of a styled component select the inner element by. */
const marker = 'data-styled';

/**
 * Something a template can contain: a value, a signal, a function of the props, or a `css` fragment.
 * `false`, `null` and `undefined` leave nothing behind.
 *
 * @template P - The props that functions receive.
 */
export type Interpolation<P> =
  | string
  | number
  | false
  | null
  | undefined
  | ReadonlySignal<string | number | false | null | undefined>
  | CssFragment
  | ((props: P) => Interpolation<P>);

/** A piece of CSS made with `css`, to share between styled components. */
export interface CssFragment {
  /** The text between the interpolations. */
  readonly strings: readonly string[];
  /** The interpolations. */
  readonly values: readonly unknown[];
}

/**
 * The props of a styled component: the props of its tag plus the transient ones, whose names start with `$`.
 * Transient props reach the style functions but never the element.
 *
 * @template K - The tag.
 * @template X - The transient props.
 */
export type StyledProps<
  K extends string,
  X extends object = Record<never, never>,
> = ComponentProps<K> & {
  [P in keyof X]: X[P] | ReadonlySignal<Exclude<X[P], undefined>>;
};

/**
 * Creates a styled component.
 *
 * @template K - The tag.
 * @template X - The transient props.
 * @param props - The props of the tag and the transient props.
 * @returns The component.
 */
export type StyledComponent<K extends string, X extends object = Record<never, never>> = (
  props?: StyledProps<K, X>,
) => Component<K>;

/**
 * The tagged template that turns CSS into a styled component for a tag.
 *
 * @template K - The tag.
 * @template X - The transient props, whose names start with `$`.
 * @param strings - The text between the interpolations.
 * @param values - The interpolations.
 * @returns A function that creates the component.
 */
export type StyledTag<K extends string> = <X extends object = Record<never, never>>(
  strings: TemplateStringsArray,
  ...values: Interpolation<ResolvedProps<K> & X>[]
) => StyledComponent<K, X>;

/** `styled('button')` or `styled.button`: one tagged template per HTML tag. */
export type Styled = (<K extends string>(tag: K) => StyledTag<K>) & {
  [K in keyof HTMLElementTagNameMap]: StyledTag<K>;
};

/**
 * Tells whether an interpolation is a `css` fragment.
 *
 * @param value - The interpolation.
 * @returns `true` for fragments.
 */
const isFragment = (value: unknown): value is CssFragment =>
  typeof value === 'object' && value !== null && 'strings' in value && 'values' in value;

/**
 * Turns an interpolation into text, calling functions with the props and reading signals.
 *
 * @param value - The interpolation.
 * @param props - The resolved props.
 * @returns The text.
 */
const toText = (value: Interpolation<never>, props: never): string => {
  if (typeof value === 'function') return toText(value(props), props);
  if (isSignal(value)) return toText(value.value, props);
  if (isFragment(value)) return join(value.strings, value.values as Interpolation<never>[], props);
  return value === false || value === null || value === undefined ? '' : String(value);
};

/**
 * Joins the text of a template with its interpolations.
 *
 * @param strings - The text between the interpolations.
 * @param values - The interpolations.
 * @param props - The resolved props.
 * @returns The CSS.
 */
const join = (strings: readonly string[], values: readonly Interpolation<never>[], props: never) =>
  strings.reduce(
    (text, part, index) =>
      text + part + (index < values.length ? toText(values[index] as never, props) : ''),
    '',
  );

/**
 * Writes a piece of CSS that styled components can share.
 *
 * @example
 * const focus = css`&:focus-visible { outline: 2px solid ${(props) => props.$accent}; }`;
 * const Button = styled.button`${focus} padding: 0.5rem;`;
 *
 * @template P - The props that its functions receive.
 * @param strings - The text between the interpolations.
 * @param values - The interpolations.
 * @returns The fragment.
 */
export const css = <P = never>(
  strings: TemplateStringsArray,
  ...values: Interpolation<P>[]
): CssFragment => ({ strings: [...strings], values });

/**
 * Makes the template function for one tag.
 *
 * @param tag - The tag.
 * @returns The tagged template.
 */
const forTag =
  (tag: string): StyledTag<string> =>
  (strings, ...values) => {
    const factory = createFactory(`styled-${tag}`);
    return (props = {} as never) => {
      const own: Record<string, unknown> = {};
      Object.entries(props).forEach(([key, value]) => {
        if (!key.startsWith('$')) own[key] = value;
      });
      const sheet = computed(() => {
        const resolved = resolveProps(props as ComponentProps);
        const extra = typeof resolved.css === 'string' ? resolved.css : '';
        return `[${marker}] {\n${join(strings, values as Interpolation<never>[], resolved as never)}\n}\n${extra}`;
      });
      return factory({ ...own, tag, [marker]: '', css: sheet } as never);
    };
  };

/**
 * Answers `styled.<tag>` with the template function for that tag.
 *
 * @param target - The `styled` function.
 * @param tag - The property that was read.
 * @param receiver - The proxy.
 * @returns The template function, or the function's own property.
 */
const lookup = (target: object, tag: string | symbol, receiver: unknown) =>
  isIgnoredKey(tag) || tag in target ? Reflect.get(target, tag, receiver) : forTag(tag);

/**
 * Starts a template for a tag, for `styled('button')`.
 *
 * @param tag - The tag.
 * @returns The template function.
 */
const call = (tag: string) => forTag(tag);

/**
 * Styled components: CSS written in a tagged template becomes a component with the styles attached, and the
 * template can read the props. The styles go to the component's shadow root, so they never leak out, and
 * nested rules and `&` use native CSS nesting.
 *
 * @example
 * const Button = styled.button<{ $primary?: boolean }>`
 *   padding: 0.5rem 1rem;
 *   background: ${(props) => (props.$primary ? '#1665e0' : '#e8eefc')};
 *   &:hover { filter: brightness(1.1); }
 * `;
 * mount('#app', Button({ content: 'Save', $primary: true }));
 */
export const styled = new Proxy<Styled>(call as unknown as Styled, { get: lookup });
