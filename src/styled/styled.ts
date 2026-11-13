import { trackAttached } from '@em/core/context';
import { createElement, isIgnoredKey, splitArgs, type AnyProps } from '@em/core/element';
import { bind } from '@em/render/bindings';
import { computed, isSignal, type ReadonlySignal } from '@em/signals/signals';
import { inject, isStyleRoot } from '@em/styled/inject';
import { hash, join, type Interpolation } from '@em/styled/template';
import { themeContext, type Theme } from '@em/styled/theme';
import type { ElementOf, Factory, Props } from '@em/types';

/**
 * The props of a styled element: the props of its tag plus the transient ones, whose names start with `$`.
 * Transient props reach the style functions but never the element. A few more props are consumed too: `theme`
 * overrides the theme from the context, `as` renders another tag with the same styles, and `css` adds
 * declarations and nested rules after the ones of the template.
 *
 * @template K - The tag.
 * @template X - The transient props.
 */
export type StyledProps<K extends string, X extends object = Record<never, never>> = Props<K> & {
  [P in keyof X]: X[P] | ReadonlySignal<Exclude<X[P], undefined>>;
} & {
  /** Renders this tag instead, keeping the styles. */
  as?: string;
  /** The theme for this element, instead of the one from the `ThemeProvider` above it. */
  theme?: Theme | ReadonlySignal<Theme>;
  /** More CSS for this element: declarations and nested rules, put after the ones of the template. */
  css?: string | ReadonlySignal<string>;
};

/**
 * Creates a styled element from optional props followed by children. The result is the element itself, with a
 * generated class that carries the styles.
 *
 * @template K - The tag.
 * @template X - The transient props.
 */
export type StyledComponent<K extends string, X extends object = Record<never, never>> = Factory<
  StyledProps<K, X>,
  ElementOf<K>
>;

/**
 * The props of a tag as style functions see them: signals are replaced by their values.
 *
 * @template T - The props.
 */
type Plain<T> = { [P in keyof T]: Exclude<T[P], ReadonlySignal<unknown>> };

/**
 * The props that functions in a template or in `attrs` receive: the resolved props, the transient ones and the theme.
 *
 * @template K - The tag.
 * @template X - The transient props.
 */
export type StyleProps<K extends string, X extends object> = Plain<Props<K>> &
  X & {
    /** The theme from the context, or the `theme` prop. An empty object without either. */
    theme: Theme;
  };

/**
 * Props that `attrs` supplies: static, or computed from the props when the component is created.
 *
 * @template K - The tag.
 * @template X - The transient props.
 */
export type Attrs<K extends string, X extends object> =
  Partial<StyledProps<K, X>> | ((props: StyleProps<K, X>) => Partial<StyledProps<K, X>>);

/**
 * The tagged template that turns CSS into a styled component for a tag.
 *
 * @template K - The tag.
 * @template B - The transient props of the component that is extended, if any.
 */
export interface StyledTag<K extends string, B extends object = Record<never, never>> {
  /**
   * Turns CSS into a component.
   *
   * @template X - The transient props, whose names start with `$`.
   * @param strings - The text between the interpolations.
   * @param values - The interpolations.
   * @returns A function that creates the component.
   */
  <X extends object = Record<never, never>>(
    strings: TemplateStringsArray,
    ...values: Interpolation<StyleProps<K, B & X>>[]
  ): StyledComponent<K, B & X>;
  /**
   * Sets default props. Props passed to the component win over them. A function is called once, when the
   * component is created, with the props it was given.
   *
   * @template X - The transient props that `attrs` adds.
   * @param attrs - The default props, or a function that returns them.
   * @returns A template function that creates components with those defaults.
   */
  attrs<X extends object = Record<never, never>>(
    attrs: Attrs<K, B & NoInfer<X>>,
  ): StyledTag<K, B & X>;
}

/**
 * `styled('button')`, `styled.button` or `styled(Button)` to extend a styled component.
 */
export type Styled = {
  <K extends string>(tag: K): StyledTag<K>;
  <K extends string, X extends object>(component: StyledComponent<K, X>): StyledTag<K, X>;
} & {
  [K in keyof HTMLElementTagNameMap]: StyledTag<K>;
};

/** One tagged template of a component. */
interface Layer {
  /** The text between the interpolations. */
  strings: readonly string[];
  /** The interpolations. */
  values: readonly unknown[];
}

/** Everything that defines a styled component, so that another one can extend it. */
interface Definition {
  /** The tag the component renders by default. */
  tag: string;
  /** The templates, from the extended component to the extending one. */
  layers: Layer[];
  /** The `attrs`, from the extended component to the extending one. */
  attrs: Attrs<string, object>[];
}

const definitions = new WeakMap<object, Definition>();

/**
 * Splits the props that go to the element from the ones that only the styles read.
 *
 * @param props - The props as passed.
 * @returns The props for the element.
 */
const forElement = (props: AnyProps) =>
  Object.fromEntries(
    Object.entries(props).filter(
      ([key]) => !key.startsWith('$') && !['theme', 'as', 'css'].includes(key),
    ),
  );

/**
 * Reads the current value of every signal in the props.
 * Calling it inside a computed value subscribes it to those signals.
 *
 * @param props - The props as passed.
 * @returns The props with plain values in place of signals.
 */
