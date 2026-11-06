import type { ResolvedProps } from '@em/types';

/**
 * Tells whether a value is a non-null object.
 *
 * @param value - The value to check.
 * @returns `true` for objects.
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Compares two objects key by key with `Object.is`.
 *
 * @param a - The first object.
 * @param b - The second object.
 * @returns `true` if both have the same keys and values.
 */
const shallowEqual = (a: object, b: object) => {
  const first = a as Record<string, unknown>;
  const second = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
  return [...keys].every((key) => Object.is(first[key], second[key]));
};

/**
 * Compares two sets of resolved props. Style objects and children lists are compared item by item,
 * everything else with `Object.is`.
 *
 * @param a - The first props.
 * @param b - The second props.
 * @returns `true` if nothing differs.
 */
export const propsEqual = (a: ResolvedProps, b: ResolvedProps) => {
  const first: Record<string, unknown> = a;
  const second: Record<string, unknown> = b;
  return [...new Set([...Object.keys(first), ...Object.keys(second)])].every((key) => {
    const [x, y] = [first[key], second[key]];
    const comparable =
      (key === 'style' && isRecord(x) && isRecord(y)) ||
      (key === 'children' && Array.isArray(x) && Array.isArray(y));
    return comparable ? shallowEqual(x, y) : Object.is(x, y);
  });
};
