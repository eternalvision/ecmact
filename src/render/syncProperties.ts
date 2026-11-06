import type { ResolvedProps } from '@em/types';

const stringKeys = ['value'] as const;
const booleanKeys = ['checked', 'selected', 'indeterminate'] as const;

/**
 * Writes one live value to the element, but only if the element has such a property.
 *
 * @param element - The element.
 * @param key - The property name.
 * @param value - The new value as a string, or `undefined` when the prop is absent.
 */
const write = (element: HTMLElement, key: string, value: string | undefined) => {
  if (!(key in element)) return;
  const target = element as unknown as Record<string, unknown>;
  target[key] = key === 'value' ? (value ?? '') : value !== undefined;
};

/**
 * Sets the live state of form controls. `value`, `checked`, `selected` and `indeterminate` are written as DOM
 * properties, so they keep working after the user has interacted with the control, which an attribute does not.
 * A property is written when its prop changes, not on every update, so unrelated updates do not reset what the user typed.
 *
 * @param element - The element to update.
 * @param props - The props.
 * @param previous - The values written by the previous call.
 * @returns The values written now, to pass to the next call.
 */
export const syncProperties = (
  element: HTMLElement,
  props: ResolvedProps,
  previous: Map<string, string>,
) => {
  const next = new Map<string, string>();
  const source = props as Record<string, unknown>;

  stringKeys.forEach((key) => {
    const value = source[key];
    if (typeof value === 'string' || typeof value === 'number') next.set(key, String(value));
  });
  booleanKeys.forEach((key) => {
    if (source[key] === true) next.set(key, '');
  });

  [...stringKeys, ...booleanKeys].forEach((key) => {
    if (previous.get(key) !== next.get(key)) write(element, key, next.get(key));
  });

  return next;
};
