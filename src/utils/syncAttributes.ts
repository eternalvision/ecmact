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
  'mounted',
  'unmounted',
  'beforeUpdate',
  'updated',
  'error',
  'provide',
]);

const toAttributeValue = (value: unknown) => {
  if (value === true) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return null;
};

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
