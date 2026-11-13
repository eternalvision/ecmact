import { isSignal, type ReadonlySignal } from '@em/signals/signals';

/**
 * Something a template can contain: a value, a signal, a function of the props, a `css` fragment or keyframes.
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
  | Keyframes
  | ((props: P) => Interpolation<P>);

/** A piece of CSS made with `css`, to share between styled components. */
export interface CssFragment {
  /** The text between the interpolations. */
  readonly strings: readonly string[];
  /** The interpolations. */
  readonly values: readonly unknown[];
}

/** An animation made with `keyframes`, to use in `animation` declarations. */
export interface Keyframes {
  /** The generated animation name, derived from the frames so that equal frames share a name. */
  readonly name: string;
  /** The `@keyframes` rule. */
  readonly rule: string;
}

/**
 * Tells whether an interpolation is a `css` fragment.
 *
 * @param value - The interpolation.
 * @returns `true` for fragments.
 */
const isFragment = (value: unknown): value is CssFragment =>
  typeof value === 'object' && value !== null && 'strings' in value && 'values' in value;

/**
 * Tells whether an interpolation is a `keyframes` animation.
 *
 * @param value - The interpolation.
 * @returns `true` for animations.
 */
const isKeyframes = (value: unknown): value is Keyframes =>
  typeof value === 'object' && value !== null && 'name' in value && 'rule' in value;

/**
 * Turns an interpolation into text, calling functions with the props and reading signals.
 * The rule of every animation it meets is added to `rules`.
 *
 * @param value - The interpolation.
 * @param props - The resolved props.
 * @param rules - Where the `@keyframes` rules are collected.
 * @returns The text.
 */
const toText = (value: Interpolation<never>, props: never, rules: Set<string>): string => {
  if (typeof value === 'function') return toText(value(props), props, rules);
  if (isSignal(value)) return toText(value.value, props, rules);
  if (isFragment(value)) {
    return join(value.strings, value.values as Interpolation<never>[], props, rules);
  }
  if (isKeyframes(value)) {
    rules.add(value.rule);
    return value.name;
  }
  return value === false || value === null || value === undefined ? '' : String(value);
};

/**
 * Joins the text of a template with its interpolations.
 *
 * @param strings - The text between the interpolations.
 * @param values - The interpolations.
 * @param props - The resolved props.
 * @param rules - Where the `@keyframes` rules are collected.
 * @returns The CSS.
 */
export const join = (
  strings: readonly string[],
  values: readonly Interpolation<never>[],
  props: never,
  rules: Set<string>,
): string =>
  strings.reduce(
    (text, part, index) =>
      text + part + (index < values.length ? toText(values[index] as never, props, rules) : ''),
    '',
  );

/**
 * Hashes text into a short name, so equal frames get the same animation name.
 *
 * @param text - The text to hash.
 * @returns A base 36 string.
 */
export const hash = (text: string) =>
  Array.from(text)
    .reduce((value, character) => (value * 33) ^ character.charCodeAt(0), 5381)
    .toString(36)
    .replace('-', 'n');

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
 * Writes the frames of an animation. Use the result in an `animation` declaration of a styled component; the
 * `@keyframes` rule is added to that component's styles, so it works inside its shadow root.
 *
 * @example
 * const spin = keyframes`from { rotate: 0deg } to { rotate: 360deg }`;
 * const Spinner = styled.div`animation: ${spin} 1s linear infinite;`;
 *
 * @param strings - The text between the values.
 * @param values - Static values to put into the frames.
 * @returns The animation.
 */
export const keyframes = (
  strings: TemplateStringsArray,
  ...values: (string | number)[]
): Keyframes => {
  const frames = strings.reduce((text, part, index) => text + part + (values[index] ?? ''), '');
  const name = `em-${hash(frames)}`;
  return { name, rule: `@keyframes ${name} {\n${frames}\n}` };
};
