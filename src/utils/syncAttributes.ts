import type { ResolvedProps } from '@em/types';
import { warn } from '@em/utils/warn';

const reservedKeys = new Set([
  'tag',
  'content',
  'html',
  'style',
  'css',
  'children',
  'ref',
  'shadow',
  'key',
  'mounted',
  'unmounted',
  'beforeUpdate',
  'updated',
  'error',
  'provide',
]);

/**
 * Converts a prop value to an attribute value.
 *
 * @param value - The prop value.
 * @returns A string, an empty string for `true`, or `null` if it cannot be an attribute.
 */
const toAttributeValue = (value: unknown) => {
  if (value === true) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return null;
};

/**
 * Sets the attribute props on an element and removes the ones that are no longer present.
 * Reserved props and handlers are skipped; objects and functions are skipped with a warning.
 *
 * @param element - The element to update.
 * @param props - The props.
 * @param previous - The attribute names set by the previous call.
 * @returns The attribute names that were set, to pass to the next call.
 */
export const syncAttributes = (
  element: HTMLElement,
  props: ResolvedProps,
  previous: Set<string>,
) => {
  const next = new Map<string, string>();

  Object.entries(props).forEach(([key, value]) => {
    if (reservedKeys.has(key) || key.startsWith('on')) return;
    const attribute = toAttributeValue(value);
    if (attribute !== null) {
      next.set(key, attribute);
    } else if (value !== undefined && value !== null && value !== false) {
      warn(`attribute "${key}" was ignored, ${typeof value} values cannot be set`);
    }
  });

  previous.forEach((key) => {
    if (!next.has(key)) element.removeAttribute(key);
  });

  next.forEach((value, key) => element.setAttribute(key, value));

  return new Set(next.keys());
};
