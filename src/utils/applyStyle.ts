import type { ResolvedProps } from '../types';
import { warn } from './warn';

const toKebabCase = (key: string) => key.replace(/([A-Z])/g, '-$1').toLowerCase();

export const applyStyle = (
  element: HTMLElement,
  style: ResolvedProps['style'] = {},
  previous: Set<string>,
) => {
  const next = new Map<string, string>();

  Object.entries(style).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      next.set(toKebabCase(key), String(value));
    } else if (value !== undefined && value !== null && value !== false) {
      warn(`style "${key}" was ignored, ${typeof value} values cannot be set`);
    }
  });

  previous.forEach((key) => {
    if (!next.has(key)) element.style.removeProperty(key);
  });

  next.forEach((value, key) => element.style.setProperty(key, value));

  return new Set(next.keys());
};
