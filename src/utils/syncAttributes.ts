import type { ComponentProps } from '../types';

const reservedKeys = new Set([
  'tag',
  'content',
  'html',
  'style',
  'children',
  'ref',
  'shadow',
  'mounted',
  'unmounted',
  'beforeUpdate',
  'updated',
]);

const toAttributeValue = (value: unknown) => {
  if (value === true) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return null;
};

export const syncAttributes = (
  element: HTMLElement,
  props: ComponentProps,
  previous: Set<string>,
) => {
  const next = new Map<string, string>();

  Object.entries(props).forEach(([key, value]) => {
    if (reservedKeys.has(key) || key.startsWith('on')) return;
    const attribute = toAttributeValue(value);
    if (attribute !== null) next.set(key, attribute);
  });

  previous.forEach((key) => {
    if (!next.has(key)) element.removeAttribute(key);
  });

  next.forEach((value, key) => element.setAttribute(key, value));

  return new Set(next.keys());
};