const resolve = (props: AnyProps): AnyProps =>
  Object.fromEntries(
    Object.entries(props).map(([key, value]) => [key, isSignal(value) ? value.value : value]),
  );

/**
 * Applies the `attrs` of a definition as defaults under the props that were passed.
 *
 * @param attrs - The `attrs`, outermost last.
 * @param props - The props that were passed.
 * @returns The props with the defaults filled in.
 */
const withAttrs = (attrs: Attrs<string, object>[], props: AnyProps) => {
  const resolved = resolve(props);
  const defaults = attrs.reduce<AnyProps>(
    (merged, entry) => ({
      ...merged,
      ...(typeof entry === 'function'
        ? entry({ ...resolved, ...merged, theme: resolved.theme ?? {} } as never)
        : entry),
    }),
    {},
  );
  return { ...defaults, ...props };
};

/**
 * Ends a template with a semicolon when its last declaration has none, so that the template that comes after it
 * in an extended component does not run into it.
 *
 * @param text - The CSS of one template.
 * @returns The CSS, ending in `;` or `}`, or empty.
 */
const terminate = (text: string) => {
  const trimmed = text.trim();
  return trimmed === '' || /[;}]$/.test(trimmed) ? trimmed : `${trimmed};`;
};

/**
 * Creates the function that makes the components of one definition.
 *
 * @param definition - What defines the component.
 * @returns The styled component.
 */
const build = (definition: Definition): StyledComponent<string> => {
  /**
   * Creates one element: applies the `attrs`, picks the tag and attaches the styles.
   *
   * @param args - Optional props, then children.
   * @returns The styled element.
   */
  const component = ((...args: unknown[]) => {
    const [given, children] = splitArgs(args);
    const props = withAttrs(definition.attrs, given);
    const tag = typeof props.as === 'string' ? props.as : definition.tag;
    const styles = computed(() => {
      const resolved = resolve(props);
      const view = { ...resolved, theme: resolved.theme ?? themeContext.use()?.value ?? {} };
      const frames = new Set<string>();
      const body = definition.layers
        .map((layer) =>
          terminate(
            join(layer.strings, layer.values as Interpolation<never>[], view as never, frames),
          ),
        )
        .join('\n');
      const extra = typeof resolved.css === 'string' ? `\n${resolved.css}` : '';
      const name = `em-${hash(body + extra)}`;
      return { name, rules: [...frames, `.${name} {\n${body}${extra}\n}`] };
    });
    const element = createElement(tag, [
      {
        ...forElement(props),
        class: [
          props.class,
          /**
           * Reads the generated class that carries the styles.
           *
           * @returns The class name.
           */
          () => styles.value.name,
        ],
      },
      ...children,
    ]);
    bind(element, () => {
      const { rules } = styles.value;
      const root = element.getRootNode();
      if (isStyleRoot(root)) inject(root, rules);
      else trackAttached();
    });
    return element;
  }) as StyledComponent<string>;
  definitions.set(component, definition);
  return component;
};

/**
 * Makes the template function for a definition without templates yet.
 *
 * @param tag - The tag.
 * @param base - The definition that is extended, or `undefined` for a plain tag.
 * @param attrs - The `attrs` collected so far.
 * @returns The tagged template.
 */
const forDefinition = (
  tag: string,
  base: Definition | undefined,
  attrs: Attrs<string, object>[],
): StyledTag<string> => {
  const template = ((strings: TemplateStringsArray, ...values: unknown[]) =>
    build({
      tag,
      layers: [...(base?.layers ?? []), { strings: [...strings], values }],
      attrs: [...(base?.attrs ?? []), ...attrs],
    })) as StyledTag<string>;
  template.attrs = ((more: Attrs<string, object>) =>
    forDefinition(tag, base, [...attrs, more])) as StyledTag<string>['attrs'];
  return template;
};

/**
 * Starts a template for a tag or for a styled component to extend.
 *
 * @param target - A tag name, or a component made by `styled`.
 * @returns The template function.
 * @throws {TypeError} If the function was not made by `styled`.
 */
const call = (target: string | StyledComponent<string>) => {
  if (typeof target === 'string') return forDefinition(target, undefined, []);
  const base = definitions.get(target);
  if (!base) throw new TypeError('ecmact: styled() takes a tag name or a component made by styled');
  return forDefinition(base.tag, base, []);
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
  isIgnoredKey(tag) || tag in target
    ? Reflect.get(target, tag, receiver)
    : forDefinition(tag, undefined, []);

/**
 * Styled elements: CSS written in a tagged template becomes a function that creates an element with the styles
 * attached, and the template can read the props. The styles are tied to a generated class and put into the
 * document, or into the shadow root of the component that the element is in. Nested rules and `&` use native
 * CSS nesting.
 *
 * @example
 * const Button = styled.button<{ $primary?: boolean }>`
 *   padding: 0.5rem 1rem;
 *   background: ${(props) => (props.$primary ? '#1665e0' : '#e8eefc')};
 *   &:hover { filter: brightness(1.1); }
 * `;
 * mount('#app', Button({ $primary: true }, 'Save'));
 */
export const styled = new Proxy<Styled>(call as unknown as Styled, { get: lookup });
