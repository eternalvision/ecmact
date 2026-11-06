/** A JSON object. */
export type Json = Record<string, unknown>;

/**
 * Tells whether a value is a plain JSON object, not an array or `null`.
 *
 * @param value - The value to check.
 * @returns `true` for objects.
 */
const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Merges two JSON objects deeply. Values of the overlay win; arrays and primitives are replaced, not merged.
 * The inputs are not changed.
 *
 * @param base - The object to start from.
 * @param overlay - The object whose values win.
 * @returns A new merged object.
 */
export const mergeJson = (base: Json, overlay: Json): Json => {
  const merged: Json = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    const current = merged[key];
    merged[key] = isObject(current) && isObject(value) ? mergeJson(current, value) : value;
  }
  return merged;
};
