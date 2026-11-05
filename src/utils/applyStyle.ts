import type { ComponentProps } from '../types';

const toKebabCase = (key: string) => key.replace(/([A-Z])/g, '-$1').toLowerCase();

export const applyStyle = (
  element: HTMLElement,
  style: ComponentProps['style'] = {},
  previous: Set<string>,
) => {
  const next = new Map<string, string>();

  Object.entries(style).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      next.set(toKebabCase(key), String(value));
    }
  });

  previous.forEach((key) => {
    if (!next.has(key)) element.style.removeProperty(key);
  });

  next.forEach((value, key) => element.style.setProperty(key, value));

  return new Set(next.keys());
};
