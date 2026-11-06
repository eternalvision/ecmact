/**
 * Replaces each run of whitespace and each run of characters that npm does not allow with one dash.
 * A single pass instead of regular expressions, so that a long hostile name cannot make it slow.
 *
 * @param value - The lowercase name.
 * @returns The name with only valid characters.
 */
const dashes = (value: string) => {
  let out = '';
  let kind = 'valid';
  for (const char of value) {
    const next = /\s/.test(char) ? 'space' : /[a-z0-9-~._]/.test(char) ? 'valid' : 'invalid';
    if (next === 'valid') out += char;
    else if (next !== kind) out += '-';
    kind = next;
  }
  return out;
};

/**
 * Removes dots, underscores and dashes from the start, and dashes from the end.
 *
 * @param value - The name.
 * @returns The trimmed name.
 */
const trimEdges = (value: string) => {
  let start = 0;
  while (start < value.length && '._-'.includes(value.charAt(start))) start++;
  let end = value.length;
  while (end > start && value.charAt(end - 1) === '-') end--;
  return value.slice(start, end);
};

/**
 * Turns a directory name into a valid npm package name.
 *
 * @param name - The directory name.
 * @returns The name in lowercase, with invalid characters replaced; `ecmact-app` if nothing is left.
 */
export const toPackageName = (name: string) =>
  trimEdges(dashes(name.trim().toLowerCase())) || 'ecmact-app';
