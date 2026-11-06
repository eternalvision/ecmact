/** A route pattern turned into a regular expression. */
export interface CompiledPattern {
  /** Matches a whole pathname and captures the parameters. */
  regexp: RegExp;
  /** The parameter names, in the order of the capture groups. */
  names: string[];
}

/**
 * Escapes the characters that have a meaning in a regular expression.
 *
 * @param text - Plain text.
 * @returns The text, safe to put into a regular expression.
 */
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Turns a route pattern into a regular expression and the names of its parameters.
 * Supports `:name` for one segment and `*` for the rest of the path. A trailing slash is optional.
 *
 * @param path - The route pattern, for example `/users/:id`.
 * @returns The regular expression and the parameter names in order.
 */
export const compilePattern = (path: string): CompiledPattern => {
  const names: string[] = [];
  const source = path
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      if (segment === '*') {
        names.push('*');
        return '(?:/(.*))?';
      }
      if (segment.startsWith(':')) {
        names.push(segment.slice(1));
        return '/([^/]+)';
      }
      return `/${escape(segment)}`;
    })
    .join('');
  return { regexp: new RegExp(`^${source}/?$`), names };
};

/**
 * Matches a path against a compiled pattern and extracts the decoded parameters.
 *
 * @param compiled - The compiled pattern.
 * @param pathname - The path to match.
 * @returns The parameters, or `null` if the path does not match or has an invalid encoding.
 */
export const matchPath = ({ regexp, names }: CompiledPattern, pathname: string) => {
  const result = regexp.exec(pathname);
  if (!result) return null;
  try {
    return Object.fromEntries(
      names.map((name, index) => [name, decodeURIComponent(result[index + 1] ?? '')]),
    );
  } catch {
    return null;
  }
};
