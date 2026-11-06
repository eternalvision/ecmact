import { isSignal } from '@em/signals/signals';
import type { ComponentProps, ResolvedProps } from '@em/types';

/**
 * Reads the value of a signal, and returns anything else as it is.
 *
 * @param value - A signal or a plain value.
 * @returns The plain value.
 */
const unwrap = (value: unknown) => (isSignal(value) ? value.value : value);

/**
 * Unwraps a style prop: the object itself may be a signal, and so may each of its values.
 *
 * @param style - The style prop.
 * @returns The style object with plain values, or the input if it is not an object.
 */
const resolveStyle = (style: unknown) => {
  const resolved = unwrap(style);
  if (typeof resolved !== 'object' || resolved === null) return resolved;
  return Object.fromEntries(Object.entries(resolved).map(([key, value]) => [key, unwrap(value)]));
};

/**
 * Unwraps the signals among the children. A list without signals is returned as it is.
 *
 * @param children - The children prop.
 * @returns The children with plain values.
 */
const resolveChildren = (children: unknown) =>
  Array.isArray(children) && children.some(isSignal) ? children.map(unwrap) : children;

/**
 * Reads the current value of every signal in the props.
 * Calling it inside an effect subscribes the effect to those signals.
 *
 * @param props - The props as passed by the user.
 * @returns The props with plain values.
 */
export const resolveProps = (props: ComponentProps): ResolvedProps =>
  Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
      key,
      key === 'style'
        ? resolveStyle(value)
        : key === 'children'
          ? resolveChildren(value)
          : unwrap(value),
    ]),
  ) as ResolvedProps;
