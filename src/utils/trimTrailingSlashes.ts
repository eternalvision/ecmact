/**
 * Removes the slashes at the end of a string. A loop instead of a regular expression, which a long run of slashes
 * followed by another character could make slow.
 *
 * @param value - The string, usually a path or a base URL.
 * @returns The string without trailing slashes.
 */
export const trimTrailingSlashes = (value: string) => {
  let end = value.length;
  while (end > 0 && value[end - 1] === '/') end--;
  return value.slice(0, end);
};
