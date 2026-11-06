import type { ResolvedProps } from '@em/types';
import { warn } from '@em/utils/warn';

/**
 * Converts a camelCase CSS property name to kebab-case.
 *
 * @param key - The camelCase name, for example `backgroundColor`.
 * @returns The kebab-case name, for example `background-color`.
 */
const toKebabCase = (key: string) => key.replace(/([A-Z])/g, '-$1').toLowerCase();

/**
 * Applies inline styles through the CSSOM and removes the ones that are no longer present.
 * Values must be strings or numbers; other values are skipped, with a warning unless they are empty.
 *
 * @param element - The element to style.
 * @param style - The camelCase style object.
 * @param previous - The property names applied by the previous call.
 * @returns The property names that were applied, to pass to the next call.
 */
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
