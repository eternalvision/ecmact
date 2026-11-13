import type { Styles } from '@em/types';
import { warn } from '@em/utils/warn';

/**
 * Converts a camelCase CSS property name to kebab-case.
 *
 * @param key - The camelCase name, for example `backgroundColor`.
 * @returns The kebab-case name, for example `background-color`.
 */
const toKebabCase = (key: string) =>
  key.startsWith('--') ? key : key.replace(/([A-Z])/g, '-$1').toLowerCase();

/** The properties whose numbers are plain numbers, not lengths. */
const unitless = new Set([
  'animationIterationCount',
  'aspectRatio',
  'columnCount',
  'columns',
  'fillOpacity',
  'flex',
  'flexGrow',
  'flexShrink',
  'floodOpacity',
  'fontWeight',
  'gridArea',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnStart',
  'gridRow',
  'gridRowEnd',
  'gridRowStart',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'scale',
  'stopOpacity',
  'strokeOpacity',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
]);

/**
 * Turns a style value into text. A number is a length in pixels, except for the properties that take plain
 * numbers, such as `opacity` and `zIndex`, and for custom properties.
 *
 * @param key - The camelCase property name.
 * @param value - The value.
 * @returns The text to set.
 */
const toCssValue = (key: string, value: string | number) =>
  typeof value === 'string' || unitless.has(key) || key.startsWith('--')
    ? String(value)
    : `${value}px`;

/**
 * Sets one inline style through the CSSOM. Strings are set as they are and numbers as pixels where the property
 * is a length, `false`, `null` and `undefined` remove
 * the property, and anything else is skipped with a warning.
 *
 * @param element - The element to style.
 * @param key - The camelCase property name.
 * @param value - The value.
 * @returns The kebab-case name if the property was set, `undefined` otherwise.
 */
export const setStyle = (element: HTMLElement, key: string, value: unknown) => {
  const name = toKebabCase(key);
  if (typeof value === 'string' || typeof value === 'number') {
    element.style.setProperty(name, toCssValue(key, value));
    return name;
  }
  element.style.removeProperty(name);
  if (value !== undefined && value !== null && value !== false) {
    warn(`style "${key}" was ignored, ${typeof value} values cannot be set`);
  }
  return undefined;
};

/**
 * Applies inline styles through the CSSOM and removes the ones that are no longer present.
 *
 * @param element - The element to style.
 * @param style - The camelCase style object, or nothing.
 * @param previous - The property names applied by the previous call.
 * @returns The property names that were applied, to pass to the next call.
 */
export const applyStyle = (
  element: HTMLElement,
  style: Styles | false | null | undefined,
  previous: Set<string>,
) => {
  const next = new Set<string>();
  Object.entries(style || {}).forEach(([key, value]) => {
    const name = setStyle(element, key, value);
    if (name) next.add(name);
  });
  previous.forEach((name) => {
    if (!next.has(name)) element.style.removeProperty(name);
  });
  return next;
};
