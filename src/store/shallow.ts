/**
 * Compares two values one level deep: objects and arrays by their own keys and values, maps and sets by their
 * entries, everything else with `Object.is`. Meant for `equalityFn`, to ignore a selector that returns a new
 * object or array with the same content.
 *
 * @example
 * store.select((state) => ({ a: state.a, b: state.b }), shallow);
 *
 * @template T - The type of the values.
 * @param a - The first value.
 * @param b - The second value.
 * @returns `true` if they have the same content at the first level.
 */
export const shallow = <T>(a: T, b: T): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (a instanceof Map && b instanceof Map) {
    return (
      a.size === b.size &&
      [...a].every(([key, value]) => b.has(key) && Object.is(value, b.get(key)))
    );
  }
  if (a instanceof Set && b instanceof Set) {
    return a.size === b.size && [...a].every((value) => b.has(value));
  }
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(b, key) &&
        Object.is((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
    )
  );
};
