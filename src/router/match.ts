export interface CompiledPattern {
  regexp: RegExp;
  names: string[];
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
